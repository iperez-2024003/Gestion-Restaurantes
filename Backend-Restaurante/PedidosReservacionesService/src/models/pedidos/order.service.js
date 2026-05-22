'use strict';

import PDFDocument from 'pdfkit';
import Order from './order.model.js';
import OrderItem from './order-item.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';
import MenuItem from '../menus/menu-item.model.js';

const TAX_RATE = 0.12;

const serializeOrder = (order, items = []) => {
  if (!order) return null;
  const data = typeof order.toObject === 'function' ? order.toObject() : order;
  return {
    id: data._id?.toString?.() || data._id,
    order_number: data.order_number,
    restaurant_id: data.restaurant_id,
    user_id: data.user_id,
    customer_name: data.customer_name,
    status: data.status,
    order_type: data.order_type,
    subtotal: data.subtotal,
    tax: data.tax,
    discount: data.discount,
    tip: data.tip,
    total: data.total,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    notes: data.notes,
    delivery_address: data.delivery_address,
    delivery_fee: data.delivery_fee,
    completed_at: data.completed_at,
    items,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const serializeOrderItem = (item) => {
  if (!item) return null;
  const data = typeof item.toObject === 'function' ? item.toObject() : item;
  return {
    id: data._id?.toString?.() || data._id,
    order_id: data.order_id,
    menu_item_id: data.menu_item_id,
    quantity: data.quantity,
    unit_price: data.unit_price,
    subtotal: data.subtotal,
    special_instructions: data.special_instructions,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const validateNumberBounds = (value, min, max, fieldName) => {
  const num = Number(value);
  if (isNaN(num) || num < min || num > max) {
    throw new Error(`${fieldName} debe estar entre ${min} y ${max}`);
  }
  return num;
};

const validateObjectId = (id, fieldName = 'ID') => {
  if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error(`${fieldName} inválido`);
  }
  return id;
};

const calculateTotals = (subtotal, discount = 0, deliveryFee = 0, tip = 0) => {
  const subNum = Number(subtotal);
  const discNum = Number(discount);
  if (isNaN(subNum) || isNaN(discNum)) throw new Error('Subtotal y descuento deben ser números válidos');
  const taxableAmount = subNum - discNum;
  if (taxableAmount < 0) throw new Error('Subtotal no puede ser negativo después de descuento');
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax + Number(deliveryFee || 0) + Number(tip || 0);
  return { tax: Number(tax.toFixed(2)), total: Number(total.toFixed(2)) };
};

const generateOrderNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;
  try {
    const lastOrder = await Order.findOne({ order_number: new RegExp(`^${prefix}`) }).sort({ createdAt: -1 });
    let sequence = 1;
    if (lastOrder?.order_number) {
      const parts = lastOrder.order_number.split('-');
      const seqNum = parseInt(parts[2], 10);
      if (!isNaN(seqNum) && seqNum > 0) {
        sequence = seqNum + 1;
      }
    }
    if (sequence > 9999) throw new Error('Límite de órdenes diarias excedido');
    return `${prefix}${String(sequence).padStart(4, '0')}`;
  } catch (error) {
    if (error.message === 'Límite de órdenes diarias excedido') throw error;
    throw new Error(`Error generando número de orden: ${error.message}`);
  }
};

const loadOrderWithItems = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return null;
  const items = await OrderItem.find({ order_id: orderId });
  const enrichedItems = await Promise.allSettled(items.map(async (item) => {
    try {
      const menuItem = await MenuItem.findById(item.menu_item_id).lean();
      return {
        ...serializeOrderItem(item),
        MenuItem: menuItem ? {
          id: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price
        } : null
      };
    } catch (error) {
      console.error(`Error enriching menu item ${item.menu_item_id}:`, error.message);
      return {
        ...serializeOrderItem(item),
        MenuItem: null
      };
    }
  }));
  const items_serialized = enrichedItems
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  return serializeOrder(order, items_serialized);
};

export const createOrderRecord = async (payload) => {
  validateNumberBounds(payload.items?.length || 0, 1, 999, 'Cantidad de items');
  
  const restaurant = await Restaurant.findById(payload.restaurant_id);
  if (!restaurant || restaurant.isActive === false) {
    throw new Error('Restaurante no encontrado');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('La orden debe contener al menos un artículo');
  }

  if (payload.order_type === 'delivery' && restaurant.acceptsDelivery === false) {
    throw new Error('Este restaurante no ofrece servicio a domicilio');
  }

  if (payload.order_type === 'takeout' && restaurant.acceptsTakeout === false) {
    throw new Error('Este restaurante no ofrece para llevar');
  }

  if (payload.order_type === 'delivery') {
    const deliveryFee = payload.delivery_fee ? Number(payload.delivery_fee) : 0;
    if (isNaN(deliveryFee) || deliveryFee < 0) {
      throw new Error('Tarifa de envío debe ser un número válido y no negativo');
    }
  }

  let subtotal = 0;
  const orderItems = [];
  const decremented = [];
  
  for (const item of payload.items) {
    validateNumberBounds(item.quantity, 1, 10000, 'Cantidad por artículo');
    
    const updatedMenuItem = await MenuItem.findOneAndUpdate(
      {
        _id: item.menu_item_id,
        restaurant_id: payload.restaurant_id,
        is_active: true,
        is_available: true,
        stock_quantity: { $gte: Number(item.quantity) },
      },
      { $inc: { stock_quantity: -Number(item.quantity) } },
      { new: true }
    ).lean();

    if (!updatedMenuItem) {
      for (const d of decremented) {
        try {
          await MenuItem.findByIdAndUpdate(d.menu_item_id, { $inc: { stock_quantity: d.quantity } });
        } catch (err) {
          console.error('Rollback stock failed for', d.menu_item_id, err.message);
        }
      }
      throw new Error(`Inventario insuficiente o platillo no disponible para id ${item.menu_item_id}`);
    }

    decremented.push({ menu_item_id: String(item.menu_item_id), quantity: Number(item.quantity) });

    const itemSubtotal = Number(updatedMenuItem.price) * Number(item.quantity);
    subtotal += itemSubtotal;

    orderItems.push({
      menu_item_id: String(item.menu_item_id),
      quantity: Number(item.quantity),
      unit_price: Number(updatedMenuItem.price),
      subtotal: Number(itemSubtotal.toFixed(2)),
      special_instructions: item.special_instructions || null,
    });
  }

  const delivery_fee = payload.order_type === 'delivery' ? validateNumberBounds(payload.delivery_fee || 0, 0, 100000, 'Tarifa de envío') : 0;
  const { tax, total } = calculateTotals(subtotal, 0, delivery_fee, 0);

  const order = await Order.create({
    order_number: await generateOrderNumber(),
    restaurant_id: payload.restaurant_id,
    user_id: payload.user_id,
    customer_name: payload.customer_name,
    status: 'pending',
    order_type: payload.order_type || 'dine_in',
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    discount: 0,
    tip: 0,
    total,
    payment_method: 'pending',
    payment_status: 'pending',
    notes: payload.notes,
    delivery_address: payload.order_type === 'delivery' ? payload.delivery_address : null,
    delivery_fee,
  });

  try {
    const createdItems = await OrderItem.insertMany(orderItems.map((item) => ({ ...item, order_id: String(order._id) })));
    
    if (!createdItems || createdItems.length === 0) {
      throw new Error('Fallo al crear items de la orden');
    }
    
    const enrichedItems = await Promise.allSettled(createdItems.map(async (item) => {
      try {
        const menuItem = await MenuItem.findById(item.menu_item_id).lean();
        return {
          ...serializeOrderItem(item),
          MenuItem: menuItem ? {
            id: menuItem._id.toString(),
            name: menuItem.name,
            price: menuItem.price,
            image_url: menuItem.image_url
          } : null
        };
      } catch (error) {
        console.error(`Error enriching menu item ${item.menu_item_id}:`, error.message);
        return {
          ...serializeOrderItem(item),
          MenuItem: null
        };
      }
    }));

    const items_serialized = enrichedItems
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    return serializeOrder(order, items_serialized);
  } catch (itemError) {
    console.error('Critical: OrderItem insert failed after Order created. Rolling back stock:', itemError.message);
    await Order.findByIdAndDelete(order._id);
    for (const d of decremented) {
      try {
        await MenuItem.findByIdAndUpdate(d.menu_item_id, { $inc: { stock_quantity: d.quantity } });
      } catch (rollbackErr) {
        console.error(`Critical: Rollback failed for ${d.menu_item_id}. MANUAL INTERVENTION NEEDED.`, rollbackErr.message);
      }
    }
    throw new Error(`Fallo crítico en creación de orden. Stock ha sido restaurado. Por favor intente de nuevo.`);
  }
};

export const fetchOrders = async ({ restaurant_id, user_id, status, order_type, payment_status, page = 1, limit = 20 }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
  
  const filter = {};
  if (restaurant_id) filter.restaurant_id = restaurant_id;
  if (user_id) filter.user_id = user_id;
  if (status) filter.status = status;
  if (order_type) filter.order_type = order_type;
  if (payment_status) filter.payment_status = payment_status;

  const skip = (pageNum - 1) * limitNum;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
  const total = await Order.countDocuments(filter);
  const withItems = await Promise.allSettled(orders.map(async (order) => {
    try {
      const items = await OrderItem.find({ order_id: String(order._id) });
      const enrichedItems = await Promise.allSettled(items.map(async (item) => {
        try {
          const menuItem = await MenuItem.findById(item.menu_item_id).lean();
          return {
            ...serializeOrderItem(item),
            MenuItem: menuItem ? {
              id: menuItem._id.toString(),
              name: menuItem.name,
              price: menuItem.price,
              image_url: menuItem.image_url
            } : null
          };
        } catch (error) {
          console.error(`Error enriching menu item ${item.menu_item_id}:`, error.message);
          return {
            ...serializeOrderItem(item),
            MenuItem: null
          };
        }
      }));
      const items_serialized = enrichedItems
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
      return serializeOrder(order, items_serialized);
    } catch (error) {
      console.error(`Error fetching order ${order._id}:`, error.message);
      return serializeOrder(order, []);
    }
  }));

  const orders_serialized = withItems
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  return {
    orders: orders_serialized,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(total / limitNum),
    },
  };
};

