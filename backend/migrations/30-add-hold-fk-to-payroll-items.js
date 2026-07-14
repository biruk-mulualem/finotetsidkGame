// migrations/20260122000004-add-hold-fk-to-payroll-items.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('payroll_items', {
      fields: ['hold_id'],
      type: 'foreign key',
      name: 'fk_payroll_items_hold_id',
      references: {
        table: 'salary_holds',
        field: 'hold_id'
      },
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('payroll_items', 'fk_payroll_items_hold_id');
  }
};