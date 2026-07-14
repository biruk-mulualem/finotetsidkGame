// backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// ============================================
// QUESTION ROUTES
// ============================================

// GET /api/questions - Get all questions with filters
router.get('/', questionController.getQuestions);

// GET /api/questions/types - Get question types with counts
router.get('/types', questionController.getQuestionTypes);

// GET /api/questions/type/:type - Get questions by type
router.get('/type/:type', questionController.getQuestionsByType);

// PUT /api/questions/assign-card-numbers - Assign card numbers to questions (admin only)
router.put('/assign-card-numbers', questionController.assignCardNumbers);

// PUT /api/questions/:id/deactivate - Deactivate a specific question
router.put('/:id/deactivate', questionController.deactivateQuestion);

// GET /api/questions/:id - Get single question (dynamic - catch all)
router.get('/:id', questionController.getQuestion);

// POST /api/questions - Create question (admin only)
router.post('/', questionController.createQuestion);

// PUT /api/questions/:id - Update question (admin only)
router.put('/:id', questionController.updateQuestion);

// DELETE /api/questions/:id - Delete question (admin only)
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;