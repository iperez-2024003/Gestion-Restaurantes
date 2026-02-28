'use strict';

import { getUserRoleNames } from '../helpers/role-db.js';
import { ADMIN_ROLE } from '../helpers/role-constants.js';

/**
 * Obtiene los nombres de rol del usuario actual (req.user o por userId).
 * req.user debe venir de validateJWT con include UserRoles + Role.
 * @param {import('express').Request} req
 * @returns {Promise<string[]>}
 */
export const getRequestUserRoleNames = async (req) => {
  if (!req.userId) return [];
  if (Array.isArray(req.userRoleNames) && req.userRoleNames.length > 0) return req.userRoleNames;
  const fromUser = req.user?.UserRoles?.map((ur) => ur?.Role?.Name).filter(Boolean);
  if (fromUser?.length) return fromUser;
  return getUserRoleNames(req.userId);
};

/**
 * Middleware que exige que el usuario tenga al menos uno de los roles permitidos.
 * Debe usarse después de validateJWT.
 * @param {...string} allowedRoles - Nombres de rol permitidos (ej: 'ADMIN_ROLE')
 * @returns {import('express').RequestHandler}
 */
export const requireRole = (...allowedRoles) => {
  const set = new Set(allowedRoles.map((r) => (r || '').toUpperCase()));
  return async (req, res, next) => {
    try {
      const roles = await getRequestUserRoleNames(req);
      const hasRole = roles.some((r) => set.has((r || '').toUpperCase()));
      if (!hasRole) {
        const roleList = [...set].join(' o ');
        return res.status(403).json({
          success: false,
          message: `Acción no permitida. Solo el rol ${roleList} puede realizar esta operación.`,
        });
      }
      next();
    } catch (err) {
      console.error('Error en requireRole:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
      });
    }
  };
};

/**
 * Middleware que exige que el usuario tenga el rol ADMIN_ROLE.
 * Debe usarse después de validateJWT.
 */
export const requireAdmin = requireRole(ADMIN_ROLE);
