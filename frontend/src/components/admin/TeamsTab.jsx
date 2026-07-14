// src/components/admin/TeamsTab.jsx
import React, { useState, useEffect } from 'react';

// ============================================
// MATCH RESULTS MODAL (inside TeamsTab)
// ============================================
const MatchResultsModal = ({ isOpen, onClose, rounds, onSubmit }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (isOpen && rounds.length > 0) {
      const activeRounds = rounds.filter(round => round.is_active === true);
      
      const matchesData = activeRounds.map((round) => ({
        roundId: round.id,
        roundNumber: round.week_number || '?',
        team1: {
          id: round.id,
          name: round.team1_name,
          emoji: round.team1_emoji,
        },
        team2: {
          id: round.id,
          name: round.team2_name,
          emoji: round.team2_emoji,
        },
        team1Score: round.team1_score || 0,
        team2Score: round.team2_score || 0
      }));
      setMatches(matchesData);
    }
  }, [isOpen, rounds]);

  const handleScoreChange = (index, team, value) => {
    const newMatches = [...matches];
    newMatches[index][`${team}Score`] = parseInt(value) || 0;
    setMatches(newMatches);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(matches);
  };

  if (!isOpen) return null;

  const activeRoundsCount = rounds.filter(round => round.is_active === true).length;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          <h2>🏆 Submit Round Results</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={modalStyles.modalBody}>
          {activeRoundsCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>✅</p>
              <p style={{ color: '#6c757d' }}>
                No active rounds to submit results for.
                <br />
                <span style={{ fontSize: '0.9rem' }}>
                  All rounds have been completed.
                </span>
              </p>
            </div>
          ) : (
            <>
              <p style={{ color: '#6c757d', marginBottom: '15px', fontSize: '0.9rem' }}>
                Enter the scores for each active round. Rounds will be marked as <strong>completed</strong> after submission.
              </p>
              <div style={matchStyles.container}>
                {matches.map((match, index) => (
                  <div key={index} style={matchStyles.matchRow}>
                    <div style={matchStyles.roundLabel}>
                      <span style={matchStyles.roundBadge}>Round {match.roundNumber}</span>
                    </div>
                    <div style={matchStyles.teamCell}>
                      <span style={matchStyles.teamName}>{match.team1.emoji} {match.team1.name}</span>
                      <input
                        type="number"
                        value={match.team1Score}
                        onChange={(e) => handleScoreChange(index, 'team1', e.target.value)}
                        style={matchStyles.scoreInput}
                        min="0"
                        placeholder="Score"
                      />
                    </div>
                    <div style={matchStyles.vsCell}>⚔️ VS</div>
                    <div style={matchStyles.teamCell}>
                      <span style={matchStyles.teamName}>{match.team2.emoji} {match.team2.name}</span>
                      <input
                        type="number"
                        value={match.team2Score}
                        onChange={(e) => handleScoreChange(index, 'team2', e.target.value)}
                        style={matchStyles.scoreInput}
                        min="0"
                        placeholder="Score"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div style={modalStyles.modalFooter}>
            <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
            <button 
              type="submit" 
              style={modalStyles.submitBtn} 
              disabled={activeRoundsCount === 0}
            >
              📊 Submit & Complete Rounds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
    marginTop: '16px',
  },
  closeBtn: {
    background: 'none',
    borderStyle: 'none',
    borderWidth: '0',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  submitBtn: {
    padding: '8px 24px',
    background: '#007bff',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  cancelBtn: {
    padding: '8px 24px',
    background: '#6c757d',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};

const matchStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
  },
  matchRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#dee2e6',
  },
  roundLabel: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    marginBottom: '4px',
  },
  roundBadge: {
    display: 'inline-block',
    padding: '2px 12px',
    background: '#007bff',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  teamCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  teamName: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
    color: '#333',
  },
  vsCell: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#6c757d',
    padding: '0 8px',
  },
  scoreInput: {
    padding: '6px 10px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    width: '80px',
    textAlign: 'center',
    background: 'white',
    color: '#333',
  },
};

