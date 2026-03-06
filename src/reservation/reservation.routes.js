'use strict';

import { Router } from 'express';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  confirmReservation,
  checkAvailability,
  getTodayReservations,
} from './reservation.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
import {
  validateReservationCreation,
  validateReservationUpdate,
  validateCheckAvailability,
} from './reservation.validation.js';

const router = Router();

router.get('/check-availability', validateCheckAvailability, checkAvailability);

/** Rutas para usuario autenticado (USER_ROLE puede crear/ver/actualizar/cancelar reservas) */
router.post('/', [validateJWT, validateReservationCreation], createReservation);
router.get('/', validateJWT, getAllReservations);
router.get('/today', validateJWT, getTodayReservations);
router.get('/:id', validateJWT, validateUuidParam('id'), getReservationById);
router.put('/:id', [validateJWT, validateUuidParam('id'), validateReservationUpdate], updateReservation);
router.delete('/:id', validateJWT, validateUuidParam('id'), cancelReservation);

/** Solo ADMIN_ROLE puede confirmar una reserva */
router.patch('/:id/confirm', [validateJWT, requireSuperAdmin, validateUuidParam('id')], confirmReservation);

export default router;
