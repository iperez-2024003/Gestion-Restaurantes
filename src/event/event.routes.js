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
import {
  validateEventCreation,
  validateEventUpdate,
  validateParticipantRegistration,
} from './event.validation.js';

const router = Router();

/**
 * Public routes
 */
// Get all events
router.get('/', getAllEvents);

// Get event by ID
router.get('/:id', getEventById);

/**
 * Protected routes (require authentication)
 */
// Create event
router.post('/', [validateJWT, validateEventCreation], createEvent);

// Update event
router.put('/:id', [validateJWT, validateEventUpdate], updateEvent);

// Cancel event
router.delete('/:id', validateJWT, cancelEvent);

// Register participant in event
router.post('/:id/register', [validateJWT, validateParticipantRegistration], registerParticipant);

// Unregister from event
router.delete('/:id/unregister', validateJWT, unregisterParticipant);

// Get event participants
router.get('/:id/participants', validateJWT, getEventParticipants);

export default router;