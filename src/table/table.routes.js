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
<<<<<<< Updated upstream
import { validateTableCreation, validateTableUpdate } from './table.validation.js';
=======
import { requireRole } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
import {
  validateTableCreation,
  validateTableUpdate,
  validateTableStatusUpdate,
  validateGetAvailableTablesQuery,
} from './table.validation.js';
>>>>>>> Stashed changes

const router = Router();

// Rutas públicas (lectura)
router.get('/', getAllTables);
router.get('/available', getAvailableTables);
router.get('/:id', getTableById);
router.post('/', [validateJWT, validateTableCreation], createTable);
router.put('/:id', [validateJWT, validateTableUpdate], updateTable);
router.delete('/:id', validateJWT, deleteTable);
router.patch('/:id/status', validateJWT, updateTableStatus);

<<<<<<< Updated upstream
export default router;
=======
// Gestión de mesas: solo Restaurant Admin o Super Admin pueden crear/editar/eliminar
const requireTableAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');
router.post('/', [validateJWT, requireTableAdmin, validateTableCreation], createTable);
router.put('/:id', [validateJWT, requireTableAdmin, validateUuidParam('id'), validateTableUpdate], updateTable);
router.delete('/:id', [validateJWT, requireTableAdmin, validateUuidParam('id')], deleteTable);

// Cambio de estado de mesa: permitido para Staff, Restaurant Admin y Super Admin
const requireOperationalStaff = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');
router.patch('/:id/status', [validateJWT, requireOperationalStaff, validateUuidParam('id'), validateTableStatusUpdate], updateTableStatus);

export default router;
>>>>>>> Stashed changes
