'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the current system_settings record
    const [settings] = await queryInterface.sequelize.query(
      `SELECT * FROM system_settings WHERE setting_key = 'attendance.rules' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!settings) {
      console.log('No attendance.rules found, skipping...');
      return;
    }

    // Parse current settings
    const currentSettings = settings.setting_value;
    
    // Get existing leaveRules (your simple structure)
    const existingLeaveRules = currentSettings.leaveRules || {};
    
    // Create the new comprehensive leave rules structure
    // Preserving your existing values where applicable
    const newLeaveRules = {
      // Annual Leave - Progressive Ethiopian System
      annualLeave: {
        baseDays: existingLeaveRules.annual || 16,
        incrementInterval: 2,
        incrementAmount: 1,
        maxDays: null,
        carryOverLimit: existingLeaveRules.maxCarryover || 10,
        carryOverExpiryYears: 2,
        accrualType: "anniversary",
        requiresApproval: true,
        minNoticeDays: existingLeaveRules.noticeDays || 7,
        maxConsecutiveDays: existingLeaveRules.maxConsecutive || 30
      },
      
      // Sick Leave - No fixed limit
      sickLeave: {
        hasFixedLimit: false,
        requiresDoctorNoteAfter: 3,
        alertThreshold: 15,
        resetFrequency: "yearly",
        requiresApproval: false,
        minNoticeDays: 0
      },
      
      // Maternity Leave
      maternityLeave: {
        defaultDays: existingLeaveRules.maternity || 90,
        isPaid: true,
        requiresApproval: true,
        requiresDocumentation: true,
        minNoticeDays: 30,
        isOneTime: true,
        genderRestriction: "female",
        extensionAllowed: true,
        maxExtensionDays: 30
      },
      
      // Paternity Leave
      paternityLeave: {
        defaultDays: existingLeaveRules.paternity || 3,
        isPaid: true,
        requiresApproval: true,
        minNoticeDays: 14,
        isOneTime: true,
        genderRestriction: "male",
        mustTakeWithinDays: 30
      },
      
      // Bereavement Leave
      bereavementLeave: {
        defaultDays: existingLeaveRules.bereavement || 3,
        isPaid: true,
        requiresApproval: true,
        requiresDocumentation: true,
        minNoticeDays: 0,
        eligibleRelationships: ["spouse", "parent", "child", "sibling"],
        immediateFamilyDays: 5,
        isOneTime: false,
        maxPerYear: 10
      },
      
      // Unpaid Leave
      unpaidLeave: {
        isPaid: false,
        requiresApproval: existingLeaveRules.unpaid !== false,
        requiresDirectorApproval: true,
        minNoticeDays: 14,
        maxConsecutiveDays: existingLeaveRules.maxConsecutive || 30,
        maxPerYear: 60,
        requiresReason: true
      },
      
      // Year-End Processing
      yearEndProcessing: {
        processingDate: new Date().getFullYear() + "-12-31",
        carryOverDeadline: new Date().getFullYear() + "-12-15",
        expiryNotificationDays: [60, 30, 14, 7, 3, 1],
        autoCarryOver: existingLeaveRules.carryover !== false,
        resetSickLeave: true,
        notificationRecipients: ["hr", "employee", "manager"]
      },
      
      // Approval Workflow
      approvalWorkflow: {
        requiresManagerApproval: true,
        requiresHrApproval: true,
        autoApproveThresholdDays: 3,
        autoApproveLeaveTypes: ["sick_leave"],
        escalationDays: 7,
        approvalChain: ["manager", "hr", "director"],
        allowSelfCancellation: true,
        cancellationDeadlineDays: 2,
        rejectionReasonRequired: true
      },
      
      // Return Tracking
      returnTracking: {
        enabled: true,
        returnConfirmationRequired: true,
        gracePeriodHours: 24,
        overdueAlertDays: [1, 3, 5, 7],
        allowEarlyReturn: true,
        allowLateReturn: true,
        requireReturnNotes: false,
        autoMarkReturned: false,
        overdueAction: "notify",
        overdueEscalationDays: [1, 3, 5, 7]
      },
      
      // Notifications
      notifications: {
        reminderDaysBefore: [30, 14, 7, 3, 1],
        overdueAlertDays: [1, 3, 5, 7],
        expiryAlertDays: [60, 30, 14, 7],
        pendingApprovalReminderDays: [3, 5, 7],
        channels: ["email", "in_app"],
        notifyOn: {
          requestSubmitted: ["manager", "hr"],
          requestApproved: ["employee"],
          requestRejected: ["employee"],
          extensionRequested: ["manager", "hr"],
          extensionApproved: ["employee"],
          extensionRejected: ["employee"],
          returnOverdue: ["employee", "manager", "hr"],
          balanceLow: ["employee"],
          leaveExpiring: ["employee"],
          carryOverApplied: ["employee"]
        }
      },
      
      // Blackout Periods
      blackoutPeriods: {
        enabled: true,
        global: [],
        departmentSpecific: {},
        exceptionAllowed: true,
        exceptionRequiresDirectorApproval: true
      },
      
      // Extensions
      extensions: {
        maxExtensionsPerLeave: 2,
        maxTotalExtensionDays: 30,
        extensionRequiresApproval: true,
        extensionApprovalChain: ["manager", "hr"],
        autoApproveExtensionDays: 2,
        extensionReasonRequired: true,
        doctorNoteRequiredForExtension: true,
        allowedLeaveTypesForExtension: ["sick_leave"]
      },
      
      // Validation Rules
      validation: {
        minDaysPerRequest: 1,
        maxDaysPerRequest: 30,
        minNoticeDaysPerType: {
          annual: existingLeaveRules.noticeDays || 7,
          sick: 0,
          maternity: 30,
          paternity: 14,
          bereavement: 0,
          unpaid: 14
        },
        overlapAllowed: false,
        concurrentLeavesAllowed: true,
        maxConcurrentEmployees: 3,
        pendingRequestsBlockNew: true,
        futureDateOnly: true,
        maxFutureDays: 365,
        weekendCounting: true,
        holidayCounting: false
      }
    };

    // Update the settings with new leaveRules
    const updatedSettings = {
      ...currentSettings,
      leaveRules: newLeaveRules
    };

    // Save back to database
    await queryInterface.sequelize.query(
      `UPDATE system_settings 
       SET setting_value = :newValue, 
           updated_at = NOW(), 
           version = version + 1 
       WHERE setting_key = 'attendance.rules'`,
      {
        replacements: { newValue: JSON.stringify(updatedSettings) },
        type: queryInterface.sequelize.QueryTypes.UPDATE
      }
    );

    console.log('✅ Successfully updated leaveRules with comprehensive structure');
    console.log('Preserved values:', {
      annual: existingLeaveRules.annual,
      sick: existingLeaveRules.sick,
      maternity: existingLeaveRules.maternity,
      paternity: existingLeaveRules.paternity,
      bereavement: existingLeaveRules.bereavement,
      noticeDays: existingLeaveRules.noticeDays,
      carryover: existingLeaveRules.carryover,
      maxCarryover: existingLeaveRules.maxCarryover
    });
  },

  async down(queryInterface, Sequelize) {
    // Get current settings
    const [settings] = await queryInterface.sequelize.query(
      `SELECT * FROM system_settings WHERE setting_key = 'attendance.rules' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!settings) return;

    const currentSettings = settings.setting_value;
    const newLeaveRules = currentSettings.leaveRules;
    
    if (newLeaveRules && newLeaveRules.annualLeave) {
      // Extract simple values from comprehensive structure for rollback
      const simpleLeaveRules = {
        annual: newLeaveRules.annualLeave?.baseDays || 20,
        sick: 10,
        maternity: newLeaveRules.maternityLeave?.defaultDays || 90,
        paternity: newLeaveRules.paternityLeave?.defaultDays || 10,
        bereavement: newLeaveRules.bereavementLeave?.defaultDays || 5,
        unpaid: newLeaveRules.unpaidLeave?.isPaid === false,
        maxConsecutive: newLeaveRules.unpaidLeave?.maxConsecutiveDays || 30,
        noticeDays: newLeaveRules.annualLeave?.minNoticeDays || 3,
        carryover: newLeaveRules.yearEndProcessing?.autoCarryOver !== false,
        maxCarryover: newLeaveRules.annualLeave?.carryOverLimit || 30
      };

      const rolledBackSettings = {
        ...currentSettings,
        leaveRules: simpleLeaveRules
      };

      await queryInterface.sequelize.query(
        `UPDATE system_settings 
         SET setting_value = :oldValue, 
             updated_at = NOW() 
         WHERE setting_key = 'attendance.rules'`,
        {
          replacements: { oldValue: JSON.stringify(rolledBackSettings) },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log('✅ Rolled back leaveRules to simple structure');
    }
  }
};