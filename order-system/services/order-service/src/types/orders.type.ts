// הגדרת המבנה של נתוני הזמנה שמגיעים מה-Client
export interface CreateOrderInput {
  customerId: number;
  items: Array<{
    productId: string;
    price: number;
    quantity: number;
  }>;
}
