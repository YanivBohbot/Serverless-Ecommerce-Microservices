import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { config } from "../config/aws.config";
import { PaymentService } from "../services/payment.service";
import { publishPaymentProcessed } from "../events/payment.publisher";
import { OrderCreatedPayload } from "../types/payment.type";

const sqsClient = new SQSClient({ region: config.region });

let running = true;

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received — shutting down after current message...");
  running = false;
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received — shutting down after current message...");
  running = false;
});

export const startPaymentWorker = async (): Promise<void> => {
  console.log("💳 Payment Worker started, polling for orders...");

  while (running) {
    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: config.sqs.queueUrl,
          WaitTimeSeconds: 20,
          MaxNumberOfMessages: 1,
        }),
      );

      if (response.Messages) {
        for (const message of response.Messages) {
          const body = JSON.parse(message.Body!);
          const orderData: OrderCreatedPayload = JSON.parse(body.Message);

          console.log(`📩 OrderCreated received for Order #${orderData.id}`);

          const record = await PaymentService.processPayment(orderData);

          await publishPaymentProcessed({ orderId: record.orderId, status: record.status });

          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: config.sqs.queueUrl,
              ReceiptHandle: message.ReceiptHandle!,
            }),
          );

          console.log(`✅ Order #${orderData.id} payment processed and message deleted`);
        }
      }
    } catch (error) {
      console.error("❌ Payment Worker error:", error);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  console.log("✅ Payment Worker stopped cleanly.");
};
