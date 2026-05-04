import { esClient, ORDERS_INDEX } from "../config/elasticsearch";
import { OrderDocument } from "../types/search.types";

export const indexOrder = async (order: OrderDocument): Promise<void> => {
  await esClient.index({
    index: ORDERS_INDEX,
    id: order.orderId,
    document: order,
  });
  console.log(`📦 Indexed order ${order.orderId} (status: ${order.status})`);
};
