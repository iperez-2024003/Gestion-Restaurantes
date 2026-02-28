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
import { requireAdmin } from '../../middlewares/require-role.js';
import {
  validateReservationCreation,
  validateReservationUpdate,
} from './reservation.validation.js';

const router = Router();

router.get('/check-availability', checkAvailability);

/** Rutas para usuario autenticado (USER_ROLE puede crear/ver/actualizar/cancelar reservas) */
router.post('/', [validateJWT, validateReservationCreation], createReservation);
router.get('/', validateJWT, getAllReservations);
router.get('/today', validateJWT, getTodayReservations);
router.get('/:id', validateJWT, getReservationById);
router.put('/:id', [validateJWT, validateReservationUpdate], updateReservation);
router.delete('/:id', validateJWT, cancelReservation);

/** Solo ADMIN_ROLE puede confirmar una reserva */
router.patch('/:id/confirm', [validateJWT, requireAdmin], confirmReservation);

export default router;