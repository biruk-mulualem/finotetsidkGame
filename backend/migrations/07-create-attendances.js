'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendances', {
      attendance_id: {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      check_in: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      check_out: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      overtime: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'half-day', 'holiday', 'leave'),
        defaultValue: 'present',
      },
      late_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      early_departure_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable('attendances');
  },
};