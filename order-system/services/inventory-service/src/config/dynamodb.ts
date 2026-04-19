import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// create DynamoDB client
export const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const Table_NAME = process.env.DYNAMODB_TABLE || "Inventory";

export const checkDynamoDBConnection = async () => {
  try {
    await dynamoDb.scan({ TableName: Table_NAME, Limit: 1 }).promise();
    console.log("✅ Connected to DynamoDB successfully");
  } catch (error) {
    console.error("❌ Error connecting to DynamoDB:", error);
  }
};
