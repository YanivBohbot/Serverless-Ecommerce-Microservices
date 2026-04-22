import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { config } from "../config/config";

const client = new CloudWatchLogsClient({
  region: config.aws.region,
  credentials: config.aws.credentials,
});

const LOG_GROUP = "/microservices/intelligence-service";
const LOG_STREAM = "runtime-logs";

export const logToCloudWatch = async (message: string) => {
  const timestamp = Date.now();

  try {
    const command = new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [
        { message: `[${new Date().toISOString()}] ${message}`, timestamp },
      ],
    });
    await client.send(command);
  } catch (error: any) {
    // אם הקבוצה או הסטרים לא קיימים, ניצור אותם (קורה רק בהרצה הראשונה)
    if (error.name === "ResourceNotFoundException") {
      console.log("☁️ Creating CloudWatch Log Group/Stream...");
      try {
        await client.send(
          new CreateLogGroupCommand({ logGroupName: LOG_GROUP }),
        );
        await client.send(
          new CreateLogStreamCommand({
            logGroupName: LOG_GROUP,
            logStreamName: LOG_STREAM,
          }),
        );
      } catch (e) {
        /* איגנור אם כבר קיים */
      }
    }
    console.error("❌ CloudWatch Error:", error.message);
  }
};
