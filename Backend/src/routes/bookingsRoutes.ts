import { Request, Response, Router } from "express";
import app from "../app";
import {
  createBooking,
  getBookingById,
} from "../controllers/bookingsController";

const router = Router();
router.post("/", createBooking);
router.get("/:id", getBookingById);

export default router;
