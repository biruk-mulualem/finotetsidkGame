// src/pages/GameStart.jsx - Fixed loading issue
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teamsService from '../services/teamsService';

const styles = {
  container: {
    background: '#ffffff',
    padding: '40px 30px',
    minHeight: 'calc(100vh - 160px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f0f0',
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    margin: 0,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6c757d',
    margin: '5px 0 0 0',
  },
  form: {
    width: '100%',
    maxWidth: '650px',
    boxSizing: 'border-box',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px',
    width: '100%',
  },
  teamCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '25px 20px',
    border: '2px solid #e9ecef',
    textAlign: 'center',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  teamCardActive: {
    borderColor: '#ffd700',
    background: 'rgba(255, 215, 0, 0.05)',
    boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.1)',
  },
  teamIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '5px',
  },
  teamTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '12px',
  },
  teamInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#1a1a2e',
    background: '#ffffff',
    transition: 'border-color 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
  },
  teamInputFocus: {
    borderColor: '#ffd700',
    boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.1)',
  },
  teamInputDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '5px',
    width: '100%',
  },
  primaryBtn: {
    width: '100%',
    maxWidth: '280px',
    padding: '14px 30px',
    background: 'linear-gradient(135deg, #ffd700, #f5a623)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
  },
  primaryBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  error: {
    color: '#dc3545',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '0.95rem',
    padding: '10px',
    background: '#f8d7da',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '650px',
    boxSizing: 'border-box',
  },
  errorIcon: {
    marginRight: '8px',
  },
  loadingText: {
    color: '#6c757d',
    textAlign: 'center',
    fontSize: '1rem',
    padding: '20px',
  },
};

