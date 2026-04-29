import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";

export const getPaymentHandler = async (req: Request, res: Response) => {
  const orderId = parseInt(req.params["orderId"] as string, 10);

  if (isNaN(orderId)) {
    res.status(400).json({ error: "orderId must be a number" });
    return;
  }

  const record = await PaymentService.getPayment(orderId);

  if (!record) {
    res.status(404).json({ error: `No payment found for order ${orderId}` });
    return;
  }

  res.status(200).json(record);
};
