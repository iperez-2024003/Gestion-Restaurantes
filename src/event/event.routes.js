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
import { requireAdmin } from '../../middlewares/require-role.js';
import {
  validateEventCreation,
  validateEventUpdate,
  validateParticipantRegistration,
} from './event.validation.js';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

/** Rutas solo ADMIN_ROLE (crear/editar/cancelar eventos) */
router.post('/', [validateJWT, requireAdmin, validateEventCreation], createEvent);
router.put('/:id', [validateJWT, requireAdmin, validateEventUpdate], updateEvent);
router.delete('/:id', [validateJWT, requireAdmin], cancelEvent);

/** Usuario autenticado puede inscribirse, desinscribirse y ver participantes */
router.post('/:id/register', [validateJWT, validateParticipantRegistration], registerParticipant);
router.delete('/:id/unregister', validateJWT, unregisterParticipant);
router.get('/:id/participants', validateJWT, getEventParticipants);

export default router;