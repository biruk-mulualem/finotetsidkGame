'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('employees', {
      employee_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      middle_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      marital_status: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: true,
      },
      nationality: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      personal_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      work_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      emergency_contact: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      current_address: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      permanent_address: {
        type: Sequelize.JSONB,
        defaultValue: {},
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
      position_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'positions',
          key: 'position_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      manager_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'employee_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      employment_type: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'intern'),
        defaultValue: 'full-time',
      },
      employment_status: {
        type: Sequelize.ENUM('active', 'inactive', 'on-leave', 'terminated', 'retired'),
        defaultValue: 'active',
      },
      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      confirmation_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      termination_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      basic_salary: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      bank_account: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      work_location: {
        type: Sequelize.STRING(200),
        allowNull: true,
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
    await queryInterface.dropTable('employees');
  },
};