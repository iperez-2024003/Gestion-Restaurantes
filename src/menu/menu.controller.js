'use strict';

import { Menu } from './menu.model.js';
import { MenuItem } from './menu-item.model.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

// ========== CATEGORÍAS ==========

export const createMenu = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const { restaurant_id, name, description, display_order, is_active, icon } =
      req.body;

    const existingMenu = await Menu.findOne({
      where: {
        restaurant_id,
        name: {
          [Op.iLike]: name,
        },
      },
    });

    if (existingMenu) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre en este restaurante',
      });
    }

    const menu = await Menu.create({
      restaurant_id,
      name,
      description,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true,
      icon,
    });

    return res.status(201).json({
      success: true,
      message: 'Categoría de menú creada exitosamente',
      data: menu,
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear la categoría de menú',
      error: error.message,
    });
  }
};

export const getAllMenus = async (req, res) => {
  try {
    const { restaurant_id, is_active } = req.query;

    const whereClause = {};

    if (restaurant_id) {
      whereClause.restaurant_id = restaurant_id;
    }

    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const menus = await Menu.findAll({
      where: whereClause,
      include: [
        {
          model: MenuItem,
          as: 'items',
          attributes: [
            'id',
            'name',
            'price',
            'is_available',
            'image_url',
            'display_order',
          ],
          required: false,
        },
      ],
      order: [
        ['display_order', 'ASC'],
        ['name', 'ASC'],
        [{ model: MenuItem, as: 'items' }, 'display_order', 'ASC'],
      ],
    });

    return res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las categorías',
      error: error.message,
    });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByPk(id, {
      include: [
        {
          model: MenuItem,
          as: 'items',
          order: [['display_order', 'ASC']],
        },
      ],
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la categoría',
      error: error.message,
    });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, description, display_order, is_active, icon } = req.body;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    if (name && name !== menu.name) {
      const existingMenu = await Menu.findOne({
        where: {
          restaurant_id: menu.restaurant_id,
          name: {
            [Op.iLike]: name,
          },
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (existingMenu) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre',
        });
      }
    }

    await menu.update({
      name: name || menu.name,
      description: description !== undefined ? description : menu.description,
      display_order:
        display_order !== undefined ? display_order : menu.display_order,
      is_active: is_active !== undefined ? is_active : menu.is_active,
      icon: icon !== undefined ? icon : menu.icon,
    });

    return res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: menu,
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la categoría',
      error: error.message,
    });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    const itemsCount = await MenuItem.count({
      where: { menu_id: id },
    });

    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Tiene ${itemsCount} platillo(s) asociado(s)`,
      });
    }

    await menu.destroy();

    return res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría',
      error: error.message,
    });
  }
};

// ========== PLATILLOS ==========

export const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const {
      menu_id,
      restaurant_id,
      name,
      description,
      price,
      image_url,
      preparation_time,
      calories,
      ingredients,
      allergens,
      is_available,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      is_spicy,
      spicy_level,
      display_order,
    } = req.body;

    const menu = await Menu.findByPk(menu_id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'La categoría no existe',
      });
    }

    const existingItem = await MenuItem.findOne({
      where: {
        menu_id,
        name: {
          [Op.iLike]: name,
        },
      },
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un platillo con ese nombre en esta categoría',
      });
    }

    const menuItem = await MenuItem.create({
      menu_id,
      restaurant_id,
      name,
      description,
      price,
      image_url,
      preparation_time,
      calories,
      ingredients,
      allergens,
      is_available: is_available !== undefined ? is_available : true,
      is_vegetarian: is_vegetarian || false,
      is_vegan: is_vegan || false,
      is_gluten_free: is_gluten_free || false,
      is_spicy: is_spicy || false,
      spicy_level: is_spicy ? spicy_level || 1 : 0,
      display_order: display_order || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Platillo creado exitosamente',
      data: menuItem,
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el platillo',
      error: error.message,
    });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const {
      menu_id,
      restaurant_id,
      is_available,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      min_price,
      max_price,
    } = req.query;

    const whereClause = {};

    if (menu_id) whereClause.menu_id = menu_id;
    if (restaurant_id) whereClause.restaurant_id = restaurant_id;
    if (is_available !== undefined)
      whereClause.is_available = is_available === 'true';
    if (is_vegetarian !== undefined)
      whereClause.is_vegetarian = is_vegetarian === 'true';
    if (is_vegan !== undefined) whereClause.is_vegan = is_vegan === 'true';
    if (is_gluten_free !== undefined)
      whereClause.is_gluten_free = is_gluten_free === 'true';

    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    const menuItems = await MenuItem.findAll({
      where: whereClause,
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'name', 'display_order'],
        },
      ],
      order: [
        ['display_order', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    return res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los platillos',
      error: error.message,
    });
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'name', 'display_order'],
        },
      ],
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el platillo',
      error: error.message,
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    if (updateData.menu_id && updateData.menu_id !== menuItem.menu_id) {
      const menu = await Menu.findByPk(updateData.menu_id);
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'La categoría no existe',
        });
      }
    }

    if (updateData.name && updateData.name !== menuItem.name) {
      const existingItem = await MenuItem.findOne({
        where: {
          menu_id: updateData.menu_id || menuItem.menu_id,
          name: {
            [Op.iLike]: updateData.name,
          },
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un platillo con ese nombre en esta categoría',
        });
      }
    }

    await menuItem.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Platillo actualizado exitosamente',
      data: menuItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el platillo',
      error: error.message,
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    await menuItem.destroy();

    return res.status(200).json({
      success: true,
      message: 'Platillo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el platillo',
      error: error.message,
    });
  }
};

export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    await menuItem.update({
      is_available: !menuItem.is_available,
    });

    return res.status(200).json({
      success: true,
      message: `Platillo ${menuItem.is_available ? 'disponible' : 'no disponible'}`,
      data: {
        id: menuItem.id,
        name: menuItem.name,
        is_available: menuItem.is_available,
      },
    });
  } catch (error) {
    console.error('Error toggling availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar disponibilidad',
      error: error.message,
    });
  }
};
