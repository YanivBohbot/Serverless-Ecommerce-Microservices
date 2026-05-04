import { Request, Response } from "express";
import { searchOrders, searchProducts, searchPayments, getAnalytics } from "../services/search.service";

export const searchOrdersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await searchOrders(req.query as { q?: string; status?: string; from?: string; to?: string });
    res.json({ results });
  } catch (error) {
    console.error("❌ searchOrders error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const searchProductsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await searchProducts(req.query as { q?: string; inStock?: string });
    res.json({ results });
  } catch (error) {
    console.error("❌ searchProducts error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const searchPaymentsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await searchPayments(req.query as { status?: string });
    res.json({ results });
  } catch (error) {
    console.error("❌ searchPayments error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const analyticsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getAnalytics();
    res.json({ analytics: data });
  } catch (error) {
    console.error("❌ analytics error:", error);
    res.status(500).json({ error: "Analytics failed" });
  }
};
