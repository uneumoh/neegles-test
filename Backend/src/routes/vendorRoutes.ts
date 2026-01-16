import { Router } from "express";
import {
  getAllVendors,
  getVendorAvailability,
  getVendorById,
} from "../controllers/vendorController";

const router = Router();

router.get("/", getAllVendors);
router.get("/:id/availability", getVendorAvailability);
router.get("/:id", getVendorById);

export default router;
