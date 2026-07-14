// migrations/XXXXXX-create-leave-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ============ FIRST: CREATE ENUM TYPES ============
    
    // Create enum for gender restriction
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_types_gender_restriction" AS ENUM ('male', 'female', 'none');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for leave request status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_requests_status" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for return status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_requests_return_status" AS ENUM ('on_leave', 'returned', 'returned_late', 'overdue');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for extension status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_extensions_status" AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for notification types
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_notifications_notification_type" AS ENUM ('reminder', 'overdue', 'expiry', 'approval', 'rejection', 'extension_approved', 'extension_rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for notification channels
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_notifications_channel" AS ENUM ('email', 'sms', 'in_app');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for notification status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_leave_notifications_status" AS ENUM ('sent', 'delivered', 'failed', 'read');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // ============ SECOND: CREATE TABLES ============

    // 1. Create leave_types table
    await queryInterface.createTable('leave_types', {
      leave_type_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      code: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      default_days: { type: Sequelize.INTEGER, allowNull: true },
      is_paid: { type: Sequelize.BOOLEAN, defaultValue: true },
      has_fixed_limit: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_one_time: { type: Sequelize.BOOLEAN, defaultValue: false },
      requires_approval: { type: Sequelize.BOOLEAN, defaultValue: true },
      min_notice_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      max_consecutive_days: { type: Sequelize.INTEGER, allowNull: true },
      requires_documentation: { type: Sequelize.BOOLEAN, defaultValue: false },
      gender_restriction: { type: Sequelize.ENUM('male', 'female', 'none'), defaultValue: 'none' },
      carry_over_limit: { type: Sequelize.INTEGER, defaultValue: 10 },
      carry_over_expiry_years: { type: Sequelize.INTEGER, defaultValue: 2 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 2. Create leave_requests table
    await queryInterface.createTable('leave_requests', {
      leave_request_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' }, onDelete: 'CASCADE' },
      department_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'departments', key: 'department_id' } },
      leave_type_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'leave_types', key: 'leave_type_id' } },
      leave_type_name: { type: Sequelize.STRING(50), allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      return_date: { type: Sequelize.DATEONLY, allowNull: true },
      total_days: { type: Sequelize.INTEGER, allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'), defaultValue: 'pending' },
      requested_date: { type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW },
      approved_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'user_id' } },
      approved_date: { type: Sequelize.DATEONLY, allowNull: true },
      approval_notes: { type: Sequelize.TEXT, allowNull: true },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      rejected_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'user_id' } },
      rejected_date: { type: Sequelize.DATEONLY, allowNull: true },
      hr_notes: { type: Sequelize.TEXT, allowNull: true },
      return_status: { type: Sequelize.ENUM('on_leave', 'returned', 'returned_late', 'overdue'), defaultValue: 'on_leave' },
      actual_return_date: { type: Sequelize.DATEONLY, allowNull: true },
      days_late: { type: Sequelize.INTEGER, defaultValue: 0 },
      return_confirmed_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'user_id' } },
      return_confirmed_date: { type: Sequelize.DATEONLY, allowNull: true },
      extension_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_extension_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      last_extended_date: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // Add indexes for leave_requests
    await queryInterface.addIndex('leave_requests', ['employee_id']);
    await queryInterface.addIndex('leave_requests', ['status']);
    await queryInterface.addIndex('leave_requests', ['start_date', 'end_date']);
    await queryInterface.addIndex('leave_requests', ['return_status', 'return_date']);

    // 3. Create leave_balances table
    await queryInterface.createTable('leave_balances', {
      leave_balance_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' }, onDelete: 'CASCADE' },
      year: { type: Sequelize.INTEGER, allowNull: false },
      years_of_service: { type: Sequelize.INTEGER, defaultValue: 0 },
      yearly_entitlement: { type: Sequelize.INTEGER, defaultValue: 16 },
      carried_over: { type: Sequelize.INTEGER, defaultValue: 0 },
      carried_over_from_year: { type: Sequelize.INTEGER, allowNull: true },
      carried_over_expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
      total_allocation: { type: Sequelize.INTEGER, defaultValue: 16 },
      used_this_year: { type: Sequelize.INTEGER, defaultValue: 0 },
      pending_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      available_days: { type: Sequelize.INTEGER, defaultValue: 16 },
      sick_used_this_year: { type: Sequelize.INTEGER, defaultValue: 0 },
      sick_alert_sent: { type: Sequelize.BOOLEAN, defaultValue: false },
      maternity_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      maternity_used_date: { type: Sequelize.DATEONLY, allowNull: true },
      paternity_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      paternity_used_date: { type: Sequelize.DATEONLY, allowNull: true },
      bereavement_used_this_year: { type: Sequelize.INTEGER, defaultValue: 0 },
      unpaid_used_this_year: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // Add unique constraint for employee_id and year
    await queryInterface.addIndex('leave_balances', ['employee_id', 'year'], { unique: true });
    await queryInterface.addIndex('leave_balances', ['employee_id']);

    // 4. Create leave_extensions table
    await queryInterface.createTable('leave_extensions', {
      extension_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      leave_request_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'leave_requests', key: 'leave_request_id' }, onDelete: 'CASCADE' },
      requested_date: { type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW },
      original_end_date: { type: Sequelize.DATEONLY, allowNull: false },
      additional_days: { type: Sequelize.INTEGER, allowNull: false },
      requested_new_end_date: { type: Sequelize.DATEONLY, allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      approved_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'user_id' } },
      approved_date: { type: Sequelize.DATEONLY, allowNull: true },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      rejected_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'user_id' } },
      rejected_date: { type: Sequelize.DATEONLY, allowNull: true },
      new_end_date: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('leave_extensions', ['leave_request_id']);
    await queryInterface.addIndex('leave_extensions', ['status']);

    // 5. Create leave_notifications table
    await queryInterface.createTable('leave_notifications', {
      notification_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'employees', key: 'employee_id' }, onDelete: 'CASCADE' },
      leave_request_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'leave_requests', key: 'leave_request_id' }, onDelete: 'SET NULL' },
      notification_type: { type: Sequelize.ENUM('reminder', 'overdue', 'expiry', 'approval', 'rejection', 'extension_approved', 'extension_rejected'), allowNull: false },
      channel: { type: Sequelize.ENUM('email', 'sms', 'in_app'), defaultValue: 'email' },
      subject: { type: Sequelize.STRING(255), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      sent_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      read_at: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.ENUM('sent', 'delivered', 'failed', 'read'), defaultValue: 'sent' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('leave_notifications', ['employee_id']);
    await queryInterface.addIndex('leave_notifications', ['notification_type', 'status']);
    await queryInterface.addIndex('leave_notifications', ['sent_date']);

    // ============ THIRD: INSERT DEFAULT DATA ============
    
    // Insert default leave types
    await queryInterface.bulkInsert('leave_types', [
      { name: 'Annual Leave', code: 'AL', description: 'Annual vacation leave', default_days: 16, is_paid: true, has_fixed_limit: true, is_one_time: false, requires_approval: true, min_notice_days: 7, max_consecutive_days: 30, gender_restriction: 'none', carry_over_limit: 10, carry_over_expiry_years: 2, is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Sick Leave', code: 'SL', description: 'Medical leave for illness', default_days: null, is_paid: true, has_fixed_limit: false, is_one_time: false, requires_approval: false, min_notice_days: 0, gender_restriction: 'none', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { name: 'Maternity Leave', code: 'ML', description: 'Maternity leave for new mothers', default_days: 90, is_paid: true, has_fixed_limit: true, is_one_time: true, requires_approval: true, min_notice_days: 30, max_consecutive_days: 90, requires_documentation: true, gender_restriction: 'female', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { name: 'Paternity Leave', code: 'PL', description: 'Paternity leave for new fathers', default_days: 3, is_paid: true, has_fixed_limit: true, is_one_time: true, requires_approval: true, min_notice_days: 14, max_consecutive_days: 3, gender_restriction: 'male', is_active: true, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      { name: 'Bereavement Leave', code: 'BL', description: 'Leave for family bereavement', default_days: 3, is_paid: true, has_fixed_limit: true, is_one_time: false, requires_approval: true, min_notice_days: 0, max_consecutive_days: 3, requires_documentation: true, gender_restriction: 'none', is_active: true, sort_order: 5, created_at: new Date(), updated_at: new Date() },
      { name: 'Unpaid Leave', code: 'UL', description: 'Unpaid leave of absence', default_days: null, is_paid: false, has_fixed_limit: false, is_one_time: false, requires_approval: true, min_notice_days: 14, max_consecutive_days: 30, gender_restriction: 'none', is_active: true, sort_order: 6, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('leave_notifications');
    await queryInterface.dropTable('leave_extensions');
    await queryInterface.dropTable('leave_balances');
    await queryInterface.dropTable('leave_requests');
    await queryInterface.dropTable('leave_types');
    
    // Drop enum types
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_notifications_status"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_notifications_channel"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_notifications_notification_type"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_extensions_status"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_requests_return_status"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_requests_status"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_leave_types_gender_restriction"`);
  }
};