import { Router } from "express";
import {
  initializePayment,
  paymentWebhook,
} from "../controllers/paymentsController";

const router = Router();

router.post("/initialize", initializePayment);
router.post("/webhook", paymentWebhook);
export default router;
