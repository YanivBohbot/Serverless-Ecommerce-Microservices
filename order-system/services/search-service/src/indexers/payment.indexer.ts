import { esClient, PAYMENTS_INDEX } from "../config/elasticsearch";
import { PaymentDocument } from "../types/search.types";

export const indexPayment = async (payment: PaymentDocument): Promise<void> => {
  await esClient.index({
    index: PAYMENTS_INDEX,
    id: payment.orderId,
    document: payment,
  });
  console.log(`💳 Indexed payment for order ${payment.orderId} (status: ${payment.status})`);
};
