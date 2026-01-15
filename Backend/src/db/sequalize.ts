import { Sequelize } from "sequelize-typescript";
import "dotenv/config";
import path from "path";

export const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "+00:00", // UTC
  logging: false,
  models: [path.join(__dirname, "../models")]
});
