'use strict';

import { Table } from './table.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { Op } from 'sequelize';

export const createTable = async (req, res) => {
  try {
    const { table_number, capacity, location, floor, restaurant_id } = req.body;
    
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant || !restaurant.is_active) {
      return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    }
    
    const existingTable = await Table.findOne({
      where: { table_number, restaurant_id, is_active: true },
    });
    
    if (existingTable) {
      return res.status(409).json({
        ok: false,
        message: 'Table number already exists in this restaurant',
      });
    }
    
    const table = await Table.create({
      table_number,
      capacity,
      location: location || 'interior',
      floor: floor || 1,
      status: 'available',
      restaurant_id,
    });
    
    return res.status(201).json({
      ok: true,
      message: 'Creado exitosamente',
      table,
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getAllTables = async (req, res) => {
  try {
    const { restaurant_id, status, location, page = 1, limit = 20 } = req.query;
    
    const where = { is_active: true };
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (status) where.status = status;
    if (location) where.location = location;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: tables } = await Table.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['table_number', 'ASC']],
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
      ],
    });
    
    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      tables,
    });
  } catch (error) {
    console.error('Error getting tables:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};

export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findOne({
      where: { id, is_active: true },
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'address'] },
      ],
    });
    
    if (!table) {
      return res.status(404).json({ ok: false, message: 'No encontrado' });
    }
    
    return res.status(200).json({
      ok: true,
      message: 'Datos obtenidos exitosamente',
      table,
    });
  } catch (error) {
    console.error('Error getting table:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const table = await Table.findOne({ where: { id, is_active: true } });
    if (!table) {
      return res.status(404).json({ ok: false, message: 'No encontrado' });
    }
    
    if (updateData.table_number && updateData.table_number !== table.table_number) {
      const existingTable = await Table.findOne({
        where: {
          table_number: updateData.table_number,
          restaurant_id: table.restaurant_id,
          is_active: true,
          id: { [Op.ne]: id },
        },
      });
      
      if (existingTable) {
        return res.status(409).json({ ok: false, message: 'Table number already exists' });
      }
    }
    
    delete updateData.id;
    delete updateData.restaurant_id;
    delete updateData.created_at;
    
    await table.update(updateData);
    
    return res.status(200).json({
      ok: true,
      message: 'Actualizado exitosamente',
      table,
    });
  } catch (error) {
    console.error('Error updating table:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findOne({ where: { id, is_active: true } });
    if (!table) {
      return res.status(404).json({ ok: false, message: 'No encontrado' });
    }
    
    await table.update({ is_active: false });
    
    return res.status(200).json({
      ok: true,
      message: 'Eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};

export const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const table = await Table.findOne({ where: { id, is_active: true } });
    if (!table) {
      return res.status(404).json({ ok: false, message: 'No encontrado' });
    }
    
    await table.update({ status });
    
    return res.status(200).json({
      ok: true,
      message: `Table status updated to ${status}`,
      table: { id: table.id, table_number: table.table_number, status: table.status },
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};

export const getAvailableTables = async (req, res) => {
  try {
    const { restaurant_id, capacity, location } = req.query;
    
    if (!restaurant_id) {
      return res.status(400).json({ ok: false, message: 'Restaurant ID is required' });
    }
    
    const where = {
      restaurant_id,
      status: 'available',
      is_active: true,
    };
    
    if (capacity) where.capacity = { [Op.gte]: parseInt(capacity) };
    if (location) where.location = location;
    
    const tables = await Table.findAll({
      where,
      order: [['table_number', 'ASC']],
    });
    
    return res.status(200).json({
      ok: true,
      message: 'Available Datos obtenidos exitosamente',
      count: tables.length,
      tables,
    });
  } catch (error) {
    console.error('Error getting available tables:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};