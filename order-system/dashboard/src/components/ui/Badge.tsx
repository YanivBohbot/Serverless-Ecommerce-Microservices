interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  const cls = `badge badge-${status.toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}
