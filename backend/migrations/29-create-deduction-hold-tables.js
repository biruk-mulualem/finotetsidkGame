// migrations/20260122000002-create-deduction-hold-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 8. Hold Releases
    await queryInterface.createTable('hold_releases', {
      release_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      hold_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'salary_holds', key: 'hold_id' } },
      release_type: { type: Sequelize.STRING(20) },
      release_percent: { type: Sequelize.DECIMAL(5, 2) },
      release_amount: { type: Sequelize.DECIMAL(12, 2) },
      release_reason: { type: Sequelize.TEXT },
      released_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      released_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      applied_to_period_id: { type: Sequelize.INTEGER, references: { model: 'payroll_periods', key: 'period_id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 9. Recurring Deductions
    await queryInterface.createTable('recurring_deductions', {
      deduction_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      deduction_type: { type: Sequelize.STRING(50), allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      deduction_type_value: { type: Sequelize.STRING(20), defaultValue: 'fixed' },
      percentage_value: { type: Sequelize.DECIMAL(5, 2) },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY },
      total_months: { type: Sequelize.INTEGER },
      remaining_months: { type: Sequelize.INTEGER },
      reference_number: { type: Sequelize.STRING(100) },
      submitted_by: { type: Sequelize.STRING(100) },
      contact: { type: Sequelize.STRING(100) },
      reason: { type: Sequelize.TEXT },
      date: { type: Sequelize.DATEONLY },
      created_by_name: { type: Sequelize.STRING(100) },
      last_applied_period_id: { type: Sequelize.INTEGER },
      last_applied_at: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('active', 'completed', 'cancelled'), defaultValue: 'active' },
      approved_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 10. Deduction Applications
    await queryInterface.createTable('deduction_applications', {
      application_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      deduction_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'recurring_deductions', key: 'deduction_id' } },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      amount_applied: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      submitted_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      submitted_by_name: { type: Sequelize.STRING(100) },
      contact: { type: Sequelize.STRING(100) },
      reason: { type: Sequelize.TEXT },
      notes: { type: Sequelize.TEXT },
      application_date: { type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'applied'), defaultValue: 'applied' },
      approval_reference: { type: Sequelize.STRING(100) },
      is_partial: { type: Sequelize.BOOLEAN, defaultValue: false },
      original_amount: { type: Sequelize.DECIMAL(12, 2) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Add unique constraint for deduction_applications
    await queryInterface.addConstraint('deduction_applications', {
      fields: ['deduction_id', 'period_id'],
      type: 'unique',
      name: 'uk_deduction_applications_deduction_period'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('deduction_applications');
    await queryInterface.dropTable('recurring_deductions');
    await queryInterface.dropTable('hold_releases');
  }
};