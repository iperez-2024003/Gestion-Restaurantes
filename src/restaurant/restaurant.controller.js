'use strict';

import os from 'os';
import { Restaurant } from './restaurant.model.js';
import { User } from '../users/user.model.js';
import { Table } from '../table/table.model.js';
import { MenuItem } from '../menu/menu-item.model.js';
import { Order } from '../order/order.model.js';
import { Op } from 'sequelize';
import { uploadImage } from '../../helpers/cloudinary-service.js';
import path from 'path';
import crypto from 'crypto';

/**
 * Create a new restaurant
 * @route POST /api/v1/restaurants
 * @access Private (Admin, Restaurant Admin)
 */
export const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      email,
      category,
      cuisine_type,
      price_range,
      average_price,
      capacity,
      opening_time,
      closing_time,
      operating_days,
      accepts_reservations,
      accepts_takeout,
      accepts_delivery,
      parking_available,
      wifi_available,
      outdoor_seating,
      pet_friendly,
      wheelchair_accessible,
      latitude,
      longitude,
      website_url,
      social_media,
      payment_methods,
      special_features,
      admin_id,
      parent_restaurant_id,
    } = req.body;

    // Normalizar booleanos de FormData (llegan como strings)
    const toBool = (val) => val === 'true' || val === true;
    const final_accepts_reservations = toBool(req.body.accepts_reservations);
    const final_accepts_takeout = toBool(req.body.accepts_takeout);
    const final_accepts_delivery = toBool(req.body.accepts_delivery);
    const final_parking_available = toBool(req.body.parking_available);
    const final_wifi_available = toBool(req.body.wifi_available);
    const final_outdoor_seating = toBool(req.body.outdoor_seating);
    const final_pet_friendly = toBool(req.body.pet_friendly);
    const final_wheelchair_accessible = toBool(req.body.wheelchair_accessible);

    // Parsear campos complejos que vienen como string desde FormData
    let final_operating_days = operating_days;
    if (typeof operating_days === 'string') {
      try { final_operating_days = JSON.parse(operating_days); } catch (e) { final_operating_days = operating_days.split(','); }
    }

    let final_social_media = req.body.social_media;
    if (typeof final_social_media === 'string') {
      try { final_social_media = JSON.parse(final_social_media); } catch (e) { final_social_media = {}; }
    }

    let final_payment_methods = req.body.payment_methods;
    if (typeof final_payment_methods === 'string') {
      try { final_payment_methods = JSON.parse(final_payment_methods); } catch (e) { final_payment_methods = final_payment_methods.split(','); }
    }

    let final_special_features = req.body.special_features;
    if (typeof final_special_features === 'string') {
      try { final_special_features = JSON.parse(final_special_features); } catch (e) { final_special_features = final_special_features.split(','); }
    }

    let logo_url = req.body.logo_url;

    // Procesar archivo de logo si existe (Multer + Cloudinary)
    if (req.file) {
      try {
        const ext = path.extname(req.file.originalname);
        const randomHex = crypto.randomBytes(6).toString('hex');
        const cloudinaryFileName = `logo-${randomHex}${ext}`;
        logo_url = await uploadImage(req.file.path, cloudinaryFileName);
      } catch (err) {
        console.error('Error uploading logo to Cloudinary:', err);
        // Fallback: usar ruta relativa si Cloudinary falla
        logo_url = req.file.path;
      }
    }

    // Check if restaurant name already exists
    const existingRestaurant = await Restaurant.findOne({
      where: { name, is_active: true },
    });

    if (existingRestaurant) {
      return res.status(409).json({
        ok: false,
        message: 'A restaurant with this name already exists',
      });
    }

    // Validate admin exists and has appropriate role
    const admin = await User.findByPk(admin_id);
    if (!admin) {
      return res.status(404).json({
        ok: false,
        message: 'Administrator No encontrado',
      });
    }

    // Validate parent restaurant if provided
    if (parent_restaurant_id) {
      const parentRestaurant = await Restaurant.findByPk(parent_restaurant_id);
      if (!parentRestaurant) {
        return res.status(404).json({
          ok: false,
          message: 'Parent No encontrado',
        });
      }
    }

    // Validate operating hours
    if (opening_time >= closing_time) {
      return res.status(400).json({
        ok: false,
        message: 'Closing time must be after opening time',
      });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      phone,
      email,
      category,
      cuisine_type,
      price_range,
      average_price: average_price ? parseFloat(average_price) : null,
      capacity: parseInt(capacity),
      opening_time,
      closing_time,
      operating_days: final_operating_days || [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      logo_url,
      accepts_reservations: final_accepts_reservations,
      accepts_takeout: final_accepts_takeout,
      accepts_delivery: final_accepts_delivery,
      parking_available: final_parking_available,
      wifi_available: final_wifi_available,
      outdoor_seating: final_outdoor_seating,
      pet_friendly: final_pet_friendly,
      wheelchair_accessible: final_wheelchair_accessible,
      latitude,
      longitude,
      website_url,
      social_media: final_social_media || {},
      payment_methods: final_payment_methods || ['cash', 'credit_card', 'debit_card'],
      special_features: final_special_features || [],
      admin_id,
      parent_restaurant_id,
      is_active: true,
      is_verified: false,
    });

    return res.status(201).json({
      ok: true,
      message: 'Creado exitosamente',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category,
        address: restaurant.address,
        phone: restaurant.phone,
        is_verified: restaurant.is_verified,
      },
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        ok: false,
        message: 'Validation error',
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while creating restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all restaurants with filters
 * @route GET /api/v1/restaurants
 * @access Public
 */
export const getAllRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      cuisine_type,
      price_range,
      accepts_reservations,
      accepts_delivery,
      search,
      sort_by = 'created_at',
      order = 'DESC',
      is_verified,
    } = req.query;

    let pageNum = parseInt(page);
    let limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;

    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where = { is_active: true };

    if (category) where.category = category;
    if (cuisine_type) where.cuisine_type = { [Op.iLike]: `%${cuisine_type}%` };
    if (price_range) where.price_range = price_range;
    if (accepts_reservations !== undefined)
      where.accepts_reservations = accepts_reservations === 'true';
    if (accepts_delivery !== undefined)
      where.accepts_delivery = accepts_delivery === 'true';
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { cuisine_type: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get restaurants with pagination
    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [[sort_by, order.toUpperCase()]],
      include: [
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Restaurant,
          as: 'parent_restaurant',
          attributes: ['id', 'name', 'category'],
        },
      ],
    });
    
    // Calcular total_pages de forma segura
    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        total_pages: totalPages,
      },
      restaurants,
    });
  } catch (error) {
    console.error('Error getting restaurants:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single restaurant by ID
 * @route GET /api/v1/restaurants/:id
 * @access Public
 */
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'username', 'email',],
        },
        {
          model: Restaurant,
          as: 'parent_restaurant',
          attributes: ['id', 'name', 'category', 'address'],
        },
        {
          model: Restaurant,
          as: 'branches',
          attributes: ['id', 'name', 'address', 'phone', 'rating'],
          where: { is_active: true },
          required: false,
        },
      ],
    });

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      restaurant,
    });
  } catch (error) {
    console.error('Error getting restaurant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update restaurant
 * @route PUT /api/v1/restaurants/:id
 * @access Private (Admin, Restaurant Admin)
 */
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const restaurant = await Restaurant.findOne({
      where: { id, is_active: true },
    });

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Validate opening and closing times if provided
    const opening = updateData.opening_time || restaurant.opening_time;
    const closing = updateData.closing_time || restaurant.closing_time;

    if (opening >= closing) {
      return res.status(400).json({
        ok: false,
        message: 'Closing time must be after opening time',
      });
    }

    // Check for duplicate name if name is being updated
    if (updateData.name && updateData.name !== restaurant.name) {
      const existingRestaurant = await Restaurant.findOne({
        where: {
          name: updateData.name,
          is_active: true,
          id: { [Op.ne]: id },
        },
      });

      if (existingRestaurant) {
        return res.status(409).json({
          ok: false,
          message: 'A restaurant with this name already exists',
        });
      }
    }

    // Validate admin if being updated
    if (updateData.admin_id && updateData.admin_id !== restaurant.admin_id) {
      const admin = await User.findByPk(updateData.admin_id);
      if (!admin) {
        return res.status(404).json({
          ok: false,
          message: 'Administrator No encontrado',
        });
      }
    }

    // Prevent updating certain fields
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.rating; // Rating should only be updated through reviews
    delete updateData.total_reviews;

    await restaurant.update(updateData);

    return res.status(200).json({
      ok: true,
      message: 'Actualizado exitosamente',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category,
        address: restaurant.address,
        phone: restaurant.phone,
        updated_at: restaurant.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        ok: false,
        message: 'Validation error',
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while updating restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Soft delete restaurant (deactivate)
 * @route DELETE /api/v1/restaurants/:id
 * @access Private (Admin, Restaurant Admin)
 */
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({
      where: { id, is_active: true },
    });

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Real hard delete (limpieza completa de la base de datos)
    await restaurant.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Restaurante eliminado permanentemente de la base de datos',
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while deleting restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get restaurants by admin
 * @route GET /api/v1/restaurants/admin/:adminId
 * @access Private (Admin, Restaurant Admin)
 */
export const getRestaurantsByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const restaurants = await Restaurant.findAll({
      where: { admin_id: adminId, is_active: true },
      include: [
        {
          model: Restaurant,
          as: 'branches',
          attributes: ['id', 'name', 'address', 'is_active'],
          where: { is_active: true },
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error('Error getting admin restaurants:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving admin restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Verify restaurant (Platform admin only)
 * @route PATCH /api/v1/restaurants/:id/verify
 * @access Private (Platform Admin)
 */
export const verifyRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({
      where: { id, is_active: true },
    });

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    await restaurant.update({
      is_verified: true,
      verification_date: new Date(),
    });

    // Recargar para obtener los datos frescos de la BD
    await restaurant.reload();

    return res.status(200).json({
      ok: true,
      message: 'Restaurante verificado exitosamente. El estado ha sido guardado.',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        is_verified: restaurant.is_verified,
        verification_date: restaurant.verification_date,
      },
    });
  } catch (error) {
    console.error('Error verifying restaurant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while verifying restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get restaurant statistics
 * @route GET /api/v1/restaurants/:id/stats
 * @access Private (Admin, Restaurant Admin)
 */
export const getRestaurantStats = async (req, res) => {
  try {
    const { id } = req.params;
    const todayStr = new Date().toISOString().slice(0, 10);

    const restaurant = await Restaurant.findOne({
      where: { id, is_active: true },
    });

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Conteo de mesas
    const tableCount = await Table.count({ where: { restaurant_id: id } });
    
    // Conteo de platos (MenuItems)
    const menuItemCount = await MenuItem.count({ where: { restaurant_id: id } });

    // Conteo de staff (Usuarios vinculados al restaurante)
    const staffCount = await User.count({ where: { restaurant_id: id } });

    // Ingresos y Órdenes de hoy
    const todayOrders = await Order.count({
      where: { 
        restaurant_id: id, 
        created_at: { [Op.gte]: todayStr } 
      }
    });

    const todayRevenue = await Order.sum('total', {
      where: { 
        restaurant_id: id, 
        payment_status: 'paid',
        created_at: { [Op.gte]: todayStr } 
      }
    }) || 0;

    // Basic statistics from restaurant model
    const stats = {
      summary: {
        tables: tableCount,
        dishes: menuItemCount,
        staff: staffCount,
        today_orders: todayOrders,
        today_revenue: parseFloat(todayRevenue.toFixed(2))
      },
      basic_info: {
        name: restaurant.name,
        category: restaurant.category,
        rating: parseFloat(restaurant.rating),
        total_reviews: restaurant.total_reviews,
        capacity: restaurant.capacity,
      },
      operational_info: {
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
        operating_days: restaurant.operating_days,
        accepts_reservations: restaurant.accepts_reservations,
        accepts_delivery: restaurant.accepts_delivery,
        accepts_takeout: restaurant.accepts_takeout,
      },
      verification: {
        is_verified: restaurant.is_verified,
        verification_date: restaurant.verification_date,
      },
    };

    return res.status(200).json({
      ok: true,
      message: 'Restaurant Datos obtenidos exitosamente',
      stats,
    });
  } catch (error) {
    console.error('Error getting restaurant stats:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get the local server IP address for QR generation
 */
export const getServerIp = async (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let ipAddress = 'localhost';

    for (const interfaceName in interfaces) {
      const networkInterface = interfaces[interfaceName];
      for (const iface of networkInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
          break;
        }
      }
      if (ipAddress !== 'localhost') break;
    }

    return res.json({
      ok: true,
      ip: ipAddress
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al detectar IP',
      error: error.message
    });
  }
};