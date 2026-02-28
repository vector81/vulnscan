const config: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--critical)', bg: 'var(--critical-dim)' },
  high: { color: 'var(--high)', bg: 'var(--high-dim)' },
  medium: { color: 'var(--medium)', bg: 'var(--medium-dim)' },
  low: { color: 'var(--low)', bg: 'var(--low-dim)' },
  info: { color: 'var(--text-muted)', bg: 'var(--bg-3)' },
};

export function SeverityBadge({ severity, count }: { severity: string; count?: number }) {
  const c = config[severity] || config.info;
  return (
    <span style={{
      fontFamily: 'Space Mono',
      fontSize: '9px',
      letterSpacing: '0.08em',
      padding: '2px 6px',
      background: c.bg,
      color: c.color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      whiteSpace: 'nowrap',
      borderLeft: `2px solid ${c.color}`,
    }}>
      {count !== undefined ? `${count}` : ''}{count !== undefined ? ' ' : ''}{severity.toUpperCase()}
    </span>
  );
}
