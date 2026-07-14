// migrations/20241201000001-add-period-fields-to-employee-penalties.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table exists first
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('employee_penalties')) {
      console.log('Table employee_penalties does not exist yet. Skipping...');
      return;
    }

    // Add period fields to employee_penalties table
    await queryInterface.addColumn('employee_penalties', 'period_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Start date of the period this penalty applies to'
    });

    await queryInterface.addColumn('employee_penalties', 'period_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'End date of the period this penalty applies to'
    });

    await queryInterface.addColumn('employee_penalties', 'period_label', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Human readable period label (e.g., "January 2024")'
    });

    await queryInterface.addColumn('employee_penalties', 'reduced_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Total amount reduced/deducted from this penalty'
    });

    // Update existing records to have period based on month field
    await queryInterface.sequelize.query(`
      UPDATE employee_penalties 
      SET 
        period_start_date = TO_DATE(month || '-01', 'YYYY-MM-DD'),
        period_end_date = (TO_DATE(month || '-01', 'YYYY-MM-DD') + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
        period_label = TO_CHAR(TO_DATE(month || '-01', 'YYYY-MM-DD'), 'FMMonth YYYY')
      WHERE month IS NOT NULL AND period_start_date IS NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    
    if (tables.includes('employee_penalties')) {
      await queryInterface.removeColumn('employee_penalties', 'period_start_date');
      await queryInterface.removeColumn('employee_penalties', 'period_end_date');
      await queryInterface.removeColumn('employee_penalties', 'period_label');
      await queryInterface.removeColumn('employee_penalties', 'reduced_amount');
    }
  }
};