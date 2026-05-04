import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
});

export const ORDERS_INDEX = "orders-index";
export const PRODUCTS_INDEX = "products-index";
export const PAYMENTS_INDEX = "payments-index";

export const createIndices = async (): Promise<void> => {
  const indices = [
    {
      index: ORDERS_INDEX,
      mappings: {
        properties: {
          orderId: { type: "keyword" },
          customerId: { type: "keyword" },
          status: { type: "keyword" },
          totalAmount: { type: "float" },
          items: {
            type: "nested",
            properties: {
              productId: { type: "keyword" },
              quantity: { type: "integer" },
              price: { type: "float" },
            },
          },
          createdAt: { type: "date" },
        },
      },
    },
    {
      index: PRODUCTS_INDEX,
      mappings: {
        properties: {
          productId: { type: "keyword" },
          stock: { type: "integer" },
          lastUpdated: { type: "date" },
        },
      },
    },
    {
      index: PAYMENTS_INDEX,
      mappings: {
        properties: {
          orderId: { type: "keyword" },
          status: { type: "keyword" },
          processedAt: { type: "date" },
        },
      },
    },
  ];

  for (const { index, mappings } of indices) {
    const exists = await esClient.indices.exists({ index });
    if (!exists) {
      await esClient.indices.create({ index, mappings } as Parameters<typeof esClient.indices.create>[0]);
      console.log(`✅ Created Elasticsearch index: ${index}`);
    }
  }
};
