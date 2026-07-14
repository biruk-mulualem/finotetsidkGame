'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payrolls', {
      payroll_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      salary_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'salaries',
          key: 'salary_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      basic_salary: {
        type: Sequelize.DECIMAL(15, 2),
      },
      allowances: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      deductions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      net_payable: {
        type: Sequelize.DECIMAL(15, 2),
      },
      payment_date: {
        type: Sequelize.DATEONLY,
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'processed', 'completed', 'failed'),
        defaultValue: 'pending',
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      processed_by: {
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
    await queryInterface.dropTable('payrolls');
  },
};