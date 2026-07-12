import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";
import Sequelize from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

const files = fs.readdirSync(__dirname).filter((file) => {
  return file !== "index.js" && file.endsWith(".js");
});

// Import each model
for (const file of files) {
  const modelModule = await import(`./${file}`);
  const model = modelModule.default(sequelize);
  db[model.name] = model;
}

// Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
