import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { config } from "../config/aws.config";

export class EmailProvider {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({ region: config.region });
  }

  async sendOrderConfirmation(
    orderId: number,
    status: string,
    customerEmail?: string,
  ): Promise<void> {
    const toEmail = customerEmail || "customer@example.com";
    const subject = `Your Order #${orderId} is ${this.formatStatus(status)}`;

    const input: SendEmailCommandInput = {
      Source: config.ses.fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      ...(config.ses.replyToEmail && {
        ReplyToAddresses: [config.ses.replyToEmail],
      }),
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: this.buildHtmlBody(orderId, status),
            Charset: "UTF-8",
          },
          Text: {
            Data: this.buildTextBody(orderId, status),
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(input);
    const result = await this.sesClient.send(command);

    console.log(
      `✅ Email sent to ${toEmail} for Order #${orderId} [${status}] — MessageId: ${result.MessageId}`,
    );
  }

  private formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  private buildHtmlBody(orderId: number, status: string): string {
    const formattedStatus = this.formatStatus(status);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Update</h2>
        <p>Your order <strong>#${orderId}</strong> has been updated to: <strong>${formattedStatus}</strong>.</p>
        ${
          status === "COMPLETED"
            ? "<p>Thank you for your purchase! Your order is on its way.</p>"
            : ""
        }
        <hr style="border: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `;
  }

  private buildTextBody(orderId: number, status: string): string {
    const formattedStatus = this.formatStatus(status);
    return [
      `Order Update`,
      ``,
      `Your order #${orderId} has been updated to: ${formattedStatus}.`,
      status === "COMPLETED"
        ? "Thank you for your purchase! Your order is on its way."
        : "",
      ``,
      `This is an automated message.`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");
  }
}
