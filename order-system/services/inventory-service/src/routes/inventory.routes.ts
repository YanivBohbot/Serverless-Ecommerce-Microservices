import { Router } from "express";
import {
  getStockHandler,
  updateStockHandler,
} from "../controllers/inventory.controller";

const router = Router();

// Get stock for a product
router.get("/:productId", getStockHandler);

router.post("/:productId/update", updateStockHandler);

export default router;
