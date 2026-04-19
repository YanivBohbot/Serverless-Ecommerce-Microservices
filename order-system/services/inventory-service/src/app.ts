import express from "express";
import dotenv from "dotenv";
import inventoryRoutes from "./routes/inventory.routes";
import { checkDynamoDBConnection } from "./config/dynamodb";
import { startInventoryWorker } from "./workers/inventory.worker"; // ייבוא ה-Worker

dotenv.config();

const app = express();
app.use(express.json());

app.use("/inventory", inventoryRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`🚀 Inventory Service running on port ${PORT}`);

  // 1. בדיקת חיבור ל-Dynamo
  await checkDynamoDBConnection();

  // 2. הפעלת ה-Polling מהתור (SQS)
  // אנחנו לא שמים await כי אנחנו רוצים שהלולאה תרוץ ברקע ולא תחסום את השרת
  startInventoryWorker();
});
