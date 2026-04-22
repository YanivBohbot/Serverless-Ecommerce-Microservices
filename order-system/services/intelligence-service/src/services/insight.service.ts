// services/intelligence-service/src/services/insight.service.ts
import { Client } from "pg";
import { BedrockProvider } from "../providers/bedrock.provider";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { config } from "../config/config";

const bedrock = new BedrockProvider();
const dynamoClient = new DynamoDBClient({
  region: config.aws.region,
  credentials: config.aws.credentials,
});

export const getBusinessInsights = async () => {
  const pgClient = new Client({ connectionString: config.databaseUrl });

  try {
    await pgClient.connect();

    // 1. משיכת נתונים מ-Postgres
    const orderResult = await pgClient.query(
      'SELECT * FROM "Orders" ORDER BY "createdAt" DESC LIMIT 10',
    );

    const orders = orderResult.rows;

    // 2. כאן אפשר להוסיף משיכה מ-DynamoDB במידה ותרצה (כרגע נתמקד בהזמנות)
    const dynamoCommand = new ScanCommand({ TableName: "Inventory" });

    const dynamoResponse = await dynamoClient.send(dynamoCommand);

    const inventory = (dynamoResponse.Items || []).map((item) =>
      unmarshall(item),
    );
    console.log(
      `🤖 Analyzing ${orders.length} orders and ${inventory.length} inventory items...`,
    );

    // 3. שליחה ל-Bedrock לניתוח משולב
    return await bedrock.analyseBusinessData(orders, inventory);
  } catch (error) {
    console.error("❌ Error fetching data for AI:", error);
    throw error;
  } finally {
    await pgClient.end();
  }
};
