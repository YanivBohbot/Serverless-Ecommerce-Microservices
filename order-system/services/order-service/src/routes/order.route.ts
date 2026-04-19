import { Router } from "express";

import { createOrderHandler } from "../controllers/order.controller";

const router = Router();

router.post("/", createOrderHandler);

export default router;
