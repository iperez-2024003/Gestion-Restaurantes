'use strict';

import { Restaurant } from './restaurant.model.js';
import { User } from '../users/user.model.js';
import { Op } from 'sequelize';

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
      logo_url,
      cover_image_url,
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
        message: 'Administrator user not found',
      });
    }

    // Validate parent restaurant if provided
    if (parent_restaurant_id) {
      const parentRestaurant = await Restaurant.findByPk(parent_restaurant_id);
      if (!parentRestaurant) {
        return res.status(404).json({
          ok: false,
          message: 'Parent restaurant not found',
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
      average_price,
      capacity,
      opening_time,
      closing_time,
      operating_days: operating_days || [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      logo_url,
      cover_image_url,
      accepts_reservations: accepts_reservations ?? true,
      accepts_takeout: accepts_takeout ?? true,
      accepts_delivery: accepts_delivery ?? false,
      parking_available: parking_available ?? false,
      wifi_available: wifi_available ?? false,
      outdoor_seating: outdoor_seating ?? false,
      pet_friendly: pet_friendly ?? false,
      wheelchair_accessible: wheelchair_accessible ?? false,
      latitude,
      longitude,
      website_url,
      social_media: social_media || {},
      payment_methods: payment_methods || ['cash', 'credit_card', 'debit_card'],
      special_features: special_features || [],
      admin_id,
      parent_restaurant_id,
      is_active: true,
      is_verified: false,
    });

    return res.status(201).json({
      ok: true,
      message: 'Restaurant created successfully',
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
      message: 'Internal server error while creating restaurant',
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

    const offset = (parseInt(page) - 1) * parseInt(limit);

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
      limit: parseInt(limit),
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

    return res.status(200).json({
      ok: true,
      message: 'Restaurants retrieved successfully',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      restaurants,
    });
  } catch (error) {
    console.error('Error getting restaurants:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving restaurants',
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
        message: 'Restaurant not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Restaurant retrieved successfully',
      restaurant,
    });
  } catch (error) {
    console.error('Error getting restaurant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving restaurant',
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
        message: 'Restaurant not found',
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
          message: 'Administrator user not found',
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
      message: 'Restaurant updated successfully',
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
      message: 'Internal server error while updating restaurant',
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
        message: 'Restaurant not found',
      });
    }

    // Soft delete
    await restaurant.update({ is_active: false });

    return res.status(200).json({
      ok: true,
      message: 'Restaurant deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while deleting restaurant',
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
      message: 'Restaurants retrieved successfully',
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error('Error getting admin restaurants:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving admin restaurants',
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
        message: 'Restaurant not found',
      });
    }

    await restaurant.update({
      is_verified: true,
      verification_date: new Date(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Restaurant verified successfully',
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
      message: 'Internal server error while verifying restaurant',
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

    const restaurant = await Restaurant.findOne({
      where: { id, is_active: true },
    });

    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurant not found',
      });
    }

    // Basic statistics from restaurant model
    const stats = {
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
      message: 'Restaurant statistics retrieved successfully',
      stats,
    });
  } catch (error) {
    console.error('Error getting restaurant stats:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};