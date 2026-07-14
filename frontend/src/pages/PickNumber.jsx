// src/pages/PickNumber.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionsByType } from '../services/questionService';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 'calc(100vh - 160px)',
    overflow: 'hidden',
    padding: '20px 80px',
    background: '#ffffff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '0',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: '8px',
  },
  teamInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  currentTeam: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: '1.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  teamEmoji: {
    fontSize: '2rem',
  },
  turnText: {
    color: '#6c757d',
    fontSize: '1.2rem',
    fontWeight: '400',
  },
  gameInfo: {
    color: '#6c757d',
    fontSize: '0.9rem',
    background: '#f8f9fa',
    padding: '8px 20px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  backBtn: {
    padding: '10px 22px',
    background: 'rgba(0, 0, 0, 0.05)',
    color: '#111010',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cubesWrapper: {
    flex: 1,
    overflow: 'auto',
    padding: '30px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cubesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '32px', // Increased from 28px
    margin: '0 auto',
    maxWidth: '1000px', // Increased from 900px
    width: '100%',
  },
  cube: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3.45rem', // Increased from 3rem (15% larger)
    fontWeight: 'bold',
    borderRadius: '23px', // Increased from 20px (15% larger)
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#f8f9fa',
    border: '4.6px solid #ffd700', // Increased from 4px (15% larger)
    color: '#1a1a2e',
    minHeight: '145px', // Increased from 126px (15% larger)
    position: 'relative',
    boxShadow: '0 3.5px 14px rgba(0,0,0,0.08)', // 15% larger
  },
  cubeUsed: {
    opacity: '0.6',
    cursor: 'not-allowed',
    transform: 'scale(0.92)',
    border: '4.6px solid #4CAF50',
    background: '#e8f5e9',
    color: '#4CAF50',
  },
  cubeAnswered: {
    opacity: '0.6',
    cursor: 'not-allowed',
    border: '4.6px solid #2196F3',
    background: '#e3f2fd',
    color: '#2196F3',
  },
  cubeDisabled: {
    opacity: '0.3',
    cursor: 'not-allowed',
    border: '4.6px solid #dee2e6',
    background: '#f8f9fa',
    color: '#adb5bd',
    transform: 'scale(0.85)',
  },
  cubeHover: {
    transform: 'scale(1.08)',
    background: '#fff3cd',
    border: '4.6px solid #ffd700',
    boxShadow: '0 9px 32px rgba(255, 215, 0, 0.5)', // 15% larger
  },
  checkmark: {
    position: 'absolute',
    top: '-9px', // Adjusted
    right: '-9px', // Adjusted
    fontSize: '1.84rem', // Increased from 1.6rem (15% larger)
    color: '#4CAF50',
    background: 'white',
    borderRadius: '50%',
    padding: '3px',
    width: '41px', // Increased from 36px (15% larger)
    height: '41px', // Increased from 36px (15% larger)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3.5px 14px rgba(0,0,0,0.2)', // 15% larger
  },
  noQuestions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#6c757d',
    fontSize: '1.2rem',
    textAlign: 'center',
    padding: '20px',
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#1a1a2e',
    fontSize: '1.2rem',
  },
  progressBar: {
    width: '100%',
    maxWidth: '1000px', // Increased from 900px
    margin: '0 auto 25px auto',
    height: '9px', // Increased from 8px (15% larger)
    background: '#e9ecef',
    borderRadius: '4.5px', // 15% larger
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffd700, #4CAF50)',
    borderRadius: '4.5px',
    transition: 'width 0.3s ease',
  },
};

