'use strict';

import { Event } from './event.model.js';
import { EventParticipant } from './event-participant.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { User } from '../users/user.model.js';
import { Op } from 'sequelize';

/**
 * Create event
 * @route POST /api/v1/events
 */
export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      restaurant_id,
      event_type,
      event_date,
      start_time,
      end_time,
      max_participants,
      price_per_person,
      image_url,
      requirements,
    } = req.body;

    // Verificar restaurante
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || !restaurant.is_active) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurant not found',
      });
    }

    // Validar que la fecha sea futura
    const eventDateTime = new Date(`${event_date}T${start_time}`);
    if (eventDateTime < new Date()) {
      return res.status(400).json({
        ok: false,
        message: 'Event date must be in the future',
      });
    }

    // Validar horarios
    if (start_time >= end_time) {
      return res.status(400).json({
        ok: false,
        message: 'End time must be after start time',
      });
    }

    const event = await Event.create({
      name,
      description,
      restaurant_id,
      event_type: event_type || 'other',
      event_date,
      start_time,
      end_time,
      max_participants,
      current_participants: 0,
      price_per_person: price_per_person || 0,
      image_url,
      requirements: requirements || [],
      status: 'scheduled',
    });

    return res.status(201).json({
      ok: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while creating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all events
 * @route GET /api/v1/events
 */
export const getAllEvents = async (req, res) => {
  try {
    const {
      restaurant_id,
      event_type,
      status,
      upcoming,
      page = 1,
      limit = 20,
    } = req.query;

    const where = { is_active: true };
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (event_type) where.event_type = event_type;
    if (status) where.status = status;

    if (upcoming === 'true') {
      where.event_date = {
        [Op.gte]: new Date().toISOString().slice(0, 10),
      };
      where.status = 'scheduled';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['event_date', 'ASC'], ['start_time', 'ASC']],
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone'],
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: 'Events retrieved successfully',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      events,
    });
  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get event by ID
 * @route GET /api/v1/events/:id
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone', 'email'],
        },
        {
          model: EventParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email'],
              required: false,
            },
          ],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Event retrieved successfully',
      event,
    });
  } catch (error) {
    console.error('Error getting event:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update event
 * @route PUT /api/v1/events/:id
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findOne({
      where: { id, is_active: true },
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Event not found',
      });
    }

    // No permitir actualizar eventos completados o cancelados
    if (['completed', 'cancelled'].includes(event.status)) {
      return res.status(400).json({
        ok: false,
        message: `Cannot update event with status: ${event.status}`,
      });
    }

    // Validar horarios si se actualizan
    const newStartTime = updateData.start_time || event.start_time;
    const newEndTime = updateData.end_time || event.end_time;

    if (newStartTime >= newEndTime) {
      return res.status(400).json({
        ok: false,
        message: 'End time must be after start time',
      });
    }

    delete updateData.id;
    delete updateData.restaurant_id;
    delete updateData.current_participants;
    delete updateData.created_at;

    await event.update(updateData);

    return res.status(200).json({
      ok: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while updating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Cancel event
 * @route DELETE /api/v1/events/:id
 */
export const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      where: { id, is_active: true },
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Event not found',
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        ok: false,
        message: 'Event is already cancelled',
      });
    }

    await event.update({ status: 'cancelled' });

    return res.status(200).json({
      ok: true,
      message: 'Event cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling event:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while cancelling event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Register participant in event
 * @route POST /api/v1/events/:id/register
 */
export const registerParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      participant_name,
      participant_email,
      participant_phone,
      special_notes,
    } = req.body;

    const event = await Event.findOne({
      where: { id, is_active: true },
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Event not found',
      });
    }

    // Validar que el evento esté programado
    if (event.status !== 'scheduled') {
      return res.status(400).json({
        ok: false,
        message: `Cannot register for event with status: ${event.status}`,
      });
    }

    // Validar cupos disponibles
    if (event.current_participants >= event.max_participants) {
      return res.status(400).json({
        ok: false,
        message: 'Event is full, no spots available',
      });
    }

    // Verificar duplicados
    const existingParticipant = await EventParticipant.findOne({
      where: {
        event_id: id,
        participant_email,
      },
    });

    if (existingParticipant) {
      return res.status(409).json({
        ok: false,
        message: 'This email is already registered for this event',
      });
    }

    // Verificar usuario si se proporciona
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          ok: false,
          message: 'User not found',
        });
      }
    }

    const participant = await EventParticipant.create({
      event_id: id,
      user_id: user_id || null,
      participant_name,
      participant_email,
      participant_phone,
      special_notes,
      payment_status: 'pending',
      attendance_status: 'registered',
    });

    // Actualizar contador de participantes
    await event.update({
      current_participants: event.current_participants + 1,
    });

    return res.status(201).json({
      ok: true,
      message: 'Registered successfully for event',
      participant: {
        id: participant.id,
        participant_name: participant.participant_name,
        participant_email: participant.participant_email,
        payment_status: participant.payment_status,
      },
      event: {
        id: event.id,
        name: event.name,
        current_participants: event.current_participants,
        max_participants: event.max_participants,
      },
    });
  } catch (error) {
    console.error('Error registering participant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while registering participant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Unregister from event
 * @route DELETE /api/v1/events/:id/unregister
 */
export const unregisterParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { participant_email } = req.body;

    const event = await Event.findOne({
      where: { id, is_active: true },
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Event not found',
      });
    }

    const participant = await EventParticipant.findOne({
      where: {
        event_id: id,
        participant_email,
      },
    });

    if (!participant) {
      return res.status(404).json({
        ok: false,
        message: 'Participant not found in this event',
      });
    }

    await participant.destroy();

    // Actualizar contador
    await event.update({
      current_participants: Math.max(0, event.current_participants - 1),
    });

    return res.status(200).json({
      ok: true,
      message: 'Unregistered successfully from event',
    });
  } catch (error) {
    console.error('Error unregistering participant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while unregistering',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get event participants
 * @route GET /api/v1/events/:id/participants
 */
export const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      where: { id, is_active: true },
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Event not found',
      });
    }

    const participants = await EventParticipant.findAll({
      where: { event_id: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false,
        },
      ],
      order: [['registration_date', 'ASC']],
    });

    return res.status(200).json({
      ok: true,
      message: 'Participants retrieved successfully',
      count: participants.length,
      participants,
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving participants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};