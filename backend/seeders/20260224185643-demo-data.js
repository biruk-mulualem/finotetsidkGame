// seeders/20250101000000-employees-seed.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // ==================== DEPARTMENTS ====================
    await queryInterface.bulkInsert('departments', [
      { department_id: 1, code: 'IT', name: 'Information Technology', description: 'Software development, infrastructure, and IT support', budget: 5000000, location: '5th Floor, Main Building', is_active: true, created_at: new Date(), updated_at: new Date() },
      { department_id: 2, code: 'FIN', name: 'Finance', description: 'Financial management, accounting, and treasury', budget: 3000000, location: '3rd Floor, Main Building', is_active: true, created_at: new Date(), updated_at: new Date() },
      { department_id: 3, code: 'OPS', name: 'Operations', description: 'Daily operations and logistics', budget: 4000000, location: '2nd Floor, Main Building', is_active: true, created_at: new Date(), updated_at: new Date() },
      { department_id: 4, code: 'HR', name: 'Human Resources', description: 'Recruitment, payroll, and employee relations', budget: 2000000, location: '4th Floor, Main Building', is_active: true, created_at: new Date(), updated_at: new Date() },
      { department_id: 5, code: 'MKT', name: 'Marketing', description: 'Marketing, branding, and communications', budget: 2500000, location: '6th Floor, Main Building', is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    // ==================== POSITIONS ====================
    await queryInterface.bulkInsert('positions', [
      { position_id: 1, code: 'CTO', title: 'Chief Technology Officer', department_id: 1, level: 'Executive', min_salary: 50000, max_salary: 80000, requirements: JSON.stringify(['Master\'s degree', '10+ years experience']), responsibilities: JSON.stringify(['Technology strategy', 'Team leadership']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 2, code: 'TL', title: 'Team Lead', department_id: 1, level: 'Senior', min_salary: 35000, max_salary: 55000, requirements: JSON.stringify(['Bachelor\'s degree', '5+ years experience']), responsibilities: JSON.stringify(['Team management', 'Code review']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 3, code: 'SD', title: 'Senior Developer', department_id: 1, level: 'Senior', min_salary: 30000, max_salary: 45000, requirements: JSON.stringify(['Bachelor\'s degree', '5+ years experience']), responsibilities: JSON.stringify(['Development', 'Mentoring']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 4, code: 'DEV', title: 'Developer', department_id: 1, level: 'Mid', min_salary: 18000, max_salary: 30000, requirements: JSON.stringify(['Bachelor\'s degree', '2+ years experience']), responsibilities: JSON.stringify(['Development', 'Testing']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 5, code: 'JDEV', title: 'Junior Developer', department_id: 1, level: 'Junior', min_salary: 10000, max_salary: 18000, requirements: JSON.stringify(['Bachelor\'s degree', 'Entry level']), responsibilities: JSON.stringify(['Development', 'Learning']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 6, code: 'FM', title: 'Finance Manager', department_id: 2, level: 'Senior', min_salary: 35000, max_salary: 55000, requirements: JSON.stringify(['Accounting degree', 'CPA preferred']), responsibilities: JSON.stringify(['Financial planning', 'Reporting']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 7, code: 'ACC', title: 'Accountant', department_id: 2, level: 'Mid', min_salary: 15000, max_salary: 25000, requirements: JSON.stringify(['Accounting degree']), responsibilities: JSON.stringify(['Bookkeeping', 'Reconciliation']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 8, code: 'OM', title: 'Operations Manager', department_id: 3, level: 'Senior', min_salary: 30000, max_salary: 50000, requirements: JSON.stringify(['Bachelor\'s degree', '5+ years experience']), responsibilities: JSON.stringify(['Operations oversight', 'Process improvement']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 9, code: 'CORD', title: 'Coordinator', department_id: 3, level: 'Mid', min_salary: 12000, max_salary: 20000, requirements: JSON.stringify(['Bachelor\'s degree', '2+ years experience']), responsibilities: JSON.stringify(['Coordination', 'Logistics']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 10, code: 'HRM', title: 'HR Manager', department_id: 4, level: 'Senior', min_salary: 30000, max_salary: 50000, requirements: JSON.stringify(['HR degree', '5+ years experience']), responsibilities: JSON.stringify(['HR strategy', 'Employee relations']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 11, code: 'HRG', title: 'HR Generalist', department_id: 4, level: 'Mid', min_salary: 12000, max_salary: 20000, requirements: JSON.stringify(['HR degree', '2+ years experience']), responsibilities: JSON.stringify(['Recruitment', 'Payroll support']), is_active: true, created_at: new Date(), updated_at: new Date() },
      { position_id: 12, code: 'MM', title: 'Marketing Manager', department_id: 5, level: 'Senior', min_salary: 28000, max_salary: 45000, requirements: JSON.stringify(['Marketing degree', '5+ years experience']), responsibilities: JSON.stringify(['Marketing strategy', 'Campaigns']), is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    // ==================== ROLES ====================
    await queryInterface.bulkInsert('roles', [
      { role_id: 1, name: 'admin', description: 'System Administrator - Full access', is_active: true, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, name: 'hr', description: 'HR Manager - Payroll and employee management', is_active: true, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, name: 'finance', description: 'Finance - Payment processing and reports', is_active: true, created_at: new Date(), updated_at: new Date() },
      { role_id: 4, name: 'attendance', description: 'Attendance - Track attendance and penalties', is_active: true, created_at: new Date(), updated_at: new Date() },
      { role_id: 5, name: 'employee', description: 'Regular employee - View own data only', is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    // ==================== USERS ====================
    await queryInterface.bulkInsert('users', [
      { user_id: 1, username: 'admin', email: 'admin@superhr.com', password_hash: hashedPassword, full_name: 'System Administrator', role_id: 1, department_id: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 2, username: 'hrmanager', email: 'hr@superhr.com', password_hash: hashedPassword, full_name: 'HR Manager', role_id: 2, department_id: 4, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 3, username: 'finance', email: 'finance@superhr.com', password_hash: hashedPassword, full_name: 'Finance Officer', role_id: 3, department_id: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 4, username: 'attendance', email: 'attendance@superhr.com', password_hash: hashedPassword, full_name: 'Attendance Officer', role_id: 4, department_id: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 5, username: 'biruk', email: 'biruk@superhr.com', password_hash: hashedPassword, full_name: 'Biruk Mulualem', role_id: 5, department_id: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 6, username: 'dagmawi', email: 'dagmawi@superhr.com', password_hash: hashedPassword, full_name: 'Dagmawi Hadgu', role_id: 5, department_id: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 7, username: 'haymanot', email: 'haymanot@superhr.com', password_hash: hashedPassword, full_name: 'Haymanot Abebaw', role_id: 5, department_id: 4, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 8, username: 'melkamu', email: 'melkamu@superhr.com', password_hash: hashedPassword, full_name: 'Melkamu Zewdu', role_id: 5, department_id: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 9, username: 'melaku', email: 'melaku@superhr.com', password_hash: hashedPassword, full_name: 'Melaku Tewodros', role_id: 5, department_id: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 10, username: 'tamrat', email: 'tamrat@superhr.com', password_hash: hashedPassword, full_name: 'Tamrat Zerihun', role_id: 5, department_id: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 11, username: 'nuru', email: 'nuru@superhr.com', password_hash: hashedPassword, full_name: 'Nuru Seid', role_id: 5, department_id: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 12, username: 'tadese', email: 'tadese@superhr.com', password_hash: hashedPassword, full_name: 'Tadese Jemberu', role_id: 5, department_id: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { user_id: 13, username: 'eshete', email: 'eshete@superhr.com', password_hash: hashedPassword, full_name: 'Eshete Worke', role_id: 5, department_id: 1, is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    // ==================== EMPLOYEES ====================
    await queryInterface.bulkInsert('employees', [
      {
        employee_id: 1,
        employee_code: 'EMP001',
        user_id: 5,
        first_name: 'Biruk',
        last_name: 'Mulualem',
        date_of_birth: '1990-05-15',
        shift_type: 'day',
        gender: 'male',
        marital_status: 'married',
        nationality: 'Ethiopian',
        personal_email: 'biruk.mulualem@email.com',
        work_email: 'biruk.mulualem@superhr.com',
        phone_number: '0911000001',
        emergency_contact: JSON.stringify({ name: 'Wife', phone: '0911000010' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Bole', woreda: '03' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Bole', woreda: '03' }),
        department_id: 1,
        position_id: 1,
        manager_id: null,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2018-01-15',
        confirmation_date: '2018-07-15',
        basic_salary: 50000,
        housing_allowance: 10000,
        position_allowance: 7500,
        transport_allowance: 5000,
        bank_account: JSON.stringify({ bank: 'Commercial Bank of Ethiopia', account: '1000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 2,
        employee_code: 'EMP002',
        user_id: 6,
        first_name: 'Dagmawi',
        last_name: 'Hadgu',
        date_of_birth: '1988-03-20',
        shift_type: 'day',
        gender: 'male',
        marital_status: 'married',
        nationality: 'Ethiopian',
        personal_email: 'dagmawi.hadgu@email.com',
        work_email: 'dagmawi.hadgu@superhr.com',
        phone_number: '0911000002',
        emergency_contact: JSON.stringify({ name: 'Spouse', phone: '0911000011' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Kirkos', woreda: '05' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Kirkos', woreda: '05' }),
        department_id: 1,
        position_id: 2,
        manager_id: 1,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2019-06-01',
        confirmation_date: '2019-12-01',
        basic_salary: 35000,
        housing_allowance: 7000,
        position_allowance: 5250,
        transport_allowance: 3500,
        bank_account: JSON.stringify({ bank: 'Awash Bank', account: '2000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 3,
        employee_code: 'EMP003',
        user_id: 8,
        first_name: 'Melkamu',
        last_name: 'Zewdu',
        date_of_birth: '1992-11-10',
        shift_type: 'day',
        gender: 'male',
        marital_status: 'single',
        nationality: 'Ethiopian',
        personal_email: 'melkamu.zewdu@email.com',
        work_email: 'melkamu.zewdu@superhr.com',
        phone_number: '0911000003',
        emergency_contact: JSON.stringify({ name: 'Sister', phone: '0911000012' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Gullele', woreda: '07' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Gullele', woreda: '07' }),
        department_id: 3,
        position_id: 8,
        manager_id: null,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2020-02-10',
        confirmation_date: '2020-08-10',
        basic_salary: 28000,
        housing_allowance: 5600,
        position_allowance: 4200,
        transport_allowance: 2800,
        bank_account: JSON.stringify({ bank: 'Dashen Bank', account: '3000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 4,
        employee_code: 'EMP004',
        user_id: 9,
        first_name: 'Melaku',
        last_name: 'Tewodros',
        date_of_birth: '1985-08-25',
        shift_type: 'day',
        gender: 'male',
        marital_status: 'married',
        nationality: 'Ethiopian',
        personal_email: 'melaku.tewodros@email.com',
        work_email: 'melaku.tewodros@superhr.com',
        phone_number: '0911000004',
        emergency_contact: JSON.stringify({ name: 'Wife', phone: '0911000013' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Yeka', woreda: '12' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Yeka', woreda: '12' }),
        department_id: 2,
        position_id: 6,
        manager_id: null,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2017-04-20',
        confirmation_date: '2017-10-20',
        basic_salary: 32000,
        housing_allowance: 6400,
        position_allowance: 4800,
        transport_allowance: 3200,
        bank_account: JSON.stringify({ bank: 'Commercial Bank of Ethiopia', account: '4000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 5,
        employee_code: 'EMP005',
        user_id: 10,
        first_name: 'Tamrat',
        last_name: 'Zerihun',
        date_of_birth: '1995-12-05',
        shift_type: 'day',
        gender: 'male',
        marital_status: 'single',
        nationality: 'Ethiopian',
        personal_email: 'tamrat.zerihun@email.com',
        work_email: 'tamrat.zerihun@superhr.com',
        phone_number: '0911000005',
        emergency_contact: JSON.stringify({ name: 'Brother', phone: '0911000014' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Kolfe', woreda: '09' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Kolfe', woreda: '09' }),
        department_id: 1,
        position_id: 4,
        manager_id: 2,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2021-09-01',
        confirmation_date: '2022-03-01',
        basic_salary: 18000,
        housing_allowance: 3600,
        position_allowance: 2700,
        transport_allowance: 1800,
        bank_account: JSON.stringify({ bank: 'Awash Bank', account: '5000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 6,
        employee_code: 'EMP006',
        user_id: 11,
        first_name: 'Nuru',
        last_name: 'Seid',
        date_of_birth: '1993-06-18',
        shift_type: 'day',
        gender: 'female',
        marital_status: 'married',
        nationality: 'Ethiopian',
        personal_email: 'nuru.seid@email.com',
        work_email: 'nuru.seid@superhr.com',
        phone_number: '0911000006',
        emergency_contact: JSON.stringify({ name: 'Husband', phone: '0911000015' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Nifas Silk', woreda: '15' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Nifas Silk', woreda: '15' }),
        department_id: 2,
        position_id: 7,
        manager_id: 4,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2020-11-15',
        confirmation_date: '2021-05-15',
        basic_salary: 15000,
        housing_allowance: 3000,
        position_allowance: 2250,
        transport_allowance: 1500,
        bank_account: JSON.stringify({ bank: 'Dashen Bank', account: '6000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 7,
        employee_code: 'EMP007',
        user_id: 12,
        first_name: 'Tadese',
        last_name: 'Jemberu',
        date_of_birth: '1994-09-22',
        shift_type: 'day',
        gender: 'male',
        marital_status: 'single',
        nationality: 'Ethiopian',
        personal_email: 'tadese.jemberu@email.com',
        work_email: 'tadese.jemberu@superhr.com',
        phone_number: '0911000007',
        emergency_contact: JSON.stringify({ name: 'Mother', phone: '0911000016' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Addis Ketema', woreda: '08' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Addis Ketema', woreda: '08' }),
        department_id: 3,
        position_id: 9,
        manager_id: 3,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2022-01-10',
        confirmation_date: '2022-07-10',
        basic_salary: 12000,
        housing_allowance: 2400,
        position_allowance: 1800,
        transport_allowance: 1200,
        bank_account: JSON.stringify({ bank: 'Commercial Bank of Ethiopia', account: '7000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 8,
        employee_code: 'EMP008',
        user_id: 13,
        first_name: 'Eshete',
        last_name: 'Worke',
        date_of_birth: '1991-07-30',
        shift_type: 'night',
        gender: 'male',
        marital_status: 'married',
        nationality: 'Ethiopian',
        personal_email: 'eshete.worke@email.com',
        work_email: 'eshete.worke@superhr.com',
        phone_number: '0911000008',
        emergency_contact: JSON.stringify({ name: 'Wife', phone: '0911000017' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Bole', woreda: '04' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Bole', woreda: '04' }),
        department_id: 1,
        position_id: 3,
        manager_id: 2,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2019-03-20',
        confirmation_date: '2019-09-20',
        basic_salary: 22000,
        housing_allowance: 4400,
        position_allowance: 3300,
        transport_allowance: 2200,
        bank_account: JSON.stringify({ bank: 'Awash Bank', account: '8000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: 9,
        employee_code: 'EMP009',
        user_id: 7,
        first_name: 'Haymanot',
        last_name: 'Abebaw',
        date_of_birth: '1987-02-14',
        shift_type: 'day',
        gender: 'female',
        marital_status: 'married',
        nationality: 'Ethiopian',
        personal_email: 'haymanot.abebaw@email.com',
        work_email: 'haymanot.abebaw@superhr.com',
        phone_number: '0911000009',
        emergency_contact: JSON.stringify({ name: 'Husband', phone: '0911000018' }),
        current_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Kirkos', woreda: '02' }),
        permanent_address: JSON.stringify({ city: 'Addis Ababa', subcity: 'Kirkos', woreda: '02' }),
        department_id: 4,
        position_id: 10,
        manager_id: null,
        employment_type: 'full-time',
        employment_status: 'active',
        hire_date: '2016-08-01',
        confirmation_date: '2017-02-01',
        basic_salary: 30000,
        housing_allowance: 6000,
        position_allowance: 4500,
        transport_allowance: 3000,
        bank_account: JSON.stringify({ bank: 'Dashen Bank', account: '9000001' }),
        work_location: 'Main Office',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ==================== LEAVE TYPES ====================
    await queryInterface.bulkInsert('leave_types', [
      { leave_type_id: 1, name: 'Annual Leave', code: 'AL', description: 'Regular annual vacation leave', default_days: 16, is_paid: true, has_fixed_limit: true, is_one_time: false, requires_approval: true, min_notice_days: 7, max_consecutive_days: 30, requires_documentation: false, gender_restriction: 'none', carry_over_limit: 10, carry_over_expiry_years: 2, is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { leave_type_id: 2, name: 'Sick Leave', code: 'SL', description: 'Medical leave with doctor\'s note', default_days: null, is_paid: true, has_fixed_limit: false, is_one_time: false, requires_approval: false, min_notice_days: 0, max_consecutive_days: 30, requires_documentation: true, gender_restriction: 'none', carry_over_limit: 0, carry_over_expiry_years: 0, is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { leave_type_id: 3, name: 'Maternity Leave', code: 'ML', description: 'Maternity leave for female employees', default_days: 90, is_paid: true, has_fixed_limit: true, is_one_time: true, requires_approval: true, min_notice_days: 30, max_consecutive_days: 90, requires_documentation: true, gender_restriction: 'female', carry_over_limit: 0, carry_over_expiry_years: 0, is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { leave_type_id: 4, name: 'Paternity Leave', code: 'PL', description: 'Paternity leave for male employees', default_days: 3, is_paid: true, has_fixed_limit: true, is_one_time: true, requires_approval: true, min_notice_days: 14, max_consecutive_days: 3, requires_documentation: false, gender_restriction: 'male', carry_over_limit: 0, carry_over_expiry_years: 0, is_active: true, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      { leave_type_id: 5, name: 'Bereavement Leave', code: 'BL', description: 'Leave for family bereavement', default_days: 3, is_paid: true, has_fixed_limit: true, is_one_time: false, requires_approval: true, min_notice_days: 0, max_consecutive_days: 5, requires_documentation: true, gender_restriction: 'none', carry_over_limit: 0, carry_over_expiry_years: 0, is_active: true, sort_order: 5, created_at: new Date(), updated_at: new Date() },
      { leave_type_id: 6, name: 'Unpaid Leave', code: 'UL', description: 'Unpaid leave for personal reasons', default_days: null, is_paid: false, has_fixed_limit: false, is_one_time: false, requires_approval: true, min_notice_days: 14, max_consecutive_days: 30, requires_documentation: false, gender_restriction: 'none', carry_over_limit: 0, carry_over_expiry_years: 0, is_active: true, sort_order: 6, created_at: new Date(), updated_at: new Date() }
    ]);

    // ==================== PAYROLL PERIODS ====================
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    
    await queryInterface.bulkInsert('payroll_periods', [
      {
        period_id: 1,
        period_code: `${currentYear}${String(currentMonth).padStart(2, '0')}`,
        year: currentYear,
        month: currentMonth,
        start_date: startDate,
        end_date: endDate,
        payment_date: new Date(currentYear, currentMonth, 10),
        status: 'draft',
        processed_by: 2,
        total_employees: 9,
        total_basic_salary: 0,
        total_allowances: 0,
        total_overtime: 0,
        total_gross: 0,
        total_tax: 0,
        total_pension_employee: 0,
        total_pension_employer: 0,
        total_penalties: 0,
        total_deductions: 0,
        total_net: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ==================== SALARY HOLDS ====================
    await queryInterface.bulkInsert('salary_holds', [
      {
        hold_id: 1,
        employee_id: 3,
        period_id: 1,
        hold_reason: 'Pending disciplinary investigation',
        hold_duration_months: 2,
        start_date: new Date(currentYear, currentMonth - 2, 15),
        end_date: new Date(currentYear, currentMonth, 15),
        original_amount: 28000,
        released_amount: 0,
        remaining_amount: 28000,
        status: 'active',
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        hold_id: 2,
        employee_id: 7,
        period_id: 1,
        hold_reason: 'Salary dispute under review',
        hold_duration_months: 1,
        start_date: new Date(currentYear, currentMonth - 1, 1),
        end_date: new Date(currentYear, currentMonth, 1),
        original_amount: 12000,
        released_amount: 0,
        remaining_amount: 12000,
        status: 'active',
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ==================== RECURRING DEDUCTIONS ====================
    await queryInterface.bulkInsert('recurring_deductions', [
      {
        deduction_id: 1,
        employee_id: 5,
        deduction_type: 'Loan',
        name: 'Housing Loan',
        amount: 2000,
        deduction_type_value: 'fixed',
        start_date: new Date(currentYear, currentMonth - 3, 1),
        end_date: new Date(currentYear, currentMonth + 9, 1),
        total_months: 12,
        remaining_months: 9,
        reference_number: 'LOAN-001',
        submitted_by: 'HR Manager',
        status: 'active',
        approved_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        deduction_id: 2,
        employee_id: 6,
        deduction_type: 'Cooperative',
        name: 'Cooperative Contribution',
        amount: 5,
        deduction_type_value: 'percent',
        percentage_value: 5,
        start_date: new Date(currentYear, currentMonth - 6, 1),
        total_months: 24,
        remaining_months: 18,
        reference_number: 'COOP-001',
        submitted_by: 'Finance Officer',
        status: 'active',
        approved_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ==================== CARRY FORWARDS ====================
    await queryInterface.bulkInsert('carry_forwards', [
      {
        carry_id: 1,
        employee_id: 8,
        period_id: 1,
        amount: 1500,
        status: 'pending',
        notes: 'Carry forward from previous month due to negative net pay',
        created_at: new Date()
     
      }
    ]);

    // ==================== PENALTY REDUCTION RULES ====================
    await queryInterface.bulkInsert('penalty_reduction_rules', [
      { rule_id: 1, rule_type: 'amount', min_value: 0, max_value: 1000, reduction_value: 0, is_active: true, created_by: 1, created_at: new Date(), updated_at: new Date() },
      { rule_id: 2, rule_type: 'amount', min_value: 1000, max_value: 5000, reduction_value: 500, is_active: true, created_by: 1, created_at: new Date(), updated_at: new Date() },
      { rule_id: 3, rule_type: 'amount', min_value: 5000, max_value: 999999, reduction_value: 1000, is_active: true, created_by: 1, created_at: new Date(), updated_at: new Date() },
      { rule_id: 4, rule_type: 'percent', min_value: 0, max_value: 5, reduction_value: 0, is_active: true, created_by: 1, created_at: new Date(), updated_at: new Date() },
      { rule_id: 5, rule_type: 'percent', min_value: 5, max_value: 10, reduction_value: 2, is_active: true, created_by: 1, created_at: new Date(), updated_at: new Date() },
      { rule_id: 6, rule_type: 'percent', min_value: 10, max_value: 999999, reduction_value: 5, is_active: true, created_by: 1, created_at: new Date(), updated_at: new Date() }
    ]);

    // ==================== SYSTEM SETTINGS ====================
    await queryInterface.bulkInsert('system_settings', [
      { setting_id: 1, setting_key: 'company.name', setting_value: JSON.stringify('SuperHR Solutions'), category: 'company', description: 'Company name', data_type: 'string', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() },
      { setting_id: 2, setting_key: 'payroll.working_days', setting_value: JSON.stringify(22), category: 'payroll', description: 'Number of working days per month', data_type: 'number', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() },
      { setting_id: 3, setting_key: 'payroll.allowance_rate', setting_value: JSON.stringify(0.45), category: 'payroll', description: 'Total allowance rate (45% of basic salary)', data_type: 'number', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() },
      { setting_id: 4, setting_key: 'payroll.pension.employee_rate', setting_value: JSON.stringify(7), category: 'payroll', description: 'Employee pension contribution rate (7%)', data_type: 'number', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() },
      { setting_id: 5, setting_key: 'payroll.pension.employer_rate', setting_value: JSON.stringify(11), category: 'payroll', description: 'Employer pension contribution rate (11%)', data_type: 'number', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() },
      { setting_id: 6, setting_key: 'payroll.pension.monthly_cap', setting_value: JSON.stringify(15000), category: 'payroll', description: 'Monthly salary cap for pension calculation', data_type: 'number', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() },
      { setting_id: 7, setting_key: 'tax.brackets', setting_value: JSON.stringify({ brackets: [{ min: 0, max: 600, rate: 0 }, { min: 601, max: 1650, rate: 10 }, { min: 1651, max: 3200, rate: 15 }, { min: 3201, max: 5250, rate: 20 }, { min: 5251, max: 7800, rate: 25 }, { min: 7801, max: 10900, rate: 30 }, { min: 10901, max: null, rate: 35 }] }), category: 'tax', description: 'Ethiopian employment tax brackets', data_type: 'json', is_editable: true, is_encrypted: false, updated_by: 1, version: 1, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order to maintain foreign key constraints
    await queryInterface.bulkDelete('system_settings', null, {});
    await queryInterface.bulkDelete('penalty_reduction_rules', null, {});
    await queryInterface.bulkDelete('carry_forwards', null, {});
    await queryInterface.bulkDelete('recurring_deductions', null, {});
    await queryInterface.bulkDelete('salary_holds', null, {});
    await queryInterface.bulkDelete('payroll_periods', null, {});
    await queryInterface.bulkDelete('leave_types', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('positions', null, {});
    await queryInterface.bulkDelete('departments', null, {});
  }
};