import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  region: process.env.AWS_REGION || "us-east-1",
  sqs: {
    queueUrl: process.env.NOTIFICATION_QUEUE_URL || "",
  },
  ses: {
    fromEmail: process.env.SES_FROM_EMAIL || "yanivbohbot5@gmail.com",
    toEmail: process.env.SES_TO_EMAIL || "mollokapi1@gmail.com",
  },
};
