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
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
import {
  validateEventCreation,
  validateEventUpdate,
  validateParticipantRegistration,
} from './event.validation.js';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', validateUuidParam('id'), getEventById);
router.post('/', [validateJWT, requireSuperAdmin, validateEventCreation], createEvent);
router.put('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateEventUpdate], updateEvent);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], cancelEvent);
router.post('/:id/register', [validateJWT, validateUuidParam('id'), validateParticipantRegistration], registerParticipant);
router.delete('/:id/unregister', validateJWT, validateUuidParam('id'), unregisterParticipant);
router.get('/:id/participants', validateJWT, validateUuidParam('id'), getEventParticipants);

export default router;
