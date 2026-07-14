// backend/controllers/gameController.js
const { Op } = require('sequelize');
const { Question, Team, Session, SessionQuestion, SessionTeam } = require('../models');

// ============================================
// GAME SESSION CONTROLLERS
// ============================================

/**
 * Start a new game session
 * POST /api/game/session
 */
exports.startGameSession = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { teamIds, questionType, totalQuestions = 10 } = req.body;

    // Validate teams
    const teams = await Team.findAll({
      where: { id: teamIds },
      transaction,
    });

    if (teams.length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'At least 2 teams are required',
      });
    }

    // Get active questions for the type
    const questions = await Question.findAll({
      where: { 
        type: questionType, 
        is_active: true 
      },
      limit: totalQuestions,
      order: [['id', 'ASC']],
      transaction,
    });

    if (questions.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No active questions found for this type',
      });
    }

    // Create session
    const session = await Session.create({
      question_type: questionType,
      status: 'active',
      total_questions: questions.length,
      current_team_index: 0,
      current_question_index: 0,
    }, { transaction });

    // Add teams to session
    for (const team of teams) {
      await SessionTeam.create({
        session_id: session.id,
        team_id: team.id,
        team_name: team.name,
        team_emoji: team.emoji,
        score: 0,
      }, { transaction });
    }

    // Add questions to session
    for (const question of questions) {
      await SessionQuestion.create({
        session_id: session.id,
        question_id: question.id,
        answered: false,
        is_correct: false,
        team_index: 0,
        points_earned: 0,
        time_taken: 0,
      }, { transaction });
    }

    await transaction.commit();

    // Get full session data
    const fullSession = await Session.findByPk(session.id, {
      include: [
        { 
          model: SessionTeam, 
          as: 'teams',
          attributes: ['id', 'team_id', 'team_name', 'team_emoji', 'score']
        },
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question',
            attributes: ['id', 'type', 'category', 'question', 'options', 'correct', 'image_url', 'audio_url', 'points', 'time_limit']
          }],
          attributes: ['id', 'answered', 'is_correct', 'team_index', 'points_earned', 'time_taken']
        }
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Game session started successfully',
      data: fullSession,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error starting game session:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Get current question for a session
 * GET /api/game/session/:sessionId/current
 */
exports.getCurrentQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findByPk(sessionId, {
      include: [
        { 
          model: SessionTeam, 
          as: 'teams',
          attributes: ['id', 'team_id', 'team_name', 'team_emoji', 'score']
        },
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question',
            attributes: ['id', 'type', 'category', 'question', 'options', 'correct', 'image_url', 'audio_url', 'points', 'time_limit']
          }],
          attributes: ['id', 'answered', 'is_correct', 'team_index', 'points_earned', 'time_taken']
        }
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Find the first unanswered question
    const questionIndex = session.questions.findIndex(q => !q.answered);
    
    if (questionIndex === -1) {
      // All questions answered
      return res.json({
        success: true,
        data: {
          session,
          allCompleted: true,
          question: null,
          questionIndex: -1,
        },
      });
    }

    const sessionQuestion = session.questions[questionIndex];
    const currentTeam = session.teams[session.current_team_index] || null;

    res.json({
      success: true,
      data: {
        session,
        question: sessionQuestion,
        questionIndex,
        currentTeam,
        totalQuestions: session.questions.length,
        answeredQuestions: session.questions.filter(q => q.answered).length,
        allCompleted: false,
      },
    });
  } catch (error) {
    console.error('Error getting current question:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Submit answer for a question
 * POST /api/game/session/:sessionId/answer
 */
exports.submitAnswer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const { questionIndex, teamIndex, isCorrect, pointsEarned, timeTaken } = req.body;

    // Get session with locks
    const session = await Session.findByPk(sessionId, {
      include: [
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question'
          }]
        },
        { 
          model: SessionTeam, 
          as: 'teams'
        }
      ],
      transaction,
      lock: true,
    });

    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (questionIndex >= session.questions.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Question not found in session',
      });
    }

    const sessionQuestion = session.questions[questionIndex];

    // Check if already answered
    if (sessionQuestion.answered) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Question already answered',
      });
    }

    // Update session question
    await sessionQuestion.update({
      answered: true,
      is_correct: isCorrect,
      team_index: teamIndex,
      points_earned: pointsEarned || 0,
      time_taken: timeTaken || 0,
    }, { transaction });

    // Update team score if correct
    if (isCorrect && pointsEarned > 0) {
      const sessionTeams = session.teams;
      if (teamIndex < sessionTeams.length) {
        const team = sessionTeams[teamIndex];
        await team.update({
          score: team.score + pointsEarned,
        }, { transaction });
      }
    }

    // Check if all questions answered
    const allAnswered = session.questions.every(q => q.answered);
    let status = session.status;
    let completedAt = session.completed_at;

    if (allAnswered) {
      status = 'completed';
      completedAt = new Date();

      // Update team stats
      const sortedTeams = [...session.teams].sort((a, b) => b.score - a.score);
      const winnerId = sortedTeams.length > 0 ? sortedTeams[0].team_id : null;

      for (const team of session.teams) {
        const isWinner = team.team_id === winnerId;
        await Team.update({
          games_played: sequelize.literal('games_played + 1'),
          total_points: sequelize.literal(`total_points + ${team.score}`),
          wins: sequelize.literal(`wins + ${isWinner ? 1 : 0}`),
          losses: sequelize.literal(`losses + ${isWinner ? 0 : 1}`),
        }, {
          where: { id: team.team_id },
          transaction,
        });
      }
    }

    // Update session
    await session.update({
      current_question_index: questionIndex + 1,
      current_team_index: (teamIndex + 1) % session.teams.length,
      status: status,
      completed_at: completedAt,
    }, { transaction });

    await transaction.commit();

    // Get updated session
    const updatedSession = await Session.findByPk(sessionId, {
      include: [
        { 
          model: SessionTeam, 
          as: 'teams',
          attributes: ['id', 'team_id', 'team_name', 'team_emoji', 'score']
        },
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question',
            attributes: ['id', 'type', 'category', 'question', 'options', 'correct', 'image_url', 'audio_url', 'points', 'time_limit']
          }],
          attributes: ['id', 'answered', 'is_correct', 'team_index', 'points_earned', 'time_taken']
        }
      ],
    });

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        session: updatedSession,
        allCompleted: status === 'completed',
        questionIndex,
        teamIndex,
        isCorrect,
        pointsEarned,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error submitting answer:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Reveal answer for a question (no points awarded)
 * POST /api/game/session/:sessionId/reveal
 */
exports.revealAnswer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const { questionIndex } = req.body;

    const session = await Session.findByPk(sessionId, {
      include: [
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question'
          }]
        },
        { 
          model: SessionTeam, 
          as: 'teams'
        }
      ],
      transaction,
      lock: true,
    });

    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (questionIndex >= session.questions.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Question not found in session',
      });
    }

    const sessionQuestion = session.questions[questionIndex];

    // Check if already answered
    if (sessionQuestion.answered) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Question already answered',
      });
    }

    // Mark as answered but incorrect (0 points)
    await sessionQuestion.update({
      answered: true,
      is_correct: false,
      team_index: -1, // No team gets points
      points_earned: 0,
      time_taken: 0,
    }, { transaction });

    // Check if all questions answered
    const allAnswered = session.questions.every(q => q.answered);
    let status = session.status;
    let completedAt = session.completed_at;

    if (allAnswered) {
      status = 'completed';
      completedAt = new Date();

      // Update team stats
      const sortedTeams = [...session.teams].sort((a, b) => b.score - a.score);
      const winnerId = sortedTeams.length > 0 ? sortedTeams[0].team_id : null;

      for (const team of session.teams) {
        const isWinner = team.team_id === winnerId;
        await Team.update({
          games_played: sequelize.literal('games_played + 1'),
          total_points: sequelize.literal(`total_points + ${team.score}`),
          wins: sequelize.literal(`wins + ${isWinner ? 1 : 0}`),
          losses: sequelize.literal(`losses + ${isWinner ? 0 : 1}`),
        }, {
          where: { id: team.team_id },
          transaction,
        });
      }
    }

    await session.update({
      current_question_index: questionIndex + 1,
      current_team_index: (session.current_team_index + 1) % session.teams.length,
      status: status,
      completed_at: completedAt,
    }, { transaction });

    await transaction.commit();

    // Get updated session
    const updatedSession = await Session.findByPk(sessionId, {
      include: [
        { 
          model: SessionTeam, 
          as: 'teams',
          attributes: ['id', 'team_id', 'team_name', 'team_emoji', 'score']
        },
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question',
            attributes: ['id', 'type', 'category', 'question', 'options', 'correct', 'image_url', 'audio_url', 'points', 'time_limit']
          }],
          attributes: ['id', 'answered', 'is_correct', 'team_index', 'points_earned', 'time_taken']
        }
      ],
    });

    res.json({
      success: true,
      message: 'Answer revealed',
      data: {
        session: updatedSession,
        allCompleted: status === 'completed',
        questionIndex,
        revealed: true,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error revealing answer:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Get game session status
 * GET /api/game/session/:sessionId/status
 */
exports.getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findByPk(sessionId, {
      include: [
        { 
          model: SessionTeam, 
          as: 'teams',
          attributes: ['id', 'team_id', 'team_name', 'team_emoji', 'score']
        },
        { 
          model: SessionQuestion, 
          as: 'questions',
          include: [{ 
            model: Question, 
            as: 'question',
            attributes: ['id', 'type', 'category', 'question', 'options', 'correct', 'image_url', 'audio_url', 'points', 'time_limit']
          }],
          attributes: ['id', 'answered', 'is_correct', 'team_index', 'points_earned', 'time_taken']
        }
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const answeredCount = session.questions.filter(q => q.answered).length;
    const totalCount = session.questions.length;
    const currentTeam = session.teams[session.current_team_index] || null;

    // Get next unanswered question
    const nextQuestionIndex = session.questions.findIndex(q => !q.answered);
    const nextQuestion = nextQuestionIndex !== -1 ? session.questions[nextQuestionIndex] : null;

    res.json({
      success: true,
      data: {
        session,
        progress: {
          answered: answeredCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0,
        },
        currentTeam,
        nextQuestionIndex,
        nextQuestion,
        isComplete: session.status === 'completed',
        teams: session.teams.map(t => ({
          id: t.team_id,
          name: t.team_name,
          emoji: t.team_emoji,
          score: t.score,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};