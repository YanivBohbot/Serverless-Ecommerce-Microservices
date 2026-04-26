import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.services";

export const getStockHandler = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const id = Array.isArray(productId) ? productId[0] : productId;
    const item = await InventoryService.getProductStock(id);

    if (!item) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching product stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStockHandler = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const id = Array.isArray(productId) ? productId[0] : productId;
    const result = await InventoryService.updateInventory(id, quantity);
    res.json({
      message: "Stock updated successfully youpiii",
      newValues: result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
