import type { Order, Product, Payment, Analytics } from '../types';

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  orders: {
    search: (params: { q?: string; status?: string; from?: string; to?: string } = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      return get<{ results: Order[] }>(`/api/search/orders${qs ? `?${qs}` : ''}`);
    },
  },

  products: {
    search: (params: { q?: string; inStock?: string } = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      return get<{ results: Product[] }>(`/api/search/products${qs ? `?${qs}` : ''}`);
    },
  },

  payments: {
    search: (params: { status?: string } = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      return get<{ results: Payment[] }>(`/api/search/payments${qs ? `?${qs}` : ''}`);
    },
  },

  analytics: {
    get: () => get<{ analytics: Analytics }>('/api/search/analytics'),
  },

  insights: {
    get: () => get<{ insights: string }>('/api/insights'),
  },
};
