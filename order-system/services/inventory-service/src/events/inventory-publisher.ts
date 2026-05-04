import AWS from "aws-sdk";
import dotenv from "dotenv";

const sns = new AWS.SNS({ region: process.env.AWS_REGION || "us-east-1" });

export interface InventoryItem {
  productId: string;
  newStock: number;
}

export const publishInventoryEvent = async (
  orderId: number,
  status: string,
  items: InventoryItem[] = [],
) => {
  const params = {
    Message: JSON.stringify({ orderId, status, items }),
    TopicArn: process.env.INVENTORY_TOPIC_ARN,
    MessageAttributes: {
      eventType: { DataType: "String", StringValue: "InventoryUpdated" },
    },
  };

  try {
    await sns.publish(params).promise();
    console.log(
      `📢 Inventory status for Order #${orderId} published: ${status}`,
    );
  } catch (error) {
    console.error("❌ Failed   to publish inventory update:", error);
  }
};
