'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('salaries', {
      salary_id: {
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
      effective_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      basic_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      housing_allowance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      transport_allowance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      medical_allowance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      communication_allowance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      other_allowances: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      deductions: {
        type: Sequelize.JSONB,
        defaultValue: { tax: 0, pension: 0, insurance: 0, loan: 0, other: [] },
      },
      net_salary: {
        type: Sequelize.DECIMAL(15, 2),
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
      },
      payment_method: {
        type: Sequelize.ENUM('bank', 'cash', 'cheque'),
        defaultValue: 'bank',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('salaries');
  },
};