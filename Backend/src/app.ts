import express from "express";
import cors from "cors";
import Vendor from "./models/Vendor";
import bodyParser from "body-parser";
import vendorRoutes from "./routes/vendorRoutes";
import bookingsRoutes from "./routes/bookingsRoutes";
import paymentsRoutes from "./routes/paymentsRoutes";

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
