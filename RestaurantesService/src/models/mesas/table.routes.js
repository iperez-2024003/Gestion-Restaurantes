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
import { requireAdmin } from '../../middlewares/require-role.js';
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

/** Rutas solo ADMIN_ROLE (gestión de mesas) */
router.post('/', [validateJWT, requireAdmin, validateTableCreation], createTable);
router.put('/:id', [validateJWT, requireAdmin, validateUuidParam('id'), validateTableUpdate], updateTable);
router.delete('/:id', [validateJWT, requireAdmin, validateUuidParam('id')], deleteTable);
router.patch('/:id/status', [validateJWT, requireAdmin, validateUuidParam('id'), validateTableStatusUpdate], updateTableStatus);

export default router;