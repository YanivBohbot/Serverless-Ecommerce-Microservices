export interface OrderDocument {
  orderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  items: Array<{ productId: string; quantity: number; price: number }>;
  createdAt: string;
}

export interface ProductDocument {
  productId: string;
  stock: number;
  lastUpdated: string;
}

export interface PaymentDocument {
  orderId: string;
  status: string;
  processedAt: string;
}

export interface OrderSearchParams {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface ProductSearchParams {
  q?: string;
  inStock?: string;
}

export interface PaymentSearchParams {
  status?: string;
}
