import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { config } from "../config/aws.config";
import { EmailProvider } from "../providers/email.provider";

const sqsClient = new SQSClient({ region: config.region });
const emailProvider = new EmailProvider();

const NOTIFIABLE_STATUSES = new Set(["COMPLETED", "CANCELLED", "FAILED"]);
const ERROR_RETRY_DELAY_MS = 5000;

export const startNotificationWorker = async () => {
  console.log("🚀 Notification Worker is polling for messages...");

  while (true) {
    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: config.sqs.queueUrl,
          WaitTimeSeconds: 20,
          MaxNumberOfMessages: 10,
        }),
      );

      if (!response.Messages || response.Messages.length === 0) {
        continue;
      }

      for (const message of response.Messages) {
        try {
          const body = JSON.parse(message.Body!);
          const data = JSON.parse(body.Message);

          console.log(
            `📩 Notification received for Order #${data.orderId} [${data.status}]`,
          );

          if (NOTIFIABLE_STATUSES.has(data.status)) {
            await emailProvider.sendOrderConfirmation(
              data.orderId,
              data.status,
              data.customerEmail,
            );
          } else {
            console.log(
              `⏭️  Skipping notification for Order #${data.orderId} — status '${data.status}' does not trigger an email`,
            );
          }

          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: config.sqs.queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
        } catch (messageError) {
          console.error(
            `❌ Failed to process message ${message.MessageId}:`,
            messageError,
          );
          // Message is not deleted — it will become visible again after the visibility timeout
        }
      }
    } catch (error) {
      console.error("❌ SQS polling error:", error);
      await new Promise((resolve) => setTimeout(resolve, ERROR_RETRY_DELAY_MS));
    }
  }
};
