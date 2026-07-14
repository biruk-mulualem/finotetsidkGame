// backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// ============================================
// GAME SESSION ROUTES
// ============================================

// Start a new game session
router.post('/session', gameController.startGameSession);

// Get current question
router.get('/session/:sessionId/current', gameController.getCurrentQuestion);

// Get session status
router.get('/session/:sessionId/status', gameController.getSessionStatus);

// Submit answer
router.post('/session/:sessionId/answer', gameController.submitAnswer);

// Reveal answer (no points)
router.post('/session/:sessionId/reveal', gameController.revealAnswer);

module.exports = router;