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
import {
  validateMenuCreation,
  validateMenuUpdate,
  validateMenuItemCreation,
  validateMenuItemUpdate,
} from './menu.validation.js';

const router = Router();

// ==================== MENU CATEGORIES ROUTES ====================

router.get('/', getAllMenus);

router.get('/:id', getMenuById);

router.post('/', [validateJWT, validateMenuCreation], createMenu);

router.put('/:id', [validateJWT, validateMenuUpdate], updateMenu);

router.delete('/:id', validateJWT, deleteMenu);

// ==================== MENU ITEMS ROUTES ====================

router.get('/items/all', getAllMenuItems);

router.get('/items/:id', getMenuItemById);

router.post('/items', [validateJWT, validateMenuItemCreation], createMenuItem);

router.put('/items/:id', [validateJWT, validateMenuItemUpdate], updateMenuItem);

router.delete('/items/:id', validateJWT, deleteMenuItem);

router.patch('/items/:id/toggle', validateJWT, toggleMenuItemAvailability);

export default router;