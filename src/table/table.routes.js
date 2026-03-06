'use strict';

import { Router } from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableStatus,
  getAvailableTables,
} from './table.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
import {
  validateTableCreation,
  validateTableUpdate,
  validateTableStatusUpdate,
  validateGetAvailableTablesQuery,
} from './table.validation.js';

const router = Router();

router.get('/', getAllTables);
router.get('/available', validateGetAvailableTablesQuery, getAvailableTables);
router.get('/:id', validateUuidParam('id'), getTableById);

/** Rutas solo ADMIN_ROLE (gestiÃ³n de mesas) */
router.post('/', [validateJWT, requireSuperAdmin, validateTableCreation], createTable);
router.put('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateTableUpdate], updateTable);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteTable);
router.patch('/:id/status', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateTableStatusUpdate], updateTableStatus);

export default router;
