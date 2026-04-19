import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// שליפת ה-URL מה-env או שימוש בברירת מחדל לפיתוח
const DB_URL =
  process.env.DATABASE_URL ||
  "postgres://admin_yaniv:password123@localhost:5444/orders_final_db";

export const sequelize = new Sequelize(DB_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    // הגדרה חשובה לעבודה עם Docker ב-Windows במידה ויש בעיות חיבור
    connectTimeout: 60000,
  },
});

export const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Connected to PostgreSQL");
      await sequelize.sync();
      console.log("📂 Database synchronized");
      return; // הצלחנו! יוצאים מהלולאה
    } catch (error) {
      retries -= 1;
      console.error(`❌ Connection failed. Retries left: ${retries}`);
      // מחכים 3 שניות לפני הניסיון הבא
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  process.exit(1); // רק אם כל הניסיונות נכשלו - קורסים
};
