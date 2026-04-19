import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { CreateOrderInput } from "../types/orders.type";

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const orderData: CreateOrderInput = req.body;
    const order = await OrderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
