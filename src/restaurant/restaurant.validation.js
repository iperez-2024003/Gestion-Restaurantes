'use strict';

import { body, param } from 'express-validator';

export const createRestaurantValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres')
    .trim(),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El país no puede exceder 100 caracteres'),
];

export const updateRestaurantValidation = [
  param('id').isUUID().withMessage('El ID debe ser un UUID válido'),
];

export const uuidParamValidation = [
  param('id').isUUID().withMessage('El ID debe ser un UUID válido'),
];