export const fetchOrderById = async (id) => loadOrderWithItems(id);

export const updateOrderStatusRecord = async ({ id, status }) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Orden no encontrada');

  const validTransitions = {
    pending: ['confirmed', 'preparing', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served', 'cancelled'],
    served: ['paid'],
    paid: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new Error(`Cannot transition from ${order.status} to ${status}`);
  }

  const updateData = { status };
  if (status === 'paid') {
    updateData.completed_at = new Date();
    updateData.payment_status = 'paid';
  }

  const updated = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!updated) throw new Error('No se pudo actualizar la orden');
  return serializeOrder(updated, (await OrderItem.find({ order_id: String(updated._id) })).map(serializeOrderItem));
};

export const cancelOrderRecord = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Orden no encontrada');

  if (['paid', 'cancelled'].includes(order.status)) {
    throw new Error(`No se puede cancelar orden con estado: ${order.status}`);
  }

  const items = await OrderItem.find({ order_id: String(order._id) });
  
  try {
    for (const item of items) {
      const updateResult = await MenuItem.findByIdAndUpdate(
        item.menu_item_id,
        { $inc: { stock_quantity: Number(item.quantity) } },
        { new: true }
      );
      if (!updateResult) {
        throw new Error(`No se encontró item para restaurar stock: ${item.menu_item_id}`);
      }
    }
  } catch (stockError) {
    console.error('Error restaurando stock en cancelación:', stockError.message);
    throw new Error(`Error al restaurar stock: ${stockError.message}`);
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { status: 'cancelled', cancelled_at: new Date() },
    { new: true, runValidators: true }
  );
  
  if (!updated) throw new Error('No se pudo cancelar la orden');
  return serializeOrder(updated, items.map(serializeOrderItem));
};

