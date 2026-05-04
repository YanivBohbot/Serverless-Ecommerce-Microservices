import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  region: process.env.AWS_REGION || "us-east-1",
  sqs: {
    orderQueueUrl: process.env.SEARCH_ORDER_QUEUE_URL || "",
    inventoryQueueUrl: process.env.SEARCH_INVENTORY_QUEUE_URL || "",
    paymentQueueUrl: process.env.SEARCH_PAYMENT_QUEUE_URL || "",
  },
};
