'use strict';

import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.DB_SQL_LOGGING === 'true' ? console.log : false,
  define: {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Conexión dual: PostgreSQL para auth y MongoDB para entidades de negocio.
 */
export const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL | Conectado a PostgreSQL');

    if (process.env.NODE_ENV === 'development') {
      const syncLogging = process.env.DB_SQL_LOGGING === 'true' ? console.log : false;
      await sequelize.sync({ force: false, logging: syncLogging });
      console.log('PostgreSQL | Esquema sincronizado en desarrollo');
    }

    mongoose.connection.on('error', () => {
      console.log('MongoDB | No se pudo conectar a MongoDB');
      mongoose.disconnect();
    });

    mongoose.connection.on('connecting', () => {
      console.log('MongoDB | Intentando conectar a MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB | Conectado a MongoDB');
    });

    mongoose.connection.on('open', () => {
      console.log('MongoDB | Conectado a la base de datos gestion-restaurantes');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB | Reconectado a MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB | Desconectado de MongoDB');
    });

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-restaurantes', {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.log(`Error al conectar la DB: ${error}`);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`MongoDB | Received ${signal}. Closing database connection...`);
  try {
    await sequelize.close();
    await mongoose.connection.close();
    console.log('MongoDB | Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB | Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

// Handle different termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Para nodemon restarts