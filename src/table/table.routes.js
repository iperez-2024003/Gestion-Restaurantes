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
import { validateTableCreation, validateTableUpdate } from './table.validation.js';

const router = Router();

router.get('/', getAllTables);
router.get('/available', getAvailableTables);
router.get('/:id', getTableById);
router.post('/', [validateJWT, validateTableCreation], createTable);
router.put('/:id', [validateJWT, validateTableUpdate], updateTable);
router.delete('/:id', validateJWT, deleteTable);
router.patch('/:id/status', validateJWT, updateTableStatus);

export default router;