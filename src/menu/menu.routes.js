'use strict';

import express from 'express';
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
import {
  createMenuValidation,
  updateMenuValidation,
  createMenuItemValidation,
  updateMenuItemValidation,
  uuidParamValidation,
  menuQueryValidation,
  menuItemQueryValidation,
} from './menu.validation.js';

const router = express.Router();

// CATEGORÍAS
router.post('/', createMenuValidation, createMenu);
router.get('/', menuQueryValidation, getAllMenus);
router.get('/:id', uuidParamValidation, getMenuById);
router.put('/:id', updateMenuValidation, updateMenu);
router.delete('/:id', uuidParamValidation, deleteMenu);

// PLATILLOS - Estas rutas van en un archivo separado o aquí
router.post('/items', createMenuItemValidation, createMenuItem);
router.get('/items', menuItemQueryValidation, getAllMenuItems);
router.get('/items/:id', uuidParamValidation, getMenuItemById);
router.put('/items/:id', updateMenuItemValidation, updateMenuItem);
router.delete('/items/:id', uuidParamValidation, deleteMenuItem);
router.patch(
  '/items/:id/toggle',
  uuidParamValidation,
  toggleMenuItemAvailability
);

export default router;
