'use strict';

import { body, query, validationResult } from 'express-validator';

/**
 * Validation middleware for reservation creation
 */
export const validateReservationCreation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('El ID del restaurante es requerido')
    .isString()
    .withMessage('El ID del restaurante debe ser un texto/ID válido'),

  body('user_id')
    .optional()
    .isString()
    .withMessage('El ID de usuario debe ser un texto/ID válido'),

  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del cliente es requerido')
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre del cliente debe tener entre 2 y 150 caracteres'),

  body('customer_phone')
    .trim()
    .notEmpty()
    .withMessage('El teléfono del cliente es requerido')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Formato de número de teléfono inválido'),

  body('customer_email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser una dirección de correo electrónico válida')
    .normalizeEmail(),

  body('reservation_date')
    .notEmpty()
    .withMessage('La fecha de la reservación es requerida')
    .isDate()
    .withMessage('Debe ser una fecha válida (YYYY-MM-DD)'),

  body('reservation_time')
    .notEmpty()
    .withMessage('La hora de la reservación es requerida')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('La hora de la reservación debe tener el formato HH:MM:SS'),

  body('party_size')
    .notEmpty()
    .withMessage('La cantidad de personas es requerida')
    .isInt({ min: 1, max: 20 })
    .withMessage('La reservación debe ser para entre 1 y 20 personas'),

  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las peticiones especiales no pueden exceder 1000 caracteres'),

  body('table_preference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La preferencia de mesa no puede exceder 100 caracteres'),

  body('occasion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El motivo no puede exceder 100 caracteres'),

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

/**
 * Validation middleware for reservation update
 */
export const validateReservationUpdate = [
  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre del cliente debe tener entre 2 y 150 caracteres'),

  body('customer_phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Formato de número de teléfono inválido'),

  body('customer_email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser una dirección de correo electrónico válida')
    .normalizeEmail(),

  body('reservation_date')
    .optional()
    .isDate()
    .withMessage('Debe ser una fecha válida (YYYY-MM-DD)'),

  body('reservation_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('La hora de la reservación debe tener el formato HH:MM:SS'),

  body('party_size')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('La reservación debe ser para entre 1 y 20 personas'),

  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las peticiones especiales no pueden exceder 1000 caracteres'),

  body('table_preference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La preferencia de mesa no puede exceder 100 caracteres'),

  body('occasion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El motivo no puede exceder 100 caracteres'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),

  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'no_show', 'cancelled'])
    .withMessage('Valor de estado inválido'),

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

/**
 * Validación de query para check-availability (GET /check-availability)
 */
export const validateCheckAvailability = [
  query('restaurant_id')
    .notEmpty()
    .withMessage('restaurant_id es requerido')
    .isString()
    .withMessage('restaurant_id debe ser un UUID válido'),
  query('reservation_date')
    .notEmpty()
    .withMessage('reservation_date es requerido (YYYY-MM-DD)')
    .isDate()
    .withMessage('reservation_date debe ser una fecha válida (YYYY-MM-DD)'),
  query('reservation_time')
    .notEmpty()
    .withMessage('reservation_time es requerido')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    .withMessage('reservation_time debe ser HH:MM o HH:MM:SS'),
  query('party_size')
    .notEmpty()
    .withMessage('party_size es requerido')
    .isInt({ min: 1, max: 20 })
    .withMessage('party_size debe ser entre 1 y 20'),
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
