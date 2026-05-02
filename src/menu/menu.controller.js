'use strict';

import { Menu } from './menu.model.js';
import { MenuItem } from './menu-item.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { Op } from 'sequelize';
import { uploadImage, deleteImage } from '../../helpers/cloudinary-service.js';

// ==================== MENU CATEGORIES ====================

/**
 * Create menu category
 * @route POST /api/v1/menus
 */
export const createMenu = async (req, res) => {
  try {
    const { name, description, restaurant_id, display_order } = req.body;

    // Verificar que el restaurante existe
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurant not found',
      });
    }

    // Verificar duplicados
    const existingMenu = await Menu.findOne({
      where: {
        name,
        restaurant_id,
        is_active: true,
      },
    });

    if (existingMenu) {
      return res.status(409).json({
        ok: false,
        message: 'A menu category with this name already exists in this restaurant',
      });
    }

    const menu = await Menu.create({
      name,
      description,
      restaurant_id,
      display_order: display_order || 0,
    });

    return res.status(201).json({
      ok: true,
      message: 'Menu category created successfully',
      menu,
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while creating menu category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all menu categories
 * @route GET /api/v1/menus
 */
export const getAllMenus = async (req, res) => {
  try {
    const { restaurant_id, page = 1, limit = 20 } = req.query;

    const where = { is_active: true };
    if (restaurant_id) where.restaurant_id = restaurant_id;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: menus } = await Menu.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['display_order', 'ASC'], ['name', 'ASC']],
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: 'Menu categories retrieved successfully',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      menus,
    });
  } catch (error) {
    console.error('Error getting menus:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving menu categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get menu category by ID
 * @route GET /api/v1/menus/:id
 */
export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'category'],
        },
        {
          model: MenuItem,
          as: 'items',
          where: { is_active: true },
          required: false,
          order: [['name', 'ASC']],
        },
      ],
    });

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu category not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Menu category retrieved successfully',
      menu,
    });
  } catch (error) {
    console.error('Error getting menu:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving menu category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update menu category
 * @route PUT /api/v1/menus/:id
 */
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const menu = await Menu.findOne({
      where: { id, is_active: true },
    });

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu category not found',
      });
    }

    // Verificar duplicados si se cambia el nombre
    if (updateData.name && updateData.name !== menu.name) {
      const existingMenu = await Menu.findOne({
        where: {
          name: updateData.name,
          restaurant_id: menu.restaurant_id,
          is_active: true,
          id: { [Op.ne]: id },
        },
      });

      if (existingMenu) {
        return res.status(409).json({
          ok: false,
          message: 'A menu category with this name already exists',
        });
      }
    }

    delete updateData.id;
    delete updateData.restaurant_id;
    delete updateData.created_at;

    await menu.update(updateData);

    return res.status(200).json({
      ok: true,
      message: 'Menu category updated successfully',
      menu,
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while updating menu category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete menu category (soft delete)
 * @route DELETE /api/v1/menus/:id
 */
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findOne({
      where: { id, is_active: true },
    });

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu category not found',
      });
    }

    // Real hard delete (limpieza física de la BD)
    await menu.destroy();

    return res.status(200).json({
      ok: true,
<<<<<<< Updated upstream
      message: 'Menu category deleted successfully',
=======
      message: 'Categoría de menú eliminada permanentemente',
>>>>>>> Stashed changes
    });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while deleting menu category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ==================== MENU ITEMS ====================

/**
 * Create menu item
 * @route POST /api/v1/menu-items
 */
