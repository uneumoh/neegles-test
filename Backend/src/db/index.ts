import { sequelize } from "./sequalize";

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

export { sequelize };
