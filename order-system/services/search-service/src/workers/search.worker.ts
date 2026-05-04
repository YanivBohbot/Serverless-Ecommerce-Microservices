import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { config } from "../config/aws.config";
import { indexOrder } from "../indexers/order.indexer";
import { indexProduct } from "../indexers/inventory.indexer";
import { indexPayment } from "../indexers/payment.indexer";
import { OrderDocument, ProductDocument, PaymentDocument } from "../types/search.types";

const sqsClient = new SQSClient({ region: config.region });

let running = true;

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received — shutting down search worker...");
  running = false;
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received — shutting down search worker...");
  running = false;
});

const pollQueue = async (
  queueUrl: string,
  label: string,
  handler: (data: unknown) => Promise<void>,
): Promise<void> => {
  while (running) {
    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          WaitTimeSeconds: 20,
          MaxNumberOfMessages: 1,
        }),
      );

      if (response.Messages) {
        for (const message of response.Messages) {
          const body = JSON.parse(message.Body!);
          const data = typeof body.Message === "string"
            ? JSON.parse(body.Message)
            : body.Message;

          await handler(data);

          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrl,
              ReceiptHandle: message.ReceiptHandle!,
            }),
          );
        }
      }
    } catch (error) {
      console.error(`❌ [${label}] Worker error:`, error);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

export const startSearchWorker = (): void => {
  console.log("🔍 Search Worker started, polling 3 queues...");

  pollQueue(
    config.sqs.orderQueueUrl,
    "OrderQueue",
    async (data) => {
      const order = data as OrderDocument & { id?: string };
      await indexOrder({
        orderId: order.orderId ?? order.id ?? "",
        customerId: order.customerId,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items ?? [],
        createdAt: order.createdAt ?? new Date().toISOString(),
      });
    },
  );

  pollQueue(
    config.sqs.inventoryQueueUrl,
    "InventoryQueue",
    async (data) => {
      const event = data as { orderId: number; status: string; items?: { productId: string; newStock: number }[] };
      if (event.items && event.items.length > 0) {
        for (const item of event.items) {
          await indexProduct({
            productId: item.productId,
            stock: item.newStock,
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    },
  );

  pollQueue(
    config.sqs.paymentQueueUrl,
    "PaymentQueue",
    async (data) => {
      const payment = data as PaymentDocument;
      await indexPayment({
        orderId: payment.orderId,
        status: payment.status,
        processedAt: payment.processedAt ?? new Date().toISOString(),
      });
    },
  );
};
