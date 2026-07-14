'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('employee_documents', 'mime_type', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('employee_documents', 'mime_type', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });
  }
};