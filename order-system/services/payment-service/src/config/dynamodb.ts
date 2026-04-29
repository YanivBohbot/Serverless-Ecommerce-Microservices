import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { config } from "./aws.config";

const client = new DynamoDBClient({ region: config.region });
export const docClient = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = config.dynamodb.tableName;
