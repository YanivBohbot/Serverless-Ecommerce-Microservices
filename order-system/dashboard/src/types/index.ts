export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string | number;
  customerId: string | number;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface Product {
  productId: string;
  stock: number;
  lastUpdated: string;
}

export interface Payment {
  orderId: string | number;
  status: string;
  processedAt: string;
}

export interface StatusBucket {
  key: string;
  doc_count: number;
}

export interface DayBucket {
  key_as_string: string;
  key: number;
  doc_count: number;
  daily_revenue: { value: number };
}

export interface Analytics {
  orders_over_time: { buckets: DayBucket[] };
  total_revenue: { value: number };
  orders_by_status: { buckets: StatusBucket[] };
}
