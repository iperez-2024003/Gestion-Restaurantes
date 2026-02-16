'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
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
    menu_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del platillo es obligatorio',
        },
        len: {
          args: [2, 150],
          msg: 'El nombre debe tener entre 2 y 150 caracteres',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El precio debe ser mayor o igual a 0',
        },
        isDecimal: {
          msg: 'El precio debe ser un número decimal válido',
        },
      },
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida',
        },
      },
    },
    preparation_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo de preparación en minutos',
      validate: {
        min: {
          args: [0],
          msg: 'El tiempo de preparación debe ser mayor o igual a 0',
        },
      },
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Las calorías deben ser mayores o iguales a 0',
        },
      },
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Lista de ingredientes separados por comas',
    },
    allergens: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Alérgenos del platillo',
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    is_spicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    spicy_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'El nivel de picante debe estar entre 0 y 5',
        },
        max: {
          args: [5],
          msg: 'El nivel de picante debe estar entre 0 y 5',
        },
      },
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'El orden debe ser mayor o igual a 0',
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
    tableName: 'menu_item',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['menu_id'],
      },
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['is_available'],
      },
      {
        fields: ['menu_id', 'display_order'],
      },
    ],
  }
);

// Relaciones
Menu.hasMany(MenuItem, {
  foreignKey: 'menu_id',
  as: 'items',
  onDelete: 'CASCADE',
});

MenuItem.belongsTo(Menu, {
  foreignKey: 'menu_id',
  as: 'menu',
});

// Hooks
MenuItem.beforeValidate((item) => {
  if (item.name) item.name = item.name.trim();
  if (item.description) item.description = item.description.trim();
  if (item.ingredients) item.ingredients = item.ingredients.trim();
  if (item.allergens) item.allergens = item.allergens.trim();
});

MenuItem.beforeSave((item) => {
  if (!item.is_spicy) {
    item.spicy_level = 0;
  }
});

console.log('MenuItem model loaded successfully');