export const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      menu_id,
      restaurant_id,
      image_url,
      ingredients,
      allergens,
      preparation_time,
      calories,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      spice_level,
      portion_size,
      stock_quantity,
    } = req.body;

    // Verificar que el restaurante existe
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        ok: false,
        message: 'Restaurant not found',
      });
    }

    // Verificar que la categoría existe
    const menu = await Menu.findOne({
      where: { id: menu_id, is_active: true },
    });

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu category not found',
      });
    }

    // Verificar que la categoría pertenece al restaurante
    if (menu.restaurant_id !== restaurant_id) {
      return res.status(400).json({
        ok: false,
        message: 'Menu category does not belong to this restaurant',
      });
    }

    // Verificar duplicados
    const existingItem = await MenuItem.findOne({
      where: {
        name,
        restaurant_id,
        is_active: true,
      },
    });

    if (existingItem) {
      return res.status(409).json({
        ok: false,
        message: 'A menu item with this name already exists in this restaurant',
      });
    }

    // Subir imagen a Cloudinary si existe
    let imageUrl = image_url;
    if (req.file) {
      try {
        imageUrl = await uploadImage(req.file.path, `dish-${Date.now()}`);
      } catch (uploadError) {
        console.error('Error uploading dish image:', uploadError);
      }
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      menu_id,
      restaurant_id,
      image_url: imageUrl,
      ingredients: ingredients || [],
      allergens: allergens || [],
      preparation_time,
      calories,
      is_vegetarian: is_vegetarian || false,
      is_vegan: is_vegan || false,
      is_gluten_free: is_gluten_free || false,
      spice_level: spice_level || 'none',
      portion_size,
      stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity, 10) : 10,
      is_available: true,
    });

    return res.status(201).json({
      ok: true,
<<<<<<< Updated upstream
      message: 'Menu item created successfully',
=======
      message: 'Platillo creado exitosamente',
>>>>>>> Stashed changes
      menuItem,
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while creating menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all menu items
 * @route GET /api/v1/menu-items
 */
export const getAllMenuItems = async (req, res) => {
  try {
    const {
      restaurant_id,
      menu_id,
      is_available,
      is_vegetarian,
      is_vegan,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const where = { is_active: true };
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (menu_id) where.menu_id = menu_id;
    if (is_available !== undefined) where.is_available = is_available === 'true';
    if (is_vegetarian !== undefined) where.is_vegetarian = is_vegetarian === 'true';
    if (is_vegan !== undefined) where.is_vegan = is_vegan === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: menuItems } = await MenuItem.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']],
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'name'],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: 'Menu items retrieved successfully',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      menuItems,
    });
  } catch (error) {
    console.error('Error getting menu items:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get menu item by ID
 * @route GET /api/v1/menu-items/:id
 */
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'name'],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone'],
        },
      ],
    });

    if (!menuItem) {
      return res.status(404).json({
        ok: false,
        message: 'Menu item not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Menu item retrieved successfully',
      menuItem,
    });
  } catch (error) {
    console.error('Error getting menu item:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while retrieving menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update menu item
 * @route PUT /api/v1/menu-items/:id
 */
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await MenuItem.findOne({
      where: { id, is_active: true },
    });

    if (!menuItem) {
      return res.status(404).json({
        ok: false,
        message: 'Menu item not found',
      });
    }

    // Verificar duplicados si se cambia el nombre
    if (updateData.name && updateData.name !== menuItem.name) {
      const existingItem = await MenuItem.findOne({
        where: {
          name: updateData.name,
          restaurant_id: menuItem.restaurant_id,
          is_active: true,
          id: { [Op.ne]: id },
        },
      });

      if (existingItem) {
        return res.status(409).json({
          ok: false,
          message: 'A menu item with this name already exists',
        });
      }
    }

    // Manejo de imagen nueva
    if (req.file) {
      try {
        // Borrar anterior si existe
        if (menuItem.image_url) {
          await deleteImage(menuItem.image_url);
        }
        updateData.image_url = await uploadImage(req.file.path, `dish-${Date.now()}`);
      } catch (uploadError) {
        console.error('Error updating dish image:', uploadError);
      }
    }

    delete updateData.id;
    delete updateData.restaurant_id;
    delete updateData.created_at;

    await menuItem.update(updateData);
    await menuItem.reload();

    return res.status(200).json({
      ok: true,
<<<<<<< Updated upstream
      message: 'Menu item updated successfully',
=======
      message: 'Platillo actualizado exitosamente',
>>>>>>> Stashed changes
      menuItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while updating menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete menu item (soft delete)
 * @route DELETE /api/v1/menu-items/:id
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({
      where: { id, is_active: true },
    });

    if (!menuItem) {
      return res.status(404).json({
        ok: false,
        message: 'Menu item not found',
      });
    }

    // Borrar imagen de Cloudinary si existe
    if (menuItem.image_url) {
      await deleteImage(menuItem.image_url).catch(e => console.error('Error deleting dish image:', e));
    }

    // Real hard delete
    await menuItem.destroy();

    return res.status(200).json({
      ok: true,
<<<<<<< Updated upstream
      message: 'Menu item deleted successfully',
=======
      message: 'Platillo eliminado permanentemente',
>>>>>>> Stashed changes
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while deleting menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Toggle menu item availability
 * @route PATCH /api/v1/menu-items/:id/toggle
 */
export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({
      where: { id, is_active: true },
    });

    if (!menuItem) {
      return res.status(404).json({
        ok: false,
        message: 'Menu item not found',
      });
    }

    await menuItem.update({
      is_available: !menuItem.is_available,
    });

    return res.status(200).json({
      ok: true,
      message: `Menu item ${menuItem.is_available ? 'marked as available' : 'marked as unavailable'}`,
      menuItem: {
        id: menuItem.id,
        name: menuItem.name,
        is_available: menuItem.is_available,
      },
    });
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error while toggling availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};