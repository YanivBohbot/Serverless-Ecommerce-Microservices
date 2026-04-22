import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import orderRoutes from "./routes/order.route";
import { startOrderUpdateWorker } from "./worker/order.worker";

dotenv.config();
const app = express();
app.use(express.json());

// נתיבים
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 3001;

// פונקציית אתחול אסינכרונית
const bootstrap = async () => {
  try {
    console.log("⏳ Connecting to Database...");
    // מחכים שהחיבור ל-DB יושלם בהצלחה
    await connectDB();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Order Service is permanently running on port ${PORT}`);

      // הפעלת ה-Worker רק אחרי שהשרת למעלה
      startOrderUpdateWorker();
    });
  } catch (error) {
    console.error("❌ Failed to start Order Service:", error);
    // אם ה-DB לא זמין, אנחנו רוצים שהקונטיינר ייפול עם שגיאה כדי שדוקר ינסה להרים אותו שוב
    process.exit(1);
  }
};

bootstrap();
