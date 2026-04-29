import { Router } from "express";
import { getPaymentHandler } from "../controllers/payment.controller";

const router = Router();

router.get("/:orderId", getPaymentHandler);

export default router;
