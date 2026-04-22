import AWS from "aws-sdk";
import { Order } from "../models/order.model";

const sqs = new AWS.SQS({ region: process.env.AWS_REGION || "us-east-1" });
const QUEUE_URL = process.env.SQS_ORDER_UPDATE_URL;

export const startOrderUpdateWorker = async () => {
  console.log(
    "👂 Order Update Worker started, waiting for inventory feedback...",
  );

  while (true) {
    try {
      const params = {
        QueueUrl: QUEUE_URL!,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
      };

      const data = await sqs.receiveMessage(params).promise();

      if (data.Messages) {
        for (const message of data.Messages) {
          const body = JSON.parse(message.Body!);
          const { orderId, status } = JSON.parse(body.Message);

          console.log(`🔄 Received update for Order #${orderId}: ${status}`);

          // עדכון הסטטוס ב-PostgreSQL
          const order = await Order.findByPk(orderId);
          if (order) {
            order.status = status; // יהיה 'COMPLETED' או 'FAILED'
            await order.save();
            console.log(
              `✅ Order #${orderId} status updated to ${status} in DB`,
            );
          }

          // מחיקת ההודעה מהתור
          await sqs
            .deleteMessage({
              QueueUrl: QUEUE_URL!,
              ReceiptHandle: message.ReceiptHandle!,
            })
            .promise();
        }
      }
    } catch (error) {
      console.error("❌ Error in Order Update Worker:", error);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};
