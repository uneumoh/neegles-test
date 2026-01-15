import { Router } from "express";
import {
  getAllVendors,
  getVendorAvailability,
} from "../controllers/vendorController";

const router = Router();

router.get("/", getAllVendors);
router.get("/:id/availability", getVendorAvailability);

export default router;
