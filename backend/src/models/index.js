
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const logger = require('../logger');

const connection = process.env.DATABASE_URL || 'postgres://postgres:rootpass@localhost:5432/cargosng';
const sequelize = new Sequelize(connection, {
  dialect: 'postgres',
  dialectOptions: connection.includes('sslmode') ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
  logging: (msg)=> logger.debug(msg)
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user','moderator','admin'), defaultValue: 'user' },
  preferredLanguage: { type: DataTypes.STRING, defaultValue: 'ru' },
  preferredCurrency: { type: DataTypes.STRING, defaultValue: process.env.BASE_CURRENCY || 'KZT' }
}, { tableName: 'users', underscored: true });

const Cargo = sequelize.define('Cargo', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  title_i18n: DataTypes.JSONB,
  description_i18n: DataTypes.JSONB,
  origin_country: DataTypes.STRING,
  dest_country: DataTypes.STRING,
  weight: DataTypes.FLOAT,
  price: DataTypes.FLOAT,
  currency: DataTypes.STRING,
  status: { type: DataTypes.ENUM('new','approved','rejected'), defaultValue: 'new' }
}, { tableName: 'cargos', underscored: true });

User.hasMany(Cargo, { foreignKey: 'user_id' });
Cargo.belongsTo(User, { foreignKey: 'user_id' });

async function init(){
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  return { sequelize, User, Cargo };
}

module.exports = { init, sequelize, User, Cargo };
