'use strict';

import { Router } from 'express';
import {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from './menu.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireAdmin } from '../../middlewares/require-role.js';
import {
  validateMenuCreation,
  validateMenuUpdate,
  validateMenuItemCreation,
  validateMenuItemUpdate,
} from './menu.validation.js';

const router = Router();

// ==================== MENU CATEGORIES ROUTES ====================

/**
 * Public routes
 */
router.get('/', getAllMenus);
router.get('/:id', getMenuById);

/**
 * Rutas solo ADMIN_ROLE (gestión de categorías de menú)
 */
router.post('/', [validateJWT, requireAdmin, validateMenuCreation], createMenu);
router.put('/:id', [validateJWT, requireAdmin, validateMenuUpdate], updateMenu);
router.delete('/:id', [validateJWT, requireAdmin], deleteMenu);

// ==================== MENU ITEMS ROUTES ====================

router.get('/items/all', getAllMenuItems);
router.get('/items/:id', getMenuItemById);

/**
 * Rutas solo ADMIN_ROLE (gestión de ítems de menú)
 */
router.post('/items', [validateJWT, requireAdmin, validateMenuItemCreation], createMenuItem);
router.put('/items/:id', [validateJWT, requireAdmin, validateMenuItemUpdate], updateMenuItem);
router.delete('/items/:id', [validateJWT, requireAdmin], deleteMenuItem);
router.patch('/items/:id/toggle', [validateJWT, requireAdmin], toggleMenuItemAvailability);

export default router;