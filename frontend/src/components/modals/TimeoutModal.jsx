// src/components/modals/TimeoutModal.jsx
import { useEffect, useRef } from 'react';

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
    border: '3px solid #ffa500',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
    animation: 'modalPop 0.5s ease',
  },
  modalIcon: {
    fontSize: '4.5rem',
    marginBottom: '15px',
    display: 'block',
  },
  modalTitle: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#ffa500',
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
    background: 'rgba(255, 165, 0, 0.15)',
    borderRadius: '12px',
    marginBottom: '15px',
    border: '1px solid rgba(255, 165, 0, 0.3)',
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
  message: {
    color: '#ffa500',
    fontSize: '0.9rem',
    marginBottom: '15px',
  },
};

const TimeoutModal = ({ onNext, correctAnswer }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <audio ref={audioRef} src="/src/assets/soundeffect/wrong_answer.wav" preload="auto" />
        <span style={styles.modalIcon}>⏰</span>
        <h2 style={styles.modalTitle}>Time's Up!</h2>
        <p style={styles.modalSubtitle}>The correct answer was:</p>
        <div style={styles.modalAnswer}>{correctAnswer}</div>
        <p style={styles.message}>No points awarded this time. ⏱️</p>
        <button onClick={onNext} style={styles.modalBtn}>
          Continue →
        </button>
      </div>
    </div>
  );
};

export default TimeoutModal;