// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// ============================================
// TEAM ROUTES
// ============================================

// Get all teams (games)
router.get('/', teamController.getAllTeams);

// Get active game
router.get('/active', teamController.getActiveGame);

// Get game history
router.get('/history', teamController.getGameHistory);

// Get leaderboard
router.get('/leaderboard', teamController.getLeaderboard);

// Get weekly leaderboard
router.get('/leaderboard/week/:week_number', teamController.getWeeklyLeaderboard);

// Get game stats
router.get('/stats', teamController.getGameStats);

// Get single game
router.get('/:id', teamController.getGameById);

// Create new game
router.post('/', teamController.createGame);

// Update scores
router.put('/:id/scores', teamController.updateScores);

// Complete game
router.put('/:id/complete', teamController.completeGame);

// Deactivate all games
router.put('/deactivate/all', teamController.deactivateAllGames);

// Delete game
router.delete('/:id', teamController.deleteGame);

module.exports = router;