// migrations/20260101000001-add-tax-rules-to-attendance-settings.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the existing attendance rules setting
    const [existing] = await queryInterface.sequelize.query(
      `SELECT setting_id, setting_value FROM system_settings 
       WHERE setting_key = 'attendance.rules' LIMIT 1;`
    );
    
    if (existing.length > 0) {
      // Get current value
      const currentValue = existing[0].setting_value;
      
      // Add tax rules to existing object (without overwriting existing data)
      const updatedValue = {
        ...currentValue,  // Keep all existing data (workSchedule, leave.rules, etc.)
        "tax.rules": {    // Add new tax rules
          version: "1.0",
          effectiveFrom: "2024-01-01",
          legalReference: {
            incomeTaxProclamation: "No. 286/2002 as amended",
            pensionProclamation: "No. 715/2011 as amended by No. 908/2015"
          },
          employmentTax: {
            brackets: [
              { min: 0, max: 2000, rate: 0, deduction: 0, description: "Exempt" },
              { min: 2001, max: 4000, rate: 15, deduction: 0, description: "15% on amount over 2,000" },
              { min: 4001, max: 7000, rate: 20, deduction: 200, description: "20% minus 200" },
              { min: 7001, max: 10000, rate: 25, deduction: 550, description: "25% minus 550" },
              { min: 10001, max: 14000, rate: 30, deduction: 1050, description: "30% minus 1,050" },
              { min: 14001, max: null, rate: 35, deduction: 1750, description: "35% minus 1,750" }
            ],
            calculationFormula: "Tax = (Income × Rate ÷ 100) - Deduction",
            roundingMethod: "floor"
          },
          pension: {
            employeeRate: 7,
            employerRate: 11,
            monthlyCap: 15000,
            maxEmployeeContribution: 1050,
            maxEmployerContribution: 1650,
            calculationBase: "basic_salary_only",
            notes: "Any salary above 15,000 ETB is not subject to pension contribution"
          },
          exemptions: {
            transportAllowance: {
              isExempt: true,
              maxExemptAmount: 2200,
              alternativeLimit: "25_percent_of_salary",
              calculationMethod: "min_of_fixed_or_percentage"
            },
            medicalReimbursement: { isExempt: true },
            hardshipAllowance: { isExempt: true },
            travelReimbursement: { isExempt: true }
          },
          deadlines: {
            taxRemittanceDay: 8,
            pensionRemittanceDay: 10
          }
        }
      };
      
      // Update the record
      await queryInterface.bulkUpdate(
        'system_settings',
        {
          setting_value: JSON.stringify(updatedValue),
          updated_at: new Date(),
          version: Sequelize.literal('version + 1')
        },
        { setting_id: existing[0].setting_id }
      );
      
      console.log('✅ Tax rules added to attendance settings');
    } else {
      console.log('⚠️ No attendance.rules found, creating new record');
      // Optionally create new record if doesn't exist
      await queryInterface.bulkInsert('system_settings', [{
        setting_key: 'attendance.rules',
        setting_value: JSON.stringify({
          "tax.rules": { /* tax rules here */ }
        }),
        category: 'attendance',
        description: 'Attendance and Tax Rules',
        data_type: 'json',
        is_editable: true,
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
      }]);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove tax.rules from the JSON (rollback)
    const [existing] = await queryInterface.sequelize.query(
      `SELECT setting_id, setting_value FROM system_settings 
       WHERE setting_key = 'attendance.rules' LIMIT 1;`
    );
    
    if (existing.length > 0) {
      const currentValue = existing[0].setting_value;
      
      // Remove tax.rules property
      delete currentValue["tax.rules"];
      
      await queryInterface.bulkUpdate(
        'system_settings',
        {
          setting_value: JSON.stringify(currentValue),
          updated_at: new Date()
        },
        { setting_id: existing[0].setting_id }
      );
    }
  }
};