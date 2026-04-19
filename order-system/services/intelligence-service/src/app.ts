import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005; // תשנה את הפורט לכל שירות (3001, 3002 וכו')

app.get("/health", (req, res) => {
  res.send("Service is healthy");
});

app.listen(PORT, () => {
  console.log(`🚀 Service is running on port ${PORT}`);
});
