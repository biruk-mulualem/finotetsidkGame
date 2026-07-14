// utils/userAccess.js
const { User, Role, Group, Store, UserGroupRelation, StoreGroupRelation } = require('../models');

async function getUserStoreAndGroup(userId) {
  if (!userId) {
    return { success: false, error: "User ID is required", data: null };
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'username', 'fullName', 'email', 'isActive', 'roleId'],
      include: [
        {
          model: Role,
          attributes: ['roleId', 'name'],
        }
      ]
    });

    if (!user) {
      return { success: false, error: "User not found", data: null };
    }

    const roleName = user.Role ? user.Role.name : 'user';
    const isAdmin = ['admin', 'Admin', 'superadmin', 'Superadmin'].includes(roleName);

    // ✅ FIX: If admin, return with NO filters (null values)
    if (isAdmin) {
      return {
        success: true,
        data: {
          userId: user.userId,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: roleName,
          roleId: user.roleId,
          isActive: user.isActive,
          isAdmin: true,
          hasAssignments: false,
          assignedStoreId: null,  // ✅ null, not undefined
          assignedGroupId: null,  // ✅ null, not undefined
          assignedStore: null,
          assignedGroup: null,
        },
      };
    }

    // ✅ FOR STORE USERS - Find their group and store
    const userGroupRelations = await UserGroupRelation.findAll({
      where: { userId: userId },
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['groupId', 'name', 'code', 'description', 'status'],
        },
      ],
    });

    if (!userGroupRelations || userGroupRelations.length === 0) {
      return {
        success: true,
        data: {
          userId: user.userId,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: roleName,
          roleId: user.roleId,
          isActive: user.isActive,
          isAdmin: false,
          hasAssignments: false,
          assignedStoreId: null,
          assignedGroupId: null,
          assignedStore: null,
          assignedGroup: null,
        },
      };
    }

    const firstGroup = userGroupRelations[0].group;
    const groupId = firstGroup.groupId;

    const storeGroupRelation = await StoreGroupRelation.findOne({
      where: { groupId: groupId },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'code', 'location', 'status'],
        },
      ],
    });

    if (!storeGroupRelation) {
      return {
        success: true,
        data: {
          userId: user.userId,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: roleName,
          roleId: user.roleId,
          isActive: user.isActive,
          isAdmin: false,
          hasAssignments: false,
          assignedStoreId: null,
          assignedGroupId: groupId,
          assignedStore: null,
          assignedGroup: firstGroup,
        },
      };
    }

    const store = storeGroupRelation.store;

    return {
      success: true,
      data: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: roleName,
        roleId: user.roleId,
        isActive: user.isActive,
        isAdmin: false,
        hasAssignments: true,
        assignedStoreId: store.id,
        assignedGroupId: groupId,
        assignedStore: {
          id: store.id,
          name: store.name,
          code: store.code,
          location: store.location,
          status: store.status,
        },
        assignedGroup: {
          id: firstGroup.groupId,
          name: firstGroup.name,
          code: firstGroup.code,
          description: firstGroup.description,
          status: firstGroup.status,
        },
      },
    };
  } catch (error) {
    console.error("❌ Get user store and group error:", error);
    return { success: false, error: error.message, data: null };
  }
}

module.exports = { getUserStoreAndGroup };