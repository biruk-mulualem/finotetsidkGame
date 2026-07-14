// migrations/20260101000000-add-normal-ot-to-attendance-records.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('attendance_records', 'normal_ot_minutes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
      comment: 'Normal overtime minutes on weekdays'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('attendance_records', 'normal_ot_minutes');
  }
};