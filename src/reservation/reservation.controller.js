'use strict';

import {
  createReservationRecord,
  fetchReservations,
  fetchReservationById,
  updateReservationRecord,
  cancelReservationRecord,
  confirmReservationRecord,
  checkReservationAvailability,
  fetchTodayReservations,
} from './reservation.service.js';

export const createReservation = async (req, res) => {
  try {
    const reservation = await createReservationRecord(req.body);
    return res.status(201).json({ ok: true, message: 'Creado exitosamente', reservation });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const { restaurant_id, user_id, status, reservation_date, page = 1, limit = 20 } = req.query;
    const { reservations, pagination } = await fetchReservations({ restaurant_id, user_id, status, reservation_date, page, limit });
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', pagination, reservations });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving reservations', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await fetchReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ ok: false, message: 'No encontrado' });
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', reservation });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving reservation', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const reservation = await updateReservationRecord({ id: req.params.id, updateData: req.body });
    return res.status(200).json({ ok: true, message: 'Actualizado exitosamente', reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await cancelReservationRecord(req.params.id);
    return res.status(200).json({ ok: true, message: 'Reserva cancelada exitosamente', reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ ok: false, message: error.message });
  }
};

export const confirmReservation = async (req, res) => {
  try {
    const reservation = await confirmReservationRecord(req.params.id);
    return res.status(200).json({ ok: true, message: 'Reserva confirmada exitosamente', reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ ok: false, message: error.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const result = await checkReservationAvailability(req.query);
    return res.status(200).json({ ok: true, message: 'Disponibilidad verificada', ...result });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const getTodayReservations = async (req, res) => {
  try {
    const reservations = await fetchTodayReservations();
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', count: reservations.length, reservations });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving reservations', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};