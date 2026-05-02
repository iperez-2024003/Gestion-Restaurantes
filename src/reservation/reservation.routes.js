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
<<<<<<< Updated upstream
=======
import { requireRole } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
>>>>>>> Stashed changes
import {
  validateReservationCreation,
  validateReservationUpdate,
} from './reservation.validation.js';

const router = Router();

<<<<<<< Updated upstream
/**
 * Public routes
 */
// Check availability
router.get('/check-availability', checkAvailability);
=======
// Personal que puede confirmar reservas
const requireOperationalStaff = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');

router.get('/check-availability', validateCheckAvailability, checkAvailability);
>>>>>>> Stashed changes

/**
 * Protected routes (require authentication)
 */
// Create reservation
router.post('/', [validateJWT, validateReservationCreation], createReservation);

// Get all reservations
router.get('/', validateJWT, getAllReservations);

// Get today's reservations
router.get('/today', validateJWT, getTodayReservations);

<<<<<<< Updated upstream
// Get reservation by ID
router.get('/:id', validateJWT, getReservationById);
=======
/** El personal puede confirmar una reserva */
router.patch('/:id/confirm', [validateJWT, requireOperationalStaff, validateUuidParam('id')], confirmReservation);
>>>>>>> Stashed changes

// Update reservation
router.put('/:id', [validateJWT, validateReservationUpdate], updateReservation);

// Cancel reservation
router.delete('/:id', validateJWT, cancelReservation);

// Confirm reservation
router.patch('/:id/confirm', validateJWT, confirmReservation);

export default router;