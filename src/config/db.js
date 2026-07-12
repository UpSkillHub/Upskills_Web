import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    },
    pool: {
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
