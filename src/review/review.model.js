'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { User } from '../users/user.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';

export const Review = sequelize.define(
    'review',
    {
        id: {
            type: DataTypes.STRING(50),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        restaurant_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'restaurant',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: DataTypes.STRING(16),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [1],
                    msg: 'Rating must be at least 1.',
                },
                max: {
                    args: [5],
                    msg: 'Rating cannot exceed 5.',
                },
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 1000],
                    msg: 'Comment cannot exceed 1000 characters.',
                },
            },
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'reviews',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

// Define Relationships
Review.belongsTo(Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant',
    onDelete: 'CASCADE',
});

Restaurant.hasMany(Review, {
    foreignKey: 'restaurant_id',
    as: 'reviews',
    onDelete: 'CASCADE',
});

Review.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
});

User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews',
    onDelete: 'CASCADE',
});

export default Review;
