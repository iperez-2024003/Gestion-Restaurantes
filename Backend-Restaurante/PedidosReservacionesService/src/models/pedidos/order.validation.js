'use strict';

import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for order creation
 */
export const validateOrderCreation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('El ID del restaurante es requerido')
    .isString()
    .withMessage('El ID del restaurante debe ser un texto/ID válido'),

  body('user_id')
    .notEmpty()
    .withMessage('El ID de usuario es requerido')
    .isString()
    .withMessage('El ID de usuario debe ser un texto/ID válido'),

  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre del cliente debe tener entre 2 y 150 caracteres'),

  body('order_type')
    .optional()
    .isIn(['dine_in', 'takeout', 'delivery'])
    .withMessage('Tipo de orden inválido'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('La lista de items es requerida y debe contener al menos un elemento'),

  body('items.*.menu_item_id')
    .notEmpty()
    .withMessage('El ID del platillo es requerido para cada item')
    .isString()
    .withMessage('El ID del platillo debe ser un texto/ID válido'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('La cantidad es requerida para cada item')
    .isInt({ min: 1, max: 10000 })
    .withMessage('La cantidad debe ser entre 1 y 10000'),

  body('items.*.special_instructions')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Las instrucciones especiales no pueden exceder 255 caracteres'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),

  body('delivery_address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La dirección de envío no puede exceder 255 caracteres'),

  body('delivery_fee')
    .optional()
    .isFloat({ min: 0, max: 100000 })
    .withMessage('La tarifa de envío debe ser entre 0 y 100000'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Order Validation Errors:', errors.array());
      return res.status(400).json({
        ok: false,
        message: 'Errores de validación',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }
    next();
  },
];

/**
 * Validation middleware for adding item to order
 */
export const validateAddItem = [
  body('menu_item_id')
    .notEmpty()
    .withMessage('El ID del platillo es requerido')
    .isString()
    .withMessage('El ID del platillo debe ser un texto/ID válido'),

  body('quantity')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 1, max: 10000 })
    .withMessage('La cantidad debe ser entre 1 y 10000'),

  body('special_instructions')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Las instrucciones especiales no pueden exceder 255 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Errores de validación',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }
    next();
  },
];

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'];

/**
 * ValidaciÃ³n para actualizar estado del pedido (PATCH /:id/status)
 */
export const validateOrderStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('El estado del pedido es requerido')
    .isIn(VALID_ORDER_STATUSES)
    .withMessage(`El estado debe ser uno de: ${VALID_ORDER_STATUSES.join(', ')}`),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Errores de validación',
        errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    }
    next();
  },
];