export const addItemToOrderRecord = async ({ orderId, menu_item_id, quantity, special_instructions }) => {
  validateNumberBounds(quantity, 1, 10000, 'Cantidad del artículo');
  
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Orden no encontrada');
  if (!['pending', 'confirmed'].includes(order.status)) throw new Error('Cannot add items to order in current status');

  const updatedMenuItem = await MenuItem.findOneAndUpdate(
    { _id: menu_item_id, restaurant_id: order.restaurant_id, is_active: true, is_available: true, stock_quantity: { $gte: Number(quantity) } },
    { $inc: { stock_quantity: -Number(quantity) } },
    { new: true }
  ).lean();

  if (!updatedMenuItem) throw new Error('Inventario insuficiente o platillo no disponible');

  const itemSubtotal = Number(updatedMenuItem.price) * Number(quantity);
  const orderItem = await OrderItem.create({
    order_id: String(order._id),
    menu_item_id: String(menu_item_id),
    quantity: Number(quantity),
    unit_price: Number(updatedMenuItem.price),
    subtotal: Number(itemSubtotal.toFixed(2)),
    special_instructions,
  });

  const newSubtotal = Number(order.subtotal) + itemSubtotal;
  const { tax, total } = calculateTotals(newSubtotal, Number(order.discount), Number(order.delivery_fee), Number(order.tip));
  const updateResult = await Order.findByIdAndUpdate(orderId, { subtotal: newSubtotal, tax, total }, { new: true });
  if (!updateResult) throw new Error('No se pudo actualizar totales de la orden');

  return serializeOrderItem(orderItem);
};

