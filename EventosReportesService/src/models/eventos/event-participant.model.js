'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { Event } from './event.model.js';
import { User } from '../users/user.model.js';

export const EventParticipant = sequelize.define(
  'event_participant',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'event', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.STRING(16),
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    participant_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    participant_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { isEmail: true },
    },
    participant_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    registration_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    attendance_status: {
      type: DataTypes.ENUM('registered', 'attended', 'absent'),
      allowNull: false,
      defaultValue: 'registered',
    },
    special_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'event_participant',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

EventParticipant.belongsTo(Event, { foreignKey: 'event_id', as: 'event', onDelete: 'CASCADE' });
EventParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL' });
Event.hasMany(EventParticipant, { foreignKey: 'event_id', as: 'participants', onDelete: 'CASCADE' });

export default EventParticipant;