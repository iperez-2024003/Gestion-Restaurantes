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
    res.setHeader('Content-Disposition', `inline; filename=Factura_${order.order_number}.pdf`);

    // A4 format, minimal margins
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    const formatMoney = (value) => `Q${Number(value || 0).toFixed(2)}`;
    const orderNumber = order.order_number?.split('-').pop() || order.order_number || '0000';
    
    let orderTypeLabel = 'Salón';
    if (order.order_type === 'delivery') orderTypeLabel = 'Domicilio';
    if (order.order_type === 'takeaway') orderTypeLabel = 'Para Llevar';
    
    const logoSource = restaurant?.logoUrl || restaurant?.logo_url;
    const pageWidth = doc.page.width;
    const leftMargin = 50;
    const contentWidth = pageWidth - leftMargin * 2;

    // --- STRIPE/APPLE AESTHETIC ---
    const colors = {
      primary: '#111827',   // Slate 900
      secondary: '#4B5563', // Slate 600
      muted: '#9CA3AF',     // Slate 400
      border: '#E5E7EB',    // Slate 200
      bg: '#F9FAFB'         // Slate 50
    };

    // 1. Header (Logo left, Invoice right)
    if (logoSource) {
      try {
        const response = await fetch(logoSource);
        const buffer = Buffer.from(await response.arrayBuffer());
        doc.image(buffer, leftMargin, 50, { fit: [60, 60], align: 'left', valign: 'top' });
      } catch (err) {
        console.error('Error loading logo for PDF:', err.message);
        doc.fillColor(colors.primary).fontSize(28).font('Helvetica-Bold').text((restaurant?.name || 'R').charAt(0), leftMargin, 50);
      }
    } else {
      doc.fillColor(colors.primary).fontSize(28).font('Helvetica-Bold').text((restaurant?.name || 'R').charAt(0), leftMargin, 50);
    }

    // Right Side Header
    doc.fillColor(colors.primary).fontSize(28).font('Helvetica-Bold').text('FACTURA', pageWidth - leftMargin - 200, 50, { width: 200, align: 'right', characterSpacing: 1 });
    doc.fillColor(colors.muted).fontSize(10).font('Helvetica-Bold').text(`#${orderNumber}`, pageWidth - leftMargin - 200, 82, { width: 200, align: 'right' });

    doc.moveDown(2);
    
    // Restaurant Info
    doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold').text(restaurant?.name?.toUpperCase() || 'RESTAURANTE', leftMargin, 130);
    doc.fillColor(colors.secondary).fontSize(10).font('Helvetica').text(restaurant?.address || 'Dirección no disponible', leftMargin, 146);
    doc.text(`Tel: ${restaurant?.phone || 'N/A'}`, leftMargin, 160);

    // Order Info Block (Grid)
    const infoX = pageWidth / 2;
    doc.fillColor(colors.primary).fontSize(9).font('Helvetica-Bold').text('Cobrado a', infoX, 130);
    doc.fillColor(colors.secondary).font('Helvetica').text(order.customer_name?.toUpperCase() || 'CONSUMIDOR FINAL', infoX, 146);
    
    doc.fillColor(colors.primary).font('Helvetica-Bold').text('Fecha', infoX, 174);
    doc.fillColor(colors.secondary).font('Helvetica').text(new Date(order.createdAt).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }), infoX, 188);
    
    doc.fillColor(colors.primary).font('Helvetica-Bold').text('Tipo de Orden', infoX + 120, 174);
    doc.fillColor(colors.secondary).font('Helvetica').text(orderTypeLabel, infoX + 120, 188);

    doc.moveTo(leftMargin, 230).lineTo(pageWidth - leftMargin, 230).strokeColor(colors.border).lineWidth(1).stroke();
    
    doc.y = 250;

    // --- TABLE HEADERS ---
    const tableTop = doc.y;
    const descX = leftMargin;
    const qtyX = leftMargin + 260;
    const unitX = leftMargin + 320;
    const subtotalX = pageWidth - leftMargin - 80;

    // Header Background
    doc.roundedRect(leftMargin, tableTop - 6, contentWidth, 24, 6).fill(colors.bg);
    
    doc.fillColor(colors.secondary).font('Helvetica-Bold').fontSize(8);
    doc.text('DESCRIPCIÓN', descX + 12, tableTop);
    doc.text('CANT', qtyX, tableTop);
    doc.text('P. UNITARIO', unitX, tableTop);
    doc.text('IMPORTE', subtotalX, tableTop, { width: 80, align: 'right' });

    doc.y = tableTop + 30;

    // --- ITEMS ---
    doc.font('Helvetica');
    order.items.forEach((item, index) => {
      const rowY = doc.y;
      const rowHeight = item.special_instructions ? 38 : 26;

      doc.fillColor(colors.primary).fontSize(10).font('Helvetica');
      doc.text(item.MenuItem?.name || 'Artículo Gourmet', descX + 12, rowY, { width: 230 });
      doc.text(String(item.quantity), qtyX, rowY);
      doc.text(formatMoney(item.unit_price), unitX, rowY);
      doc.text(formatMoney(item.subtotal), subtotalX, rowY, { width: 80, align: 'right' });

      if (item.special_instructions) {
        doc.fillColor(colors.muted).fontSize(8).text(`Nota: ${item.special_instructions}`, descX + 12, rowY + 16, { width: 230 });
      }
      
      doc.y = rowY + rowHeight;
      doc.moveTo(leftMargin, doc.y).lineTo(pageWidth - leftMargin, doc.y).strokeColor(colors.border).lineWidth(0.5).stroke();
      doc.y += 12;
    });

    doc.y += 15;

    // --- TOTALS ---
    const summaryWidth = 200;
    const summaryX = pageWidth - leftMargin - summaryWidth;
    let summaryY = doc.y;

    doc.fillColor(colors.secondary).fontSize(10).font('Helvetica').text('Subtotal', summaryX, summaryY);
    doc.fillColor(colors.primary).text(formatMoney(order.subtotal), summaryX + 100, summaryY, { width: 100, align: 'right' });
    
    summaryY += 22;
    doc.fillColor(colors.secondary).text('IVA (12%)', summaryX, summaryY);
    doc.fillColor(colors.primary).text(formatMoney(order.tax), summaryX + 100, summaryY, { width: 100, align: 'right' });

    if (order.delivery_fee > 0) {
      summaryY += 22;
      doc.fillColor(colors.secondary).text('Envío/Domicilio', summaryX, summaryY);
      doc.fillColor(colors.primary).text(formatMoney(order.delivery_fee), summaryX + 100, summaryY, { width: 100, align: 'right' });
    }

    summaryY += 28;
    doc.moveTo(summaryX, summaryY - 12).lineTo(pageWidth - leftMargin, summaryY - 12).strokeColor(colors.border).lineWidth(1).stroke();
    
    doc.fillColor(colors.primary).fontSize(14).font('Helvetica-Bold').text('Total a Pagar', summaryX, summaryY);
    doc.text(formatMoney(order.total), summaryX + 100, summaryY, { width: 100, align: 'right' });

    // --- FOOTER ---
    const footerY = doc.page.height - 80;
    doc.moveTo(leftMargin, footerY).lineTo(pageWidth - leftMargin, footerY).strokeColor(colors.border).lineWidth(1).stroke();

    doc.fillColor(colors.muted).fontSize(9).font('Helvetica').text('Gracias por su preferencia.', leftMargin, footerY + 15, { width: contentWidth, align: 'center' });
    doc.fontSize(8).text('Generado por BuenProvecho Premium OS', leftMargin, footerY + 30, { width: contentWidth, align: 'center' });

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