const PickNumber = () => {
  const navigate = useNavigate();
  const [hoveredCube, setHoveredCube] = useState(null);
  const [teams, setTeams] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [questionType, setQuestionType] = useState('');
  const [gameState, setGameState] = useState({
    usedCubes: [],
    answeredCubes: [],
    askedQuestionIds: [],
    currentQuestionIndex: 0,
    cardNumbers: [],
  });

  const { questions, loading } = useQuestionsByType(questionType);

  // Load data from localStorage
  useEffect(() => {
    const teamsData = localStorage.getItem('gameTeams');
    const type = localStorage.getItem('selectedType');
    const state = localStorage.getItem('gameState');
    const teamIndex = localStorage.getItem('currentTeamIndex');
    
    if (!teamsData || !type) {
      navigate('/');
      return;
    }
    
    setTeams(JSON.parse(teamsData));
    setQuestionType(type);
    if (state) {
      const parsedState = JSON.parse(state);
      setGameState({
        usedCubes: parsedState.usedCubes || [],
        answeredCubes: parsedState.answeredCubes || [],
        askedQuestionIds: parsedState.askedQuestionIds || [],
        currentQuestionIndex: parsedState.currentQuestionIndex || 0,
        cardNumbers: parsedState.cardNumbers || [],
      });
    }
    if (teamIndex) setCurrentTeamIndex(parseInt(teamIndex));
  }, [navigate]);

  // Extract card numbers from questions when they load
  useEffect(() => {
    if (questions && questions.length > 0 && gameState.cardNumbers.length === 0) {
      const cardNumbers = questions
        .map(q => q.card_number)
        .filter(num => num !== null && num !== undefined)
        .sort((a, b) => a - b);
      
      if (cardNumbers.length > 0) {
        const updatedState = {
          ...gameState,
          cardNumbers: cardNumbers,
        };
        setGameState(updatedState);
        localStorage.setItem('gameState', JSON.stringify(updatedState));
      } else {
        const fallbackNumbers = Array.from({ length: questions.length }, (_, i) => i + 1);
        const updatedState = {
          ...gameState,
          cardNumbers: fallbackNumbers,
        };
        setGameState(updatedState);
        localStorage.setItem('gameState', JSON.stringify(updatedState));
      }
    }
  }, [questions, gameState.cardNumbers]);

  // Get available questions with their card numbers
  const availableQuestions = useMemo(() => {
    if (!questions) return [];
    return questions.filter(q => 
      !gameState.askedQuestionIds.includes(q.id)
    );
  }, [questions, gameState.askedQuestionIds]);

  // Create a map of card number to question
  const cardNumberMap = useMemo(() => {
    const map = new Map();
    availableQuestions.forEach(q => {
      if (q.card_number) {
        map.set(q.card_number, q);
      }
    });
    return map;
  }, [availableQuestions]);

  // Get all card numbers from the map (sorted)
  const allCardNumbers = useMemo(() => {
    if (gameState.cardNumbers.length > 0) {
      return gameState.cardNumbers;
    }
    return Array.from({ length: availableQuestions.length }, (_, i) => i + 1);
  }, [gameState.cardNumbers, availableQuestions.length]);

  const currentTeam = teams[currentTeamIndex % teams.length];

  const handleCubeClick = (cardNumber) => {
    const question = cardNumberMap.get(cardNumber);
    
    if (!question) {
      console.log(`No question found for card ${cardNumber}`);
      return;
    }
    
    if (gameState.usedCubes.includes(cardNumber)) {
      console.log(`Card ${cardNumber} already used`);
      return;
    }

    const updatedState = {
      ...gameState,
      usedCubes: [...gameState.usedCubes, cardNumber],
    };
    
    localStorage.setItem('gameState', JSON.stringify(updatedState));
    localStorage.setItem('currentQuestion', JSON.stringify(question));
    localStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    localStorage.setItem('nextTeamIndex', String((currentTeamIndex + 1) % teams.length));
    
    navigate('/game-board');
  };

  const handleBack = () => {
    navigate('/select-type');
  };

  // Check if all cards are used
  const allUsed = allCardNumbers.every(num => gameState.usedCubes.includes(num));
  const progress = allCardNumbers.length > 0 ? (gameState.usedCubes.length / allCardNumbers.length) * 100 : 0;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>Loading questions...</div>
      </div>
    );
  }

  if (allCardNumbers.length === 0 || availableQuestions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={handleBack} style={styles.backBtn}>⬅ Back</button>
          <div style={styles.noQuestions}>
            <div>
              <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</p>
              <p>No active questions available for this type.</p>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '8px' }}>
                All questions have been answered or none are active.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backBtn}>⬅ Back</button>
        <div style={styles.teamInfo}>
          <div style={styles.currentTeam}>
            <span style={styles.teamEmoji}>{currentTeam?.emoji || '👤'}</span>
            {currentTeam?.name || 'Team'}
          </div>
          <span style={styles.turnText}>
            {allUsed ? '🎉 All questions completed!' : "'s Turn - Pick a Number"}
          </span>
        </div>
        <div style={styles.gameInfo}>
          <span>
            {allUsed ? '✅ Complete' : `${gameState.usedCubes.length}/${allCardNumbers.length}`}
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{questionType}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {!allUsed && (
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      )}

      <div style={styles.cubesWrapper}>
        <div style={styles.cubesGrid}>
          {allCardNumbers.map((cardNum) => {
            const isUsed = gameState.usedCubes.includes(cardNum);
            const isAnswered = gameState.answeredCubes?.includes(cardNum) || false;
            const hasQuestion = cardNumberMap.has(cardNum);
            const isUnavailable = isUsed || isAnswered || !hasQuestion;
            
            let cubeStyle = { ...styles.cube };
            
            if (isUsed) {
              cubeStyle = { ...cubeStyle, ...styles.cubeUsed };
            } else if (isAnswered) {
              cubeStyle = { ...cubeStyle, ...styles.cubeAnswered };
            } else if (!hasQuestion) {
              cubeStyle = { ...cubeStyle, ...styles.cubeDisabled };
            }
            
            if (hoveredCube === cardNum && !isUnavailable) {
              cubeStyle = { ...cubeStyle, ...styles.cubeHover };
            }
            
            return (
              <div
                key={cardNum}
                style={cubeStyle}
                onClick={() => {
                  if (!isUnavailable && hasQuestion) {
                    handleCubeClick(cardNum);
                  }
                }}
                onMouseEnter={() => setHoveredCube(cardNum)}
                onMouseLeave={() => setHoveredCube(null)}
                title={isUsed ? 'Already used' : isAnswered ? 'Already answered' : !hasQuestion ? 'No question' : 'Click to select'}
              >
                {cardNum}
                {(isUsed || isAnswered) && <span style={styles.checkmark}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PickNumber;