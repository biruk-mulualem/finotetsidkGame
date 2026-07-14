// controllers/teamController.js
const { Op } = require('sequelize');
const { Team } = require('../models');

// ============================================
// TEAM CONTROLLERS
// ============================================

// Get all teams (games) with optional filters, pagination, and search
exports.getAllTeams = async (req, res) => {
  try {
    const { 
      is_active, 
      week_number, 
      search,
      limit = 10, 
      offset = 0,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;
    
    const where = {};
    
    // Filter by active status
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }
    
    // Filter by week number
    if (week_number) {
      where.week_number = parseInt(week_number);
    }
    
    // Search in team names
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { team1_name: { [Op.like]: searchTerm } },
        { team2_name: { [Op.like]: searchTerm } },
      ];
    }
    
    const parsedLimit = parseInt(limit) || 10;
    const parsedOffset = parseInt(offset) || 0;
    
    const total = await Team.count({ where });
    
    const teams = await Team.findAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: parsedLimit,
      offset: parsedOffset,
    });
    
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;
    
    res.json({
      success: true,
      count: teams.length,
      total,
      data: teams,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        totalPages,
        currentPage,
        hasNext: parsedOffset + parsedLimit < total,
        hasPrevious: parsedOffset > 0,
      },
      filters: {
        is_active: is_active !== undefined ? is_active === 'true' : null,
        week_number: week_number || null,
        search: search || null,
      }
    });
  } catch (error) {
    console.error('Error in getAllTeams:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get active game (current teams)
exports.getActiveGame = async (req, res) => {
  try {
    const game = await Team.findOne({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'No active game found',
      });
    }
    
    res.json({
      success: true,
      data: game,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single game by ID
exports.getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Team.findByPk(id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }
    
    res.json({
      success: true,
      data: game,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create a new game with both teams
exports.createGame = async (req, res) => {
  try {
    const { 
      team1_name, 
      team1_emoji, 
      team1_color,
      team2_name, 
      team2_emoji, 
      team2_color,
      week_number 
    } = req.body;
    
    // Validate required fields
    if (!team1_name || !team2_name) {
      return res.status(400).json({
        success: false,
        message: 'Both team names are required',
      });
    }
    
    // Check if teams have the same name
    if (team1_name === team2_name) {
      return res.status(400).json({
        success: false,
        message: 'Team 1 and Team 2 cannot have the same name',
      });
    }
    
    // Deactivate all existing active games
    await Team.update(
      { is_active: false },
      { where: { is_active: true } }
    );
    
    // Create new game
    const game = await Team.create({
      team1_name,
      team1_emoji: team1_emoji || '🔵',
      team1_color: team1_color || 'blue',
      team1_score: 0,
      team2_name,
      team2_emoji: team2_emoji || '🔴',
      team2_color: team2_color || 'red',
      team2_score: 0,
      is_active: true,
      week_number: week_number || null,
      game_date: new Date(),
    });
    
    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: game,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update game scores
exports.updateScores = async (req, res) => {
  try {
    const { id } = req.params;
    const { team1_score, team2_score } = req.body;
    
    const game = await Team.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }
    
    // Validate scores
    if (team1_score !== undefined && (team1_score < 0 || isNaN(team1_score))) {
      return res.status(400).json({
        success: false,
        message: 'Team 1 score must be a positive number',
      });
    }
    
    if (team2_score !== undefined && (team2_score < 0 || isNaN(team2_score))) {
      return res.status(400).json({
        success: false,
        message: 'Team 2 score must be a positive number',
      });
    }
    
    await game.update({
      team1_score: team1_score !== undefined ? team1_score : game.team1_score,
      team2_score: team2_score !== undefined ? team2_score : game.team2_score,
    });
    
    res.json({
      success: true,
      message: 'Scores updated successfully',
      data: game,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Complete game (calculate winner, update stats)
exports.completeGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Team.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }
    
    // Calculate winner
    let team1_wins = game.team1_wins;
    let team1_losses = game.team1_losses;
    let team2_wins = game.team2_wins;
    let team2_losses = game.team2_losses;
    let winner = null;
    
    if (game.team1_score > game.team2_score) {
      team1_wins += 1;
      team2_losses += 1;
      winner = {
        team: 1,
        name: game.team1_name,
        score: game.team1_score,
        emoji: game.team1_emoji,
      };
    } else if (game.team2_score > game.team1_score) {
      team2_wins += 1;
      team1_losses += 1;
      winner = {
        team: 2,
        name: game.team2_name,
        score: game.team2_score,
        emoji: game.team2_emoji,
      };
    } else {
      // Draw - no wins/losses
      winner = {
        team: 0,
        name: 'Draw',
        score: game.team1_score,
        emoji: '🤝',
      };
    }
    
    // Update game with stats and deactivate
    await game.update({
      team1_wins,
      team1_losses,
      team1_total_points: game.team1_total_points + game.team1_score,
      team1_games_played: game.team1_games_played + 1,
      team2_wins,
      team2_losses,
      team2_total_points: game.team2_total_points + game.team2_score,
      team2_games_played: game.team2_games_played + 1,
      is_active: false,
    });
    
    res.json({
      success: true,
      message: 'Game completed successfully',
      data: game,
      winner,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get game history
exports.getGameHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0, week_number, search } = req.query;
    
    const where = { is_active: false };
    if (week_number) where.week_number = parseInt(week_number);
    
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { team1_name: { [Op.like]: searchTerm } },
        { team2_name: { [Op.like]: searchTerm } },
      ];
    }
    
    const games = await Team.findAll({
      where,
      order: [['game_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    const total = await Team.count({ where });
    
    // Add winner info to each game
    const gamesWithWinner = games.map(game => {
      const gameData = game.toJSON();
      let winner = null;
      
      if (game.team1_score > game.team2_score) {
        winner = { team: 1, name: game.team1_name, score: game.team1_score };
      } else if (game.team2_score > game.team1_score) {
        winner = { team: 2, name: game.team2_name, score: game.team2_score };
      } else {
        winner = { team: 0, name: 'Draw', score: game.team1_score };
      }
      
      return {
        ...gameData,
        winner,
        match: `${game.team1_name} vs ${game.team2_name}`,
        score: `${game.team1_score} - ${game.team2_score}`,
      };
    });
    
    res.json({
      success: true,
      count: games.length,
      total,
      data: gamesWithWinner,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get leaderboard (combined stats for both teams)
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get all completed games
    const games = await Team.findAll({
      where: { is_active: false },
      order: [['game_date', 'DESC']],
    });
    
    // Aggregate stats for Team 1
    const team1Stats = {};
    games.forEach(game => {
      const name = game.team1_name;
      if (!team1Stats[name]) {
        team1Stats[name] = {
          name,
          emoji: game.team1_emoji,
          color: game.team1_color,
          wins: 0,
          losses: 0,
          total_points: 0,
          games_played: 0,
        };
      }
      team1Stats[name].wins += game.team1_wins;
      team1Stats[name].losses += game.team1_losses;
      team1Stats[name].total_points += game.team1_total_points;
      team1Stats[name].games_played += game.team1_games_played;
    });
    
    // Aggregate stats for Team 2
    const team2Stats = {};
    games.forEach(game => {
      const name = game.team2_name;
      if (!team2Stats[name]) {
        team2Stats[name] = {
          name,
          emoji: game.team2_emoji,
          color: game.team2_color,
          wins: 0,
          losses: 0,
          total_points: 0,
          games_played: 0,
        };
      }
      team2Stats[name].wins += game.team2_wins;
      team2Stats[name].losses += game.team2_losses;
      team2Stats[name].total_points += game.team2_total_points;
      team2Stats[name].games_played += game.team2_games_played;
    });
    
    // Combine and sort
    const allTeams = [...Object.values(team1Stats), ...Object.values(team2Stats)];
    const leaderboard = allTeams
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get weekly leaderboard
exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    const { week_number } = req.params;
    const { limit = 10 } = req.query;
    
    const games = await Team.findAll({
      where: { 
        is_active: false,
        week_number: parseInt(week_number),
      },
      order: [['game_date', 'DESC']],
    });
    
    // Aggregate stats for this week
    const weeklyStats = {};
    
    games.forEach(game => {
      // Team 1
      if (!weeklyStats[game.team1_name]) {
        weeklyStats[game.team1_name] = {
          name: game.team1_name,
          emoji: game.team1_emoji,
          color: game.team1_color,
          wins: 0,
          losses: 0,
          total_points: 0,
          games_played: 0,
        };
      }
      weeklyStats[game.team1_name].wins += game.team1_wins;
      weeklyStats[game.team1_name].losses += game.team1_losses;
      weeklyStats[game.team1_name].total_points += game.team1_total_points;
      weeklyStats[game.team1_name].games_played += game.team1_games_played;
      
      // Team 2
      if (!weeklyStats[game.team2_name]) {
        weeklyStats[game.team2_name] = {
          name: game.team2_name,
          emoji: game.team2_emoji,
          color: game.team2_color,
          wins: 0,
          losses: 0,
          total_points: 0,
          games_played: 0,
        };
      }
      weeklyStats[game.team2_name].wins += game.team2_wins;
      weeklyStats[game.team2_name].losses += game.team2_losses;
      weeklyStats[game.team2_name].total_points += game.team2_total_points;
      weeklyStats[game.team2_name].games_played += game.team2_games_played;
    });
    
    const leaderboard = Object.values(weeklyStats)
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      week_number: parseInt(week_number),
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete a game
exports.deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Team.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }
    
    await game.destroy();
    
    res.json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Deactivate all active games
exports.deactivateAllGames = async (req, res) => {
  try {
    await Team.update(
      { is_active: false },
      { where: { is_active: true } }
    );
    
    res.json({
      success: true,
      message: 'All games deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get game stats summary
// controllers/teamController.js - Add this new function

// ============================================
// GET COMPREHENSIVE GAME STATS
// ============================================
exports.getGameStats = async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const { Question } = require('../models');
    
    // Get round stats
    const totalRounds = await Team.count();
    const activeRounds = await Team.count({ where: { is_active: true } });
    const completedRounds = await Team.count({ where: { is_active: false } });
    
    // Get question stats
    const totalQuestions = await Question.count();
    const activeQuestions = await Question.count({ where: { is_active: true } });
    const processedQuestions = await Question.count({ where: { is_active: false } });
    
    // Get total points from all teams
    const pointsResult = await Team.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('team1_total_points')), 'team1Points'],
        [sequelize.fn('SUM', sequelize.col('team2_total_points')), 'team2Points'],
      ],
      where: { is_active: false },
    });
    
    const totalPoints = (pointsResult[0]?.get('team1Points') || 0) + 
                        (pointsResult[0]?.get('team2Points') || 0);
    
    res.json({
      success: true,
      data: {
        totalRounds,
        activeRounds,
        completedRounds,
        totalQuestions,
        activeQuestions,
        processedQuestions,
        totalPoints,
      },
    });
  } catch (error) {
    console.error('Error in getGameStats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};