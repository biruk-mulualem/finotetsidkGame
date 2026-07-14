// src/components/Timer.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import beepSound from '../assets/soundeffect/clock_beep_sound.wav';

const styles = {
  sideSection: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    minWidth: '130px',
    maxWidth: '160px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  sideTitle: {
    color: '#ffd700',
    fontSize: '1rem',
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
    paddingBottom: '6px',
    width: '100%',
  },
  timerSideContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 0',
    width: '100%',
  },
  timerCircleSide: {
    width: '70px',
    height: '70px',
    background: '#4CAF50',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderWidth: '3px',
    borderColor: 'rgba(76, 175, 80, 0.3)',
    transition: 'background 0.3s ease, borderColor 0.3s ease',
    position: 'relative',
  },
  timerCirclePaused: {
    background: '#ffa500',
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  timerNumberSide: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    color: '#000000',
  },
  timerLabelSide: {
    color: '#a8b5d9',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  pauseButton: {
    padding: '4px 12px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#000000',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.7rem',
    transition: 'all 0.3s',
    marginTop: '2px',
  },
  pauseButtonActive: {
    background: 'rgba(255, 165, 0, 0.3)',
    borderColor: '#ffa500',
  },
  pulseAnimation: {
    animation: 'pulse 0.5s ease-in-out infinite',
  },
};

const Timer = ({ 
  initialTime = 30, 
  isRunning = true, 
  onTimeout, 
  onTimeUpdate,
  isPaused = false,
  onPauseToggle,
  questionType = '',
  isMuted = false,
  showModal = false // NEW: prop to control modal visibility
}) => {
  const [time, setTime] = useState(initialTime);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Reset timer when initialTime changes
  useEffect(() => {
    setTime(initialTime);
    setHasTimedOut(false);
    // Stop any playing audio when resetting
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, [initialTime]);

  // Timer logic with continuous beep - using useRef for interval
  useEffect(() => {
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (isRunning && !isPaused && time > 0 && !hasTimedOut && !showModal) {
      timerIntervalRef.current = setInterval(() => {
        // Use functional update to avoid stale closures
        setTime(prevTime => {
          const newTime = prevTime - 1;
          
          // Notify parent of time update - use requestAnimationFrame to avoid render phase updates
          if (newTime >= 0 && onTimeUpdate && isMountedRef.current) {
            // Use requestAnimationFrame to schedule the update after render
            requestAnimationFrame(() => {
              if (isMountedRef.current) {
                onTimeUpdate(newTime);
              }
            });
          }
          
          if (newTime <= 0) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            
            // Use setTimeout to avoid state updates during render
            setTimeout(() => {
              if (isMountedRef.current) {
                setHasTimedOut(true);
                
                // Stop beep sound when timer ends
                if (audioRef.current && isPlayingRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  isPlayingRef.current = false;
                }
                
                if (onTimeout) {
                  onTimeout();
                }
              }
            }, 0);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, time, hasTimedOut, onTimeout, onTimeUpdate, showModal]);

  // Handle continuous beep sound
  useEffect(() => {
    // Check if sound should be muted (modal visible OR song question OR explicitly muted)
    const shouldMute = questionType === 'song' || isMuted || showModal;
    
    // Check if beep should play (timer is running, not paused, not timed out, time > 0)
    const shouldPlayBeep = isRunning && !isPaused && !hasTimedOut && time > 0;
    
    // Don't play if muted
    if (shouldMute) {
      // Stop audio if playing and muted
      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        isPlayingRef.current = false;
      }
      return;
    }
    
    // Start playing beep if conditions met and not already playing
    if (shouldPlayBeep && audioRef.current && !isPlayingRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isMountedRef.current) {
              isPlayingRef.current = true;
            }
          })
          .catch((error) => {
            // Ignore AbortError - it's caused by pause() calls
            if (error.name !== 'AbortError') {
              console.log('Beep sound playback failed:', error);
            }
            isPlayingRef.current = false;
          });
      }
    }
    
    // Stop beep if conditions not met and currently playing
    if ((!shouldPlayBeep || shouldMute) && audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        isPlayingRef.current = false;
      }
    };
  }, [isRunning, isPaused, hasTimedOut, time, questionType, isMuted, showModal]);

  // Reset timer externally
  const resetTimer = useCallback((newTime) => {
    setTime(newTime || initialTime);
    setHasTimedOut(false);
    // Stop any playing audio when resetting
    if (audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, [initialTime]);

  // Get color based on time remaining
  const getTimerColor = () => {
    if (isPaused) return '#ffa500';
    if (time <= 5) return '#f44336';
    return '#4CAF50';
  };

  const getBorderColor = () => {
    if (isPaused) return 'rgba(255, 165, 0, 0.3)';
    if (time <= 5) return 'rgba(244, 67, 54, 0.3)';
    return 'rgba(76, 175, 80, 0.3)';
  };

  // Check if timer should pulse (when time is low)
  const shouldPulse = time <= 5 && !isPaused && !hasTimedOut;

  return (
    <div style={styles.sideSection}>
      <div style={styles.sideTitle}>⏱️ Timer</div>
      <div style={styles.timerSideContainer}>
        <div style={{
          ...styles.timerCircleSide,
          ...(isPaused ? styles.timerCirclePaused : {}),
          ...(shouldPulse ? styles.pulseAnimation : {}),
          background: getTimerColor(),
          borderColor: getBorderColor(),
        }}>
          <span style={styles.timerNumberSide}>{time}</span>
        </div>
        <div style={styles.timerLabelSide}>
          {isPaused ? '⏸️ Paused' : 'Seconds'}
        </div>
        <button
          onClick={onPauseToggle}
          style={{
            ...styles.pauseButton,
            ...(isPaused ? styles.pauseButtonActive : {}),
          }}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        
        {/* Audio element for beep sound */}
        <audio 
          ref={audioRef} 
          src={beepSound} 
          preload="auto" 
          style={{ display: 'none' }}
        />
        
        {/* Show sound status indicator */}
        <div style={{ 
          color: '#a8b5d9', 
          fontSize: '0.6rem',
          marginTop: '2px',
          fontStyle: 'italic'
        }}>
          {(questionType === 'song' || isMuted || showModal) ? (
            '🔇 Sound muted'
          ) : (isRunning && !isPaused && !hasTimedOut && time > 0) ? (
            '🔊 Beep playing'
          ) : (
            '🔇 Beep stopped'
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;