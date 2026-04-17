'use strict';

import { Order } from './order.model.js';
import { OrderItem } from './order-item.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { MenuItem } from '../menu/menu-item.model.js';
import { User } from '../users/user.model.js';
import { sequelize } from '../../configs/db.js';
import { getIo } from '../socket/socket.config.js';
import { Op } from 'sequelize';

const TAX_RATE = 0.12; // 12% IVA

/**
 * Generate unique order number
 */
const generateOrderNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastOrder = await Order.findOne({
    where: {
      order_number: {
        [Op.like]: `ORD-${dateStr}-%`,
      },
    },
    order: [['created_at', 'DESC']],
  });

  let sequence = 1;
  if (lastOrder) {
    const lastNumber = lastOrder.order_number.split('-')[2];
    sequence = parseInt(lastNumber) + 1;
  }

  return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Calculate order totals
 */
const calculateTotals = (subtotal, discount = 0, deliveryFee = 0, tip = 0) => {
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax + deliveryFee + tip;
  
  return {
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Create order
 * @route POST /api/v1/orders
 */
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      restaurant_id,
      user_id,
      customer_name,
      order_type,
      items,
      notes,
      delivery_address,
      delivery_fee,
    } = req.body;

    // Verificar restaurante
    const restaurant = await Restaurant.findByPk(restaurant_id, { transaction });
    if (!restaurant || !restaurant.is_active) {
      await transaction.rollback();
      return res.status(404).json({
        ok: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Verificar usuario
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    // Validar items
    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        ok: false,
        message: 'La orden debe contener al menos un artículo',
      });
    }

    // Validar delivery
    if (order_type === 'delivery') {
      if (!restaurant.accepts_delivery) {
        await transaction.rollback();
        return res.status(400).json({
          ok: false,
          message: 'Este restaurante no ofrece servicio a domicilio',
        });
      }
      if (!delivery_address) {
        await transaction.rollback();
        return res.status(400).json({
          ok: false,
          message: 'Se requiere dirección de entrega',
        });
      }
    }

    // Validar takeout
    if (order_type === 'takeout' && !restaurant.accepts_takeout) {
      await transaction.rollback();
      return res.status(400).json({
        ok: false,
        message: 'Este restaurante no ofrece para llevar',
      });
    }

    // Generar número de orden
    const order_number = await generateOrderNumber();

    // Calcular subtotal verificando items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        where: {
          id: item.menu_item_id,
          restaurant_id,
          is_active: true,
        },
        transaction
      });

      if (!menuItem) {
        await transaction.rollback();
        return res.status(404).json({
          ok: false,
          message: `Menu item ${item.menu_item_id} not found or not available`,
        });
      }

      if (!menuItem.is_available) {
        await transaction.rollback();
        return res.status(400).json({
          ok: false,
          message: `Menu item "${menuItem.name}" no está disponible actualmente`,
        });
      }

      if (menuItem.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          ok: false,
          message: `Inventario insuficiente para "${menuItem.name}". Solo quedan ${menuItem.stock_quantity} en stock.`,
        });
      }

      // Descontar inventario
      menuItem.stock_quantity -= item.quantity;
      await menuItem.save({ transaction });

      const itemSubtotal = parseFloat(menuItem.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: parseFloat(menuItem.price),
        subtotal: itemSubtotal,
        special_instructions: item.special_instructions || null,
      });
    }

    // Calcular totales
    const { tax, total } = calculateTotals(
      subtotal,
      0,
      delivery_fee || 0,
      0
    );

    // Crear orden
    const order = await Order.create({
      order_number,
      restaurant_id,
      user_id,
      customer_name,
      status: 'pending',
      order_type: order_type || 'dine_in',
      subtotal,
      tax,
      discount: 0,
      tip: 0,
      total,
      payment_method: 'pending',
      payment_status: 'pending',
      notes,
      delivery_address: order_type === 'delivery' ? delivery_address : null,
      delivery_fee: order_type === 'delivery' ? (delivery_fee || 0) : 0,
    }, { transaction });

    // Crear items de la orden
    const itemsToCreate = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItem.bulkCreate(itemsToCreate, { transaction });

    await transaction.commit();

    // Obtener orden completa con items para retornar
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: MenuItem,
              as: 'menu_item',
              attributes: ['id', 'name', 'description'],
            },
          ],
        },
      ],
    });

    // Emitir socket event de nueva orden para la sucursal
    try {
      const io = getIo();
      io.to(`restaurant_${restaurant_id}`).emit('new_order', completeOrder);
    } catch (socketErr) {
      console.warn('Socket notification failed, but order was created:', socketErr);
    }

    return res.status(201).json({
      ok: true,
      message: 'Orden creada exitosamente (inventory deducted)',
      order: completeOrder,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error creating order:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear la orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all orders
 * @route GET /api/v1/orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const {
      restaurant_id,
      user_id,
      status,
      order_type,
      payment_status,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    if (order_type) where.order_type = order_type;
    if (payment_status) where.payment_status = payment_status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: MenuItem,
              as: 'menu_item',
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: 'Órdenes obtenidas exitosamente',
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
      orders,
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get order by ID
 * @route GET /api/v1/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: MenuItem,
              as: 'menu_item',
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Orden no encontrada',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Orden obtenida exitosamente',
      order,
    });
  } catch (error) {
    console.error('Error getting order:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while retrieving order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update order status
 * @route PATCH /api/v1/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Orden no encontrada',
      });
    }

    // Validar transiciones de estado
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served'],
      served: ['paid'],
      paid: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    const updateData = { status };

    if (status === 'paid') {
      updateData.completed_at = new Date();
      updateData.payment_status = 'paid';
    }

    await order.update(updateData);

    return res.status(200).json({
      ok: true,
      message: `Order status updated to ${status}`,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Cancel order
 * @route DELETE /api/v1/orders/:id
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Orden no encontrada',
      });
    }

    if (['paid', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        ok: false,
        message: `No se puede cancelar orden con estado: ${order.status}`,
      });
    }

    const transaction = await sequelize.transaction();
    try {
      await order.update({ status: 'cancelled' }, { transaction });

      // Return stock to inventory
      for (const item of order.items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id, { transaction });
        if (menuItem) {
          menuItem.stock_quantity += item.quantity;
          await menuItem.save({ transaction });
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    return res.status(200).json({
      ok: true,
      message: 'Orden cancelada exitosamente and stock returned',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Add item to order
 * @route POST /api/v1/orders/:id/items
 */
export const addItemToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_item_id, quantity, special_instructions } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Orden no encontrada',
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        ok: false,
        message: 'Cannot add items to order in current status',
      });
    }

    // Verificar menu item
    const menuItem = await MenuItem.findOne({
      where: {
        id: menu_item_id,
        restaurant_id: order.restaurant_id,
        is_active: true,
        is_available: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({
        ok: false,
        message: 'Platillo no encontrado o no disponible',
      });
    }

    const itemSubtotal = parseFloat(menuItem.price) * quantity;

    // Crear item
    const orderItem = await OrderItem.create({
      order_id: id,
      menu_item_id,
      quantity,
      unit_price: parseFloat(menuItem.price),
      subtotal: itemSubtotal,
      special_instructions,
    });

    // Recalcular totales
    const newSubtotal = parseFloat(order.subtotal) + itemSubtotal;
    const { tax, total } = calculateTotals(
      newSubtotal,
      parseFloat(order.discount),
      parseFloat(order.delivery_fee),
      parseFloat(order.tip)
    );

    await order.update({
      subtotal: newSubtotal,
      tax,
      total,
    });

    return res.status(201).json({
      ok: true,
      message: 'Item added to order successfully',
      orderItem,
    });
  } catch (error) {
    console.error('Error adding item to order:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while adding item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Remove item from order
 * @route DELETE /api/v1/orders/:id/items/:itemId
 */
export const removeItemFromOrder = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Orden no encontrada',
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        ok: false,
        message: 'Cannot remove items from order in current status',
      });
    }

    const orderItem = await OrderItem.findOne({
      where: { id: itemId, order_id: id },
    });

    if (!orderItem) {
      return res.status(404).json({
        ok: false,
        message: 'Order No encontrado',
      });
    }

    const itemSubtotal = parseFloat(orderItem.subtotal);

    await orderItem.destroy();

    // Recalcular totales
    const newSubtotal = parseFloat(order.subtotal) - itemSubtotal;
    const { tax, total } = calculateTotals(
      newSubtotal,
      parseFloat(order.discount),
      parseFloat(order.delivery_fee),
      parseFloat(order.tip)
    );

    await order.update({
      subtotal: newSubtotal,
      tax,
      total,
    });

    return res.status(200).json({
      ok: true,
      message: 'Item removed from order successfully',
    });
  } catch (error) {
    console.error('Error removing item from order:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor while removing item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};