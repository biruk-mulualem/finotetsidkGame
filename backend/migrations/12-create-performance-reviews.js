'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('performance_reviews', {
      review_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'employee_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'employee_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      review_period: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      rating: {
        type: Sequelize.DECIMAL(3, 1),
        validate: { min: 1, max: 5 },
      },
      strengths: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      weaknesses: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      goals: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      recommendations: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      next_review_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected'),
        defaultValue: 'draft',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('performance_reviews');
  },
};