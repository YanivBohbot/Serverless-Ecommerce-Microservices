import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  region: process.env.AWS_REGION || "us-east-1",
  sqs: {
    queueUrl: process.env.NOTIFICATION_QUEUE_URL || "",
  },
  ses: {
    fromEmail: process.env.SES_FROM_EMAIL || "",
    replyToEmail: process.env.SES_REPLY_TO_EMAIL || "",
  },
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};
