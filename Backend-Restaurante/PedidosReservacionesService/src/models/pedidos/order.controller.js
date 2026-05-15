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
import Restaurant from '../restaurantes/restaurant.model.js';
import { getIo } from '../../socket/socket.config.js';

export const createOrder = async (req, res) => {
  try {
    const order = await createOrderRecord(req.body);
    
    // Emitir socket para tiempo real
    const io = getIo();
    io.to(`restaurant_${order.restaurant_id}`).emit('new_order', order);
    
    return res.status(201).json({ success: true, message: 'Orden creada exitosamente', data: order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { restaurant_id, user_id, status, order_type, payment_status, page = 1, limit = 20 } = req.query;
    const { orders, pagination } = await fetchOrders({ restaurant_id, user_id, status, order_type, payment_status, page, limit });
    return res.status(200).json({ success: true, message: 'Órdenes obtenidas exitosamente', pagination, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    return res.status(200).json({ success: true, message: 'Orden obtenida exitosamente', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await updateOrderStatusRecord({ id: req.params.id, status: req.body.status });
    
    // Emitir socket para tiempo real
    const io = getIo();
    io.to(`restaurant_${order.restaurant_id}`).emit('order_status_updated', {
      orderId: order.id,
      status: order.status,
      orderNumber: order.order_number
    });
    
    return res.status(200).json({ success: true, message: `Order status updated to ${req.body.status}`, data: order });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    await cancelOrderRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Orden cancelada exitosamente' });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const addItemToOrder = async (req, res) => {
  try {
    const orderItem = await addItemToOrderRecord({ orderId: req.params.id, ...req.body });
    return res.status(201).json({ success: true, message: 'Item added to order successfully', data: orderItem });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const removeItemFromOrder = async (req, res) => {
  try {
    await removeItemFromOrderRecord({ orderId: req.params.id, itemId: req.params.itemId });
    return res.status(200).json({ success: true, message: 'Item removed from order successfully' });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' || error.message === 'Order No encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const generateOrderPDF = async (req, res) => {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    const restaurant = await Restaurant.findById(order.restaurant_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Ticket_${order.order_number}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // --- LOGO & HEADER ---
    if (restaurant?.logoUrl) {
      try {
        const response = await fetch(restaurant.logoUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        doc.image(buffer, { fit: [80, 80], align: 'center' });
        doc.moveDown(4);
      } catch (err) {
        console.error('Error loading logo for PDF:', err.message);
      }
    }

    doc.fillColor('#1c1712').fontSize(22).font('Helvetica-Bold').text(restaurant?.name?.toUpperCase() || 'RESTAURANTE', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#6b5e4e').text(restaurant?.address || '', { align: 'center' });
    doc.text(`Tel: ${restaurant?.phone || ''} | ${restaurant?.email || ''}`, { align: 'center' });
    
    doc.moveDown(2);
    doc.strokeColor('#caa56d').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1.5);

    // --- ORDER INFO ---
    doc.fillColor('#1c1712').fontSize(14).font('Helvetica-Bold').text(`TICKET DE VENTA #${order.order_number.split('-').pop()}`, { align: 'left' });
    doc.moveDown(0.5);
    
    const leftCol = 40;
    const rightCol = 300;
    const currentY = doc.y;

    doc.fontSize(10).font('Helvetica-Bold').text('CLIENTE:', leftCol);
    doc.font('Helvetica').text(order.customer_name?.toUpperCase() || 'CONSUMIDOR FINAL', leftCol + 60, currentY);
    
    doc.font('Helvetica-Bold').text('FECHA:', rightCol);
    doc.font('Helvetica').text(new Date(order.createdAt).toLocaleString('es-GT'), rightCol + 60, currentY);

    doc.moveDown(0.5);
    const nextY = doc.y;
    doc.font('Helvetica-Bold').text('TIPO:', leftCol);
    doc.font('Helvetica').text(order.order_type === 'dine_in' ? 'SALÓN' : order.order_type === 'delivery' ? 'DOMICILIO' : 'PARA LLEVAR', leftCol + 60, nextY);

    doc.font('Helvetica-Bold').text('ESTADO:', rightCol);
    doc.font('Helvetica').text(order.status === 'paid' ? 'PAGADO' : 'PENDIENTE', rightCol + 60, nextY);

    doc.moveDown(2);

    // --- TABLE HEADERS ---
    const tableTop = doc.y;
    doc.fillColor('#1c1712').font('Helvetica-Bold');
    doc.text('CANT', 40, tableTop);
    doc.text('DESCRIPCIÓN', 100, tableTop);
    doc.text('P. UNIT', 400, tableTop, { width: 60, align: 'right' });
    doc.text('SUBTOTAL', 480, tableTop, { width: 75, align: 'right' });

    doc.moveDown(0.5);
    doc.strokeColor('#1c1712').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // --- ITEMS ---
    doc.font('Helvetica');
    order.items.forEach(item => {
      const itemY = doc.y;
      doc.text(item.quantity.toString(), 40, itemY);
      doc.text(item.MenuItem?.name || 'Platillo Gourmet', 100, itemY, { width: 280 });
      doc.text(`Q${item.unit_price.toFixed(2)}`, 400, itemY, { width: 60, align: 'right' });
      doc.text(`Q${item.subtotal.toFixed(2)}`, 480, itemY, { width: 75, align: 'right' });
      doc.moveDown(0.8);
      
      if (item.special_instructions) {
        doc.fontSize(8).fillColor('#6b5e4e').text(`* ${item.special_instructions}`, 110, doc.y);
        doc.fontSize(10).fillColor('#1c1712');
        doc.moveDown(0.5);
      }
    });

    doc.moveDown(1);
    doc.strokeColor('#1c1712').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1.5);

    // --- TOTALS ---
    const summaryX = 350;
    doc.font('Helvetica-Bold').text('SUBTOTAL:', summaryX);
    doc.font('Helvetica').text(`Q${order.subtotal.toFixed(2)}`, 480, doc.y - 12, { width: 75, align: 'right' });
    
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('IVA (12%):', summaryX);
    doc.font('Helvetica').text(`Q${order.tax.toFixed(2)}`, 480, doc.y - 12, { width: 75, align: 'right' });

    if (order.delivery_fee > 0) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('DOMICILIO:', summaryX);
      doc.font('Helvetica').text(`Q${order.delivery_fee.toFixed(2)}`, 480, doc.y - 12, { width: 75, align: 'right' });
    }

    doc.moveDown(1);
    doc.fillColor('#caa56d').fontSize(16).font('Helvetica-Bold').text('TOTAL A PAGAR:', summaryX);
    doc.text(`Q${order.total.toFixed(2)}`, 480, doc.y - 18, { width: 75, align: 'right' });

    // --- FOOTER ---
    doc.moveDown(4);
    doc.fillColor('#6b5e4e').fontSize(10).font('Helvetica-Oblique').text('¡Gracias por elegirnos! Esperamos verle pronto.', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica').text('BuenProvecho Premium OS - Sistema de Gestión de Restaurantes', { align: 'center', opacity: 0.5 });

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await fetchKitchenOrders(req.params.restaurantId);
    return res.status(200).json({ success: true, message: 'Órdenes obtenidas exitosamente', data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};