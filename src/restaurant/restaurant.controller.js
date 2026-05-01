'use strict';

import os from 'os';
import Restaurant from './restaurant.model.js';
import {
  fetchRestaurants,
  fetchRestaurantById,
  createRestaurantRecord,
  updateRestaurantRecord,
  changeRestaurantStatus,
  deleteRestaurant as deleteRestaurantRecord,
  searchRestaurants,
  fetchRestaurantsByAdmin,
  serializeRestaurant,
} from './restaurant.service.js';

export const getRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive = true } = req.query;
    const normalizedIsActive = isActive === 'false' ? false : true;
    const { restaurants, pagination } = await fetchRestaurants({
      page,
      limit,
      isActive: normalizedIsActive,
    });

    res.status(200).json({ success: true, data: restaurants, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener restaurantes', error: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await fetchRestaurantById(req.params.id);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message || 'Restaurante no encontrado' });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await createRestaurantRecord({ restaurantData: req.body, file: req.file });
    res.status(201).json({ success: true, message: 'Restaurante creado correctamente', data: restaurant });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al crear restaurante', error: error.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await updateRestaurantRecord({ id: req.params.id, updateData: req.body, file: req.file });
    res.status(200).json({ success: true, message: 'Restaurante actualizado correctamente', data: restaurant });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al actualizar restaurante', error: error.message });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const restaurant = await changeRestaurantStatus(req.params.id, req.body.isActive);
    res.status(200).json({ success: true, message: 'Estado actualizado correctamente', data: restaurant });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al cambiar estado', error: error.message });
  }
};

export const removeRestaurant = async (req, res) => {
  try {
    const restaurant = await deleteRestaurantRecord(req.params.id);
    res.status(200).json({ success: true, message: 'Restaurante eliminado correctamente', data: restaurant });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al eliminar restaurante', error: error.message });
  }
};

export const search = async (req, res) => {
  try {
    const { restaurants, pagination } = await searchRestaurants({
      keyword: req.query.keyword,
      category: req.query.category,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    });

    res.status(200).json({ success: true, data: restaurants, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en búsqueda', error: error.message });
  }
};

export const getAdminRestaurants = async (req, res) => {
  try {
    const { restaurants, pagination } = await fetchRestaurantsByAdmin({
      adminId: req.params.adminId,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    });

    res.status(200).json({ success: true, data: restaurants, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener restaurantes del admin', error: error.message });
  }
};

export const getAllRestaurants = getRestaurants;
export const deleteRestaurant = removeRestaurant;
export const getRestaurantsByAdmin = getAdminRestaurants;

export const verifyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verificationDate: new Date() },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Restaurante verificado exitosamente', data: serializeRestaurant(restaurant) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar restaurante', error: error.message });
  }
};

export const getRestaurantStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    const restaurantsTotal = await Restaurant.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          restaurants: restaurantsTotal,
          tables: 0,
          dishes: 0,
          staff: 0,
          today_orders: 0,
          today_revenue: 0,
        },
        restaurant: serializeRestaurant(restaurant),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
  }
};

export const getServerIp = async (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let ipAddress = 'localhost';

    for (const interfaceName in interfaces) {
      for (const iface of interfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
          break;
        }
      }
      if (ipAddress !== 'localhost') break;
    }

    res.status(200).json({ success: true, ip: ipAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al detectar IP', error: error.message });
  }
};