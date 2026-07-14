// src/components/admin/StatsTab.jsx
import React from 'react';

const StatsTab = ({
  stats,
  filteredLeaderboard,
  leaderboardSearchTerm,
  handleLeaderboardSearch,
  leaderboardSortBy,
  handleLeaderboardSort,
  leaderboardSortOrder,
  leaderboardCurrentPage,
  leaderboardTotalPages,
  leaderboardPaginate,
  leaderboardTotalItems,
  leaderboardItemsPerPage,
  getPaginatedLeaderboard,
  loading
}) => {
  if (loading) {
    return <div style={styles.loading}>Loading stats...</div>;
  }

  return (
    <div>
      <h3 style={{marginBottom: '20px'}}>📊 Game Statistics</h3>
      
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Rounds</div>
            <div style={styles.statNumber}>{stats.totalRounds || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Rounds</div>
            <div style={styles.statNumber}>{stats.activeRounds || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed Rounds</div>
            <div style={styles.statNumber}>{stats.completedRounds || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Questions</div>
            <div style={styles.statNumber}>{stats.totalQuestions || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Questions</div>
            <div style={styles.statNumber}>{stats.activeQuestions || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Processed Questions</div>
            <div style={styles.statNumber}>{stats.processedQuestions || 0}</div>
          </div>
        </div>
      )}

      <div style={styles.tableWrap}>
        <div style={styles.leaderboardHeader}>
          <h4>🏆 All-Time Leaderboard</h4>
          <div style={styles.leaderboardToolbar}>
            <input
              type="text"
              placeholder="🔍 Search teams..."
              value={leaderboardSearchTerm}
              onChange={handleLeaderboardSearch}
              style={styles.leaderboardSearchInput}
            />
            <select 
              value={leaderboardSortBy} 
              onChange={(e) => handleLeaderboardSort(e.target.value)}
              style={styles.select}
            >
              <option value="points">Sort by Points</option>
              <option value="name">Sort by Name</option>
              <option value="rounds">Sort by Rounds</option>
            </select>
            <button 
              onClick={() => handleLeaderboardSort(leaderboardSortBy)}
              style={styles.sortBtn}
            >
              {leaderboardSortOrder === 'asc' ? '⬆ Asc' : '⬇ Desc'}
            </button>
          </div>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '8%' }}>Rank</th>
              <th style={{ width: '25%' }}>Team</th>
              <th style={{ width: '27%' }}>From Round</th>
              <th style={{ width: '15%' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaderboard.length === 0 ? (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', color: '#6c757d', padding: '20px'}}>
                  No data available. Complete some rounds to see the leaderboard.
                </td>
              </tr>
            ) : (
              getPaginatedLeaderboard().map((team, index) => {
                const globalIndex = (leaderboardCurrentPage - 1) * leaderboardItemsPerPage + index;
                return (
                  <tr key={team.id || index}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {globalIndex === 0 && team.total_points > 0 ? '🏆' : `#${globalIndex + 1}`}
                    </td>
                    <td>{team.emoji || '👤'} {team.name}</td>
                    <td style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {team.round_numbers && team.round_numbers.length > 0 ? (
                        <span>
                          {team.round_numbers.map((round, i) => (
                            <span key={i}>
                              Round {round}
                              {i < team.round_numbers.length - 1 && ', '}
                            </span>
                          ))}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {team.total_points || 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Leaderboard Pagination */}
        {leaderboardTotalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => leaderboardPaginate(leaderboardCurrentPage - 1)}
              disabled={leaderboardCurrentPage === 1}
              style={{...styles.pageBtn, ...(leaderboardCurrentPage === 1 ? styles.pageBtnDisabled : {})}}
            >
              ◀
            </button>
            <span style={styles.pageInfo}>
              Page {leaderboardCurrentPage} of {leaderboardTotalPages}
            </span>
            <button
              onClick={() => leaderboardPaginate(leaderboardCurrentPage + 1)}
              disabled={leaderboardCurrentPage === leaderboardTotalPages}
              style={{...styles.pageBtn, ...(leaderboardCurrentPage === leaderboardTotalPages ? styles.pageBtnDisabled : {})}}
            >
              ▶
            </button>
            <span style={styles.pageInfo}>
              ({leaderboardTotalItems} teams)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#dee2e6',
    transition: 'all 0.3s ease',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: '5px',
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
  leaderboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  leaderboardToolbar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  leaderboardSearchInput: {
    padding: '6px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.9rem',
    width: '200px',
    background: 'white',
    color: '#333',
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
  sortBtn: {
    padding: '6px 12px',
    background: '#6c757d',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
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

export default StatsTab;