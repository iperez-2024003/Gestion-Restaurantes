'use strict';

import { param, query, body } from 'express-validator';
import { handleValidationErrors } from './validation.js';
import { isValidUserId } from '../helpers/uuid-generator.js';
import { ALLOWED_ROLES } from '../helpers/role-constants.js';

/**
 * Valida un parámetro de ruta que debe ser UUID (restaurantes, menús, pedidos, reservas, eventos, mesas, etc.)
 */
export const validateUuidParam = (paramName = 'id') => [
  param(paramName)
    .isUUID(4)
    .withMessage(`${paramName} debe ser un UUID válido`),
  handleValidationErrors,
];

/**
 * Valida varios parámetros de ruta que deben ser UUID (ej: id e itemId)
 */
export const validateUuidParams = (...paramNames) => {
  const validations = paramNames.map((name) =>
    param(name).isUUID(4).withMessage(`${name} debe ser un UUID válido`)
  );
  return [...validations, handleValidationErrors];
};

/**
 * Valida un parámetro de ruta que debe ser userId (formato usr_xxx de 16 caracteres)
 */
export const validateUserIdParam = (paramName = 'userId') => [
  param(paramName)
    .notEmpty()
    .withMessage(`${paramName} es requerido`)
    .custom((value) => {
      if (!isValidUserId(value)) {
        throw new Error(`${paramName} debe tener formato válido (ej: usr_xxxxxxxxxxxx)`);
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Valida roleName en params (solo ADMIN_ROLE o USER_ROLE; acepta mayúsculas/minúsculas)
 */
export const validateRoleNameParam = () => [
  param('roleName')
    .notEmpty()
    .withMessage('roleName es requerido')
    .trim()
    .custom((value) => {
      const normalized = (value || '').toUpperCase();
      if (!ALLOWED_ROLES.includes(normalized)) {
        throw new Error('roleName debe ser ADMIN_ROLE o USER_ROLE');
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Valida body userId para getProfileById (formato usr_xxx)
 */
export const validateProfileByIdBody = [
  body('userId')
    .notEmpty()
    .withMessage('userId es requerido')
    .custom((value) => {
      if (!isValidUserId(value)) {
        throw new Error('userId debe tener formato válido (ej: usr_xxxxxxxxxxxx)');
      }
      return true;
    }),
  handleValidationErrors,
];

/** Query opcional period (week | month | year) para estadísticas de pedidos */
export const validateQueryPeriod = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year'])
    .withMessage('period debe ser week, month o year'),
  handleValidationErrors,
];

/** Query opcional limit (1-100) para estadísticas de platos populares */
export const validateQueryLimit = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100'),
  handleValidationErrors,
];
