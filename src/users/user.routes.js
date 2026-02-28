import { Router } from 'express';
import {
  updateUserRole,
  getUserRoles,
  getUsersByRole,
} from './user.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireAdmin } from '../../middlewares/require-role.js';

const router = Router();

// PUT /api/v1/users/:userId/role — solo ADMIN_ROLE
router.put('/:userId/role', validateJWT, requireAdmin, ...updateUserRole);

// GET /api/v1/users/:userId/roles — usuario puede ver sus propios roles; ver otros requiere ADMIN_ROLE
router.get('/:userId/roles', validateJWT, ...getUserRoles);

// GET /api/v1/users/by-role/:roleName — solo ADMIN_ROLE
router.get('/by-role/:roleName', validateJWT, requireAdmin, ...getUsersByRole);

export default router;
