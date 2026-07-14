// migrations/20260122000000-add-payroll-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Payroll Periods
    await queryInterface.createTable('payroll_periods', {
      period_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      period_code: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      year: { type: Sequelize.INTEGER, allowNull: false },
      month: { type: Sequelize.INTEGER, allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      payment_date: { type: Sequelize.DATEONLY },
      status: { type: Sequelize.ENUM('draft', 'processing', 'processed', 'paid', 'closed'), defaultValue: 'draft' },
      processed_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      processed_at: { type: Sequelize.DATE },
      total_employees: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_basic_salary: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_allowances: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_overtime: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_gross: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_tax: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_pension_employee: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_pension_employer: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_penalties: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_deductions: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_net: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // 2. Payroll Items
    await queryInterface.createTable('payroll_items', {
      payroll_item_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      period_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payroll_periods', key: 'period_id' } },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      basic_salary: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      housing_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      position_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      transport_allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_allowances: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      overtime_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      overtime_pay: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      bonus_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      other_income: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      gross_pay: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      taxable_income: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      tax_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      tax_bracket_applied: { type: Sequelize.STRING(50) },
      pension_employee: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      pension_employer: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      absent_days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 0 },
      absent_penalty: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      late_minutes: { type: Sequelize.INTEGER, defaultValue: 0 },
      late_penalty: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_penalties: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      loan_deduction: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      advance_deduction: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      cooperative_deduction: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      other_deductions: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_deductions: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      carry_forward_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      net_pay: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      is_on_hold: { type: Sequelize.BOOLEAN, defaultValue: false },
      hold_id: { type: Sequelize.INTEGER },
      hold_reason: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Add unique constraint
    await queryInterface.addConstraint('payroll_items', {
      fields: ['period_id', 'employee_id'],
      type: 'unique',
      name: 'uk_payroll_items_period_employee'
    });

    // 3. Salary Holds
    await queryInterface.createTable('salary_holds', {
      hold_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' } },
      period_id: { type: Sequelize.INTEGER, references: { model: 'payroll_periods', key: 'period_id' } },
      hold_reason: { type: Sequelize.TEXT, allowNull: false },
      hold_duration_months: { type: Sequelize.INTEGER, defaultValue: 1 },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY },
      original_amount: { type: Sequelize.DECIMAL(12, 2) },
      released_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      remaining_amount: { type: Sequelize.DECIMAL(12, 2) },
      status: { type: Sequelize.ENUM('active', 'released', 'partially_released'), defaultValue: 'active' },
      released_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      released_at: { type: Sequelize.DATE },
      created_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'user_id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('salary_holds');
    await queryInterface.dropTable('payroll_items');
    await queryInterface.dropTable('payroll_periods');
  }
};