'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { User } from '../users/user.model.js';

export const Restaurant = sequelize.define(
  'restaurant',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Restaurant name cannot be empty',
        },
        len: {
          args: [3, 100],
          msg: 'Restaurant name must be between 3 and 100 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Description cannot exceed 1000 characters',
        },
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Address is required',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Phone number is required',
        },
        is: {
          args: /^[\d\s\-\+\(\)]+$/,
          msg: 'Invalid phone number format',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    category: {
      type: DataTypes.ENUM(
        'casual',
        'fine_dining',
        'fast_food',
        'cafe',
        'bakery',
        'bar',
        'food_truck',
        'buffet',
        'family_style',
        'gourmet',
        'other'
      ),
      allowNull: false,
      defaultValue: 'casual',
      validate: {
        isIn: {
          args: [[
            'casual',
            'fine_dining',
            'fast_food',
            'cafe',
            'bakery',
            'bar',
            'food_truck',
            'buffet',
            'family_style',
            'gourmet',
            'other',
          ]],
          msg: 'Invalid restaurant category',
        },
      },
    },
    cuisine_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of cuisine offered (e.g., Italian, Mexican, Asian)',
    },
    price_range: {
      type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'),
      allowNull: false,
      defaultValue: '$$',
      comment: '$ = Budget, $$ = Moderate, $$$ = Expensive, $$$$ = Very Expensive',
    },
    average_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Average price must be positive',
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: {
          args: [1],
          msg: 'Capacity must be at least 1',
        },
      },
    },
    opening_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '08:00:00',
      validate: {
        notEmpty: {
          msg: 'Opening time is required',
        },
      },
    },
    closing_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '22:00:00',
      validate: {
        notEmpty: {
          msg: 'Closing time is required',
        },
      },
    },
    operating_days: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      comment: 'Array of days when restaurant is open',
      validate: {
        isValidDays(value) {
          const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          if (!Array.isArray(value)) {
            throw new Error('Operating days must be an array');
          }
          if (value.length === 0) {
            throw new Error('At least one operating day is required');
          }
          const invalidDays = value.filter((day) => !validDays.includes(day.toLowerCase()));
          if (invalidDays.length > 0) {
            throw new Error(`Invalid operating days: ${invalidDays.join(', ')}`);
          }
        },
      },
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Logo URL must be a valid URL',
        },
      },
    },
    cover_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Cover image URL must be a valid URL',
        },
      },
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: {
          args: [0],
          msg: 'Rating cannot be negative',
        },
        max: {
          args: [5],
          msg: 'Rating cannot exceed 5.0',
        },
      },
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total reviews cannot be negative',
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete flag',
    },
    accepts_reservations: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    accepts_takeout: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    accepts_delivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    parking_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    wifi_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    outdoor_seating: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pet_friendly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    wheelchair_accessible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: {
          args: [-90],
          msg: 'Latitude must be between -90 and 90',
        },
        max: {
          args: [90],
          msg: 'Latitude must be between -90 and 90',
        },
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: {
          args: [-180],
          msg: 'Longitude must be between -180 and 180',
        },
        max: {
          args: [180],
          msg: 'Longitude must be between -180 and 180',
        },
      },
    },
    website_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Website URL must be a valid URL',
        },
      },
    },
    social_media: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Social media links (facebook, instagram, twitter, etc.)',
    },
    payment_methods: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['cash', 'credit_card', 'debit_card'],
      comment: 'Accepted payment methods',
    },
    special_features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of special features (live_music, valet_parking, etc.)',
    },
    admin_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Restaurant administrator user ID',
    },
    parent_restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'restaurant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Parent restaurant ID for chain/branch management',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Platform verification status',
    },
    verification_date: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'restaurant',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'idx_restaurant_name',
        fields: ['name'],
      },
      {
        name: 'idx_restaurant_category',
        fields: ['category'],
      },
      {
        name: 'idx_restaurant_admin',
        fields: ['admin_id'],
      },
      {
        name: 'idx_restaurant_active',
        fields: ['is_active'],
      },
      {
        name: 'idx_restaurant_location',
        fields: ['latitude', 'longitude'],
      },
    ],
  }
);

// Define relationships
Restaurant.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'administrator',
  onDelete: 'RESTRICT',
});

Restaurant.belongsTo(Restaurant, {
  foreignKey: 'parent_restaurant_id',
  as: 'parent_restaurant',
  onDelete: 'SET NULL',
});

Restaurant.hasMany(Restaurant, {
  foreignKey: 'parent_restaurant_id',
  as: 'branches',
  onDelete: 'SET NULL',
});

// Instance methods
Restaurant.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Remove sensitive fields if needed
  return values;
};

// Class methods
Restaurant.findActiveRestaurants = async function (options = {}) {
  return await this.findAll({
    where: { is_active: true, ...options.where },
    ...options,
  });
};

Restaurant.findByCategory = async function (category, options = {}) {
  return await this.findAll({
    where: { category, is_active: true, ...options.where },
    ...options,
  });
};

Restaurant.findByAdmin = async function (adminId, options = {}) {
  return await this.findAll({
    where: { admin_id: adminId, ...options.where },
    ...options,
  });
};

export default Restaurant;