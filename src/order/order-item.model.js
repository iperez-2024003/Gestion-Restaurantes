'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { Order } from './order.model.js';
import { MenuItem } from '../menu/menu-item.model.js';

export const OrderItem = sequelize.define(
  'order_item',
  {
    id: {
      type: DataTypes.STRING(50),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'order',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    menu_item_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'menu_item',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Quantity must be at least 1',
        },
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price at the time of order',
      validate: {
        min: {
          args: [0],
          msg: 'Unit price cannot be negative',
        },
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'quantity * unit_price',
      validate: {
        min: {
          args: [0],
          msg: 'Subtotal cannot be negative',
        },
      },
    },
    special_instructions: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Special preparation instructions',
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served'),
      allowNull: false,
      defaultValue: 'pending',
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
    tableName: 'order_item',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'idx_order_item_order',
        fields: ['order_id'],
      },
      {
        name: 'idx_order_item_menu_item',
        fields: ['menu_item_id'],
      },
    ],
  }
);

// Relaciones
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(MenuItem, {
  foreignKey: 'menu_item_id',
  as: 'menu_item',
  onDelete: 'RESTRICT',
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
  onDelete: 'CASCADE',
});

MenuItem.hasMany(OrderItem, {
  foreignKey: 'menu_item_id',
  as: 'order_items',
  onDelete: 'RESTRICT',
});

export default OrderItem;
