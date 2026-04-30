'use strict';

import { Restaurant } from '../restaurant/restaurant.model.js';
import { Order } from '../order/order.model.js';
import { OrderItem } from '../order/order-item.model.js';
import { Reservation } from '../reservation/reservation.model.js';
import { Event } from '../event/event.model.js';
import { MenuItem } from '../menu/menu-item.model.js';
import { sequelize } from '../../configs/db.js';
import { Op, fn, col, literal } from 'sequelize';
import ExcelJS from 'exceljs';

export const getRestaurantOverview = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ ok: false, message: 'Restaurant not found' });
    }
    
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = await Order.count({
      where: { restaurant_id: id, created_at: { [Op.gte]: today } },
    });
    
    const todayRevenue = await Order.sum('total', {
      where: { restaurant_id: id, payment_status: 'paid', created_at: { [Op.gte]: today } },
    }) || 0;
    
    const todayReservations = await Reservation.count({
      where: { restaurant_id: id, reservation_date: today },
    });
    
    const totalOrders = await Order.count({ where: { restaurant_id: id } });
    const totalRevenue = await Order.sum('total', {
      where: { restaurant_id: id, payment_status: 'paid' },
    }) || 0;
    
    return res.status(200).json({
      ok: true,
      message: 'Restaurant overview retrieved successfully',
      overview: {
        restaurant_info: { id: restaurant.id, name: restaurant.name, rating: restaurant.rating },
        today: { orders: todayOrders, revenue: parseFloat(todayRevenue.toFixed(2)), reservations: todayReservations },
        all_time: { total_orders: totalOrders, total_revenue: parseFloat(totalRevenue.toFixed(2)) },
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

export const getOrdersStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = new Date();
    if (period === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
    else if (period === 'month') dateFilter.setMonth(dateFilter.getMonth() - 1);
    else if (period === 'year') dateFilter.setFullYear(dateFilter.getFullYear() - 1);
    
    const orders = await Order.findAll({
      where: {
        restaurant_id: id,
        created_at: { [Op.gte]: dateFilter },
      },
      attributes: [
        [sequelize.literal('created_at::date'), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
      ],
      group: [sequelize.literal('created_at::date')],
      order: [[sequelize.literal('created_at::date'), 'ASC']],
      raw: true,
    });
    
    return res.status(200).json({
      ok: true,
      message: 'Orders statistics retrieved successfully',
      period,
      data: orders,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

export const getPopularDishes = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const popularDishes = await OrderItem.findAll({
      attributes: [
        'menu_item_id',
        [sequelize.fn('COUNT', sequelize.col('order_item.id')), 'order_count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
      ],
      include: [
        {
          model: MenuItem,
          as: 'menu_item',
          where: { restaurant_id: id },
          attributes: ['id', 'name', 'price', 'description'],
        },
      ],
      group: ['menu_item_id', 'menu_item.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: parseInt(limit),
      raw: false,
    });
    
    return res.status(200).json({
      ok: true,
      message: 'Popular dishes retrieved successfully',
      dishes: popularDishes,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

export const getPlatformSummary = async (req, res) => {
  try {
    const totalRestaurants = await Restaurant.count({ where: { is_active: true } });
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total', { where: { payment_status: 'paid' } }) || 0;
    const totalReservations = await Reservation.count();
    const totalEvents = await Event.count({ where: { is_active: true } });
    
    const topRestaurants = await Restaurant.findAll({
      where: { is_active: true },
      order: [['rating', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'rating', 'category', 'total_reviews'],
    });
    
    return res.status(200).json({
      ok: true,
      message: 'Platform summary retrieved successfully',
      summary: {
        total_restaurants: totalRestaurants,
        total_orders: totalOrders,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        total_reservations: totalReservations,
        total_events: totalEvents,
        top_restaurants: topRestaurants,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

/**
 * Generate Excel Report of Orders
 * @route GET /api/v1/statistics/restaurant/:id/export-excel
 */
export const exportOrdersToExcel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Traer todas las ordenes del restaurante (limitamos a 1000 para no reventar la memoria en un demo)
    const orders = await Order.findAll({
      where: { restaurant_id: id },
      order: [['created_at', 'DESC']],
      limit: 1000,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 20 },
      { header: 'Número de Orden', key: 'orderNumber', width: 25 },
      { header: 'Cliente', key: 'customer', width: 25 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Subtotal (Q)', key: 'subtotal', width: 15 },
      { header: 'Total (Q)', key: 'total', width: 15 },
    ];

    // Estilo a la cabecera
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6B8' } // Amber claro
    };

    // Llenar filas
    orders.forEach((order) => {
      worksheet.addRow({
        date: new Date(order.created_at).toLocaleString(),
        orderNumber: order.order_number,
        customer: order.customer_name,
        type: order.order_type,
        status: order.status,
        subtotal: parseFloat(order.subtotal),
        total: parseFloat(order.total),
      });
    });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_Ventas_${id}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel:', error);
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, message: 'Error interno generando Excel' });
    }
  }
};

/**
 * Get global platform statistics (SuperAdmin only)
 */
export const getGlobalStats = async (req, res) => {
  try {
    const totalRestaurants = await Restaurant.count({ where: { is_active: true } });
    const totalUsers = await User.count({ where: { Status: true } });
    const totalOrders = await Order.count();
    
    const totalRevenue = await Order.sum('total', { 
      where: { payment_status: 'paid' } 
    }) || 0;

    const topRestaurants = await Order.findAll({
      attributes: [
        'restaurant_id',
        [fn('SUM', col('total')), 'revenue'],
        [fn('COUNT', col('order.id')), 'orders_count']
      ],
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['name'] }],
      where: { payment_status: 'paid' },
      group: ['restaurant_id', 'restaurant.id'],
      order: [[literal('revenue'), 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      ok: true,
      stats: {
        totalRestaurants,
        totalUsers,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        topRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return res.status(500).json({ ok: false, message: 'Error fetching global stats' });
  }
};

/**
 * Get VIP clients across the whole platform
 */
export const getGlobalVipClients = async (req, res) => {
  try {
    const vipClients = await Order.findAll({
      attributes: [
        'user_id',
        [fn('COUNT', col('order.id')), 'orders_count'],
        [fn('SUM', col('total')), 'total_spent']
      ],
      include: [{ 
        model: User, 
        as: 'user',
        attributes: ['Id', 'Name', 'Surname', 'Username', 'Email'] 
      }],
      group: ['user_id', 'user.id'],
      order: [[literal('total_spent'), 'DESC']],
      limit: 10
    });

    return res.status(200).json({
      ok: true,
      clients: vipClients
    });
  } catch (error) {
    console.error('Error fetching VIP clients:', error);
    return res.status(500).json({ ok: false, message: 'Error fetching VIP clients' });
  }
};