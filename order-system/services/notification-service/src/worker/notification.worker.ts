import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { config } from "../config/aws.config";
import { EmailProvider } from "../providers/email.provider";

const sqsClient = new SQSClient({ region: config.region });
const emailProvider = new EmailProvider();

export const startNotificationWorker = async () => {
  console.log("🚀 Notification Worker is polling for messages...");

  while (true) {
    const command = new ReceiveMessageCommand({
      QueueUrl: config.sqs.queueUrl,
      WaitTimeSeconds: 20,
      MaxNumberOfMessages: 1,
    });

    try {
      const response = await sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          // SNS שולח את המידע בתוך שדה Body.Message כסטרינג
          const body = JSON.parse(message.Body!);
          const data = JSON.parse(body.Message);

          console.log(`📩 Notification received for Order #${data.orderId}`);

          if (data.status === "COMPLETED") {
            await emailProvider.sendOrderConfirmation(
              data.orderId,
              data.status,
            );
          }

          // מחיקת ההודעה מהתור לאחר עיבוד
          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: config.sqs.queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
        }
      }
    } catch (error) {
      console.error("❌ Notification Error:", error);
    }
  }
};
