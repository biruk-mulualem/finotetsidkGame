// migrations/20260122000003-create-history-penalty-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 11. Carry Forward
    await queryInterface.createTable('carry_forwards', {
      carry_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'cleared', 'written_off'), defaultValue: 'pending' },
      cleared_in_period_id: { type: Sequelize.INTEGER, references: { model: 'payroll_periods', key: 'period_id' } },
      cleared_at: { type: Sequelize.DATE },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 12. Compensation History
    await queryInterface.createTable('compensation_history', {
      history_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      component_type: { type: Sequelize.STRING(50) },
      old_value: { type: Sequelize.DECIMAL(12, 2) },
      new_value: { type: Sequelize.DECIMAL(12, 2) },
      change_percent: { type: Sequelize.DECIMAL(5, 2) },
      effective_date: { type: Sequelize.DATEONLY, allowNull: false },
      reason: { type: Sequelize.TEXT },
      approved_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 13. Penalty Reductions
    await queryInterface.createTable('penalty_reductions', {
      reduction_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      penalty_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'attendance_records', key: 'id' } },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      amount_reduced: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      percent_reduced: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      new_penalty_amount: { type: Sequelize.DECIMAL(12, 2) },
      new_penalty_percent: { type: Sequelize.DECIMAL(5, 2) },
      reason: { type: Sequelize.TEXT },
      reduced_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      reduced_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 14. Penalty Reduction Rules
    await queryInterface.createTable('penalty_reduction_rules', {
      rule_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      rule_type: { type: Sequelize.ENUM('amount', 'percent'), allowNull: false },
      min_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      max_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      reduction_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Add indexes for performance
    // await queryInterface.addIndex('payroll_items', ['employee_id', 'is_on_hold']);
    // await queryInterface.addIndex('payment_transactions', ['employee_id', 'status']);
    // await queryInterface.addIndex('recurring_deductions', ['employee_id', 'status']);
    // await queryInterface.addIndex('carry_forwards', ['employee_id', 'status']);
    // await queryInterface.addIndex('compensation_history', ['employee_id', 'effective_date']);
    // await queryInterface.addIndex('unclaimed_salaries', ['employee_id', 'status']);
    // await queryInterface.addIndex('returned_payments', ['status']);
    // await queryInterface.addIndex('salary_holds', ['employee_id', 'status']);
    // await queryInterface.addIndex('penalty_reductions', ['penalty_id', 'period_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('penalty_reduction_rules');
    await queryInterface.dropTable('penalty_reductions');
    await queryInterface.dropTable('compensation_history');
    await queryInterface.dropTable('carry_forwards');
  }
};

