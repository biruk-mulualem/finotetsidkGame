'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // Step 1: Create new enum type with all values
      await queryInterface.sequelize.query(`
        CREATE TYPE enum_employee_documents_document_type_new AS ENUM (
          'id_card',
          'cv',
          'degree',
          'guarantee_letter',
          'resume',
          'id-card',
          'passport',
          'certificate',
          'contract',
          'performance-review'
        );
      `);
      
      // Step 2: Update the column to use the new enum
      await queryInterface.sequelize.query(`
        ALTER TABLE employee_documents 
        ALTER COLUMN document_type TYPE enum_employee_documents_document_type_new 
        USING document_type::text::enum_employee_documents_document_type_new;
      `);
      
      // Step 3: Drop the old enum
      await queryInterface.sequelize.query(`
        DROP TYPE enum_employee_documents_document_type;
      `);
      
      // Step 4: Rename the new enum to the original name
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_employee_documents_document_type_new RENAME TO enum_employee_documents_document_type;
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // Revert back to original enum
      await queryInterface.sequelize.query(`
        CREATE TYPE enum_employee_documents_document_type_old AS ENUM (
          'resume',
          'id-card',
          'passport',
          'degree',
          'certificate',
          'contract',
          'performance-review'
        );
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE employee_documents 
        ALTER COLUMN document_type TYPE enum_employee_documents_document_type_old 
        USING document_type::text::enum_employee_documents_document_type_old;
      `);
      
      await queryInterface.sequelize.query(`
        DROP TYPE enum_employee_documents_document_type;
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_employee_documents_document_type_old RENAME TO enum_employee_documents_document_type;
      `);
    }
  }
};