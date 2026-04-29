import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { config } from "../config/aws.config";

const sesClient = new SESClient({ region: config.region });

function buildEmailContent(
  orderId: number,
  status: string,
): { subject: string; body: string } | null {
  if (status === "COMPLETED") {
    return {
      subject: "Your order has been confirmed!",
      body: `Great news! Your Order #${orderId} has been confirmed and is now being processed.`,
    };
  }
  if (status === "FAILED") {
    return {
      subject: "There was a problem with your order",
      body: `Unfortunately, your Order #${orderId} could not be processed. Please try again or contact support.`,
    };
  }
  return null;
}

export class EmailProvider {
  async sendOrderConfirmation(orderId: number, status: string) {
    const content = buildEmailContent(orderId, status);

    if (!content) {
      console.warn(`⚠️ No email template for status: ${status}`);
      return;
    }

    const command = new SendEmailCommand({
      Source: config.ses.fromEmail,
      Destination: { ToAddresses: [config.ses.toEmail] },
      Message: {
        Subject: { Data: content.subject },
        Body: { Text: { Data: content.body } },
      },
    });

    await sesClient.send(command);
    console.log(
      `📧 Email sent → Order #${orderId} [${status}] to ${config.ses.toEmail}`,
    );
  }
}
