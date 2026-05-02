'use strict';

import { Router } from 'express';
import { sendOrderInvoice, getDailyReport, downloadDailyExcelReport } from './report.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
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

/**
 * @route GET /api/v1/reports/daily-excel/:restaurantId
 * @desc Descarga reporte diario en Excel
 * @access Private
 */
router.get('/daily-excel/:restaurantId', [validateJWT, requireRestaurantAdmin], downloadDailyExcelReport);

export default router;
