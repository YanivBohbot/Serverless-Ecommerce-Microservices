import { esClient, ORDERS_INDEX, PRODUCTS_INDEX, PAYMENTS_INDEX } from "../config/elasticsearch";
import {
  OrderSearchParams,
  ProductSearchParams,
  PaymentSearchParams,
} from "../types/search.types";

export const searchOrders = async (params: OrderSearchParams) => {
  const must: object[] = [];
  const filter: object[] = [];

  if (params.q) {
    must.push({
      multi_match: {
        query: params.q,
        fields: ["orderId", "customerId", "status"],
      },
    });
  }

  if (params.status) {
    filter.push({ term: { status: params.status } });
  }

  if (params.from || params.to) {
    filter.push({
      range: {
        createdAt: {
          ...(params.from && { gte: params.from }),
          ...(params.to && { lte: params.to }),
        },
      },
    });
  }

  const result = await esClient.search({
    index: ORDERS_INDEX,
    query: {
      bool: {
        ...(must.length > 0 && { must }),
        ...(filter.length > 0 && { filter }),
        ...(must.length === 0 && filter.length === 0 && { must: [{ match_all: {} }] }),
      },
    },
  });

  return result.hits.hits.map((h) => h._source);
};

export const searchProducts = async (params: ProductSearchParams) => {
  const must: object[] = [];
  const filter: object[] = [];

  if (params.q) {
    must.push({ match: { productId: params.q } });
  }

  if (params.inStock === "true") {
    filter.push({ range: { stock: { gt: 0 } } });
  }

  const result = await esClient.search({
    index: PRODUCTS_INDEX,
    query: {
      bool: {
        ...(must.length > 0 && { must }),
        ...(filter.length > 0 && { filter }),
        ...(must.length === 0 && filter.length === 0 && { must: [{ match_all: {} }] }),
      },
    },
  });

  return result.hits.hits.map((h) => h._source);
};

export const searchPayments = async (params: PaymentSearchParams) => {
  const filter: object[] = [];

  if (params.status) {
    filter.push({ term: { status: params.status } });
  }

  const result = await esClient.search({
    index: PAYMENTS_INDEX,
    query: {
      bool: {
        ...(filter.length > 0 && { filter }),
        ...(filter.length === 0 && { must: [{ match_all: {} }] }),
      },
    },
  });

  return result.hits.hits.map((h) => h._source);
};

export const getAnalytics = async () => {
  const result = await esClient.search({
    index: ORDERS_INDEX,
    size: 0,
    aggs: {
      orders_over_time: {
        date_histogram: {
          field: "createdAt",
          calendar_interval: "day",
        },
        aggs: {
          daily_revenue: {
            sum: { field: "totalAmount" },
          },
        },
      },
      total_revenue: {
        sum: { field: "totalAmount" },
      },
      orders_by_status: {
        terms: { field: "status" },
      },
    },
  });

  return result.aggregations;
};
