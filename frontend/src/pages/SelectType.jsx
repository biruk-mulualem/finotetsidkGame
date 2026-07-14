// src/pages/SelectType.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionTypes } from '../services/questionService';
import teamsService from '../services/teamsService';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    flex: 1,
    overflow: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 160px)',
  },
  title: {
    color: '#ffd700',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#a8b5d9',
    marginBottom: '12px',
    textAlign: 'center',
    fontSize: '0.95rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    width: '100%',
    maxWidth: '600px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '20px 15px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minHeight: '110px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHover: {
    transform: 'translateY(-4px) scale(1.03)',
    borderColor: 'rgba(255, 215, 0, 0.6)',
    background: 'rgba(255, 215, 0, 0.15)',
    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)',
  },
  cardCompleted: {
    borderColor: '#4CAF50',
    background: 'rgba(76, 175, 80, 0.15)',
    opacity: '0.7',
    cursor: 'default',
  },
  cardDisabled: {
    opacity: '0.4',
    cursor: 'not-allowed',
  },
  emoji: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '6px',
  },
  name: {
    color: '#111010',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
  count: {
    color: '#a8b5d9',
    fontSize: '0.75rem',
    marginTop: '3px',
  },
  status: {
    color: '#4CAF50',
    fontSize: '0.7rem',
    marginTop: '3px',
    fontWeight: 'bold',
  },
  statusDisabled: {
    color: '#ff6b6b',
    fontSize: '0.7rem',
    marginTop: '3px',
    fontWeight: 'bold',
  },
  backBtn: {
    padding: '6px 14px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#111010',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#ffd700',
    fontSize: '1.2rem',
  },
  errorMessage: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: '20px',
    fontSize: '1rem',
  },
  primaryBtn: {
    width: '100%',
    maxWidth: '250px',
    padding: '10px',
    background: 'linear-gradient(135deg, #ffd700, #f5a623)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  noActiveRound: {
    textAlign: 'center',
    padding: '30px 20px',
    background: 'rgba(255, 215, 0, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    width: '100%',
    maxWidth: '500px',
  },
  noActiveRoundIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '10px',
  },
  noActiveRoundTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: '8px',
  },
  noActiveRoundText: {
    color: '#a8b5d9',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  },
  goBackBtn: {
    marginTop: '15px',
    padding: '10px 30px',
    background: 'linear-gradient(135deg, #ffd700, #f5a623)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

const SelectType = () => {
  const navigate = useNavigate();
  const [hoveredType, setHoveredType] = useState(null);
  const [completedTypes, setCompletedTypes] = useState([]);
  const [hasActiveRound, setHasActiveRound] = useState(true);
  const [checkingRound, setCheckingRound] = useState(true);
  const { types, loading, error } = useQuestionTypes();

  // Load completed types from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedTypes');
    if (saved) {
      setCompletedTypes(JSON.parse(saved));
    }
  }, []);

  // Check if teams exist and if there's an active round
  useEffect(() => {
    const checkActiveRound = async () => {
      try {
        setCheckingRound(true);
        
        // Check if teams exist in localStorage
        const teams = localStorage.getItem('gameTeams');
        if (!teams) {
          navigate('/');
          return;
        }
        
        // Check if there's an active round in the database
        try {
          const response = await teamsService.getActiveGame();
          const activeGame = response.data;
          
          if (activeGame) {
            setHasActiveRound(true);
          } else {
            setHasActiveRound(false);
          }
        } catch (apiError) {
          // If API returns 404 (no active game), there's no active round
          if (apiError.response?.status === 404) {
            setHasActiveRound(false);
          } else {
            // Other errors - assume no active round to be safe
            console.error('Error checking active round:', apiError);
            setHasActiveRound(false);
          }
        }
      } catch (error) {
        console.error('Error in checkActiveRound:', error);
        setHasActiveRound(false);
      } finally {
        setCheckingRound(false);
      }
    };

    checkActiveRound();
  }, [navigate]);

  const handleSelectType = (type) => {
    // Save selected type
    localStorage.setItem('selectedType', type);
    
    // Reset game state for new type
    localStorage.setItem('gameState', JSON.stringify({
      usedCubes: [],
      answeredCubes: [],
      askedQuestionIds: [],
      currentQuestionIndex: 0,
    }));
    
    localStorage.setItem('currentTeamIndex', '0');
    
    navigate('/pick-number');
  };

  const handleBack = () => {
    // Clear all game-related data from localStorage
    localStorage.removeItem('gameTeams');
    localStorage.removeItem('currentTeamIndex');
    localStorage.removeItem('selectedType');
    localStorage.removeItem('gameState');
    localStorage.removeItem('completedTypes');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('currentTeam');
    localStorage.removeItem('nextTeamIndex');
    localStorage.removeItem('selectedCubeNumber');
    
    navigate('/');
  };

  const isTypeCompleted = (type) => {
    return completedTypes.includes(type.type);
  };

  const hasQuestions = (type) => {
    return type.count > 0;
  };

  const allCompleted = types.every(type => isTypeCompleted(type));

  if (loading || checkingRound) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          {loading ? 'Loading question types...' : 'Checking game status...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          Error loading questions: {error}
        </div>
      </div>
    );
  }

  // If there's no active round, show a message and disable selection
  if (!hasActiveRound) {
    return (
      <div style={styles.container}>
        <div style={styles.noActiveRound}>
          <span style={styles.noActiveRoundIcon}>⚠️</span>
          <h3 style={styles.noActiveRoundTitle}>No Active Round</h3>
          <p style={styles.noActiveRoundText}>
            There is currently no active round. 
            <br />
            Please go back and create a new round with two teams.
          </p>
          <button onClick={handleBack} style={styles.goBackBtn}>
            🔙 Go Back to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {allCompleted ? '🎉 All Complete!' : '📚 Select Question Type'}
      </h2>
      <p style={styles.subtitle}>
        {allCompleted 
          ? 'You have completed all available question types! 🏆' 
          : 'Choose a category to start playing'}
      </p>
      
      <div style={styles.grid}>
        {types.map((type) => {
          const isCompleted = isTypeCompleted(type);
          const hasAvailableQuestions = hasQuestions(type);
          const isDisabled = isCompleted || !hasAvailableQuestions || !hasActiveRound;
          
          return (
            <div
              key={type.type}
              style={{
                ...styles.card,
                ...(hoveredType === type.type && !isDisabled ? styles.cardHover : {}),
                ...(isCompleted ? styles.cardCompleted : {}),
                ...(!hasAvailableQuestions || !hasActiveRound ? styles.cardDisabled : {}),
              }}
              onMouseEnter={() => setHoveredType(type.type)}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => {
                if (!isDisabled) {
                  handleSelectType(type.type);
                }
              }}
            >
              <span style={styles.emoji}>{type.emoji || '📚'}</span>
              <div style={styles.name}>{type.name || type.type}</div>
              <div style={styles.count}>
                {hasAvailableQuestions ? `${type.count} questions available` : 'No questions available'}
              </div>
              {isCompleted && (
                <div style={styles.status}>✅ Completed!</div>
              )}
              {!isCompleted && !hasAvailableQuestions && (
                <div style={styles.statusDisabled}>🔒 No questions</div>
              )}
              {!isCompleted && hasAvailableQuestions && hasActiveRound && (
                <div style={{ ...styles.status, color: '#ffd700' }}>▶ Click to start</div>
              )}
              {!isCompleted && hasAvailableQuestions && !hasActiveRound && (
                <div style={styles.statusDisabled}>⛔ No active round</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectType;