// backend/controllers/questionController.js
const { Op } = require('sequelize');
const { Question } = require('../models');

// ============================================
// GET ALL QUESTIONS (with filters, pagination, search)
// ============================================
exports.getQuestions = async (req, res) => {
  try {
    const { 
      type, 
      category, 
      isActive, 
      search,
      limit = 10, 
      offset = 0,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;
    
    const where = {};
    
    // Filter by type
    if (type) where.type = type;
    
    // Filter by category
    if (category) where.category = category;
    
    // Filter by active status (default: true)
    if (isActive !== undefined) {
      where.is_active = isActive === 'true';
    } else {
      where.is_active = true; // Default: only active questions
    }
    
    // SEARCH: Search in question, category, correct, and answer fields
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { question: { [Op.like]: searchTerm } },
        { category: { [Op.like]: searchTerm } },
        { correct: { [Op.like]: searchTerm } },
        { answer: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } },
        // Search in options array (for PostgreSQL)
        // For MySQL/PostgreSQL, you might need a different approach
        // This works for PostgreSQL with JSONB
        // { options: { [Op.contains]: [search.trim()] } }
      ];
      
      // For SQLite, you might need to use a different approach
      // Or you can use raw SQL for better search
    }
    
    // Build order
    const order = [[sortBy, sortOrder]];
    
    // Parse pagination params
    const parsedLimit = parseInt(limit) || 10;
    const parsedOffset = parseInt(offset) || 0;
    
    // Get total count (for pagination)
    const total = await Question.count({ where });
    
    // Get paginated results
    const questions = await Question.findAll({
      where,
      order,
      limit: parsedLimit,
      offset: parsedOffset,
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;
    
    res.json({
      success: true,
      data: questions,
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
        type: type || null,
        category: category || null,
        isActive: isActive !== undefined ? isActive === 'true' : true,
        search: search || null,
      }
    });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// GET QUESTIONS BY TYPE (with pagination)
// ============================================
exports.getQuestionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { 
      limit = 10, 
      offset = 0,
      search,
      sortBy = 'card_number',
      sortOrder = 'ASC'
    } = req.query;
    
    // Validate type
    const validTypes = ['sign', 'proverb', 'choice', 'truefalse', 'short', 'song'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question type',
      });
    }
    
    const where = { 
      type, 
      is_active: true 
    };
    
    // Search filter
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { question: { [Op.like]: searchTerm } },
        { category: { [Op.like]: searchTerm } },
        { correct: { [Op.like]: searchTerm } },
      ];
    }
    
    const parsedLimit = parseInt(limit) || 10;
    const parsedOffset = parseInt(offset) || 0;
    
    const total = await Question.count({ where });
    
    const questions = await Question.findAll({
      where,
      limit: parsedLimit,
      offset: parsedOffset,
      order: [
        [sortBy, sortOrder],
        ['id', 'ASC']
      ],
    });
    
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;
    
    console.log(`📊 Found ${questions.length} active questions for type ${type}`);
    console.log(`📊 Total active count: ${total}`);
    
    res.json({
      success: true,
      count: questions.length,
      total: total,
      data: questions,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        totalPages,
        currentPage,
        hasNext: parsedOffset + parsedLimit < total,
        hasPrevious: parsedOffset > 0,
      }
    });
  } catch (error) {
    console.error('Error in getQuestionsByType:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// GET QUESTION TYPES WITH COUNTS (only active)
// ============================================
exports.getQuestionTypes = async (req, res) => {
  try {
    const { sequelize } = require('../models');
    
    // Get all types with counts for active questions
    const types = await Question.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { is_active: true },
      group: ['type'],
      order: [['type', 'ASC']],
      raw: true,
    });
    
    // Define all possible types with metadata
    const allTypes = [
      { type: 'sign', emoji: '🤟', name: 'Sign Language' },
      { type: 'proverb', emoji: '📜', name: 'Bible Proverb' },
      { type: 'choice', emoji: '❓', name: 'Multiple Choice' },
      { type: 'truefalse', emoji: '⚖️', name: 'True or False' },
      { type: 'short', emoji: '✏️', name: 'Short Answer' },
      { type: 'song', emoji: '🎵', name: 'Guess the Song' },
    ];
    
    // Merge counts with all types
    const result = allTypes.map(typeInfo => {
      const found = types.find(t => t.type === typeInfo.type);
      return {
        ...typeInfo,
        count: found ? parseInt(found.count) : 0,
      };
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getQuestionTypes:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// GET SINGLE QUESTION BY ID
// ============================================
exports.getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }
    
    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Error in getQuestion:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// CREATE QUESTION (admin only)
// ============================================

exports.createQuestion = async (req, res) => {
  try {
    const { 
      type, 
      category, 
      question, 
      options, 
      correct, 
      answer,
      image_url,
      description,
      audio_url,
      difficulty,
      points,
      time_limit,
      is_active,
      is_weekly,
      week_number,
      year,
      // card_number is removed from req.body - we auto-generate it
    } = req.body;
    
    // Validate required fields
    if (!type || !category || !question || !correct) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, category, question, correct',
      });
    }
    
    // Validate type
    const validTypes = ['sign', 'proverb', 'choice', 'truefalse', 'short', 'song'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question type',
      });
    }
    
    // ============================================
    // AUTO-GENERATE UNIQUE CARD NUMBER FOR THIS TYPE
    // ============================================
    // Find all active questions for this type with card numbers
    const existingQuestions = await Question.findAll({
      where: { 
        type: type,
        is_active: true,
        card_number: { [Op.ne]: null }
      },
      attributes: ['card_number'],
      order: [['card_number', 'ASC']],
    });
    
    // Get all existing card numbers for this type
    const existingCardNumbers = existingQuestions
      .map(q => q.card_number)
      .filter(num => num !== null && num !== undefined)
      .sort((a, b) => a - b);
    
    // Find the first available number (starting from 1)
    let nextCardNumber = 1;
    while (existingCardNumbers.includes(nextCardNumber)) {
      nextCardNumber++;
    }
    
    console.log(`📊 Auto-generating unique card_number for type "${type}": ${nextCardNumber}`);
    console.log(`📊 Existing card numbers for type "${type}": ${existingCardNumbers.join(', ')}`);
    
    // Handle options properly for PostgreSQL array
    let finalOptions = null;
    if (type === 'choice' && options && Array.isArray(options)) {
      // Filter out empty strings
      const filtered = options.filter(opt => opt && opt.trim() !== '');
      if (filtered.length > 0) {
        // Ensure all items are strings (PostgreSQL array expects strings)
        finalOptions = filtered.map(opt => String(opt).trim());
      }
    }
    
    const newQuestion = await Question.create({
      type,
      category,
      question,
      options: finalOptions,
      correct: String(correct),
      answer: answer || null,
      image_url: image_url || null,
      description: description || null,
      audio_url: audio_url || null,
      difficulty: difficulty || 1,
      points: points || 10,
      time_limit: time_limit || 30,
      is_active: is_active !== undefined ? is_active : true,
      is_weekly: is_weekly || false,
      week_number: week_number || null,
      year: year || null,
      card_number: nextCardNumber, // Auto-generated unique number
    });
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: newQuestion,
      card_number_assigned: nextCardNumber,
    });
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};


exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_number, type, options } = req.body;
    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }
    
    // If card_number is being updated manually, validate it
    if (card_number !== undefined && card_number !== null) {
      if (card_number < 1 || card_number > 10) {
        return res.status(400).json({
          success: false,
          message: 'Card number must be between 1 and 10',
        });
      }
      
      // Check if card_number already exists for this type (excluding current question)
      const questionType = type || question.type;
      const existing = await Question.findOne({
        where: {
          type: questionType,
          card_number: card_number,
          is_active: true,
          id: { [Op.ne]: id }
        }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Card number ${card_number} already exists for this question type`,
        });
      }
    }
    
    // Handle options properly for PostgreSQL array
    let updateData = { ...req.body };
    
    if (options !== undefined) {
      const questionType = type || question.type;
      if (questionType === 'choice' && options && Array.isArray(options)) {
        const filtered = options.filter(opt => opt && opt.trim() !== '');
        if (filtered.length > 0) {
          updateData.options = filtered.map(opt => String(opt).trim());
        } else {
          updateData.options = null;
        }
      } else {
        updateData.options = null;
      }
    }
    
    // Ensure correct is a string
    if (updateData.correct !== undefined) {
      updateData.correct = String(updateData.correct);
    }
    
    await question.update(updateData);
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question,
    });
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// DELETE QUESTION (admin only)
// ============================================
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }
    
    await question.destroy();
    
    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// DEACTIVATE QUESTION (mark as answered/used)
// ============================================
exports.deactivateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);
    
    // SAFETY: Prevent any bulk operations
    if (isNaN(questionId) || questionId <= 0) {
      console.log(`❌ Invalid question ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID',
      });
    }
    
    console.log(`🔴 Attempting to deactivate question ID: ${questionId}`);
    
    const question = await Question.findByPk(questionId);
    
    if (!question) {
      console.log(`❌ Question ${questionId} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }
    
    if (!question.is_active) {
      console.log(`⚠️ Question ${questionId} is already deactivated`);
      return res.status(400).json({
        success: false,
        message: 'Question is already deactivated',
      });
    }
    
    const questionType = question.type;
    const cardNumber = question.card_number;
    
    await question.update({ 
      is_active: false 
    });
    
    const updatedQuestion = await Question.findByPk(questionId);
    console.log(`✅ Question ${questionId} updated. New is_active: ${updatedQuestion.is_active}`);
    
    const remainingCount = await Question.count({
      where: { 
        type: questionType, 
        is_active: true 
      }
    });
    console.log(`📊 Remaining active questions for type "${questionType}": ${remainingCount}`);
    console.log(`📊 Card number ${cardNumber} (Question ${questionId}) deactivated`);
    
    res.json({
      success: true,
      message: `Question ${questionId} marked as answered`,
      data: updatedQuestion,
      remainingCount: remainingCount,
    });
  } catch (error) {
    console.error('❌ Error in deactivateQuestion:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ASSIGN CARD NUMBERS (admin only)
// ============================================

exports.assignCardNumbers = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { is_active: true };
    if (type) where.type = type;
    
    // Get all active questions for this type
    const questions = await Question.findAll({
      where,
      order: [['id', 'ASC']],
    });
    
    if (questions.length === 0) {
      return res.json({
        success: true,
        message: 'No active questions found for this type',
        data: [],
      });
    }
    
    // Get existing card numbers
    const existingCardNumbers = questions
      .map(q => q.card_number)
      .filter(num => num !== null && num !== undefined)
      .sort((a, b) => a - b);
    
    // Find missing numbers and assign them
    const updates = [];
    let nextCardNumber = 1;
    
    for (const question of questions) {
      // Skip questions that already have a card number
      if (question.card_number !== null && question.card_number !== undefined) {
        continue;
      }
      
      // Find the next available card number
      while (existingCardNumbers.includes(nextCardNumber)) {
        nextCardNumber++;
      }
      
      question.card_number = nextCardNumber;
      await question.save();
      updates.push({
        id: question.id,
        card_number: nextCardNumber,
        question: question.question.substring(0, 50) + '...'
      });
      existingCardNumbers.push(nextCardNumber);
      nextCardNumber++;
    }
    
    res.json({
      success: true,
      message: `Assigned card numbers to ${updates.length} questions`,
      data: updates,
    });
  } catch (error) {
    console.error('Error in assignCardNumbers:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};