'use strict';

import { Restaurant } from '../restaurant/restaurant.model.js';
import { Order } from '../order/order.model.js';
import { OrderItem } from '../order/order-item.model.js';
import { Reservation } from '../reservation/reservation.model.js';
import { Event } from '../event/event.model.js';
import { MenuItem } from '../menu/menu-item.model.js';
import { sequelize } from '../../configs/db.js';
import { Op } from 'sequelize';

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
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
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