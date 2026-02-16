'use strict';

import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} from './restaurant.controller.js';
import {
  createRestaurantValidation,
  updateRestaurantValidation,
  uuidParamValidation,
} from './restaurant.validation.js';

const router = express.Router();

router.post('/', createRestaurantValidation, createRestaurant);
router.get('/', getAllRestaurants);
router.get('/:id', uuidParamValidation, getRestaurantById);
router.put('/:id', updateRestaurantValidation, updateRestaurant);
router.delete('/:id', uuidParamValidation, deleteRestaurant);

export default router;