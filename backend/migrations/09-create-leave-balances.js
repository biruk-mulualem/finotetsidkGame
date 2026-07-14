'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leave_balances', {
      balance_id: {
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
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      annual: {
        type: Sequelize.JSONB,
        defaultValue: { total: 20, used: 0, remaining: 20 },
      },
      sick: {
        type: Sequelize.JSONB,
        defaultValue: { total: 12, used: 0, remaining: 12 },
      },
      casual: {
        type: Sequelize.JSONB,
        defaultValue: { total: 10, used: 0, remaining: 10 },
      },
      unpaid: {
        type: Sequelize.JSONB,
        defaultValue: { total: 0, used: 0, remaining: 0 },
      },
      carried_over: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('leave_balances');
  },
};