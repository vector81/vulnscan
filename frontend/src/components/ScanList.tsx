"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanSummary } from "@/lib/api";
import { SeverityBadge } from "./SeverityBadge";

function StatusDot({ status }: { status: string }) {
  const config: Record<string, { color: string; glow: string }> = {
    pending: { color: '#ffc700', glow: 'rgba(255, 199, 0, 0.4)' },
    running: { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' },
    completed: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)' },
    failed: { color: '#ff3b3b', glow: 'rgba(255, 59, 59, 0.4)' },
  };
  const c = config[status] || { color: '#4a6070', glow: 'transparent' };
  return (
    <span style={{
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: c.color,
      boxShadow: `0 0 6px ${c.glow}`,
      display: 'inline-block',
      flexShrink: 0,
      animation: status === 'running' ? 'pulse-scan 1.2s ease infinite' : 'none',
    }} />
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function ScanDuration({ scan }: { scan: ScanSummary }) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (scan.status !== "running") return;
    const calculateElapsed = () => {
      const start = new Date(scan.created_at).getTime();
      return Math.floor((Date.now() - start) / 1000);
    };
    setElapsed(calculateElapsed());
    const interval = setInterval(() => setElapsed(calculateElapsed()), 1000);
    return () => clearInterval(interval);
  }, [scan.status, scan.created_at]);

  if (scan.status === "pending") return <span style={durationStyle}>--</span>;
  if (scan.status === "running") return <span style={{ ...durationStyle, color: 'var(--accent)' }}>{elapsed}s</span>;
  if (scan.status === "completed" && scan.completed_at) {
    const seconds = Math.floor((new Date(scan.completed_at).getTime() - new Date(scan.created_at).getTime()) / 1000);
    return <span style={durationStyle}>{formatDuration(seconds)}</span>;
  }
  return <span style={durationStyle}>--</span>;
}

const durationStyle = {
  fontFamily: 'Space Mono',
  fontSize: '10px',
  color: 'var(--text-muted)',
} as React.CSSProperties;

export function ScanList({ scans, loading }: { scans: ScanSummary[]; loading: boolean }) {
  if (loading && scans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: 'Space Mono', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          LOADING...
        </p>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--border)' }}>
        <p style={{ fontFamily: 'Space Mono', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          NO SCANS YET
        </p>
        <p style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>
          Submit a repo or file above to begin
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 100px 200px 60px',
        gap: '16px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2px',
      }}>
        {['', 'TARGET', 'FINDINGS', 'TIME', 'DURATION'].map(h => (
          <span key={h} style={{
            fontFamily: 'Space Mono',
            fontSize: '9px',
            color: 'var(--text-dim)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>{h}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {scans.map((s, i) => (
          <ScanRow key={s.id} scan={s} index={i} />
        ))}
      </div>
    </div>
  );
}

function ScanRow({ scan: s, index }: { scan: ScanSummary; index: number }) {
  const [hovered, setHovered] = useState(false);
  const name = s.source_value.replace(/.*\//, '');

  return (
    <Link
      href={`/scans/${s.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 100px 200px 60px',
        gap: '16px',
        padding: '12px 16px',
        background: hovered ? 'var(--bg-3)' : 'var(--bg-2)',
        borderLeft: hovered ? '2px solid var(--accent)' : '2px solid transparent',
        textDecoration: 'none',
        alignItems: 'center',
        transition: 'all 0.12s ease',
        animation: `fadeInUp 0.3s ease ${index * 0.04}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StatusDot status={s.status} />

      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'Space Mono',
            fontSize: '12px',
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {name}
          </span>
          <span style={{
            fontFamily: 'Space Mono',
            fontSize: '9px',
            color: 'var(--text-dim)',
            background: 'var(--bg-3)',
            padding: '2px 6px',
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}>
            {s.source_type.toUpperCase()}
          </span>
        </div>
        {s.status === 'running' && (
          <div style={{
            height: '2px',
            background: 'var(--bg-3)',
            marginTop: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '40%',
              background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {s.critical > 0 && <SeverityBadge severity="critical" count={s.critical} />}
        {s.high > 0 && <SeverityBadge severity="high" count={s.high} />}
        {s.medium > 0 && <SeverityBadge severity="medium" count={s.medium} />}
        {s.low > 0 && <SeverityBadge severity="low" count={s.low} />}
        {s.finding_count === 0 && s.status === 'completed' && (
          <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#00ff88' }}>CLEAN</span>
        )}
      </div>

      <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)' }}>
        {new Date(s.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>

      <ScanDuration scan={s} />
    </Link>
  );
}
