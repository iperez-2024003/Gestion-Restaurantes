import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { findUserById } from '../../helpers/user-db.js';
import {
  getUserRoleNames,
  getUsersByRole as repoGetUsersByRole,
  setUserSingleRole,
} from '../../helpers/role-db.js';
import { getRequestUserRoleNames } from '../../middlewares/require-role.js';
import { ALLOWED_ROLES, ADMIN_ROLE } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { sequelize } from '../../configs/db.js';

export const updateUserRole = [
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { roleName } = req.body || {};

    const normalized = (roleName || '').trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Role not allowed. Use ADMIN_ROLE or USER_ROLE',
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const { updatedUser } = await setUserSingleRole(
      user,
      normalized,
      sequelize
    );

    return res.status(200).json(buildUserResponse(updatedUser));
  }),
];

export const getUserRoles = [
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.userId;
    // Solo puede ver sus propios roles o ser ADMIN_ROLE para ver cualquier usuario
    if (userId !== currentUserId) {
      const userRoles = await getRequestUserRoleNames(req);
      if (!userRoles.includes(ADMIN_ROLE)) {
        return res.status(403).json({
          success: false,
          message: 'Solo el rol ADMIN_ROLE puede consultar los roles de otros usuarios.',
        });
      }
    }
    const roles = await getUserRoleNames(userId);
    return res.status(200).json(roles);
  }),
];

export const getUsersByRole = [
  asyncHandler(async (req, res) => {
    const { roleName } = req.params;
    const normalized = (roleName || '').trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Role not allowed. Use ADMIN_ROLE or USER_ROLE',
      });
    }

    const users = await repoGetUsersByRole(normalized);
    const payload = users.map(buildUserResponse);
    return res.status(200).json(payload);
  }),
];
