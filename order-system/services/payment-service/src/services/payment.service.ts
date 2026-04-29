import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../config/dynamodb";
import { OrderCreatedPayload, PaymentRecord, PaymentStatus } from "../types/payment.type";

export class PaymentService {
  static async processPayment(order: OrderCreatedPayload): Promise<PaymentRecord> {
    const status: PaymentStatus = "AUTHORIZED";

    const record: PaymentRecord = {
      orderId: order.id,
      status,
      processedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      }),
    );

    console.log(`💳 Payment ${status} for Order #${order.id}`);
    return record;
  }

  static async getPayment(orderId: number): Promise<PaymentRecord | undefined> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { orderId },
      }),
    );

    return result.Item as PaymentRecord | undefined;
  }
}
