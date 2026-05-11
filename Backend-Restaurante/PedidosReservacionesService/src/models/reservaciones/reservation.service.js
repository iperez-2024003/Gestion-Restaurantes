'use strict';

import Reservation from './reservation.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';

const serializeReservation = (reservation) => {
  if (!reservation) return null;
  const data = typeof reservation.toObject === 'function' ? reservation.toObject() : reservation;

  return {
    id: data._id?.toString?.() || data._id,
    reservation_number: data.reservation_number,
    restaurant_id: data.restaurant_id,
    user_id: data.user_id,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    reservation_date: data.reservation_date,
    reservation_time: data.reservation_time,
    party_size: data.party_size,
    status: data.status,
    special_requests: data.special_requests,
    table_preference: data.table_preference,
    occasion: data.occasion,
    confirmation_sent: data.confirmation_sent,
    reminder_sent: data.reminder_sent,
    notes: data.notes,
    confirmed_at: data.confirmed_at,
    cancelled_at: data.cancelled_at,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const normalizeTime = (time) => (typeof time === 'string' && time.length >= 5 ? time.slice(0, 8) : time);

const generateReservationNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `RES-${dateStr}-`;
  const lastReservation = await Reservation.findOne({ reservation_number: new RegExp(`^${prefix}`) }).sort({ createdAt: -1 });
  let sequence = 1;

  if (lastReservation?.reservation_number) {
    const lastNumber = lastReservation.reservation_number.split('-')[2];
    sequence = Number(lastNumber) + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

const validateRestaurantReservationRules = async ({ restaurantId, reservationDate, reservationTime, partySize }) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.isActive === false) {
    throw new Error('Restaurante no encontrado');
  }

  if (restaurant.acceptsReservations === false) {
    throw new Error('This restaurant does not accept reservations');
  }

  const timeValue = normalizeTime(reservationTime).slice(0, 5);
  const openingTime = String(restaurant.openingTime || '08:00').slice(0, 5);
  const closingTime = String(restaurant.closingTime || '22:00').slice(0, 5);

  if (timeValue < openingTime || timeValue > closingTime) {
    throw new Error(`Restaurant operating hours: ${openingTime} - ${closingTime}`);
  }

  const dateTime = new Date(`${reservationDate}T${timeValue}:00`);
  const minimumTime = new Date(Date.now() + 60 * 60 * 1000);
  if (dateTime < minimumTime) {
    throw new Error('Reservation must be at least 1 hour in advance');
  }

  const capacity = restaurant.capacity || 50;
  const existingReservations = await Reservation.countDocuments({
    restaurant_id: restaurantId,
    reservation_date: reservationDate,
    reservation_time: timeValue,
    status: { $in: ['pending', 'confirmed', 'seated'] },
  });

  if (existingReservations >= capacity) {
    throw new Error('No hay disponibilidad en la franja horaria seleccionada');
  }

  return restaurant;
};

export const createReservationRecord = async (payload) => {
  await validateRestaurantReservationRules({
    restaurantId: payload.restaurant_id,
    reservationDate: payload.reservation_date,
    reservationTime: payload.reservation_time,
    partySize: payload.party_size,
  });

  const reservation = await Reservation.create({
    reservation_number: await generateReservationNumber(),
    restaurant_id: payload.restaurant_id,
    user_id: payload.user_id || null,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email,
    reservation_date: payload.reservation_date,
    reservation_time: normalizeTime(payload.reservation_time),
    party_size: Number(payload.party_size),
    special_requests: payload.special_requests,
    table_preference: payload.table_preference,
    occasion: payload.occasion,
    status: 'pending',
  });

  return serializeReservation(reservation);
};

export const fetchReservations = async ({ restaurant_id, user_id, status, reservation_date, page = 1, limit = 20 }) => {
  const filter = {};
  if (restaurant_id) filter.restaurant_id = restaurant_id;
  if (user_id) filter.user_id = user_id;
  if (status) filter.status = status;
  if (reservation_date) filter.reservation_date = reservation_date;

  const skip = (page - 1) * limit;
  const reservations = await Reservation.find(filter)
    .sort({ reservation_date: -1, reservation_time: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Reservation.countDocuments(filter);

  return {
    reservations: reservations.map(serializeReservation),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const fetchReservationById = async (id) => {
  const reservation = await Reservation.findById(id);
  return reservation ? serializeReservation(reservation) : null;
};

export const updateReservationRecord = async ({ id, updateData }) => {
  const current = await Reservation.findById(id);
  if (!current) throw new Error('No encontrado');

  const nextDate = updateData.reservation_date ?? current.reservation_date;
  const nextTime = updateData.reservation_time ?? current.reservation_time;
  const nextPartySize = updateData.party_size ?? current.party_size;

  await validateRestaurantReservationRules({
    restaurantId: current.restaurant_id,
    reservationDate: nextDate,
    reservationTime: nextTime,
    partySize: nextPartySize,
  });

  const payload = {
    customer_name: updateData.customer_name,
    customer_phone: updateData.customer_phone,
    customer_email: updateData.customer_email,
    reservation_date: updateData.reservation_date,
    reservation_time: updateData.reservation_time ? normalizeTime(updateData.reservation_time) : undefined,
    party_size: updateData.party_size !== undefined ? Number(updateData.party_size) : undefined,
    special_requests: updateData.special_requests,
    table_preference: updateData.table_preference,
    occasion: updateData.occasion,
    notes: updateData.notes,
  };

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  const updated = await Reservation.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return serializeReservation(updated);
};

export const cancelReservationRecord = async (id) => {
  const reservation = await Reservation.findByIdAndUpdate(
    id,
    { status: 'cancelled', cancelled_at: new Date() },
    { new: true, runValidators: true }
  );
  if (!reservation) throw new Error('No encontrado');
  return serializeReservation(reservation);
};

export const confirmReservationRecord = async (id) => {
  const reservation = await Reservation.findByIdAndUpdate(
    id,
    { status: 'confirmed', confirmed_at: new Date(), confirmation_sent: true },
    { new: true, runValidators: true }
  );
  if (!reservation) throw new Error('No encontrado');
  return serializeReservation(reservation);
};

export const fetchTodayReservations = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const reservations = await Reservation.find({ reservation_date: today }).sort({ reservation_time: 1 });
  return reservations.map(serializeReservation);
};

export const checkReservationAvailability = async ({ restaurant_id, reservation_date, reservation_time, party_size }) => {
  const restaurant = await validateRestaurantReservationRules({
    restaurantId: restaurant_id,
    reservationDate: reservation_date,
    reservationTime: reservation_time,
    partySize: party_size,
  });

  return {
    available: true,
    restaurant: {
      id: restaurant._id?.toString?.() || restaurant._id,
      name: restaurant.name,
      capacity: restaurant.capacity,
    },
  };
};