'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'profile_picture', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    
    await queryInterface.addColumn('employees', 'profile_picture_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    
    await queryInterface.addColumn('employees', 'profile_picture_public_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('employees', 'profile_picture');
    await queryInterface.removeColumn('employees', 'profile_picture_url');
    await queryInterface.removeColumn('employees', 'profile_picture_public_id');
  }
};