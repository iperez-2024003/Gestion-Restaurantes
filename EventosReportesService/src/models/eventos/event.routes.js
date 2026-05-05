'use strict';

import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  cancelEvent,
  registerParticipant,
  unregisterParticipant,
  getEventParticipants,
} from './event.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireSuperAdmin, requireRole } from '../../../middlewares/require-role.js';
import { validateUuidParam } from '../../../middlewares/validate-params.js';
import {
  validateEventCreation,
  validateEventUpdate,
  validateParticipantRegistration,
} from './event.validation.js';

const router = Router();
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');

router.get('/', getAllEvents);
router.get('/:id', validateUuidParam('id'), getEventById);
router.post('/', [validateJWT, requireAdminOrRestaurantAdmin, validateEventCreation], createEvent);
router.put('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), validateEventUpdate], updateEvent);
router.delete('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], cancelEvent);
router.post('/:id/register', [validateJWT, validateUuidParam('id'), validateParticipantRegistration], registerParticipant);
router.delete('/:id/unregister', validateJWT, validateUuidParam('id'), unregisterParticipant);
router.get('/:id/participants', validateJWT, validateUuidParam('id'), getEventParticipants);

export default router;
