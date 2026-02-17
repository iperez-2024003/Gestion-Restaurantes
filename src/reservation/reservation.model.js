'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { User } from '../users/user.model.js';

export const Reservation = sequelize.define(
  'reservation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    reservation_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique reservation number (e.g., RES-20260315-0001)',
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who made the reservation (nullable for guest reservations)',
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Customer name is required',
        },
        len: {
          args: [2, 150],
          msg: 'Customer name must be between 2 and 150 characters',
        },
      },
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Customer phone is required',
        },
      },
    },
    customer_email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    reservation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reservation date is required',
        },
        isDate: {
          msg: 'Must be a valid date',
        },
      },
    },
    reservation_time: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reservation time is required',
        },
      },
    },
    party_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Party size must be at least 1',
        },
        max: {
          args: [20],
          msg: 'Party size cannot exceed 20',
        },
      },
      comment: 'Number of people',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'seated',
        'completed',
        'cancelled',
        'no_show'
      ),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']],
          msg: 'Invalid reservation status',
        },
      },
    },
    special_requests: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Special requests cannot exceed 1000 characters',
        },
      },
    },
    table_preference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Preferred table location (window, terrace, private, etc.)',
    },
    occasion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Special occasion (birthday, anniversary, business, etc.)',
    },
    confirmation_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether confirmation email/SMS was sent',
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether reminder was sent',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal notes for restaurant staff',
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
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the reservation was confirmed',
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the reservation was cancelled',
    },
  },
  {
    tableName: 'reservation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'idx_reservation_restaurant',
        fields: ['restaurant_id'],
      },
      {
        name: 'idx_reservation_user',
        fields: ['user_id'],
      },
      {
        name: 'idx_reservation_date',
        fields: ['reservation_date'],
      },
      {
        name: 'idx_reservation_status',
        fields: ['status'],
      },
      {
        name: 'idx_reservation_number',
        fields: ['reservation_number'],
        unique: true,
      },
      {
        name: 'idx_reservation_datetime',
        fields: ['reservation_date', 'reservation_time'],
      },
    ],
  }
);

// Relaciones
Reservation.belongsTo(Restaurant, {
  foreignKey: 'restaurant_id',
  as: 'restaurant',
  onDelete: 'CASCADE',
});

Reservation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'SET NULL',
});

Restaurant.hasMany(Reservation, {
  foreignKey: 'restaurant_id',
  as: 'reservations',
  onDelete: 'CASCADE',
});

User.hasMany(Reservation, {
  foreignKey: 'user_id',
  as: 'reservations',
  onDelete: 'SET NULL',
});

export default Reservation;