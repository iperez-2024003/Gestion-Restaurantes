'use strict';

import { Reservation } from './reservation.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { User } from '../users/user.model.js';
import { Op } from 'sequelize';

/**
 * Generate unique reservation number
 */
const generateReservationNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Buscar el último número del día
  const lastReservation = await Reservation.findOne({
    where: {
      reservation_number: {
        [Op.like]: `RES-${dateStr}-%`,
      },
    },
    order: [['created_at', 'DESC']],
  });

  let sequence = 1;
  if (lastReservation) {
    const lastNumber = lastReservation.reservation_number.split('-')[2];
    sequence = parseInt(lastNumber) + 1;
  }

  return `RES-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Create reservation
 * @route POST /api/v1/reservations
 */
export const createReservation = async (req, res) => {
  try {
    const {
      restaurant_id,
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      reservation_date,
      reservation_time,
      party_size,
      special_requests,
      table_preference,
      occasion,
    } = req.body;

    // Verificar que el restaurante existe
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || !restaurant.is_active) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Verificar que acepta reservaciones
    if (!restaurant.accepts_reservations) {
      return res.status(400).json({
        ok: false,
        message: 'This restaurant does not accept reservations',
      });
    }

    // Validar que la fecha sea futura
    const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (reservationDateTime < oneHourFromNow) {
      return res.status(400).json({
        ok: false,
        message: 'Reservation must be at least 1 hour in advance',
      });
    }

    // Validar horario de operación del restaurante
    const reservationDay = reservationDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!restaurant.operating_days.includes(reservationDay)) {
      return res.status(400).json({
        ok: false,
        message: `Restaurant is closed on ${reservationDay}s`,
      });
    }

    // Validar horario de apertura
    const reservationTimeStr = reservation_time.slice(0, 5);
    const openingTimeStr = restaurant.opening_time.slice(0, 5);
    const closingTimeStr = restaurant.closing_time.slice(0, 5);

    if (reservationTimeStr < openingTimeStr || reservationTimeStr > closingTimeStr) {
      return res.status(400).json({
        ok: false,
        message: `Restaurant operating hours: ${openingTimeStr} - ${closingTimeStr}`,
      });
    }

    // Verificar si el usuario existe (si se proporciona)
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          ok: false,
          message: 'Usuario no encontrado',
        });
      }
    }

    // Generar número de reservación
    const reservation_number = await generateReservationNumber();

    const reservation = await Reservation.create({
      reservation_number,
      restaurant_id,
      user_id: user_id || null,
      customer_name,
      customer_phone,
      customer_email,
      reservation_date,
      reservation_time,
      party_size,
      special_requests,
      table_preference,
      occasion,
      status: 'pending',
    });

    return res.status(201).json({
      ok: true,
      message: 'Creado exitosamente',
      reservation: {
        id: reservation.id,
        reservation_number: reservation.reservation_number,
        customer_name: reservation.customer_name,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        party_size: reservation.party_size,
        status: reservation.status,
      },
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while creating reservation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all reservations
 * @route GET /api/v1/reservations
 */
export const getAllReservations = async (req, res) => {
  try {
    const {
      restaurant_id,
      user_id,
      status,
      reservation_date,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    if (reservation_date) where.reservation_date = reservation_date;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: reservations } = await Reservation.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['reservation_date', 'DESC'], ['reservation_time', 'DESC']],
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false,
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      reservations,
    });
  } catch (error) {
    console.error('Error getting reservations:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving reservations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get reservation by ID
 * @route GET /api/v1/reservations/:id
 */
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone'],
          required: false,
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({
        ok: false,
        message: 'No encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      reservation,
    });
  } catch (error) {
    console.error('Error getting reservation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving reservation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update reservation
 * @route PUT /api/v1/reservations/:id
 */
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        ok: false,
        message: 'No encontrado',
      });
    }

    // No permitir actualizar si ya está completada o cancelada
    if (['completed', 'cancelled', 'no_show'].includes(reservation.status)) {
      return res.status(400).json({
        ok: false,
        message: `Cannot update reservation with status: ${reservation.status}`,
      });
    }

    // Validar nueva fecha/hora si se proporciona
    if (updateData.reservation_date || updateData.reservation_time) {
      const newDate = updateData.reservation_date || reservation.reservation_date;
      const newTime = updateData.reservation_time || reservation.reservation_time;
      const newDateTime = new Date(`${newDate}T${newTime}`);
      const now = new Date();

      if (newDateTime < now) {
        return res.status(400).json({
          ok: false,
          message: 'Cannot update to a past date/time',
        });
      }
    }

    delete updateData.id;
    delete updateData.reservation_number;
    delete updateData.restaurant_id;
    delete updateData.created_at;

    await reservation.update(updateData);

    return res.status(200).json({
      ok: true,
      message: 'Actualizado exitosamente',
      reservation,
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while updating reservation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Cancel reservation
 * @route DELETE /api/v1/reservations/:id
 */
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        ok: false,
        message: 'No encontrado',
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        ok: false,
        message: 'Reservation is already cancelled',
      });
    }

    await reservation.update({
      status: 'cancelled',
      cancelled_at: new Date(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Reservation cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while cancelling reservation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Confirm reservation
 * @route PATCH /api/v1/reservations/:id/confirm
 */
export const confirmReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        ok: false,
        message: 'No encontrado',
      });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({
        ok: false,
        message: `Cannot confirm reservation with status: ${reservation.status}`,
      });
    }

    await reservation.update({
      status: 'confirmed',
      confirmed_at: new Date(),
      confirmation_sent: true,
    });

    return res.status(200).json({
      ok: true,
      message: 'Reservation confirmed successfully',
      reservation: {
        id: reservation.id,
        reservation_number: reservation.reservation_number,
        status: reservation.status,
        confirmed_at: reservation.confirmed_at,
      },
    });
  } catch (error) {
    console.error('Error confirming reservation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while confirming reservation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Check availability
 * @route GET /api/v1/reservations/check-availability
 */
export const checkAvailability = async (req, res) => {
  try {
    const { restaurant_id, reservation_date, reservation_time, party_size } = req.query;

    if (!restaurant_id || !reservation_date || !reservation_time || !party_size) {
      return res.status(400).json({
        ok: false,
        message: 'Missing required parameters: restaurant_id, reservation_date, reservation_time, party_size',
      });
    }

    // Verificar restaurante
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || !restaurant.is_active) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Contar reservaciones en ese horario (±1 hora)
    const timeStart = reservation_time.slice(0, 5);
    const timeEnd = `${parseInt(timeStart.split(':')[0]) + 1}:${timeStart.split(':')[1]}`;

    const existingReservations = await Reservation.count({
      where: {
        restaurant_id,
        reservation_date,
        reservation_time: {
          [Op.between]: [timeStart, timeEnd],
        },
        status: {
          [Op.in]: ['pending', 'confirmed', 'seated'],
        },
      },
    });

    // Estimación simple de disponibilidad (capacidad del restaurante)
    const totalCapacity = restaurant.capacity;
    const availableSpace = totalCapacity - existingReservations;
    const isAvailable = availableSpace >= parseInt(party_size);

    return res.status(200).json({
      ok: true,
      message: 'Availability checked successfully',
      availability: {
        is_available: isAvailable,
        restaurant_capacity: totalCapacity,
        current_reservations: existingReservations,
        available_space: availableSpace,
        requested_party_size: parseInt(party_size),
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while checking availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get today's reservations
 * @route GET /api/v1/reservations/today
 */
export const getTodayReservations = async (req, res) => {
  try {
    const { restaurant_id } = req.query;

    if (!restaurant_id) {
      return res.status(400).json({
        ok: false,
        message: 'Restaurant ID is required',
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    const reservations = await Reservation.findAll({
      where: {
        restaurant_id,
        reservation_date: today,
        status: {
          [Op.in]: ['pending', 'confirmed', 'seated'],
        },
      },
      order: [['reservation_time', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false,
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: "Today's Datos obtenidos exitosamente",
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    console.error('Error getting today reservations:', error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor while retrieving today's reservations",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};