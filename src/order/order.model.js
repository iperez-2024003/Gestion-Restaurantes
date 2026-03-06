'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { User } from '../users/user.model.js';

export const Order = sequelize.define(
  'order',
  {
    id: {
      type: DataTypes.STRING(50),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique order number (e.g., ORD-20260315-0001)',
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
      onDelete: 'RESTRICT',
      comment: 'Waiter or customer who created the order',
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Customer name for the order',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'served',
        'paid',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
    order_type: {
      type: DataTypes.ENUM('dine_in', 'takeout', 'delivery'),
      allowNull: false,
      defaultValue: 'dine_in',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Subtotal cannot be negative',
        },
      },
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Tax amount (12% IVA)',
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Discount cannot be negative',
        },
      },
    },
    tip: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Tip cannot be negative',
        },
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Total cannot be negative',
        },
      },
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'transfer', 'pending'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Special instructions or notes',
    },
    delivery_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Delivery address if order_type is delivery',
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
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
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the order was completed',
    },
  },
  {
    tableName: 'order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'idx_order_restaurant',
        fields: ['restaurant_id'],
      },
      {
        name: 'idx_order_user',
        fields: ['user_id'],
      },
      {
        name: 'idx_order_status',
        fields: ['status'],
      },
      {
        name: 'idx_order_number',
        fields: ['order_number'],
        unique: true,
      },
      {
        name: 'idx_order_created',
        fields: ['created_at'],
      },
    ],
  }
);

// Relaciones
Order.belongsTo(Restaurant, {
  foreignKey: 'restaurant_id',
  as: 'restaurant',
  onDelete: 'CASCADE',
});

Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'RESTRICT',
});

Restaurant.hasMany(Order, {
  foreignKey: 'restaurant_id',
  as: 'orders',
  onDelete: 'CASCADE',
});

User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
  onDelete: 'RESTRICT',
});

export default Order;
