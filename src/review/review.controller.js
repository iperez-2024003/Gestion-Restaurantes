'use strict';

import { Review } from './review.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { User, UserProfile } from '../users/user.model.js';
import { SUPER_ADMIN_ROLE } from '../../helpers/role-constants.js';
import { getRequestUserRoleNames } from '../../middlewares/require-role.js';

/**
 * Creates a new review
 */
export const createReview = async (req, res) => {
    try {
        const { restaurant_id, rating, comment } = req.body;
        const user_id = req.userId;

        // Verify restaurant exists
        const restaurant = await Restaurant.findByPk(restaurant_id);
        if (!restaurant) {
            return res.status(404).json({
                ok: false,
                message: 'Restaurante no encontrado',
            });
        }

        // Check if user already reviewed this restaurant
        const existingReview = await Review.findOne({
            where: {
                restaurant_id,
                user_id,
            },
        });

        if (existingReview) {
            return res.status(400).json({
                ok: false,
                message: 'You have already reviewed this restaurant.',
            });
        }

        const review = await Review.create({
            restaurant_id,
            user_id,
            rating,
            comment,
        });

        // Update restaurant average rating
        await updateRestaurantRating(restaurant_id);

        return res.status(201).json({
            ok: true,
            message: 'Creado exitosamente',
            review,
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error creating review',
            error: error.message,
        });
    }
};

/**
 * Let's get all reviews for a specific restaurant
 */
export const getRestaurantReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        const reviews = await Review.findAndCountAll({
            where: { restaurant_id: restaurantId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['Id', 'Name', 'Surname'],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        return res.status(200).json({
            ok: true,
            total: reviews.count,
            reviews: reviews.rows,
        });
    } catch (error) {
        console.error('Error getting reviews:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error getting reviews',
            error: error.message,
        });
    }
};

/**
 * Updates a review
 */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.userId;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                ok: false,
                message: 'No encontrado',
            });
        }

        // Solo quedan the author can update the review
        if (review.user_id !== user_id) {
            return res.status(403).json({
                ok: false,
                message: 'You can only edit your own reviews',
            });
        }

        review.rating = rating !== undefined ? rating : review.rating;
        review.comment = comment !== undefined ? comment : review.comment;
        await review.save();

        // Update restaurant average rating
        await updateRestaurantRating(review.restaurant_id);

        return res.status(200).json({
            ok: true,
            message: 'Actualizado exitosamente',
            review,
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error updating review',
            error: error.message,
        });
    }
};

/**
 * Deletes a review
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                ok: false,
                message: 'No encontrado',
            });
        }

        // Allow deleting if author OR if super admin
        const roles = await getRequestUserRoleNames(req);
        const isSuperAdmin = roles.includes(SUPER_ADMIN_ROLE);

        if (review.user_id !== user_id && !isSuperAdmin) {
            return res.status(403).json({
                ok: false,
                message: 'You do not have permission to delete this review',
            });
        }

        const restaurant_id = review.restaurant_id;
        await review.destroy();

        // Update restaurant average rating
        await updateRestaurantRating(restaurant_id);

        return res.status(200).json({
            ok: true,
            message: 'Eliminado exitosamente',
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error deleting review',
            error: error.message,
        });
    }
};

/**
 * Helper: Updates restaurant overall rating
 */
const updateRestaurantRating = async (restaurantId) => {
    const result = await Review.findAll({
        where: { restaurant_id: restaurantId },
        attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            [sequelize.fn('COUNT', sequelize.col('rating')), 'totalReviews'],
        ],
        raw: true,
    });

    if (result && result.length > 0) {
        const stats = result[0];
        const newRating = stats.averageRating ? parseFloat(stats.averageRating).toFixed(2) : 0;
        const newTotal = stats.totalReviews ? parseInt(stats.totalReviews, 10) : 0;

        await Restaurant.update(
            { rating: newRating, total_reviews: newTotal },
            { where: { id: restaurantId } }
        );
    }
};
