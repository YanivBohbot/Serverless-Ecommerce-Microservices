import express from "express";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.routes";
import { startPaymentWorker } from "./workers/payment.worker";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/payments", paymentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", service: "payment-service" });
});

const PORT = process.env.PORT || 3003;

const bootstrap = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Payment Service running on port ${PORT}`);
      startPaymentWorker();
    });
  } catch (error) {
    console.error("❌ Failed to start Payment Service:", error);
    process.exit(1);
  }
};

bootstrap();
