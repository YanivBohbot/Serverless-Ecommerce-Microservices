import { startNotificationWorker } from "./worker/notification.worker";

console.log("🔔 Notification Service is starting...");

startNotificationWorker().catch((err) => {
  console.error("💀 Fatal error in Notification Service:", err);
  process.exit(1);
});
