import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import type { Order, Product, Payment } from '../types';

const IconOrders = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="1" width="12" height="14" rx="2" />
    <path d="M5 5h6M5 8h6M5 11h4" strokeLinecap="round" />
  </svg>
);
const IconRevenue = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 4.5v7M6 6.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5S9.1 8 8 8s-2 .7-2 1.5S6.9 11 8 11s2-.7 2-1.5" strokeLinecap="round" />
  </svg>
);
const IconProducts = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 1.5L14 5v6L8 14.5 2 11V5L8 1.5Z" />
    <path d="M8 1.5v13M2 5l6 3.5M14 5l-6 3.5" />
  </svg>
);
const IconPayments = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1.5" y="4" width="13" height="9" rx="1.5" />
    <path d="M1.5 7h13" />
    <path d="M4.5 10.5h2" strokeLinecap="round" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.3.9 4.3 2.2" strokeLinecap="round" />
    <path d="M12 2l1 2.5-2.5 1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 14, height: 14, transition: 'transform 200ms ease', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
  >
    <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function OrderDetailRow({ order, open }: { order: Order; open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) setHeight(open ? ref.current.scrollHeight : 0);
  }, [open]);

  const lineTotal = (qty: number, price: number) => (qty * price).toFixed(2);

  return (
    <tr className="order-detail-tr">
      <td colSpan={7} style={{ padding: 0, borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div
          ref={ref}
          className="order-detail-wrap"
          style={{ maxHeight: height, overflow: 'hidden', transition: 'max-height 220ms cubic-bezier(0.4,0,0.2,1)' }}
        >
          <div className="order-detail-body">
            <div className="order-detail-meta">
              <div className="order-detail-meta-item">
                <span className="order-detail-meta-label">Customer ID</span>
                <span className="order-detail-meta-value mono">cust-{order.customerId}</span>
              </div>
              <div className="order-detail-meta-item">
                <span className="order-detail-meta-label">Order ID</span>
                <span className="order-detail-meta-value mono">#{order.orderId}</span>
              </div>
              <div className="order-detail-meta-item">
                <span className="order-detail-meta-label">Created</span>
                <span className="order-detail-meta-value mono">{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-detail-meta-item">
                <span className="order-detail-meta-label">Status</span>
                <Badge status={order.status} />
              </div>
            </div>

            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.productId}>
                    <td><span className="mono">{item.productId}</span></td>
                    <td><span className="mono">×{item.quantity}</span></td>
                    <td><span className="mono">${Number(item.price).toFixed(2)}</span></td>
                    <td><span className="mono order-line-total">${lineTotal(item.quantity, item.price)}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', paddingRight: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Order Total
                  </td>
                  <td><span className="mono order-grand-total">${Number(order.totalAmount).toFixed(2)}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function stockLevel(stock: number): 'high' | 'medium' | 'low' {
  if (stock > 50) return 'high';
  if (stock > 20) return 'medium';
  return 'low';
}

export function Dashboard() {
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrder = (id: string) =>
    setExpandedOrderId(prev => (prev === id ? null : id));

  const ordersSearch = useCallback(
    () => api.orders.search({ q: orderQuery || undefined, status: orderStatus || undefined }),
    [orderQuery, orderStatus]
  );

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } =
    useAsync(ordersSearch, [orderQuery, orderStatus]);

  const { data: productsData, loading: productsLoading } =
    useAsync(() => api.products.search(), []);

  const { data: paymentsData, loading: paymentsLoading } =
    useAsync(() => api.payments.search(), []);

  const { data: analyticsData } =
    useAsync(() => api.analytics.get(), []);

  const orders: Order[]   = ordersData?.results ?? [];
  const products: Product[] = productsData?.results?.filter(p => p.productId) ?? [];
  const payments: Payment[] = paymentsData?.results ?? [];
  const totalRevenue = analyticsData?.analytics?.total_revenue?.value ?? 0;
  const authorizedPayments = payments.filter(p => p.status === 'AUTHORIZED').length;

  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">order-system / real-time overview</div>
        </div>
        <div className="header-meta">
          <div className="live-badge">
            <span className="dot" />
            LIVE
          </div>
          <span className="header-time">{now}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Orders"
          value={orders.length}
          meta={`${orders.filter(o => o.status === 'PENDING').length} pending`}
          icon={<IconOrders />}
          color="accent"
          delay={0}
        />
        <StatCard
          label="Total Revenue"
          value={Math.round(totalRevenue)}
          format="currency"
          meta="from completed orders"
          icon={<IconRevenue />}
          color="green"
          delay={60}
        />
        <StatCard
          label="Products Indexed"
          value={products.length}
          meta="in Elasticsearch"
          icon={<IconProducts />}
          color="blue"
          delay={120}
        />
        <StatCard
          label="Payments Auth."
          value={authorizedPayments}
          meta={`${payments.length} total processed`}
          icon={<IconPayments />}
          color="purple"
          delay={180}
        />
      </div>

      {/* Orders Table */}
      <div className="section" style={{ animationDelay: '200ms' }}>
        <div className="section-header">
          <div>
            <span className="section-title">Orders</span>
            <span className="section-count">({orders.length})</span>
          </div>
          <div className="section-controls">
            <input
              className="search-input"
              placeholder="Search by ID, customer..."
              value={orderQuery}
              onChange={e => setOrderQuery(e.target.value)}
            />
            <select
              className="filter-select"
              value={orderStatus}
              onChange={e => setOrderStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <button className="btn" onClick={refetchOrders} title="Refresh">
              <IconRefresh />
            </button>
          </div>
        </div>

        {ordersError && <div className="error-banner">Failed to load orders: {ordersError}</div>}

        {ordersLoading ? (
          <Spinner label="Querying Elasticsearch..." />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <IconOrders />
            No orders found
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }} />
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const id = String(order.orderId);
                  const isOpen = expandedOrderId === id;
                  return (
                    <>
                      <tr
                        key={id}
                        className={`order-row${isOpen ? ' expanded' : ''}`}
                        onClick={() => toggleOrder(id)}
                      >
                        <td className="order-chevron-cell">
                          <IconChevron open={isOpen} />
                        </td>
                        <td><span className="mono">#{order.orderId}</span></td>
                        <td><span className="mono">cust-{order.customerId}</span></td>
                        <td>
                          <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td><span className="amount">${Number(order.totalAmount).toFixed(2)}</span></td>
                        <td><Badge status={order.status} /></td>
                        <td><span className="mono" style={{ fontSize: 11 }}>{formatDate(order.createdAt)}</span></td>
                      </tr>
                      <OrderDetailRow key={`${id}-detail`} order={order} open={isOpen} />
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products + Payments */}
      <div className="products-payments-grid">
        {/* Products */}
        <div className="section" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <span className="section-title">Inventory</span>
            <span className="section-count">({products.length} products)</span>
          </div>
          {productsLoading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <IconProducts />
              No products indexed yet
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const level = stockLevel(product.stock);
                const pct = Math.min((product.stock / 100) * 100, 100);
                return (
                  <div key={product.productId} className="product-card">
                    <div className="product-id">{product.productId}</div>
                    <div className="product-stock-label">Stock</div>
                    <div className="product-stock-value">{product.stock}</div>
                    <div className="stock-bar-track">
                      <div
                        className={`stock-bar-fill ${level}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="product-updated">
                      {formatDate(product.lastUpdated)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payments */}
        <div className="section" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <span className="section-title">Payments</span>
            <span className="section-count">({payments.length})</span>
          </div>
          {paymentsLoading ? (
            <Spinner />
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <IconPayments />
              No payments processed yet
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={String(p.orderId)}>
                      <td><span className="mono">#{p.orderId}</span></td>
                      <td><Badge status={p.status} /></td>
                      <td><span className="mono" style={{ fontSize: 11 }}>{formatDate(p.processedAt)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