export const removeItemFromOrderRecord = async ({ orderId, itemId }) => {
  validateObjectId(orderId, 'orderId');
  validateObjectId(itemId, 'itemId');
  
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Orden no encontrada');
  if (!['pending', 'confirmed'].includes(order.status)) throw new Error('Cannot remove items from order in current status');

  const orderItem = await OrderItem.findOne({ _id: itemId, order_id: String(order._id) });
  if (!orderItem) throw new Error('Item no encontrado en la orden');
  if (!orderItem.menu_item_id || orderItem.quantity == null || orderItem.subtotal == null) {
    throw new Error('Item corrupto: falta menu_item_id, quantity o subtotal');
  }

  // Restaurar stock atómicamente
  const stockUpdateResult = await MenuItem.findByIdAndUpdate(orderItem.menu_item_id, { $inc: { stock_quantity: Number(orderItem.quantity) } }, { new: true });
  if (!stockUpdateResult) throw new Error('No se pudo restaurar el inventario');

  await OrderItem.findByIdAndDelete(itemId);
  const newSubtotal = Math.max(0, Number(order.subtotal) - Number(orderItem.subtotal));
  const { tax, total } = calculateTotals(newSubtotal, Number(order.discount), Number(order.delivery_fee), Number(order.tip));
  const updateResult = await Order.findByIdAndUpdate(orderId, { subtotal: newSubtotal, tax, total }, { new: true });
  if (!updateResult) throw new Error('No se pudo actualizar totales de la orden');
  
  return true;
};

export const fetchKitchenOrders = async (restaurantId) => {
  validateObjectId(restaurantId, 'restaurantId');
  
  const orders = await Order.find({ 
    restaurant_id: restaurantId, 
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
  }).sort({ createdAt: 1 });

  const withItems = await Promise.allSettled(orders.map(async (order) => {
    const items = await OrderItem.find({ order_id: String(order._id) });
    const enrichedItems = await Promise.allSettled(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menu_item_id).lean();
      return {
        ...serializeOrderItem(item),
        MenuItem: menuItem ? {
          id: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price
        } : null
      };
    }));
    const validItems = enrichedItems
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    if (enrichedItems.length > 0 && validItems.length === 0) {
      console.warn(`All menu items failed to enrich for order ${order._id}`);
    }
    return serializeOrder(order, validItems);
  }));
  
  const result = withItems
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  if (withItems.length > 0 && result.length === 0) {
    console.warn(`All orders failed to fetch for restaurant ${restaurantId}`);
  }
  
  return result;
};

export const buildOrderPdf = async (orderId) => {
  const order = await fetchOrderById(orderId);
  if (!order) throw new Error('Orden no encontrada');

  const restaurant = await Restaurant.findById(order.restaurant_id);
  const doc = new PDFDocument({ margin: 50 });

  return { doc, order, restaurant: restaurant ? (restaurant.toObject ? restaurant.toObject() : restaurant) : null };
};
