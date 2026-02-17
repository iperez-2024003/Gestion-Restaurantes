'use strict';

import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addItemToOrder,
  removeItemFromOrder,
} from './order.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  validateOrderCreation,
  validateAddItem,
} from './order.validation.js';

const router = Router();

/**
 * All routes require authentication
 */

// Create order
router.post('/', [validateJWT, validateOrderCreation], createOrder);

// Get all orders
router.get('/', validateJWT, getAllOrders);

// Get order by ID
router.get('/:id', validateJWT, getOrderById);

// Update order status
router.patch('/:id/status', validateJWT, updateOrderStatus);

// Cancel order
router.delete('/:id', validateJWT, cancelOrder);

// Add item to order
router.post('/:id/items', [validateJWT, validateAddItem], addItemToOrder);

// Remove item from order
router.delete('/:id/items/:itemId', validateJWT, removeItemFromOrder);

export default router;