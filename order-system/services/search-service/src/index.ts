import express from "express";
import dotenv from "dotenv";
import searchRoutes from "./routes/search.routes";
import { startSearchWorker } from "./workers/search.worker";
import { esClient, createIndices } from "./config/elasticsearch";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/search", searchRoutes);

app.get("/health", async (_req, res) => {
  try {
    const health = await esClient.cluster.health();
    res.json({ status: "healthy", service: "search-service", elasticsearch: health.status });
  } catch {
    res.status(503).json({ status: "unhealthy", service: "search-service" });
  }
});

const PORT = process.env.PORT || 3005;

const bootstrap = async () => {
  try {
    console.log("⏳ Waiting for Elasticsearch...");
    let retries = 10;
    while (retries > 0) {
      try {
        await esClient.ping();
        break;
      } catch {
        retries--;
        if (retries === 0) throw new Error("Elasticsearch unreachable after 10 retries");
        console.log(`⏳ Elasticsearch not ready, retrying (${retries} left)...`);
        await new Promise((res) => setTimeout(res, 5000));
      }
    }

    await createIndices();

    app.listen(PORT, () => {
      console.log(`🚀 Search Service running on port ${PORT}`);
      startSearchWorker();
    });
  } catch (error) {
    console.error("❌ Failed to start Search Service:", error);
    process.exit(1);
  }
};

bootstrap();
