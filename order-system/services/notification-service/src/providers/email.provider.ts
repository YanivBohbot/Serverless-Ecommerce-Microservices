export class EmailProvider {
  async sendOrderConfirmation(orderId: number, status: string) {
    console.log(`\n--- 📧 NEW NOTIFICATION ---`);
    console.log(`To: customer@example.com`);
    console.log(`Message: Order #${orderId} has been successfully ${status}!`);
    console.log(`  Timestamp : ${new Date().toISOString()}`);
    console.log(`---------------------------\n`);
  }
}
