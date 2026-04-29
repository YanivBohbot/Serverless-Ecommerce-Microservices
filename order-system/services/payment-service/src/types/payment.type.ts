export type PaymentStatus = "AUTHORIZED" | "FAILED";

export interface PaymentRecord {
  orderId: number;
  status: PaymentStatus;
  processedAt: string;
}

export interface OrderCreatedPayload {
  id: number;
  customerId: number;
  items: Array<{ productId: string; price: number; quantity: number }>;
  totalAmount: number;
  status: string;
}

export interface PaymentProcessedEvent {
  orderId: number;
  status: PaymentStatus;
}
