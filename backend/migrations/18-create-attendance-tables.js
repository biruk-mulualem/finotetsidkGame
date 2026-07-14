'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // =============================================
    // 1. Add shift_type column to employees table
    // =============================================
    const tableExists = await queryInterface.showAllTables();
    
    if (tableExists.includes('employees')) {
      const employeesColumns = await queryInterface.describeTable('employees');
      if (!employeesColumns.shift_type) {
        await queryInterface.addColumn('employees', 'shift_type', {
          type: Sequelize.ENUM('day', 'night'),
          defaultValue: 'day',
          field: 'shift_type',
        });
      }
    }

    // =============================================
    // 2. Drop old attendances table
    // =============================================
    if (tableExists.includes('attendances')) {
      await queryInterface.dropTable('attendances');
    }

    // =============================================
    // 3. Create company_shift_defaults table
    // =============================================
    await queryInterface.createTable('company_shift_defaults', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shift_type: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
      },
      check_in_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      check_out_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      check_out_day_offset: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: '0=same day, 1=next day',
      },
      late_threshold_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      absent_after_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 60,
      },
      lunch_duration_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 40,
      },
      dinner_duration_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 40,
      },
      dinner_start_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 4. Create department_overrides table
    // =============================================
    await queryInterface.createTable('department_overrides', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'department_id',
        },
        onDelete: 'CASCADE',
      },
      shift_type: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
      },
      check_in_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      check_out_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      lunch_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dinner_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dinner_start_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      overtime_after_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 5. Create employee_overrides table
    // =============================================
    await queryInterface.createTable('employee_overrides', {
      id: {
        type: Sequelize.BIGINT,
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
        onDelete: 'CASCADE',
      },
      shift_type: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
      },
      check_in_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      check_out_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      lunch_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dinner_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dinner_start_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      overtime_after_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 6. Create break_tickets table
    // =============================================
    await queryInterface.createTable('break_tickets', {
      id: {
        type: Sequelize.BIGINT,
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
        onDelete: 'CASCADE',
      },
      break_type: {
        type: Sequelize.ENUM('lunch', 'dinner'),
        allowNull: false,
      },
      break_out_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expected_return_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      actual_return_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'late', 'absent'),
        defaultValue: 'active',
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      late_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 7. Create overtime_rates table
    // =============================================
    await queryInterface.createTable('overtime_rates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shift_type: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
      },
      day_type: {
        type: Sequelize.ENUM('weekday', 'weekend', 'holiday'),
        allowNull: false,
      },
      rate: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false,
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 8. Create late_night_adjustments table
    // =============================================
    await queryInterface.createTable('late_night_adjustments', {
      id: {
        type: Sequelize.BIGINT,
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
        onDelete: 'CASCADE',
      },
      work_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      worked_until_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      adjusted_check_in_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 9. Create field_work_assignments table
    // =============================================
    await queryInterface.createTable('field_work_assignments', {
      id: {
        type: Sequelize.BIGINT,
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
        onDelete: 'CASCADE',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      assignment_type: {
        type: Sequelize.ENUM('today', 'range', 'permanent'),
        allowNull: false,
      },
      no_office_checkin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active',
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 10. Create holidays table
    // =============================================
    await queryInterface.createTable('holidays', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      holiday_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      ethiopian_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      holiday_type: {
        type: Sequelize.ENUM('public', 'religious', 'company'),
        allowNull: false,
      },
      overtime_rate: {
        type: Sequelize.DECIMAL(3, 1),
        defaultValue: 2.5,
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 11. Create working_days_config table
    // =============================================
    await queryInterface.createTable('working_days_config', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shift_type: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
      },
      day_of_week: {
        type: Sequelize.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        allowNull: false,
      },
      is_working_day: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 12. Create attendance_logs table
    // =============================================
    await queryInterface.createTable('attendance_logs', {
      id: {
        type: Sequelize.BIGINT,
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
        onDelete: 'CASCADE',
      },
      attendance_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      shift_type: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
        defaultValue: 'day',
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_late: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      late_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_absent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_half_day: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_holiday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_field_work: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_on_leave: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      total_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      overtime_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      overtime_rate_applied: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // =============================================
    // 13. Add indexes (NO DUPLICATES)
    // =============================================

    await queryInterface.addIndex('company_shift_defaults', ['shift_type', 'effective_from', 'effective_to']);
    await queryInterface.addIndex('company_shift_defaults', ['is_active']);
    await queryInterface.addIndex('department_overrides', ['department_id', 'shift_type', 'effective_from', 'effective_to']);
    await queryInterface.addIndex('employee_overrides', ['employee_id', 'shift_type', 'effective_from', 'effective_to']);
    await queryInterface.addIndex('employee_overrides', ['employee_id', 'effective_from']);
    await queryInterface.addIndex('break_tickets', ['employee_id', 'status']);
    await queryInterface.addIndex('break_tickets', ['status', 'break_out_time']);
    await queryInterface.addIndex('break_tickets', ['break_type', 'status']);
    await queryInterface.addIndex('break_tickets', ['expected_return_time']);
    await queryInterface.addIndex('overtime_rates', ['shift_type', 'day_type', 'effective_from', 'effective_to']);
    
    // UNIQUE index for late_night_adjustments (only one)
    await queryInterface.addIndex('late_night_adjustments', ['employee_id', 'work_date'], { 
      unique: true,
      name: 'idx_lna_unique_employee_date'
    });
    
    await queryInterface.addIndex('late_night_adjustments', ['status']);
    await queryInterface.addIndex('field_work_assignments', ['employee_id', 'status']);
    await queryInterface.addIndex('field_work_assignments', ['status', 'start_date']);
    await queryInterface.addIndex('field_work_assignments', ['start_date', 'end_date']);
    await queryInterface.addIndex('holidays', ['holiday_date']);
    await queryInterface.addIndex('holidays', ['holiday_type']);
    await queryInterface.addIndex('holidays', ['holiday_date', 'name'], { unique: true });
    
    // UNIQUE index for working_days_config
    await queryInterface.addIndex('working_days_config', ['shift_type', 'day_of_week', 'effective_from'], { 
      unique: true,
      name: 'idx_wdc_unique_shift_day_effective'
    });
    
    await queryInterface.addIndex('working_days_config', ['effective_from', 'effective_to']);
    
    // UNIQUE index for attendance_logs
    await queryInterface.addIndex('attendance_logs', ['employee_id', 'attendance_date'], { 
      unique: true,
      name: 'idx_al_unique_employee_date'
    });
    
    await queryInterface.addIndex('attendance_logs', ['attendance_date']);
    await queryInterface.addIndex('attendance_logs', ['shift_type', 'attendance_date']);
    await queryInterface.addIndex('attendance_logs', ['is_absent', 'attendance_date']);

    // =============================================
    // 14. Insert default data
    // =============================================

    await queryInterface.bulkInsert('company_shift_defaults', [
      {
        shift_type: 'day',
        check_in_time: '06:20:00',
        check_out_time: '18:00:00',
        late_threshold_minutes: 5,
        absent_after_minutes: 60,
        lunch_duration_minutes: 40,
        dinner_duration_minutes: 40,
        effective_from: '2024-01-01',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        shift_type: 'night',
        check_in_time: '22:00:00',
        check_out_time: '06:00:00',
        check_out_day_offset: 1,
        late_threshold_minutes: 5,
        absent_after_minutes: 60,
        lunch_duration_minutes: 40,
        dinner_duration_minutes: 40,
        dinner_start_time: '02:00:00',
        effective_from: '2024-01-01',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('overtime_rates', [
      { shift_type: 'day', day_type: 'weekday', rate: 1.5, effective_from: '2024-01-01', created_at: new Date(), updated_at: new Date() },
      { shift_type: 'day', day_type: 'weekend', rate: 2.0, effective_from: '2024-01-01', created_at: new Date(), updated_at: new Date() },
      { shift_type: 'day', day_type: 'holiday', rate: 2.5, effective_from: '2024-01-01', created_at: new Date(), updated_at: new Date() },
      { shift_type: 'night', day_type: 'weekday', rate: 1.5, effective_from: '2024-01-01', created_at: new Date(), updated_at: new Date() },
      { shift_type: 'night', day_type: 'weekend', rate: 2.0, effective_from: '2024-01-01', created_at: new Date(), updated_at: new Date() },
      { shift_type: 'night', day_type: 'holiday', rate: 2.5, effective_from: '2024-01-01', created_at: new Date(), updated_at: new Date() },
    ]);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shifts = ['day', 'night'];
    const workingDaysData = [];
    for (const shift of shifts) {
      for (const day of days) {
        workingDaysData.push({
          shift_type: shift,
          day_of_week: day,
          is_working_day: day !== 'sunday',
          effective_from: '2024-01-01',
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    await queryInterface.bulkInsert('working_days_config', workingDaysData);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendance_logs');
    await queryInterface.dropTable('working_days_config');
    await queryInterface.dropTable('holidays');
    await queryInterface.dropTable('field_work_assignments');
    await queryInterface.dropTable('late_night_adjustments');
    await queryInterface.dropTable('overtime_rates');
    await queryInterface.dropTable('break_tickets');
    await queryInterface.dropTable('employee_overrides');
    await queryInterface.dropTable('department_overrides');
    await queryInterface.dropTable('company_shift_defaults');
    
    const tableExists = await queryInterface.showAllTables();
    if (tableExists.includes('employees')) {
      const employeesColumns = await queryInterface.describeTable('employees');
      if (employeesColumns.shift_type) {
        await queryInterface.removeColumn('employees', 'shift_type');
      }
    }
    
    await queryInterface.createTable('attendances', {
      attendance_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
};