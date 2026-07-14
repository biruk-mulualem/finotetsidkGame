// migrations/20241201000000-create-penalty-summary-tables.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create PenaltySummary table (lowercase with underscore)
    await queryInterface.createTable('penalty_summaries', {
      summary_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'employee_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      penalty_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employee_penalties',
          key: 'penalty_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      period_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      period_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      period_label: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      penalty_type: {
        type: Sequelize.ENUM('asset', 'other', 'percent'),
        allowNull: false
      },
      penalty_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      penalty_category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      original_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      current_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_deducted_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      original_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      current_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'partially_deducted', 'fully_deducted', 'cancelled'),
        defaultValue: 'active',
        allowNull: false
      },
      reference_document: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      submitted_by: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      approved_by: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      approval_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });

    // Create PenaltyDeduction table
    await queryInterface.createTable('penalty_deductions', {
      deduction_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'employee_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      summary_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'penalty_summaries',
          key: 'summary_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      penalty_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      deduction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      period_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      period_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      deduction_type: {
        type: Sequelize.ENUM('percent_reduction', 'amount_reduction', 'full_reduction'),
        allowNull: false
      },
      deduction_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      deduction_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      previous_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      new_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      previous_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      new_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      processed_by: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      is_batch: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      batch_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      batch_rule_applied: {
        type: Sequelize.JSON,
        allowNull: true
      },
      reference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('penalty_summaries', ['employee_id']);
    await queryInterface.addIndex('penalty_summaries', ['period_start_date', 'period_end_date']);
    await queryInterface.addIndex('penalty_summaries', ['status']);
    await queryInterface.addIndex('penalty_deductions', ['summary_id']);
    await queryInterface.addIndex('penalty_deductions', ['deduction_date']);
    await queryInterface.addIndex('penalty_deductions', ['batch_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('penalty_deductions');
    await queryInterface.dropTable('penalty_summaries');
  }
};