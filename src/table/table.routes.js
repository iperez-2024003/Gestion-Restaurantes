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
import { validateTableCreation, validateTableUpdate } from './table.validation.js';

const router = Router();

router.get('/', getAllTables);
router.get('/available', getAvailableTables);
router.get('/:id', getTableById);

/** Rutas solo ADMIN_ROLE (gestión de mesas) */
router.post('/', [validateJWT, requireAdmin, validateTableCreation], createTable);
router.put('/:id', [validateJWT, requireAdmin, validateTableUpdate], updateTable);
router.delete('/:id', [validateJWT, requireAdmin], deleteTable);
router.patch('/:id/status', [validateJWT, requireAdmin], updateTableStatus);

export default router;