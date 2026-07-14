// src/pages/GameBoard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService from '../services/questionService';
import CorrectModal from '../components/modals/CorrectModal';
import WrongModal from '../components/modals/WrongModal';
import TimeoutModal from '../components/modals/TimeoutModal';
import Timer from '../components/Timer';

// ============================================
// HELPER: Get display URL (Vite compatible)
// ============================================
const getDisplayUrl = (url) => {
  if (!url) return null;
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /uploads, prepend the API base URL
  if (url.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${baseUrl}${url}`;
  }
  
  return url;
};

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minHeight: 'calc(100vh - 100px)',
  },
  main: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    paddingBottom: '4px',
    borderBottom: '1px solid rgba(253, 253, 253, 0.1)',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: '4px',
  },
  currentTeam: {
    color: '#ffd700',
    fontWeight: 'bold',
    fontSize: '1.4rem',
  },
  gameInfo: {
    color: '#a8b5d9',
    fontSize: '0.9rem',
  },
  questionCard: {
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  questionCategory: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(255, 215, 0, 0.2)',
    color: '#ffd700',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginBottom: '10px',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: '1.4rem',
    marginBottom: '15px',
    lineHeight: '1.6',
    color: '#000000',
    fontWeight: '600',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    flex: 1,
  },
  optionBtn: {
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.12)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#000000',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'left',
    fontWeight: '500',
  },
  optionSelected: {
    borderColor: '#ffd700',
    background: 'rgba(255, 215, 0, 0.2)',
  },
  trueFalseContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    marginTop: '10px',
    flex: 1,
  },
  trueFalseBtn: {
    padding: '25px 50px',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#000000',
    minWidth: '150px',
  },
  shortAnswerButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
    maxWidth: '450px',
  },
  shortAnswerBtn: {
    padding: '20px',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#000000',
    textAlign: 'center',
  },
  proverbDisplay: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '550px',
    marginBottom: '10px',
  },
  proverbText: {
    fontSize: '1.6rem',
    color: '#ffd700',
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: '1.8',
  },
  signDisplay: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px dashed rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    minHeight: '350px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '550px',
  },
  signImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '8px',
    marginBottom: '8px',
    objectFit: 'contain',
  },
  audioControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  audioButton: {
    padding: '12px 30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'linear-gradient(135deg, #ffd700, #f5a623)',
    color: '#1a1a2e',
  },
  audioButtonPlaying: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
  },
  replayButton: {
    padding: '12px 30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
    color: '#000000',
  },
  descriptionArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '10px',
  },
  answerFeedback: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    flexShrink: 0,
  },
  correctAnswer: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  incorrectAnswer: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  timeoutAnswer: {
    color: '#ffa500',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  nextBtn: {
    marginTop: '10px',
    padding: '10px 24px',
    background: '#ffd700',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '1.1rem',
  },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  songIcon: {
    fontSize: '3rem',
    color: '#ffd700',
    textAlign: 'center',
    display: 'block',
    marginBottom: '10px',
  },
};

// Updated AudioPlayer - Only Play and Replay (no Stop)
const AudioPlayer = ({ audioSrc, isPlaying, onPlay, onReplay }) => {
  return (
    <div style={styles.audioControls}>
      <button
        onClick={isPlaying ? onReplay : onPlay}
        style={{
          ...styles.audioButton,
          ...(isPlaying ? styles.audioButtonPlaying : {}),
        }}
      >
        {isPlaying ? '🔄 Replay' : '▶️ Play'}
      </button>
    </div>
  );
};

const GameBoard = () => {
  const navigate = useNavigate();
  
  // State with safe defaults
  const [question, setQuestion] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [questionType, setQuestionType] = useState('');
  const [gameState, setGameState] = useState({
    usedCubes: [],
    answeredCubes: [],
    askedQuestionIds: [],
    currentQuestionIndex: 0,
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isProcessingNext, setIsProcessingNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const userAnsweredRef = useRef(false);
  const processedQuestionRef = useRef(null);
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const timeoutProcessedRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const isPausingRef = useRef(false);

  // Load data from localStorage
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setIsLoading(true);
        
        const questionData = localStorage.getItem('currentQuestion');
        const teamData = localStorage.getItem('currentTeam');
        const teamsData = localStorage.getItem('gameTeams');
        const type = localStorage.getItem('selectedType');
        const state = localStorage.getItem('gameState');
        
        if (!questionData || !teamsData) {
          navigate('/pick-number');
          return;
        }
        
        const q = JSON.parse(questionData);
        setQuestion(q);
        
        if (teamData) {
          setCurrentTeam(JSON.parse(teamData));
        }
        
        if (teamsData) {
          setTeams(JSON.parse(teamsData));
        }
        
        setQuestionType(type || '');
        
        if (state) {
          try {
            const parsedState = JSON.parse(state);
            setGameState({
              usedCubes: parsedState.usedCubes || [],
              answeredCubes: parsedState.answeredCubes || [],
              askedQuestionIds: parsedState.askedQuestionIds || [],
              currentQuestionIndex: parsedState.currentQuestionIndex || 0,
            });
          } catch (e) {
            console.warn('Failed to parse gameState, using defaults');
          }
        }
        
        setTimer(q.time_limit || 30);
        setHasTimedOut(false);
        timeoutProcessedRef.current = false;
        setModalType(null);
        setIsTimerRunning(true);
        setIsPaused(false);
      } catch (error) {
        console.error('Error loading game data:', error);
        navigate('/pick-number');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [navigate]);

  // ============================================
  // DEACTIVATE QUESTION
  // ============================================
  const deactivateQuestion = useCallback(async (id) => {
    if (!id || processedQuestionRef.current === id) return;
    
    processedQuestionRef.current = id;
    
    try {
      const response = await questionService.deactivateQuestion(id);
      if (response && response.success) {
        const updatedState = {
          ...gameState,
          askedQuestionIds: [...gameState.askedQuestionIds, id],
        };
        localStorage.setItem('gameState', JSON.stringify(updatedState));
        setGameState(updatedState);
        console.log(`✅ Question ${id} deactivated (${hasTimedOut ? 'timeout' : 'answered'})`);
      }
    } catch (error) {
      console.error('Failed to deactivate question:', error);
    } finally {
      userAnsweredRef.current = false;
    }
  }, [gameState, hasTimedOut]);

  // ============================================
  // HANDLE TIMEOUT
  // ============================================
  const handleTimeout = useCallback(() => {
    if (hasTimedOut || timeoutProcessedRef.current) return;
    
    console.log('⏰ TIMEOUT! Deactivating question with 0 points');
    
    setHasTimedOut(true);
    timeoutProcessedRef.current = true;
    setIsTimerRunning(false);
    setShowAnswer(true);
    setPointsEarned(0);
    
    userAnsweredRef.current = true;
    
    if (question?.id) {
      deactivateQuestion(question.id);
    }
    
    setModalType('timeout');
    
    // Stop audio if playing
    if (audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setIsSongPlaying(false);
    }
  }, [question, hasTimedOut, deactivateQuestion, isAudioPlaying]);

  // ============================================
  // TIMER LOGIC
  // ============================================
  useEffect(() => {
    if (isTimerRunning && !isPaused && timer > 0 && !showAnswer && !hasTimedOut) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [isTimerRunning, isPaused, timer, showAnswer, hasTimedOut, handleTimeout]);

  // ============================================
  // AUDIO HANDLERS
  // ============================================
  const handlePlayAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsAudioPlaying(true);
          setIsSongPlaying(true);
        })
        .catch((error) => {
          console.error('Audio playback failed:', error);
        });
    }
  }, []);

  const handleReplayAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setIsAudioPlaying(true);
          setIsSongPlaying(true);
        })
        .catch((error) => {
          console.error('Audio replay failed:', error);
        });
    }
  }, []);

  // Auto-play audio for song questions
  useEffect(() => {
    if (question?.type === 'song' && !showAnswer && !isAudioPlaying && !hasTimedOut) {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsAudioPlaying(true);
            setIsSongPlaying(true);
          })
          .catch((error) => {
            console.error('Auto-play failed:', error);
          });
      }
    }
  }, [question, showAnswer, isAudioPlaying, hasTimedOut]);

  // Cleanup audio when question changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsAudioPlaying(false);
        setIsSongPlaying(false);
      }
    };
  }, [question?.id]);

  // ============================================
  // GET CORRECT ANSWER TEXT
  // ============================================
  const getCorrectAnswerText = () => {
    if (!question) return '';
    switch (question.type) {
      case 'choice':
        return question.options?.[question.correct] || '';
      case 'truefalse':
        return question.correct === 'true' ? 'True' : 'False';
      case 'short':
        return question.answer || question.correct || '';
      case 'sign':
      case 'proverb':
      case 'song':
        return question.correct || '';
      default:
        return '';
    }
  };

  // ============================================
  // ANSWER HANDLERS
  // ============================================
  const handleAnswer = useCallback((optionIndex) => {
    if (showAnswer || !isTimerRunning || hasTimedOut) return;
    if (!question) return;
    
    // Stop audio if playing
    if (audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setIsSongPlaying(false);
    }
    
    const isCorrect = optionIndex === parseInt(question.correct);
    const points = isCorrect ? (question.points || 10) : 0;
    
    setPointsEarned(points);
    userAnsweredRef.current = true;
    setSelectedOption(optionIndex);
    setShowAnswer(true);
    setIsTimerRunning(false);
    
    // Update team score only if correct
    if (isCorrect && points > 0) {
      const updatedTeams = teams.map(t => {
        if (t.id === currentTeam?.id) {
          return { ...t, score: (t.score || 0) + points };
        }
        return t;
      });
      localStorage.setItem('gameTeams', JSON.stringify(updatedTeams));
      setTeams(updatedTeams);
    }
    
    setModalType(isCorrect ? 'correct' : 'wrong');
    
    deactivateQuestion(question.id);
  }, [question, showAnswer, isTimerRunning, hasTimedOut, currentTeam, teams, deactivateQuestion, isAudioPlaying]);

  const handleTrueFalse = useCallback((value) => {
    if (showAnswer || !isTimerRunning || hasTimedOut) return;
    if (!question) return;
    
    // Stop audio if playing
    if (audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setIsSongPlaying(false);
    }
    
    const isCorrect = value === (question.correct === 'true');
    const points = isCorrect ? (question.points || 10) : 0;
    
    setPointsEarned(points);
    userAnsweredRef.current = true;
    setSelectedOption(value);
    setShowAnswer(true);
    setIsTimerRunning(false);
    
    if (isCorrect && points > 0) {
      const updatedTeams = teams.map(t => {
        if (t.id === currentTeam?.id) {
          return { ...t, score: (t.score || 0) + points };
        }
        return t;
      });
      localStorage.setItem('gameTeams', JSON.stringify(updatedTeams));
      setTeams(updatedTeams);
    }
    
    setModalType(isCorrect ? 'correct' : 'wrong');
    
    deactivateQuestion(question.id);
  }, [question, showAnswer, isTimerRunning, hasTimedOut, currentTeam, teams, deactivateQuestion, isAudioPlaying]);

  const handleShortAnswer = useCallback((isCorrect) => {
    if (showAnswer || !isTimerRunning || hasTimedOut) return;
    if (!question) return;
    
    // Stop audio if playing
    if (audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setIsSongPlaying(false);
    }
    
    const points = isCorrect ? (question.points || 10) : 0;
    
    setPointsEarned(points);
    userAnsweredRef.current = true;
    setSelectedOption(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);
    setIsTimerRunning(false);
    
    if (isCorrect && points > 0) {
      const updatedTeams = teams.map(t => {
        if (t.id === currentTeam?.id) {
          return { ...t, score: (t.score || 0) + points };
        }
        return t;
      });
      localStorage.setItem('gameTeams', JSON.stringify(updatedTeams));
      setTeams(updatedTeams);
    }
    
    setModalType(isCorrect ? 'correct' : 'wrong');
    
    deactivateQuestion(question.id);
  }, [question, showAnswer, isTimerRunning, hasTimedOut, currentTeam, teams, deactivateQuestion, isAudioPlaying]);

  const handleSignProverbSong = useCallback((isCorrect) => {
    if (showAnswer || !isTimerRunning || hasTimedOut) return;
    if (!question) return;
    
    // Stop audio if playing
    if (audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setIsSongPlaying(false);
    }
    
    const points = isCorrect ? (question.points || 10) : 0;
    
    setPointsEarned(points);
    userAnsweredRef.current = true;
    setSelectedOption(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);
    setIsTimerRunning(false);
    
    if (isCorrect && points > 0) {
      const updatedTeams = teams.map(t => {
        if (t.id === currentTeam?.id) {
          return { ...t, score: (t.score || 0) + points };
        }
        return t;
      });
      localStorage.setItem('gameTeams', JSON.stringify(updatedTeams));
      setTeams(updatedTeams);
    }
    
    setModalType(isCorrect ? 'correct' : 'wrong');
    
    deactivateQuestion(question.id);
  }, [question, showAnswer, isTimerRunning, hasTimedOut, currentTeam, teams, deactivateQuestion, isAudioPlaying]);

  // ============================================
  // MODAL HANDLERS
  // ============================================
  const handleModalNext = useCallback(() => {
    setModalType(null);
    setIsProcessingNext(true);
    
    // Clear timer interval if still running
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    const updatedState = {
      ...gameState,
      askedQuestionIds: [...gameState.askedQuestionIds, question.id],
    };
    localStorage.setItem('gameState', JSON.stringify(updatedState));
    setGameState(updatedState);
    
    const totalQuestions = 10;
    const usedCount = gameState?.usedCubes?.length || 0;
    
    if (usedCount >= totalQuestions) {
      const type = localStorage.getItem('selectedType');
      const completed = JSON.parse(localStorage.getItem('completedTypes') || '[]');
      if (type && !completed.includes(type)) {
        completed.push(type);
        localStorage.setItem('completedTypes', JSON.stringify(completed));
      }
      navigate('/select-type');
      return;
    }
    
    const nextTeamIndex = parseInt(localStorage.getItem('nextTeamIndex') || '0');
    localStorage.setItem('currentTeamIndex', String(nextTeamIndex));
    navigate('/pick-number');
  }, [gameState, question, navigate]);

  const handlePauseToggle = useCallback(() => {
    if (isPausingRef.current) return;
    isPausingRef.current = true;
    setIsPaused(prev => !prev);
    setTimeout(() => {
      isPausingRef.current = false;
    }, 100);
  }, []);

  // In GameBoard.jsx, replace the handleTimeUpdate function
const handleTimeUpdate = useCallback((newTime) => {
  // Only update if the value actually changed and we're not showing answer
  if (!showAnswer && !hasTimedOut) {
    setTimer(newTime);
  }
}, [showAnswer, hasTimedOut]);

  const optionLabels = ['A', 'B', 'C', 'D'];
  const usedCount = (gameState && gameState.usedCubes) ? gameState.usedCubes.length : 0;

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.main}>
          <div style={styles.header}>
            <div style={styles.currentTeam}>
              {currentTeam?.emoji || '👤'} {currentTeam?.name || 'Team'}
            </div>
            <div style={styles.gameInfo}>
              {questionType} | Loading...
            </div>
          </div>
          <div style={{ ...styles.questionCard, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#a8b5d9', fontSize: '1.2rem' }}>
              Loading question...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={styles.container}>
        <div style={styles.main}>
          <div style={styles.header}>
            <div style={styles.currentTeam}>
              {currentTeam?.emoji || '👤'} {currentTeam?.name || 'Team'}
            </div>
            <div style={styles.gameInfo}>
              {questionType} | No question
            </div>
          </div>
          <div style={{ ...styles.questionCard, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#a8b5d9', fontSize: '1.2rem' }}>
              No question available
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.header}>
          <div style={styles.currentTeam}>
            {currentTeam?.emoji || '👤'} {currentTeam?.name || 'Team'}
          </div>
          <div style={styles.gameInfo}>
            {questionType} | {usedCount}/10
          </div>
        </div>

        <div style={styles.questionCard}>
          <div style={styles.questionCategory}>{question?.category}</div>
          <div style={styles.questionText}>{question?.question}</div>
          
          {question?.type === 'choice' && question?.options && question.options.length > 0 && (
            <div style={styles.optionsGrid}>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.optionBtn,
                    ...(selectedOption === index && !showAnswer ? styles.optionSelected : {}),
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleAnswer(index)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  <strong>{optionLabels[index]}.</strong> {option}
                </button>
              ))}
            </div>
          )}

          {question?.type === 'truefalse' && (
            <div style={styles.trueFalseContainer}>
              <button
                style={{
                  ...styles.trueFalseBtn,
                  ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                }}
                onClick={() => handleTrueFalse(true)}
                disabled={showAnswer || !isTimerRunning || hasTimedOut}
              >
                ✅ True
              </button>
              <button
                style={{
                  ...styles.trueFalseBtn,
                  ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                }}
                onClick={() => handleTrueFalse(false)}
                disabled={showAnswer || !isTimerRunning || hasTimedOut}
              >
                ❌ False
              </button>
            </div>
          )}

          {question?.type === 'short' && (
            <div style={styles.descriptionArea}>
              <div style={styles.shortAnswerButtons}>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleShortAnswer(true)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ✅ Correct
                </button>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleShortAnswer(false)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ❌ Incorrect
                </button>
              </div>
            </div>
          )}

          {question?.type === 'sign' && (
            <div style={styles.descriptionArea}>
              <div style={styles.signDisplay}>
                <img 
                  src={getDisplayUrl(question.image_url)} 
                  alt={question.description || "Sign Language"} 
                  style={styles.signImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {question.description && (
                  <div style={{ color: '#a8b5d9', fontSize: '0.7rem', marginTop: '4px' }}>
                
                  </div>
                )}
              </div>
              <div style={styles.shortAnswerButtons}>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleSignProverbSong(true)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ✅ Correct Guess
                </button>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleSignProverbSong(false)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ❌ Incorrect Guess
                </button>
              </div>
            </div>
          )}

          {question?.type === 'proverb' && (
            <div style={styles.descriptionArea}>
              <div style={styles.proverbDisplay}>
                <span style={styles.proverbText}>
                  {question.question}
                </span>
              </div>
              <div style={styles.shortAnswerButtons}>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleSignProverbSong(true)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ✅ Correct
                </button>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleSignProverbSong(false)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ❌ Incorrect
                </button>
              </div>
            </div>
          )}

          {question?.type === 'song' && (
            <div style={styles.descriptionArea}>
              <div style={styles.signDisplay}>
                <span style={styles.songIcon}>🎵</span>
                <audio
                  ref={audioRef}
                  src={question.audio_url}
                  onEnded={() => {
                    setIsAudioPlaying(false);
                    setIsSongPlaying(false);
                  }}
                  style={{ display: 'none' }}
                />
                <AudioPlayer
                  audioSrc={question.audio_url}
                  isPlaying={isAudioPlaying}
                  onPlay={handlePlayAudio}
                  onReplay={handleReplayAudio}
                />
              </div>
              <div style={styles.shortAnswerButtons}>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleSignProverbSong(true)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ✅ Correct
                </button>
                <button
                  style={{
                    ...styles.shortAnswerBtn,
                    ...((showAnswer || !isTimerRunning || hasTimedOut) ? styles.disabled : {})
                  }}
                  onClick={() => handleSignProverbSong(false)}
                  disabled={showAnswer || !isTimerRunning || hasTimedOut}
                >
                  ❌ Incorrect
                </button>
              </div>
            </div>
          )}
          
          {showAnswer && (
            <div style={styles.answerFeedback}>
              {modalType === 'timeout' ? (
                <p style={styles.timeoutAnswer}>⏰ Time's up! No points awarded.</p>
              ) : modalType === 'correct' ? (
                <p style={styles.correctAnswer}>🎉 Correct! +{pointsEarned} pts</p>
              ) : (
                <p style={styles.incorrectAnswer}>
                  😅 Wrong! 
                  {question?.type === 'short' && ` Answer: ${question.answer}`}
                  {question?.type === 'sign' && ` Answer: ${question.correct}`}
                  {question?.type === 'proverb' && ` Answer: ${question.correct}`}
                  {question?.type === 'song' && ` Answer: ${question.correct}`}
                  {question?.type === 'truefalse' && ` Answer: ${question.correct ? 'True' : 'False'}`}
                  {question?.type === 'choice' && question?.options && ` Answer: ${question.options[question.correct]}`}
                </p>
              )}
              <button onClick={handleModalNext} style={styles.nextBtn}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <Timer
        initialTime={timer}
        isRunning={isTimerRunning}
        isPaused={isPaused}
        onTimeout={handleTimeout}
        onTimeUpdate={handleTimeUpdate}
        onPauseToggle={handlePauseToggle}
        questionType={question?.type || ''}
        isMuted={question?.type === 'song'}
         showModal={modalType !== null} 
      />

      {modalType === 'correct' && (
        <CorrectModal 
          onNext={handleModalNext}
          points={pointsEarned}
        />
      )}
      
      {modalType === 'wrong' && (
        <WrongModal 
          onNext={handleModalNext}
          correctAnswer={getCorrectAnswerText()}
        />
      )}
      
      {modalType === 'timeout' && (
        <TimeoutModal 
          onNext={handleModalNext}
          correctAnswer={getCorrectAnswerText()}
        />
      )}
    </div>
  );
};

export default GameBoard;