const GameStart = () => {
  const navigate = useNavigate();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [team1Focused, setTeam1Focused] = useState(false);
  const [team2Focused, setTeam2Focused] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [error, setError] = useState(null);
  const [hoverBtn, setHoverBtn] = useState(false);

  useEffect(() => {
    const loadActiveGame = async () => {
      try {
        setIsLoadingTeams(true);
        
        // Check localStorage first
        const savedTeams = localStorage.getItem('gameTeams');
        if (savedTeams) {
          const teams = JSON.parse(savedTeams);
          if (teams.length === 2) {
            setTeam1Name(teams[0].name || '');
            setTeam2Name(teams[1].name || '');
            setIsLoadingTeams(false);
            return;
          }
        }
        
        // Try API - get active game (is_active = true)
        try {
          const response = await teamsService.getActiveGame();
          const activeGame = response.data;
          
          if (activeGame) {
            setTeam1Name(activeGame.team1_name || '');
            setTeam2Name(activeGame.team2_name || '');
          } else {
            setTeam1Name('');
            setTeam2Name('');
          }
        } catch (apiError) {
          // Check if it's a 404 (no active game) - this is expected
          if (apiError.response?.status === 404) {
            console.log('No active game found, ready for new game');
            setTeam1Name('');
            setTeam2Name('');
          } else {
            // Other errors - log but don't block
            console.error('API error:', apiError);
            setTeam1Name('');
            setTeam2Name('');
          }
        }
      } catch (error) {
        console.error('Failed to load active game:', error);
        setTeam1Name('');
        setTeam2Name('');
      } finally {
        // ALWAYS set loading to false, even on error
        setIsLoadingTeams(false);
      }
    };

    loadActiveGame();
  }, []);

  // Function to check if a team name already exists
  const checkTeamNameExists = async (teamName) => {
    try {
      const response = await teamsService.getAllTeams({ 
        limit: 1000, 
        offset: 0 
      });
      const allTeams = response.data || [];
      
      return allTeams.some(team => 
        team.team1_name.toLowerCase() === teamName.toLowerCase() ||
        team.team2_name.toLowerCase() === teamName.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to check team name:', error);
      return false;
    }
  };

  // Function to get the next round number
  const getNextRoundNumber = async () => {
    try {
      const response = await teamsService.getAllTeams({ 
        limit: 1000, 
        offset: 0,
        sortBy: 'week_number',
        sortOrder: 'DESC'
      });
      const allRounds = response.data || [];
      
      if (allRounds.length === 0) {
        return 1;
      }
      
      let maxWeekNumber = 0;
      allRounds.forEach(round => {
        if (round.week_number && round.week_number > maxWeekNumber) {
          maxWeekNumber = round.week_number;
        }
      });
      
      return maxWeekNumber + 1;
    } catch (error) {
      console.error('Failed to get next round number:', error);
      return teamsService.getCurrentWeek();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedTeam1 = team1Name.trim();
    const trimmedTeam2 = team2Name.trim();
    
    if (!trimmedTeam1 || !trimmedTeam2) {
      setError('Please enter both team names');
      return;
    }

    if (trimmedTeam1 === trimmedTeam2) {
      setError('Team names must be different');
      return;
    }

    setError(null);
    setIsCreatingGame(true);

    try {
      // Check Team 1 name
      const team1Exists = await checkTeamNameExists(trimmedTeam1);
      if (team1Exists) {
        setError(`Team name "${trimmedTeam1}" already exists. Please choose a different name.`);
        setIsCreatingGame(false);
        return;
      }

      // Check Team 2 name
      const team2Exists = await checkTeamNameExists(trimmedTeam2);
      if (team2Exists) {
        setError(`Team name "${trimmedTeam2}" already exists. Please choose a different name.`);
        setIsCreatingGame(false);
        return;
      }

      // Get the next unique round number
      const roundNumber = await getNextRoundNumber();
      
      const response = await teamsService.createGame({
        team1_name: trimmedTeam1,
        team1_emoji: '🔵',
        team1_color: 'blue',
        team2_name: trimmedTeam2,
        team2_emoji: '🔴',
        team2_color: 'red',
        week_number: roundNumber,
      });

      const game = response.data;
      
      if (!game) {
        throw new Error('Failed to create game');
      }

      const teams = [
        { 
          id: game.id, 
          name: game.team1_name, 
          score: game.team1_score || 0, 
          emoji: game.team1_emoji || '🔵',
          color: game.team1_color || 'blue',
        },
        { 
          id: game.id, 
          name: game.team2_name, 
          score: game.team2_score || 0, 
          emoji: game.team2_emoji || '🔴',
          color: game.team2_color || 'red',
        }
      ];
      
      localStorage.setItem('gameTeams', JSON.stringify(teams));
      localStorage.setItem('currentTeamIndex', '0');
      localStorage.removeItem('gameState');
      localStorage.removeItem('completedTypes');
      
      navigate('/select-type');
      
    } catch (error) {
      console.error('Failed to create game:', error);
      setError(error.message || 'Failed to create game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const isFormValid = team1Name.trim() && team2Name.trim() && team1Name.trim() !== team2Name.trim();
  const isSubmitting = isCreatingGame;

  if (isLoadingTeams) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>👥 Team Setup</h2>
          <p style={styles.subtitle}>Loading active teams...</p>
        </div>
        <div style={styles.loadingText}>⏳ Please wait...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Team Setup</h2>
        <p style={styles.subtitle}>Enter both team names to start</p>
      </div>
      
      {error && (
        <div style={styles.error}>
          <span style={styles.errorIcon}>❌</span> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.teamGrid}>
          <div style={{ ...styles.teamCard, ...(team1Focused ? styles.teamCardActive : {}) }}>
            <span style={styles.teamIcon}>🔵</span>
            <div style={styles.teamTitle}>Team 1</div>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              placeholder="Enter Team 1 name"
              style={{
                ...styles.teamInput,
                ...(team1Focused ? styles.teamInputFocus : {}),
                ...(isSubmitting ? styles.teamInputDisabled : {}),
              }}
              onFocus={() => setTeam1Focused(true)}
              onBlur={() => setTeam1Focused(false)}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ ...styles.teamCard, ...(team2Focused ? styles.teamCardActive : {}) }}>
            <span style={styles.teamIcon}>🔴</span>
            <div style={styles.teamTitle}>Team 2</div>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              placeholder="Enter Team 2 name"
              style={{
                ...styles.teamInput,
                ...(team2Focused ? styles.teamInputFocus : {}),
                ...(isSubmitting ? styles.teamInputDisabled : {}),
              }}
              onFocus={() => setTeam2Focused(true)}
              onBlur={() => setTeam2Focused(false)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {team1Name.trim() && team2Name.trim() && team1Name.trim() === team2Name.trim() && (
          <div style={{ ...styles.error, marginBottom: '15px' }}>
            <span style={styles.errorIcon}>⚠️</span> Team names must be different
          </div>
        )}
        
        <div style={styles.buttonContainer}>
          <button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
            style={{
              ...styles.primaryBtn,
              ...(!isFormValid || isSubmitting ? styles.disabled : {}),
              ...(hoverBtn && !(!isFormValid || isSubmitting) ? styles.primaryBtnHover : {}),
            }}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
          >
            {isSubmitting ? (
              '⏳ Please wait...'
            ) : (
              '🚀 Start Game'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameStart;