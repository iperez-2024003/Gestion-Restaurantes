'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';

export const Menu = sequelize.define(
  'menu',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la categoría es obligatorio',
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nombre del icono para la categoría',
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
    tableName: 'menu',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['restaurant_id', 'display_order'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

Menu.beforeValidate((menu) => {
  if (menu.name) {
    menu.name = menu.name.trim();
  }
  if (menu.description) {
    menu.description = menu.description.trim();
  }
});

console.log('Menu model loaded successfully');