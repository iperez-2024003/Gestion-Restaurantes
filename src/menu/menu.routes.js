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

/**
 * Public routes
 */
// Get all menu categories
router.get('/', getAllMenus);

// Get menu category by ID
router.get('/:id', getMenuById);

/**
 * Protected routes (require authentication)
 */
// Create menu category
router.post('/', [validateJWT, validateMenuCreation], createMenu);

// Update menu category
router.put('/:id', [validateJWT, validateMenuUpdate], updateMenu);

// Delete menu category
router.delete('/:id', validateJWT, deleteMenu);

// ==================== MENU ITEMS ROUTES ====================

/**
 * Public routes
 */
// Get all menu items
router.get('/items/all', getAllMenuItems);

// Get menu item by ID
router.get('/items/:id', getMenuItemById);

/**
 * Protected routes (require authentication)
 */
// Create menu item
router.post('/items', [validateJWT, validateMenuItemCreation], createMenuItem);

// Update menu item
router.put('/items/:id', [validateJWT, validateMenuItemUpdate], updateMenuItem);

// Delete menu item
router.delete('/items/:id', validateJWT, deleteMenuItem);

// Toggle menu item availability
router.patch('/items/:id/toggle', validateJWT, toggleMenuItemAvailability);

export default router;