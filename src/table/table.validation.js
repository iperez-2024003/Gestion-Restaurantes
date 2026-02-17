'use strict';

import { body, validationResult } from 'express-validator';

export const validateTableCreation = [
  body('table_number').notEmpty().withMessage('Table number is required').isInt({ min: 1 }).withMessage('Table number must be at least 1'),
  body('capacity').notEmpty().withMessage('Capacity is required').isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').optional().isIn(['interior', 'terrace', 'vip', 'bar', 'window', 'private']).withMessage('Invalid location'),
  body('floor').optional().isInt({ min: 1 }).withMessage('Floor must be at least 1'),
  body('restaurant_id').notEmpty().withMessage('Restaurant ID is required').isUUID().withMessage('Restaurant ID must be a valid UUID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    }
    next();
  },
];

export const validateTableUpdate = [
  body('table_number').optional().isInt({ min: 1 }).withMessage('Table number must be at least 1'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').optional().isIn(['interior', 'terrace', 'vip', 'bar', 'window', 'private']).withMessage('Invalid location'),
  body('floor').optional().isInt({ min: 1 }).withMessage('Floor must be at least 1'),
  body('status').optional().isIn(['available', 'occupied', 'reserved', 'cleaning']).withMessage('Invalid status'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    }
    next();
  },
];