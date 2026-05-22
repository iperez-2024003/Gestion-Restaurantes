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
import Reservation from './reservation.model.js';

const isOperationalStaff = (req) => (
  ['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE'].includes(req.userRole || req.user?.role)
);

const ensureReservationAccess = (req, res, reservation) => {
  if (isOperationalStaff(req)) return true;
  if (!reservation || String(reservation.user_id) !== String(req.userId)) {
    res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    return false;
  }
  return true;
};

export const createReservation = async (req, res) => {
  try {
    const reservation = await createReservationRecord(req.body);
    return res.status(201).json({ success: true, message: 'Reservación creada exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const { restaurant_id, user_id, status, reservation_date, page = 1, limit = 20 } = req.query;
    const effectiveUserId = isOperationalStaff(req) ? user_id : req.userId;
    const { reservations, pagination } = await fetchReservations({ restaurant_id, user_id: effectiveUserId, status, reservation_date, page, limit });
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', pagination, data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await fetchReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'No encontrado' });
    if (!ensureReservationAccess(req, res, reservation)) return;
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const existingReservation = await Reservation.findById(req.params.id);
    if (!existingReservation) return res.status(404).json({ success: false, message: 'No encontrado' });
    if (!ensureReservationAccess(req, res, existingReservation)) return;
    const reservation = await updateReservationRecord({ id: req.params.id, updateData: req.body });
    return res.status(200).json({ success: true, message: 'Actualizado exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const existingReservation = await Reservation.findById(req.params.id);
    if (!existingReservation) return res.status(404).json({ success: false, message: 'No encontrado' });
    if (!ensureReservationAccess(req, res, existingReservation)) return;
    const reservation = await cancelReservationRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Reserva cancelada exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const confirmReservation = async (req, res) => {
  try {
    const reservation = await confirmReservationRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Reserva confirmada exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const result = await checkReservationAvailability(req.query);
    return res.status(200).json({ success: true, message: 'Disponibilidad verificada', data: result });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const getTodayReservations = async (req, res) => {
  try {
    const reservations = await fetchTodayReservations(isOperationalStaff(req) ? undefined : req.userId);
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
