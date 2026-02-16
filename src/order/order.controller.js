'use strict';

import { Order } from './order.model.js';
import { OrderItem } from './order-item.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { MenuItem } from '../menu/menu-item.model.js';
import { User } from '../users/user.model.js';
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
        const restaurant = await Restaurant.findByPk(restaurant_id);
        if (!restaurant || !restaurant.is_active) {
            return res.status(404).json({
                ok: false,
                message: 'Restaurant not found',
            });
        }

        // Verificar usuario
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'User not found',
            });
        }

        // Validar items
        if (!items || items.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Order must contain at least one item',
            });
        }

        // Validar delivery
        if (order_type === 'delivery') {
            if (!restaurant.accepts_delivery) {
                return res.status(400).json({
                    ok: false,
                    message: 'This restaurant does not offer delivery',
                });
            }
            if (!delivery_address) {
                return res.status(400).json({
                    ok: false,
                    message: 'Delivery address is required for delivery orders',
                });
            }
        }

        // Validar takeout
        if (order_type === 'takeout' && !restaurant.accepts_takeout) {
            return res.status(400).json({
                ok: false,
                message: 'This restaurant does not offer takeout',
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
            });

            if (!menuItem) {
                return res.status(404).json({
                    ok: false,
                    message: `Menu item ${item.menu_item_id} not found or not available`,
                });
            }

            if (!menuItem.is_available) {
                return res.status(400).json({
                    ok: false,
                    message: `Menu item "${menuItem.name}" is currently unavailable`,
                });
            }

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
        });

        // Crear items de la orden
        const itemsToCreate = orderItems.map((item) => ({
            ...item,
            order_id: order.id,
        }));

        await OrderItem.bulkCreate(itemsToCreate);

        // Obtener orden completa con items
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

        return res.status(201).json({
            ok: true,
            message: 'Order created successfully',
            order: completeOrder,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            ok: false,
            message: 'Internal server error while creating order',
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
            message: 'Orders retrieved successfully',
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
            message: 'Internal server error while retrieving orders',
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
                message: 'Order not found',
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Order retrieved successfully',
            order,
        });
    } catch (error) {
        console.error('Error getting order:', error);
        return res.status(500).json({
            ok: false,
            message: 'Internal server error while retrieving order',
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
                message: 'Order not found',
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
            message: 'Internal server error while updating order status',
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

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                ok: false,
                message: 'Order not found',
            });
        }

        if (['paid', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                ok: false,
                message: `Cannot cancel order with status: ${order.status}`,
            });
        }

        await order.update({ status: 'cancelled' });

        return res.status(200).json({
            ok: true,
            message: 'Order cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({
            ok: false,
            message: 'Internal server error while cancelling order',
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
                message: 'Order not found',
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
                message: 'Menu item not found or not available',
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
            message: 'Internal server error while adding item',
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
                message: 'Order not found',
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
                message: 'Order item not found',
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
            message: 'Internal server error while removing item',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};