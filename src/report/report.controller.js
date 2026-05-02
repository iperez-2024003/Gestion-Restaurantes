'use strict';

import { Order } from '../order/order.model.js';
import { OrderItem } from '../order/order-item.model.js';
import { MenuItem } from '../menu/menu-item.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { User } from '../users/user.model.js';
import { generateInvoiceHTML, generateDailySummaryHTML } from './report.service.js';
import { sendHtmlEmail } from '../../helpers/email-service.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

/**
 * Envía la factura de una orden al correo del cliente
 */
export const sendOrderInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
        include: [
            {
                model: OrderItem,
                as: 'items',
                include: [{ model: MenuItem, as: 'menu_item' }]
            },
            { model: Restaurant, as: 'restaurant' },
            { model: User, as: 'user' }
        ]
    });

    if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    const html = generateInvoiceHTML(order, order.restaurant, order.user);
    const emailToSend = order.user.email; // Se asume que el usuario tiene email

    await sendHtmlEmail(
        emailToSend,
        `Factura de tu pedido ${order.order_number} - ${order.restaurant.name}`,
        html
    );

    return res.status(200).json({
        success: true,
        message: `Factura enviada exitosamente a ${emailToSend}`
    });
});

/**
 * Genera un reporte de ventas diario y lo envía al administrador
 */
export const getDailyReport = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    // Obtener estadísticas del día
    const orders = await Order.findAll({
        where: {
            restaurant_id: restaurantId,
            created_at: { [Op.gte]: today },
            status: { [Op.ne]: 'cancelled' }
        }
    });

    const stats = {
        totalOrders: orders.length,
        totalSales: orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
        dineInCount: orders.filter(o => o.order_type === 'dine_in').length,
        takeoutCount: orders.filter(o => o.order_type === 'takeout').length,
        deliveryCount: orders.filter(o => o.order_type === 'delivery').length
    };

    const html = generateDailySummaryHTML(restaurant, stats);

    // Aquí podríamos enviarlo al correo del admin que hace la petición
    // Por ahora lo devolvemos en el JSON y opcionalmente lo enviamos si hay correo
    const user = await User.findByPk(req.userId);
    if (user && user.email) {
        await sendHtmlEmail(
            user.email,
            `Reporte Diario de Ventas - ${restaurant.name}`,
            html
        );
    }

    return res.status(200).json({
        success: true,
        message: 'Reporte generado y enviado exitosamente',
        data: stats
    });
});

/**
 * Descarga de reporte Excel
 */
export const downloadDailyExcelReport = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    const orders = await Order.findAll({
        where: {
            restaurant_id: restaurantId,
            created_at: { [Op.gte]: today },
            status: { [Op.ne]: 'cancelled' }
        },
        include: [{ model: User, as: 'user', attributes: ['username'] }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Diario');

    worksheet.columns = [
        { header: 'No. Orden', key: 'order_number', width: 25 },
        { header: 'Cliente', key: 'customer', width: 30 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Subtotal', key: 'subtotal', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Fecha', key: 'date', width: 25 }
    ];

    orders.forEach(o => {
        worksheet.addRow({
            order_number: o.order_number,
            customer: o.customer_name || (o.user ? o.user.username : 'N/A'),
            type: o.order_type,
            status: o.status,
            subtotal: o.subtotal,
            total: o.total,
            date: new Date(o.created_at).toLocaleString()
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_${restaurant.name}_${new Date().toISOString().slice(0, 10)}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
});
