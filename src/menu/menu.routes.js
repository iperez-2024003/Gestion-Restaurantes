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
import { upload } from '../../helpers/file-upload.js';
import {
  validateMenuCreation,
  validateMenuUpdate,
  validateMenuItemCreation,
  validateMenuItemUpdate,
} from './menu.validation.js';

const router = Router();

/**
 * Middleware para parsear los datos de FormData que vienen como strings
 */
const parseMenuItemFormData = (req, res, next) => {
  if (req.body.price) req.body.price = parseFloat(req.body.price);
  if (req.body.preparation_time) req.body.preparation_time = parseInt(req.body.preparation_time);
  if (req.body.calories) req.body.calories = parseInt(req.body.calories);
  if (req.body.is_vegetarian) req.body.is_vegetarian = req.body.is_vegetarian === 'true';
  if (req.body.is_vegan) req.body.is_vegan = req.body.is_vegan === 'true';
  if (req.body.is_gluten_free) req.body.is_gluten_free = req.body.is_gluten_free === 'true';
  if (req.body.is_available) req.body.is_available = req.body.is_available === 'true';
  
  // Parsear arrays (ingredients, allergens) si vienen como string JSON
  if (typeof req.body.ingredients === 'string') {
    try { req.body.ingredients = JSON.parse(req.body.ingredients); } catch (e) { req.body.ingredients = []; }
  }
  if (typeof req.body.allergens === 'string') {
    try { req.body.allergens = JSON.parse(req.body.allergens); } catch (e) { req.body.allergens = []; }
  }
  
  next();
};

// ==================== MENU CATEGORIES ROUTES ====================

router.get('/', getAllMenus);
router.get('/:id', validateUuidParam('id'), getMenuById);
router.post('/', [validateJWT, requireSuperAdmin, validateMenuCreation], createMenu);
router.put('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateMenuUpdate], updateMenu);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteMenu);

// ==================== MENU ITEMS ROUTES ====================

router.get('/items/all', getAllMenuItems);
router.get('/items/:id', validateUuidParam('id'), getMenuItemById);

router.post('/items', [
  validateJWT, 
  requireSuperAdmin, 
  upload.single('image'),
  parseMenuItemFormData,
  validateMenuItemCreation
], createMenuItem);

router.put('/items/:id', [
  validateJWT, 
  requireSuperAdmin, 
  validateUuidParam('id'), 
  upload.single('image'),
  parseMenuItemFormData,
  validateMenuItemUpdate
], updateMenuItem);

router.delete('/items/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteMenuItem);
router.patch('/items/:id/toggle', [validateJWT, requireSuperAdmin, validateUuidParam('id')], toggleMenuItemAvailability);

export default router;
