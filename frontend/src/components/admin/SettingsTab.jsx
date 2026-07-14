// src/components/admin/SettingsTab.jsx
import React from 'react';

const SettingsTab = ({
  timeLimits,
  handleTimeLimitChange,
  saveTimeLimits,
  setTimeLimits,
  typeLabels,
  loading
}) => {
  if (loading) {
    return <div style={styles.loading}>Loading settings...</div>;
  }

  return (
    <div>
      <h3 style={{marginBottom: '15px'}}>⏱️ Time Limits by Question Type</h3>
      <p style={{color: '#6c757d', marginBottom: '20px'}}>
        These time limits apply globally to all questions of each type.
      </p>
      
      <div style={styles.settingsGrid}>
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} style={styles.settingsCard}>
            <div style={styles.settingsLabel}>{label}</div>
            <div style={styles.settingsRow}>
              <input
                type="number"
                value={timeLimits[type] || 0}
                onChange={(e) => handleTimeLimitChange(type, e.target.value)}
                style={styles.settingsInput}
                min="5"
                max="120"
              />
              <span style={styles.settingsUnit}>seconds</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop: '20px'}}>
        <button onClick={saveTimeLimits} style={styles.saveBtn}>
          💾 Save All Time Limits
        </button>
        <button 
          onClick={() => setTimeLimits({sign:30, proverb:30, choice:15, truefalse:15, short:15, song:60})} 
          style={styles.resetBtn}
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};

const styles = {
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  settingsCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#dee2e6',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  settingsLabel: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
    color: '#2c3e50',
  },
  settingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  settingsInput: {
    width: '80px',
    padding: '6px 10px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  settingsUnit: {
    color: '#6c757d',
    fontSize: '0.9rem',
  },
  saveBtn: {
    padding: '10px 24px',
    background: '#28a745',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    marginRight: '10px',
  },
  resetBtn: {
    padding: '10px 24px',
    background: '#6c757d',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
    fontSize: '1.1rem',
  },
};

export default SettingsTab;