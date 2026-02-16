'use strict';

import { Restaurant } from './restaurant.model.js';
import { validationResult } from 'express-validator';

export const createRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const restaurant = await Restaurant.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el restaurante',
      error: error.message,
    });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los restaurantes',
      error: error.message,
    });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el restaurante',
      error: error.message,
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    await restaurant.update(req.body);

    return res.status(200).json({
      success: true,
      message: 'Restaurante actualizado exitosamente',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el restaurante',
      error: error.message,
    });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    await restaurant.destroy();

    return res.status(200).json({
      success: true,
      message: 'Restaurante eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el restaurante',
      error: error.message,
    });
  }
};