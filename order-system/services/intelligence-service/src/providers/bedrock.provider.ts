import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { config } from "../config/config";
import { logToCloudWatch } from "../utils/logger";

export class BedrockProvider {
  private client = new BedrockRuntimeClient();

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: config.aws.region,
      credentials: config.aws.credentials,
    });
  }

  // services/intelligence-service/src/providers/bedrock.provider.ts

  async analyseBusinessData(orders: any[], inventory: any[]) {
    await logToCloudWatch(
      `🤖 Starting AI Analysis for ${orders.length} orders`,
    );
    const prompt = ` 
        You are an expert Business Intelligence Analyst.
        Analyze the following data from my store:

        ORDERS: ${JSON.stringify(orders)}
        INVENTORY: ${JSON.stringify(inventory)}

        Please provide:
        1. A summary of total revenue.
        2. Identification of the best-selling product.
        3. One specific recommendation for inventory management.
        Respond in clear, professional English.
    `;

    const input = {
      modelId: config.bedrock.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
          temperature: 0.7,
        },
      }),
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      const result = JSON.parse(new TextDecoder().decode(response.body));

      // התיקון כאן: בדיקה ישירה של מבנה ה-choices שראינו בלוג שלך
      if (result.choices && result.choices[0] && result.choices[0].message) {
        return result.choices[0].message.content;
      }

      // גיבוי למקרה שהמבנה משתנה לפורמט ה-Output של AWS
      if (result.output?.message?.content) {
        await logToCloudWatch(`✅ AI Analysis completed successfully`);
        return result.output.message.content[0].text;
      }

      console.log("Raw Response:", JSON.stringify(result));
      return "AI analysis completed, but format was unexpected.";
    } catch (error: any) {
      await logToCloudWatch(`❌ AI Analysis failed: ${error.message}`);
      console.error("❌ Bedrock Error:", error);
      throw new Error("Failed to get insights from AI");
    }
  } 
}
