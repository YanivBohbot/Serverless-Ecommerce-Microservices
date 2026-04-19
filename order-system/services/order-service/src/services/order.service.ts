import { Order } from "../models/order.model";
import { publishOrderCreated } from "../events/order.publisher";

export class OrderService {
  static async createOrder(orderData: any) {
    // 1. חישוב סכום הזמנה (לוגיקה עסקית)
    const totalAmount = orderData.items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 2. שמירה ב-Database
    const newOrder = await Order.create({
      ...orderData,
      totalAmount,
    });

    console.log(`📦 הזמנה ${newOrder.id} נשמרה בבסיס הנתונים`);

    // 3. שידור אירוע ל-SNS (כדי ששאר המערכת תדע שיש הזמנה)
    // 2. שליחת האירוע ל-SNS
    // אנחנו שולחים את ה-data שחזר מה-DB (כי יש לו כבר ID ו-Timestamp)
    try {
      await publishOrderCreated(newOrder.toJSON());
    } catch (error) {
      console.error("Could not notify inventory service, but order was saved.");
    }

    return newOrder;
  }
}
