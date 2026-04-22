// services/intelligence-service/src/index.ts
import express from "express";
import { getAwsSecrets } from "./utils/secrets";
import { getBusinessInsights } from "./services/insight.service";

const app = express();
app.use(express.json());

async function bootstrap() {
  console.log("🔐 Fetching configuration from Secrets Manager...");
  const secrets = await getAwsSecrets("prod/intelligence/secrets");

  process.env.DATABASE_URL = secrets.DATABASE_URL;

  app.get("/insights", async (req, res) => {
    const insights = await getBusinessInsights();
    res.json({ insights });
  });

  // עכשיו אפשר להפעיל את השרת
  app.listen(3004, () => {
    console.log(
      "🚀 Intelligence Service is live on port 3004 with Cloud Secrets",
    );
  });
}

bootstrap();
