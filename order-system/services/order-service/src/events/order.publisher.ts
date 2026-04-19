import AWS from "aws-sdk";

const sns = new AWS.SNS({ region: process.env.AWS_REGION || "us-east-1" });

export const publishOrderCreated = async (orderData: any) => {
  const params = {
    Message: JSON.stringify(orderData),
    TopicArn:
      process.env.SNS_TOPIC_ARN ||
      "arn:aws:sns:us-east-1:584246028688:order-events-topic",
    MessageAttributes: {
      eventType: { DataType: "String", StringValue: "OrderCreated" },
    },
  };

  try {
    const result = await sns.publish(params).promise();
    console.log(
      `📢 Event published: OrderCreated (ID: ${orderData.id || "N/A"})`,
    );
    return result;
  } catch (error: any) {
    // במקום רק לדלג, נדפיס את השגיאה האמיתית כדי שנוכל לדבג
    console.error("❌ SNS Publish Error:", error.message);

    // במידה ואנחנו ב-Development ולא רוצים שהכל יקרוס אם אין אינטרנט
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ SNS skip (Development mode)");
    } else {
      throw error; // בסביבת פרודקשן אנחנו רוצים לדעת שהאירוע נכשל
    }
  }
};
