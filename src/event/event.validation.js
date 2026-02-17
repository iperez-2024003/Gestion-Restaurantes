'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { Menu } from './menu.model.js';

export const MenuItem = sequelize.define(
  'menu_item',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Menu item name cannot be empty',
        },
        len: {
          args: [2, 150],
          msg: 'Menu item name must be between 2 and 150 characters',
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price must be greater than or equal to 0',
        },
        isDecimal: {
          msg: 'Price must be a valid decimal number',
        },
      },
    },
    menu_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Image URL must be a valid URL',
        },
      },
    },
    ingredients: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of ingredients',
    },
    allergens: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of allergens (gluten, nuts, dairy, etc.)',
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Item availability status',
    },
    preparation_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Preparation time must be at least 1 minute',
        },
        max: {
          args: [180],
          msg: 'Preparation time cannot exceed 180 minutes',
        },
      },
      comment: 'Preparation time in minutes',
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Calories cannot be negative',
        },
      },
    },
    is_vegetarian: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_vegan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_gluten_free: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    spice_level: {
      type: DataTypes.ENUM('none', 'mild', 'medium', 'hot', 'extra_hot'),
      allowNull: false,
      defaultValue: 'none',
    },
    portion_size: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Portion size description (e.g., "Individual", "For 2 people")',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete flag',
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
    tableName: 'menu_item',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'idx_menu_item_menu',
        fields: ['menu_id'],
      },
      {
        name: 'idx_menu_item_restaurant',
        fields: ['restaurant_id'],
      },
      {
        name: 'idx_menu_item_available',
        fields: ['is_available'],
      },
      {
        name: 'idx_menu_item_active',
        fields: ['is_active'],
      },
    ],
  }
);

// Relaciones
MenuItem.belongsTo(Menu, {
  foreignKey: 'menu_id',
  as: 'menu',
  onDelete: 'CASCADE',
});

MenuItem.belongsTo(Restaurant, {
  foreignKey: 'restaurant_id',
  as: 'restaurant',
  onDelete: 'CASCADE',
});

Menu.hasMany(MenuItem, {
  foreignKey: 'menu_id',
  as: 'items',
  onDelete: 'CASCADE',
});

Restaurant.hasMany(MenuItem, {
  foreignKey: 'restaurant_id',
  as: 'menu_items',
  onDelete: 'CASCADE',
});

export default MenuItem;