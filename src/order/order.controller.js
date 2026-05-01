'use strict';

import PDFDocument from 'pdfkit';
import {
  createOrderRecord,
  fetchOrders,
  fetchOrderById,
  updateOrderStatusRecord,
  cancelOrderRecord,
  addItemToOrderRecord,
  removeItemFromOrderRecord,
  fetchKitchenOrders,
} from './order.service.js';
import Restaurant from '../restaurant/restaurant.model.js';

export const createOrder = async (req, res) => {
  try {
    const order = await createOrderRecord(req.body);
    return res.status(201).json({ ok: true, message: 'Orden creada exitosamente', order });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { restaurant_id, user_id, status, order_type, payment_status, page = 1, limit = 20 } = req.query;
    const { orders, pagination } = await fetchOrders({ restaurant_id, user_id, status, order_type, payment_status, page, limit });
    return res.status(200).json({ ok: true, message: 'Órdenes obtenidas exitosamente', pagination, orders });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving orders', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) return res.status(404).json({ ok: false, message: 'Orden no encontrada' });
    return res.status(200).json({ ok: true, message: 'Orden obtenida exitosamente', order });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving order', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await updateOrderStatusRecord({ id: req.params.id, status: req.body.status });
    return res.status(200).json({ ok: true, message: `Order status updated to ${req.body.status}`, order });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    await cancelOrderRecord(req.params.id);
    return res.status(200).json({ ok: true, message: 'Orden cancelada exitosamente and stock returned' });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const addItemToOrder = async (req, res) => {
  try {
    const orderItem = await addItemToOrderRecord({ orderId: req.params.id, ...req.body });
    return res.status(201).json({ ok: true, message: 'Item added to order successfully', orderItem });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const removeItemFromOrder = async (req, res) => {
  try {
    await removeItemFromOrderRecord({ orderId: req.params.id, itemId: req.params.itemId });
    return res.status(200).json({ ok: true, message: 'Item removed from order successfully' });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' || error.message === 'Order No encontrado' ? 404 : 400).json({ ok: false, message: error.message });
  }
};

export const generateOrderPDF = async (req, res) => {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) return res.status(404).json({ ok: false, message: 'Orden no encontrada' });

    const restaurant = await Restaurant.findById(order.restaurant_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Factura_${order.order_number}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(20).text(restaurant?.name || 'Restaurante', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Orden: ${order.order_number}`);
    doc.text(`Cliente: ${order.customer_name || ''}`);
    doc.text(`Total: ${order.total}`);
    doc.end();
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while generating PDF', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await fetchKitchenOrders(req.params.restaurantId);
    return res.status(200).json({ ok: true, message: 'Órdenes obtenidas exitosamente', orders });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving kitchen orders', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};