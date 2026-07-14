// src/components/modals/CorrectModal.jsx
import { useState, useEffect, useRef } from 'react';

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  },
  modalContent: {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: '24px',
    padding: '40px 50px',
    maxWidth: '550px',
    width: '90%',
    textAlign: 'center',
    border: '3px solid #4caf50',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
    animation: 'modalPop 0.5s ease',
  },
  modalIcon: {
    fontSize: '5rem',
    marginBottom: '15px',
    display: 'block',
  },
  modalTitle: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#4caf50',
  },
  modalSubtitle: {
    color: '#a8b5d9',
    fontSize: '1.1rem',
    marginBottom: '15px',
  },
  modalAnswer: {
    color: '#ffd700',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    padding: '15px',
    background: 'rgba(76, 175, 80, 0.15)',
    borderRadius: '12px',
    marginBottom: '25px',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  modalBtn: {
    padding: '14px 50px',
    background: 'linear-gradient(135deg, #ffd700, #f5a623)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  points: {
    color: '#4caf50',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
};

const CorrectModal = ({ onNext, points = 10 }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Play celebration sound from assets
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error);
      });
    }
    // Show celebration animation after a slight delay
    setTimeout(() => setShowCelebration(true), 200);
  }, []);

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {/* Audio element using the clap sound from assets */}
        <audio 
          ref={audioRef} 
          src="/src/assets/soundeffect/clap_sound.mp3" 
          preload="auto" 
        />
        <span style={{ ...styles.modalIcon, animation: showCelebration ? 'bounce 0.5s ease' : '' }}>🎉</span>
        <h2 style={{ ...styles.modalTitle, animation: showCelebration ? 'pulse 0.5s ease' : '' }}>
          Correct!
        </h2>
        <p style={styles.modalSubtitle}>Great job! You got it right!</p>
        
        <button onClick={onNext} style={styles.modalBtn}>
          Continue →
        </button>
      </div>
    </div>
  );
};

export default CorrectModal;