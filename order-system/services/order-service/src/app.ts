import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import orderRoutes from "./routes/order.route";

dotenv.config();
const app = express();
app.use(express.json());

// חיבור לבסיס הנתונים
connectDB();

// נתיבים
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});
