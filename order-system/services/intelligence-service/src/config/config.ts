import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3004,
  databaseUrl: process.env.DATABASE_URL, // Postgres
  aws: {
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  },
  bedrock: {
    modelId: "google.gemma-3-4b-it", // מודל מהיר וזול למשימות BI
  },
};
