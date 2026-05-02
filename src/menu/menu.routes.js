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
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
import {
  validateMenuCreation,
  validateMenuUpdate,
  validateMenuItemCreation,
  validateMenuItemUpdate,
} from './menu.validation.js';

const router = Router();

// ==================== MENU CATEGORIES ROUTES ====================

router.get('/', getAllMenus);
router.get('/:id', validateUuidParam('id'), getMenuById);
router.post('/', [validateJWT, requireSuperAdmin, validateMenuCreation], createMenu);
router.put('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateMenuUpdate], updateMenu);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteMenu);

// ==================== MENU ITEMS ROUTES ====================

router.get('/items/all', getAllMenuItems);
router.get('/items/:id', validateUuidParam('id'), getMenuItemById);
router.post('/items', [validateJWT, requireSuperAdmin, validateMenuItemCreation], createMenuItem);
router.put('/items/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateMenuItemUpdate], updateMenuItem);
router.delete('/items/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteMenuItem);
router.patch('/items/:id/toggle', [validateJWT, requireSuperAdmin, validateUuidParam('id')], toggleMenuItemAvailability);

export default router;
