import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import config from "./config.js"; // ← Import the JS config directly

dotenv.config();

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || console.log,
    pool: dbConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize connected to database successfully");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
    return false;
  }
};

export { sequelize, testConnection };
