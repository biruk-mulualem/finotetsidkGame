// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import questionService from '../services/questionService';
import teamsService from '../services/teamsService';
import QuestionsTab from '../components/admin/QuestionsTab';
import TeamsTab from '../components/admin/TeamsTab';
import StatsTab from '../components/admin/StatsTab';
import SettingsTab from '../components/admin/SettingsTab';

const gameService = {
  questions: questionService,
  teams: teamsService,
  sessions: {
    submitWeeklyResults: async (data) => {
      return { success: true };
    }
  }
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // ========== QUESTIONS STATE ==========
  const [questions, setQuestions] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypeForAdd, setSelectedTypeForAdd] = useState('choice');
  
  // ========== QUESTION PAGINATION ==========
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ========== ROUNDS STATE ==========
  const [rounds, setRounds] = useState([]);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [allRounds, setAllRounds] = useState([]);
  
  // ========== ROUNDS PAGINATION & FILTERS ==========
  const [roundSearchTerm, setRoundSearchTerm] = useState('');
  const [roundStatusFilter, setRoundStatusFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');
  const [roundCurrentPage, setRoundCurrentPage] = useState(1);
  const [roundItemsPerPage] = useState(10);
  const [roundTotalItems, setRoundTotalItems] = useState(0);
  const [roundTotalPages, setRoundTotalPages] = useState(0);

  // ========== TIME LIMITS ==========
  const [timeLimits, setTimeLimits] = useState({
    sign: 30,
    proverb: 30,
    choice: 15,
    truefalse: 15,
    short: 15,
    song: 60
  });

  // ========== STATS & LEADERBOARD ==========
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [leaderboardSearchTerm, setLeaderboardSearchTerm] = useState('');
  const [leaderboardSortBy, setLeaderboardSortBy] = useState('points');
  const [leaderboardSortOrder, setLeaderboardSortOrder] = useState('desc');
  const [leaderboardCurrentPage, setLeaderboardCurrentPage] = useState(1);
  const [leaderboardItemsPerPage] = useState(10);
  const [leaderboardTotalItems, setLeaderboardTotalItems] = useState(0);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(0);

  // ========== FETCH ALL ROUNDS ==========
  const fetchAllRounds = useCallback(async () => {
    try {
      const response = await gameService.teams.getAllTeams({ 
        limit: 1000, 
        offset: 0 
      });
      const allRoundsData = response.data || [];
      const rounds = new Set();
      allRoundsData.forEach(round => {
        if (round.week_number) {
          rounds.add(round.week_number);
        }
      });
      setAllRounds(Array.from(rounds).sort((a, b) => b - a));
    } catch (error) {
      console.error('Failed to fetch rounds:', error);
    }
  }, []);

  // ========== DATA FETCHING ==========
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: 'id',
        sortOrder: 'ASC'
      };
      
      if (selectedStatus !== 'all') {
        params.isActive = selectedStatus === 'active';
      }
      
      const response = await gameService.questions.getQuestions(params);
      const data = response.data || [];
      setQuestions(data);
      
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(response.pagination.totalPages || 0);
      } else {
        setTotalItems(response.total || data.length);
        setTotalPages(Math.ceil((response.total || data.length) / itemsPerPage));
      }
    } catch (error) {
      showMessage('error', 'Failed to load questions: ' + (error.message || ''));
    }
    setLoading(false);
  }, [selectedType, selectedStatus, searchTerm, currentPage, itemsPerPage]);

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: roundItemsPerPage,
        offset: (roundCurrentPage - 1) * roundItemsPerPage,
        sortBy: 'id',
        sortOrder: 'DESC'
      };
      
      if (roundStatusFilter !== 'all') {
        params.is_active = roundStatusFilter === 'active';
      }
      
      if (roundFilter !== 'all' && roundFilter !== '') {
        params.week_number = parseInt(roundFilter);
      }
      
      if (roundSearchTerm.trim() !== '') {
        params.search = roundSearchTerm.trim();
      }
      
      const response = await gameService.teams.getAllTeams(params);
      const data = response.data || [];
      setRounds(data);
      setRoundTotalItems(response.total || data.length);
      setRoundTotalPages(Math.ceil((response.total || data.length) / roundItemsPerPage));
    } catch (error) {
      showMessage('error', 'Failed to load rounds');
    }
    setLoading(false);
  }, [roundCurrentPage, roundItemsPerPage, roundStatusFilter, roundFilter, roundSearchTerm]);

  // ========== LEADERBOARD FUNCTIONS ==========
  const applyLeaderboardFilters = useCallback((data, search, sortBy, sortOrder) => {
    let filtered = [...data];
    
    if (search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchLower) ||
        (team.emoji && team.emoji.includes(search))
      );
    }
    
    filtered.sort((a, b) => {
      let valA, valB;
      switch(sortBy) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'rounds':
          valA = a.rounds || 0;
          valB = b.rounds || 0;
          break;
        case 'points':
        default:
          valA = a.total_points || 0;
          valB = b.total_points || 0;
          break;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    
    setFilteredLeaderboard(filtered);
    setLeaderboardTotalItems(filtered.length);
    setLeaderboardTotalPages(Math.ceil(filtered.length / leaderboardItemsPerPage));
    setLeaderboardCurrentPage(1);
  }, [leaderboardItemsPerPage]);

  const handleLeaderboardSearch = (e) => {
    const value = e.target.value;
    setLeaderboardSearchTerm(value);
    applyLeaderboardFilters(leaderboard, value, leaderboardSortBy, leaderboardSortOrder);
  };

  const handleLeaderboardSort = (sortBy) => {
    const newOrder = leaderboardSortBy === sortBy && leaderboardSortOrder === 'asc' ? 'desc' : 'asc';
    setLeaderboardSortBy(sortBy);
    setLeaderboardSortOrder(newOrder);
    applyLeaderboardFilters(leaderboard, leaderboardSearchTerm, sortBy, newOrder);
  };

  const getPaginatedLeaderboard = () => {
    const startIndex = (leaderboardCurrentPage - 1) * leaderboardItemsPerPage;
    const endIndex = startIndex + leaderboardItemsPerPage;
    return filteredLeaderboard.slice(startIndex, endIndex);
  };

  const leaderboardPaginate = (pageNumber) => {
    setLeaderboardCurrentPage(pageNumber);
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions();
    } else if (activeTab === 'teams') {
      fetchRounds();
      fetchAllRounds();
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'settings') {
      loadTimeLimits();
    }
  }, [activeTab, fetchQuestions, fetchRounds, fetchAllRounds]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsRes = await gameService.teams.getGameStats();
      setStats(statsRes.data);
      
      const allRoundsRes = await gameService.teams.getAllTeams({ 
        limit: 1000, 
        offset: 0 
      });
      const allRoundsData = allRoundsRes.data || [];
      
      const teamStats = {};
      
      allRoundsData.forEach(round => {
        const weekNumber = round.week_number || '?';
        
        // Process Team 1
        if (!teamStats[round.team1_name]) {
          teamStats[round.team1_name] = {
            name: round.team1_name,
            emoji: round.team1_emoji || '👤',
            rounds: 0,
            total_points: 0,
            round_numbers: [],
            round_points: [],
          };
        }
        teamStats[round.team1_name].rounds += 1;
        teamStats[round.team1_name].total_points += round.team1_total_points || 0;
        teamStats[round.team1_name].round_numbers.push(weekNumber);
        teamStats[round.team1_name].round_points.push({
          round: weekNumber,
          points: round.team1_total_points || 0,
          score: round.team1_score || 0
        });
        
        // Process Team 2
        if (!teamStats[round.team2_name]) {
          teamStats[round.team2_name] = {
            name: round.team2_name,
            emoji: round.team2_emoji || '👤',
            rounds: 0,
            total_points: 0,
            round_numbers: [],
            round_points: [],
          };
        }
        teamStats[round.team2_name].rounds += 1;
        teamStats[round.team2_name].total_points += round.team2_total_points || 0;
        teamStats[round.team2_name].round_numbers.push(weekNumber);
        teamStats[round.team2_name].round_points.push({
          round: weekNumber,
          points: round.team2_total_points || 0,
          score: round.team2_score || 0
        });
      });
      
      const leaderboardData = Object.values(teamStats)
        .map(team => ({
          ...team,
          roundsDisplay: team.round_numbers.join(', '),
          pointsDisplay: team.round_points.map(rp => `R${rp.round}: ${rp.points}pts`).join(' | ')
        }))
        .sort((a, b) => {
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points;
          }
          if (b.rounds !== a.rounds) {
            return b.rounds - a.rounds;
          }
          return a.name.localeCompare(b.name);
        });
      
      setLeaderboard(leaderboardData);
      applyLeaderboardFilters(leaderboardData, '', 'points', 'desc');
      
    } catch (error) {
      showMessage('error', 'Failed to load stats: ' + (error.message || ''));
    }
    setLoading(false);
  };

  const loadTimeLimits = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('gameTimeLimits');
      if (saved) {
        setTimeLimits(JSON.parse(saved));
      }
    } catch (error) {
      showMessage('error', 'Failed to load time limits');
    }
    setLoading(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ========== PAGINATION ==========
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const roundPaginate = (pageNumber) => {
    setRoundCurrentPage(pageNumber);
  };

  // ========== QUESTION CRUD ==========
  const handleSaveQuestion = async (data) => {
    try {
      if (editingQuestion) {
        await gameService.questions.updateQuestion(editingQuestion.id, data);
        showMessage('success', 'Question updated!');
        fetchQuestions();
        setEditingQuestion(null);
        setIsModalOpen(false);
      } else {
        await gameService.questions.createQuestion(data);
        showMessage('success', 'Question created!');
        fetchQuestions();
      }
    } catch (error) {
      showMessage('error', 'Failed to save question: ' + (error.message || ''));
      throw error;
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    setLoading(true);
    try {
      await gameService.questions.deleteQuestion(id);
      showMessage('success', 'Question deleted!');
      fetchQuestions();
    } catch (error) {
      showMessage('error', 'Failed to delete question');
    }
    setLoading(false);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  // ========== MATCH RESULTS ==========
  const handleSubmitMatches = async (matches) => {
    setLoading(true);
    try {
      for (const match of matches) {
        await gameService.teams.updateScores(match.roundId, {
          team1_score: match.team1Score,
          team2_score: match.team2Score
        });
        
        await gameService.teams.completeGame(match.roundId);
      }
      
      showMessage('success', `Results submitted for ${matches.length} round${matches.length > 1 ? 's' : ''}!`);
      setIsMatchModalOpen(false);
      fetchRounds();
      fetchStats();
    } catch (error) {
      showMessage('error', 'Failed to submit results: ' + (error.message || ''));
    }
    setLoading(false);
  };

  // ========== TIME LIMITS ==========
  const handleTimeLimitChange = (type, value) => {
    setTimeLimits({ ...timeLimits, [type]: parseInt(value) || 0 });
  };

  const saveTimeLimits = () => {
    localStorage.setItem('gameTimeLimits', JSON.stringify(timeLimits));
    showMessage('success', 'Time limits saved!');
  };

  const getTimeLimit = (type) => timeLimits[type] || 30;

  const typeLabels = {
    sign: 'Sign Language',
    proverb: 'Bible Proverb',
    choice: 'Multiple Choice',
    truefalse: 'True/False',
    short: 'Short Answer',
    song: 'Guess the Song'
  };

  const activeRounds = rounds.filter(round => round.is_active === true);
  const completedRounds = rounds.filter(round => round.is_active === false);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ Game Admin</h1>
      
      {message.text && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'questions' ? styles.tabActive : {})}}
          onClick={() => { setActiveTab('questions'); setCurrentPage(1); }}
        >
          📝 Questions
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'teams' ? styles.tabActive : {})}}
          onClick={() => { setActiveTab('teams'); setRoundCurrentPage(1); }}
        >
          👥 Teams & Results
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'stats' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('stats')}
        >
          📊 Stats
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'settings' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('settings')}
        >
          ⏱️ Settings
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'questions' && (
          <QuestionsTab
            questions={questions}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleAddQuestion={handleAddQuestion}
            handleEditQuestion={handleEditQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
            getTimeLimit={getTimeLimit}
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            loading={loading}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            editingQuestion={editingQuestion}
            setEditingQuestion={setEditingQuestion}
            selectedTypeForAdd={selectedTypeForAdd}
            handleSaveQuestion={handleSaveQuestion}
            handleCloseModal={handleCloseModal}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsTab
            rounds={rounds}
            activeRounds={activeRounds}
            completedRounds={completedRounds}
            allRounds={allRounds}
            roundSearchTerm={roundSearchTerm}
            setRoundSearchTerm={setRoundSearchTerm}
            roundStatusFilter={roundStatusFilter}
            setRoundStatusFilter={setRoundStatusFilter}
            roundFilter={roundFilter}
            setRoundFilter={setRoundFilter}
            roundCurrentPage={roundCurrentPage}
            roundTotalPages={roundTotalPages}
            roundPaginate={roundPaginate}
            roundTotalItems={roundTotalItems}
            roundItemsPerPage={roundItemsPerPage}
            loading={loading}
            isMatchModalOpen={isMatchModalOpen}
            setIsMatchModalOpen={setIsMatchModalOpen}
            handleSubmitMatches={handleSubmitMatches}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            stats={stats}
            filteredLeaderboard={filteredLeaderboard}
            leaderboardSearchTerm={leaderboardSearchTerm}
            handleLeaderboardSearch={handleLeaderboardSearch}
            leaderboardSortBy={leaderboardSortBy}
            handleLeaderboardSort={handleLeaderboardSort}
            leaderboardSortOrder={leaderboardSortOrder}
            leaderboardCurrentPage={leaderboardCurrentPage}
            leaderboardTotalPages={leaderboardTotalPages}
            leaderboardPaginate={leaderboardPaginate}
            leaderboardTotalItems={leaderboardTotalItems}
            leaderboardItemsPerPage={leaderboardItemsPerPage}
            getPaginatedLeaderboard={getPaginatedLeaderboard}
            loading={loading}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            timeLimits={timeLimits}
            handleTimeLimitChange={handleTimeLimitChange}
            saveTimeLimits={saveTimeLimits}
            setTimeLimits={setTimeLimits}
            typeLabels={typeLabels}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN STYLES
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    padding: '20px',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#333333',
  },
  title: {
    color: '#2c3e50',
    fontSize: '1.8rem',
    marginBottom: '20px',
    borderBottom: '3px solid #3498db',
    paddingBottom: '10px',
  },
  message: {
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '15px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '2px solid #e9ecef',
    paddingBottom: '10px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 20px',
    background: 'white',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#dee2e6',
    borderRadius: '6px',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#3498db',
    borderColor: '#3498db',
    color: 'white',
  },
  content: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
};

export default AdminPanel;