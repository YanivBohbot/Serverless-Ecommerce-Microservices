import type { ReactNode } from 'react';
import { useCountUp } from '../../hooks/useAsync';

interface StatCardProps {
  label: string;
  value: number;
  format?: 'number' | 'currency';
  meta?: string;
  icon: ReactNode;
  color: 'accent' | 'green' | 'blue' | 'purple';
  delay?: number;
}

export function StatCard({ label, value, format = 'number', meta, icon, color, delay = 0 }: StatCardProps) {
  const count = useCountUp(value);

  const formatted =
    format === 'currency'
      ? `$${count.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
      : count.toLocaleString('en-US');

  return (
    <div className={`stat-card ${color}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>
      <div className="stat-value">{formatted}</div>
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  );
}
