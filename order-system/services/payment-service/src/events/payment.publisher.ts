import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { config } from "../config/aws.config";
import { PaymentProcessedEvent } from "../types/payment.type";

const snsClient = new SNSClient({ region: config.region });

export const publishPaymentProcessed = async (event: PaymentProcessedEvent): Promise<void> => {
  const command = new PublishCommand({
    Message: JSON.stringify(event),
    TopicArn: config.sns.topicArn,
    MessageAttributes: {
      eventType: { DataType: "String", StringValue: "PaymentProcessed" },
    },
  });

  await snsClient.send(command);
  console.log(`📢 PaymentProcessed published for Order #${event.orderId}: ${event.status}`);
};