// ============================================
// TEAMS TAB COMPONENT
// ============================================
const TeamsTab = ({
  rounds,
  activeRounds,
  completedRounds,
  allRounds,
  roundSearchTerm,
  setRoundSearchTerm,
  roundStatusFilter,
  setRoundStatusFilter,
  roundFilter,
  setRoundFilter,
  roundCurrentPage,
  roundTotalPages,
  roundPaginate,
  roundTotalItems,
  roundItemsPerPage,
  loading,
  // Modal props
  isMatchModalOpen,
  setIsMatchModalOpen,
  handleSubmitMatches,
}) => {
  if (loading) {
    return <div style={styles.loading}>Loading rounds...</div>;
  }

  return (
    <div>
      <div style={styles.teamsHeader}>
        <h3>👥 Teams & Rounds</h3>
        <div style={styles.teamActions}>
          <span style={styles.teamCount}>
            Active Rounds: {activeRounds.length} | Completed: {completedRounds.length}
          </span>
          <button 
            onClick={() => setIsMatchModalOpen(true)} 
            style={{
              ...styles.submitBtn,
              ...(activeRounds.length === 0 ? styles.submitBtnDisabled : {})
            }}
            disabled={activeRounds.length === 0}
            title={activeRounds.length === 0 ? 'No active rounds to submit' : 'Submit results for active rounds'}
          >
            🏆 Submit Match Results {activeRounds.length === 0 && '(No active rounds)'}
          </button>
        </div>
      </div>

      {/* Teams Toolbar - Search and Filters */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 Search teams..."
          value={roundSearchTerm}
          onChange={(e) => setRoundSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <select 
          value={roundStatusFilter} 
          onChange={(e) => setRoundStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="active">🟢 Active</option>
          <option value="completed">🔴 Completed</option>
        </select>
        
        <select 
          value={roundFilter} 
          onChange={(e) => setRoundFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Rounds</option>
          {allRounds.map(round => (
            <option key={round} value={round}>Round {round}</option>
          ))}
        </select>
      </div>
      
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '8%' }}>Round</th>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '22%' }}>Team 1</th>
              <th style={{ width: '10%' }}>Score</th>
              <th style={{ width: '22%' }}>Team 2</th>
              <th style={{ width: '10%' }}>Score</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '8%' }}>Winner</th>
            </tr>
          </thead>
          <tbody>
            {rounds.length === 0 ? (
              <tr>
                <td colSpan="8" style={{textAlign: 'center', color: '#6c757d', padding: '20px'}}>
                  No rounds registered yet.
                </td>
              </tr>
            ) : (
              rounds.map((round) => {
                let winner = '-';
                let winnerColor = '#6c757d';
                if (!round.is_active) {
                  if (round.team1_score > round.team2_score) {
                    winner = `${round.team1_name}`;
                    winnerColor = '#28a745';
                  } else if (round.team2_score > round.team1_score) {
                    winner = `${round.team2_name}`;
                    winnerColor = '#28a745';
                  } else {
                    winner = '🤝 Draw';
                    winnerColor = '#ffc107';
                  }
                } else {
                  winner = '⏳ Active';
                  winnerColor = '#007bff';
                }
                
                return (
                  <tr key={round.id} style={round.is_active ? styles.activeRow : {}}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Round {round.week_number || '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>{round.id}</td>
                    <td style={{ fontWeight: round.team1_score > round.team2_score && !round.is_active ? 'bold' : 'normal' }}>
                      {round.team1_name}
                      {round.team1_score > round.team2_score && !round.is_active && ' 🏆'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{round.team1_score}</td>
                    <td style={{ fontWeight: round.team2_score > round.team1_score && !round.is_active ? 'bold' : 'normal' }}>
                      {round.team2_name}
                      {round.team2_score > round.team1_score && !round.is_active && ' 🏆'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{round.team2_score}</td>
                    <td>
                      <span style={{
                        color: round.is_active ? '#007bff' : '#6c757d',
                        fontWeight: 'bold'
                      }}>
                        {round.is_active ? '🟢 Active' : '🔴 Completed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: winnerColor }}>
                      {winner}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Teams Pagination */}
      {roundTotalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => roundPaginate(roundCurrentPage - 1)}
            disabled={roundCurrentPage === 1}
            style={{...styles.pageBtn, ...(roundCurrentPage === 1 ? styles.pageBtnDisabled : {})}}
          >
            ◀
          </button>
          <span style={styles.pageInfo}>
            Page {roundCurrentPage} of {roundTotalPages}
          </span>
          <button
            onClick={() => roundPaginate(roundCurrentPage + 1)}
            disabled={roundCurrentPage === roundTotalPages}
            style={{...styles.pageBtn, ...(roundCurrentPage === roundTotalPages ? styles.pageBtnDisabled : {})}}
          >
            ▶
          </button>
          <span style={styles.pageInfo}>
            ({rounds.length} of {roundTotalItems})
          </span>
        </div>
      )}

      {/* Match Results Modal */}
      <MatchResultsModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        rounds={rounds}
        onSubmit={handleSubmitMatches}
      />
    </div>
  );
};

const styles = {
  teamsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  teamActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  teamCount: {
    fontSize: '0.9rem',
    color: '#6c757d',
    fontWeight: '500',
  },
  submitBtn: {
    padding: '8px 20px',
    background: '#007bff',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: '#6c757d',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    background: 'white',
    color: '#333',
    minWidth: '150px',
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    flex: '1',
    minWidth: '200px',
    background: 'white',
    color: '#333',
  },
  tableWrap: {
    overflowX: 'auto',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    tableLayout: 'fixed',
  },
  activeRow: {
    background: '#e3f2fd',
    fontWeight: 'bold',
  },
  pagination: {
    display: 'flex',
    gap: '8px',
    marginTop: '15px',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pageBtn: {
    padding: '6px 12px',
    background: '#f8f9fa',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#333',
  },
  pageBtnActive: {
    background: '#007bff',
    borderColor: '#007bff',
    color: 'white',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginLeft: '10px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
    fontSize: '1.1rem',
  },
};

export default TeamsTab;