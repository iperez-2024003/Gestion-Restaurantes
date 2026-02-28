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
import { requireAdmin } from '../../middlewares/require-role.js';
import {
  validateOrderCreation,
  validateAddItem,
} from './order.validation.js';

const router = Router();

/** Rutas para usuario autenticado (USER_ROLE puede crear/ver/cancelar sus pedidos) */
router.post('/', [validateJWT, validateOrderCreation], createOrder);
router.get('/', validateJWT, getAllOrders);
router.get('/:id', validateJWT, getOrderById);
router.delete('/:id', validateJWT, cancelOrder);
router.post('/:id/items', [validateJWT, validateAddItem], addItemToOrder);
router.delete('/:id/items/:itemId', validateJWT, removeItemFromOrder);

/** Solo ADMIN_ROLE puede actualizar estado del pedido */
router.patch('/:id/status', [validateJWT, requireAdmin], updateOrderStatus);

export default router;