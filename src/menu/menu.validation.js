'use strict';

import { body, param, query } from 'express-validator';

// Validación para crear categoría
export const createMenuValidation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('El ID del restaurante es obligatorio')
    .isUUID()
    .withMessage('El ID del restaurante debe ser un UUID válido'),
  body('name')
    .notEmpty()
    .withMessage('El nombre de la categoría es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero mayor o igual a 0'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un valor booleano'),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El icono no puede exceder 50 caracteres')
    .trim(),
];

// Validación para actualizar categoría
export const updateMenuValidation = [
  param('id').isUUID().withMessage('El ID debe ser un UUID válido'),
  body('name')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero mayor o igual a 0'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un valor booleano'),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El icono no puede exceder 50 caracteres')
    .trim(),
];

// Validación para crear platillo
export const createMenuItemValidation = [
  body('menu_id')
    .notEmpty()
    .withMessage('El ID de la categoría es obligatorio')
    .isUUID()
    .withMessage('El ID de la categoría debe ser un UUID válido'),
  body('restaurant_id')
    .notEmpty()
    .withMessage('El ID del restaurante es obligatorio')
    .isUUID()
    .withMessage('El ID del restaurante debe ser un UUID válido'),
  body('name')
    .notEmpty()
    .withMessage('El nombre del platillo es obligatorio')
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres')
    .trim(),
  body('price')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('La URL de la imagen debe ser válida'),
  body('preparation_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El tiempo de preparación debe ser mayor o igual a 0'),
  body('calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las calorías deben ser mayor o igual a 0'),
  body('ingredients')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los ingredientes no pueden exceder 2000 caracteres')
    .trim(),
  body('allergens')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Los alérgenos no pueden exceder 500 caracteres')
    .trim(),
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available debe ser booleano'),
  body('is_vegetarian')
    .optional()
    .isBoolean()
    .withMessage('is_vegetarian debe ser booleano'),
  body('is_vegan')
    .optional()
    .isBoolean()
    .withMessage('is_vegan debe ser booleano'),
  body('is_gluten_free')
    .optional()
    .isBoolean()
    .withMessage('is_gluten_free debe ser booleano'),
  body('is_spicy')
    .optional()
    .isBoolean()
    .withMessage('is_spicy debe ser booleano'),
  body('spicy_level')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('El nivel de picante debe estar entre 0 y 5'),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser mayor o igual a 0'),
];

// Validación para actualizar platillo
export const updateMenuItemValidation = [
  param('id').isUUID().withMessage('El ID debe ser un UUID válido'),
  body('menu_id')
    .optional()
    .isUUID()
    .withMessage('El ID de la categoría debe ser un UUID válido'),
  body('name')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres')
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('La URL de la imagen debe ser válida'),
  body('preparation_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El tiempo de preparación debe ser mayor o igual a 0'),
  body('calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las calorías deben ser mayor o igual a 0'),
  body('ingredients')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los ingredientes no pueden exceder 2000 caracteres')
    .trim(),
  body('allergens')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Los alérgenos no pueden exceder 500 caracteres')
    .trim(),
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available debe ser booleano'),
  body('is_vegetarian')
    .optional()
    .isBoolean()
    .withMessage('is_vegetarian debe ser booleano'),
  body('is_vegan')
    .optional()
    .isBoolean()
    .withMessage('is_vegan debe ser booleano'),
  body('is_gluten_free')
    .optional()
    .isBoolean()
    .withMessage('is_gluten_free debe ser booleano'),
  body('is_spicy')
    .optional()
    .isBoolean()
    .withMessage('is_spicy debe ser booleano'),
  body('spicy_level')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('El nivel de picante debe estar entre 0 y 5'),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser mayor o igual a 0'),
];

// Validación UUID
export const uuidParamValidation = [
  param('id').isUUID().withMessage('El ID debe ser un UUID válido'),
];

// Validación query categorías
export const menuQueryValidation = [
  query('restaurant_id')
    .optional()
    .isUUID()
    .withMessage('El restaurant_id debe ser un UUID válido'),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser booleano'),
];

// Validación query platillos
export const menuItemQueryValidation = [
  query('menu_id')
    .optional()
    .isUUID()
    .withMessage('El menu_id debe ser un UUID válido'),
  query('restaurant_id')
    .optional()
    .isUUID()
    .withMessage('El restaurant_id debe ser un UUID válido'),
  query('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available debe ser booleano'),
  query('is_vegetarian')
    .optional()
    .isBoolean()
    .withMessage('is_vegetarian debe ser booleano'),
  query('is_vegan')
    .optional()
    .isBoolean()
    .withMessage('is_vegan debe ser booleano'),
  query('is_gluten_free')
    .optional()
    .isBoolean()
    .withMessage('is_gluten_free debe ser booleano'),
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('min_price debe ser mayor o igual a 0'),
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('max_price debe ser mayor o igual a 0'),
];
