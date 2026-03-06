'use strict';

import { Router } from 'express';
import { sendOrderInvoice, getDailyReport } from './report.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { requireAdmin, requireRestaurantAdmin, requireClient } from '../../middlewares/require-role.js';

const router = Router();

/**
 * @route POST /api/v1/reports/send-invoice/:orderId
 * @desc Envía la factura de la orden al correo del cliente
 * @access Private (Client o Admin)
 */
router.post('/send-invoice/:orderId', [validateJWT], sendOrderInvoice);

/**
 * @route GET /api/v1/reports/daily-summary/:restaurantId
 * @desc Genera reporte diario (Solo Restaurant Admin o Super Admin)
 * @access Private
 */
router.get('/daily-summary/:restaurantId', [validateJWT, requireRestaurantAdmin], getDailyReport);

export default router;
