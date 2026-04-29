import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  region: process.env.AWS_REGION || "us-east-1",
  sqs: {
    queueUrl: process.env.PAYMENT_QUEUE_URL || "",
  },
  sns: {
    topicArn: process.env.PAYMENT_TOPIC_ARN || "",
  },
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE || "Payments",
  },
};
