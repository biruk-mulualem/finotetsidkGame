// migrations/20260122000001-create-payment-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 4. Payment Sessions
    await queryInterface.createTable('payment_sessions', {
      session_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      session_code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      payment_date: { type: Sequelize.DATEONLY, allowNull: false },
      payment_window_days: { type: Sequelize.INTEGER, defaultValue: 7 },
      unclaimed_window_days: { type: Sequelize.INTEGER, defaultValue: 14 },
      total_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      employee_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      status: { type: Sequelize.ENUM('active', 'closed', 'expired'), defaultValue: 'active' },
      created_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 5. Payment Transactions
    await queryInterface.createTable('payment_transactions', {
      transaction_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      session_id: { type: Sequelize.INTEGER, references: { model: 'payment_sessions', key: 'session_id' } },
      payroll_item_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_items', key: 'payroll_item_id' } },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      payment_method: { type: Sequelize.STRING(30) },
      transaction_reference: { type: Sequelize.STRING(100) },
      payment_date: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('pending', 'completed', 'failed', 'returned'), defaultValue: 'pending' },
      processed_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      processed_at: { type: Sequelize.DATE },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 6. Unclaimed Salaries
    await queryInterface.createTable('unclaimed_salaries', {
      unclaimed_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      transaction_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payment_transactions', key: 'transaction_id' } },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      days_overdue: { type: Sequelize.INTEGER, defaultValue: 0 },
      status: { type: Sequelize.ENUM('unclaimed', 'claimed', 'written_off'), defaultValue: 'unclaimed' },
      claimed_date: { type: Sequelize.DATEONLY },
      claimed_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 7. Returned Payments
    await queryInterface.createTable('returned_payments', {
      return_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      transaction_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payment_transactions', key: 'transaction_id' } },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      return_date: { type: Sequelize.DATEONLY, allowNull: false },
      return_reason: { type: Sequelize.STRING(100) },
      original_amount: { type: Sequelize.DECIMAL(12, 2) },
      returned_amount: { type: Sequelize.DECIMAL(12, 2) },
      penalty_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('pending', 'resolved', 'written_off'), defaultValue: 'pending' },
      resolved_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      resolved_at: { type: Sequelize.DATE },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('returned_payments');
    await queryInterface.dropTable('unclaimed_salaries');
    await queryInterface.dropTable('payment_transactions');
    await queryInterface.dropTable('payment_sessions');
  }
};