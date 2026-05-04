import { useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Spinner } from '../components/ui/Spinner';
import type { Analytics } from '../types';

const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3C9.5 3 7.5 5 7.5 7.5c0 1.2.5 2.2 1.2 3C7.7 11.2 7 12.6 7 14c0 2.8 2.2 5 5 5h0c2.8 0 5-2.2 5-5 0-1.4-.7-2.8-1.7-3.5.7-.8 1.2-1.8 1.2-3C16.5 5 14.5 3 12 3Z" />
    <path d="M12 9v10M9 13H7M17 13h-2" strokeLinecap="round" />
  </svg>
);
const IconSparkle = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 1v14M1 8h14M4 4l8 8M12 4l-8 8" strokeLinecap="round" opacity=".5" />
    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
  </svg>
);

function parseInsights(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return <strong key={i} className="insight-heading">{inner}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="status-bar-item">
      <span className="status-bar-label">{label}</span>
      <div className="status-bar-track">
        <div className="status-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="status-bar-count">{count}</span>
    </div>
  );
}

function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
  const totalRevenue = analytics.total_revenue?.value ?? 0;
  const statusBuckets = analytics.orders_by_status?.buckets ?? [];
  const totalOrders = statusBuckets.reduce((s, b) => s + b.doc_count, 0);

  const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    COMPLETED: '#22C55E',
    FAILED: '#EF4444',
  };

  return (
    <div className="analytics-grid">
      <div className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-card-title">Total Revenue</span>
        </div>
        <div className="analytics-card-body">
          <div className="total-revenue-value">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="total-revenue-label">across {totalOrders} orders</div>
        </div>
      </div>

      <div className="analytics-card">
        <div className="analytics-card-header">
          <span className="analytics-card-title">Orders by Status</span>
        </div>
        <div className="analytics-card-body">
          <div className="status-bars">
            {statusBuckets.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                No data yet
              </div>
            ) : (
              statusBuckets.map(b => (
                <StatusBar
                  key={b.key}
                  label={b.key}
                  count={b.doc_count}
                  total={totalOrders}
                  color={statusColors[b.key] ?? '#60A5FA'}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Insights() {
  const [insightsText, setInsightsText] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const { data: analyticsData, loading: analyticsLoading } =
    useAsync(() => api.analytics.get(), []);

  const generateInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    setInsightsText(null);
    try {
      const res = await api.insights.get();
      setInsightsText(res.insights);
    } catch (e) {
      setInsightsError((e as Error).message);
    } finally {
      setInsightsLoading(false);
    }
  };

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Intelligence</h1>
          <div className="page-subtitle">ai insights / powered by aws bedrock · gemma-3-4b-it</div>
        </div>
        <div className="header-meta">
          <span className="header-time">{now}</span>
        </div>
      </div>

      {/* Analytics */}
      {analyticsLoading ? (
        <Spinner label="Loading analytics..." />
      ) : analyticsData?.analytics ? (
        <AnalyticsPanel analytics={analyticsData.analytics} />
      ) : null}

      {/* AI Insights Panel */}
      <div className="section">
        <div className="insights-hero">
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}>AI Business Insights</div>
            <p className="insights-description">
              Analyze your order history, inventory levels, and payment data to generate
              actionable business intelligence using AWS Bedrock.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={generateInsights}
            disabled={insightsLoading}
            style={{ flexShrink: 0 }}
          >
            {insightsLoading ? (
              <>
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                Analyzing...
              </>
            ) : (
              <>
                <IconSparkle />
                Generate Insights
              </>
            )}
          </button>
        </div>

        <div className="insights-body">
          {insightsError && (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              Intelligence service error: {insightsError}
            </div>
          )}

          {insightsLoading && (
            <Spinner label="Bedrock is analyzing your data..." />
          )}

          {!insightsLoading && !insightsText && !insightsError && (
            <div className="insights-placeholder">
              <IconBrain />
              <p>Click <strong>Generate Insights</strong> to run an AI analysis of your current orders, inventory, and revenue data.</p>
              <span className="hint">// connects to AWS Bedrock → google.gemma-3-4b-it-v1:0</span>
            </div>
          )}

          {insightsText && !insightsLoading && (
            <div className="insights-text">
              {parseInsights(insightsText)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
