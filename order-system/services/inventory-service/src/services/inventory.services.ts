import { dynamoDb, Table_NAME } from "../config/dynamodb";

export class InventoryService {
  static async updateInventory(productId: string, quantityChange: number) {
    const params = {
      TableName: Table_NAME,
      Key: {
        productId,
      },
      UpdateExpression: "SET  stock = if_not_exists(stock, :start) - :val",
      ExpressionAttributeValues: {
        ":val": quantityChange,
        ":start": 100,
      },
      ReturnValues: "UPDATED_NEW",
    };
    return await dynamoDb.update(params).promise();
  }

  static async getProductStock(productId: string) {
    const params = {
      TableName: Table_NAME,
      Key: {
        productId,
      },
    };

    const result = await dynamoDb.get(params).promise();
    return result.Item;
  }
}
