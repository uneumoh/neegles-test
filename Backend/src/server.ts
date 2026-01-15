import "dotenv/config";
import app from "./app";
import { connectDB } from "./db";

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
