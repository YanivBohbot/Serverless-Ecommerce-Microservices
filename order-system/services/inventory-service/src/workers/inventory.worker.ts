import AWS from "aws-sdk";
import { InventoryService } from "../services/inventory.services";
import { publishInventoryEvent, InventoryItem } from "../events/inventory-publisher";

// הגדרת ה-SQS Client
const sqs = new AWS.SQS({ region: process.env.AWS_REGION || "us-east-1" });
const QUEUE_URL = process.env.SQS_QUEUE_URL;

export const startInventoryWorker = async () => {
  console.log("📦 Inventory Worker started, polling for messages...");

  if (!QUEUE_URL) {
    console.error("❌ SQS_QUEUE_URL is not defined in environment variables!");
    return;
  }

  while (true) {
    try {
      const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20, // Long Polling לחיסכון במשאבים
        AttributeNames: ["All"],
      };

      const data = await sqs.receiveMessage(params).promise();

      if (data.Messages && data.Messages.length > 0) {
        let orderId = null;

        for (const message of data.Messages) {
          try {
            // 1. פירוק המעטפת של SQS ו-SNS
            const body = JSON.parse(message.Body!);

            // SNS שולח את התוכן בשדה Message כמחרוזת, צריך לעשות Parse נוסף
            const orderData =
              typeof body.Message === "string"
                ? JSON.parse(body.Message)
                : body.Message;

            console.log(
              `📩 New message received for Order #${orderData.id || "Unknown"}`,
            );
            orderId = orderData.id;

            console.log(`📩 Processing Order #${orderId}`);
            // 2. טיפול במבנה של "סל קניות" (מערך של items)
            if (
              orderData &&
              orderData.items &&
              Array.isArray(orderData.items)
            ) {
              console.log(
                `📉 Processing order with ${orderData.items.length} items...`,
              );

              const updatedItems: InventoryItem[] = [];
              for (const item of orderData.items) {
                if (item.productId && item.quantity) {
                  console.log(
                    `   -> Updating stock for: ${item.productId} (-${item.quantity})`,
                  );
                  const result = await InventoryService.updateInventory(
                    item.productId,
                    item.quantity,
                  );
                  const newStock = result.Attributes?.stock ?? 0;
                  updatedItems.push({ productId: item.productId, newStock });
                }
              }

              await publishInventoryEvent(orderId, "COMPLETED", updatedItems);
              console.log(
                `✅ Order #${orderId} inventory updated and confirmed.`,
              );
            }
            // 3. תמיכה לאחור במבנה של מוצר בודד (למקרה של בדיקות ידניות)
            else if (orderData && orderData.productId) {
              console.log(
                `📉 Updating stock for single product: ${orderData.productId}`,
              );
              await InventoryService.updateInventory(
                orderData.productId,
                orderData.quantity || 1,
              );
            } else {
              console.warn(
                "⚠️ Message format not recognized, skipping logic but deleting message.",
                orderData,
              );
            }

            // 4. מחיקת ההודעה מהתור - קריטי כדי שלא תחזור שוב
            await sqs
              .deleteMessage({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle!,
              })
              .promise();

            console.log("✅ Message processed and deleted from queue");
          } catch (error: any) {
            console.error(
              "❌ Error processing Order #${orderId}:`, error.message",
            );
            if (orderId) {
              await publishInventoryEvent(orderId, "FAILED");
            }
            // מוחקים מהתור כדי לא להיתקע, ה-Saga תטפל בביטול
            await sqs
              .deleteMessage({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle!,
              })
              .promise();
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in SQS Polling loop:", error);
      // מחכים 5 שניות לפני ניסיון נוסף במקרה של שגיאת תקשורת/הרשאות
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};
