import { Router } from "express";
import {
  searchOrdersHandler,
  searchProductsHandler,
  searchPaymentsHandler,
  analyticsHandler,
} from "../controllers/search.controller";

const router = Router();

router.get("/orders", searchOrdersHandler);
router.get("/products", searchProductsHandler);
router.get("/payments", searchPaymentsHandler);
router.get("/analytics", analyticsHandler);

export default router;
