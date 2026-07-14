'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('positions', {
      position_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'department_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      level: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      min_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      max_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      requirements: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      responsibilities: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('positions');
  },
};