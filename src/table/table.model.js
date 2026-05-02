'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { Restaurant } from '../restaurant/restaurant.model.js';

export const Table = sequelize.define(
  'table',
  {
    id: {
      type: DataTypes.STRING(50),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Table number must be at least 1' },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Capacity must be at least 1' },
        max: { args: [20], msg: 'Capacity cannot exceed 20' },
      },
    },
    location: {
      type: DataTypes.ENUM('interior', 'terrace', 'vip', 'bar', 'window', 'private'),
      allowNull: false,
      defaultValue: 'interior',
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning'),
      allowNull: false,
      defaultValue: 'available',
    },
    restaurant_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: { model: 'restaurant', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'table',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      { name: 'idx_table_restaurant', fields: ['restaurant_id'] },
      { name: 'idx_table_status', fields: ['status'] },
      { name: 'idx_table_number_restaurant', fields: ['table_number', 'restaurant_id'], unique: true },
    ],
  }
);

Table.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant', onDelete: 'CASCADE' });
Restaurant.hasMany(Table, { foreignKey: 'restaurant_id', as: 'tables', onDelete: 'CASCADE' });

export default Table;
