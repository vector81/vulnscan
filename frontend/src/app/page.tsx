"use client";

import { useEffect, useState } from "react";
import { ScanForm } from "@/components/ScanForm";
import { ScanList } from "@/components/ScanList";
import { listScans, ScanSummary } from "@/lib/api";

export default function Home() {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await listScans();
      setScans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, []);

  const totals = scans.reduce(
    (acc, s) => ({
      critical: acc.critical + s.critical,
      high: acc.high + s.high,
      medium: acc.medium + s.medium,
      low: acc.low + s.low,
      total: acc.total + s.finding_count,
      scans: acc.scans + 1,
    }),
    { critical: 0, high: 0, medium: 0, low: 0, total: 0, scans: 0 }
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Security Analysis
          </p>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '28px', color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
            Threat Dashboard
          </h1>
        </div>
        <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px' }}>
        <StatCard label="TOTAL SCANS" value={totals.scans} valueColor="var(--text)" accent="var(--border-bright)" index={0} />
        <StatCard label="CRITICAL" value={totals.critical} valueColor="var(--critical)" accent="var(--critical)" bg="var(--critical-dim)" index={1} />
        <StatCard label="HIGH" value={totals.high} valueColor="var(--high)" accent="var(--high)" bg="var(--high-dim)" index={2} />
        <StatCard label="MEDIUM" value={totals.medium} valueColor="var(--medium)" accent="var(--medium)" bg="var(--medium-dim)" index={3} />
        <StatCard label="LOW" value={totals.low} valueColor="var(--low)" accent="var(--low)" bg="var(--low-dim)" index={4} />
      </div>

      {/* Distribution Bar */}
      {totals.total > 0 && (
        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          padding: '20px 24px',
          animation: 'fadeInUp 0.4s ease forwards',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Finding Distribution
            </span>
            <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)' }}>
              {totals.total} total
            </span>
          </div>
          <div style={{
            display: 'flex',
            height: '6px',
            background: 'var(--bg-3)',
            overflow: 'hidden',
            gap: '1px',
          }}>
            {totals.critical > 0 && (
              <div style={{ width: `${(totals.critical / totals.total) * 100}%`, background: 'var(--critical)', transition: 'width 0.5s ease' }} />
            )}
            {totals.high > 0 && (
              <div style={{ width: `${(totals.high / totals.total) * 100}%`, background: 'var(--high)', transition: 'width 0.5s ease' }} />
            )}
            {totals.medium > 0 && (
              <div style={{ width: `${(totals.medium / totals.total) * 100}%`, background: 'var(--medium)', transition: 'width 0.5s ease' }} />
            )}
            {totals.low > 0 && (
              <div style={{ width: `${(totals.low / totals.total) * 100}%`, background: 'var(--low)', transition: 'width 0.5s ease' }} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '10px' }}>
            {[
              { label: 'Critical', count: totals.critical, color: 'var(--critical)' },
              { label: 'High', count: totals.high, color: 'var(--high)' },
              { label: 'Medium', count: totals.medium, color: 'var(--medium)' },
              { label: 'Low', count: totals.low, color: 'var(--low)' },
            ].filter(s => s.count > 0).map(s => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span style={{ width: '6px', height: '6px', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                {s.label} {s.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <ScanForm onSubmitted={refresh} />
      <ScanList scans={scans} loading={loading} />
    </div>
  );
}

function StatCard({
  label, value, valueColor, accent, bg, index
}: {
  label: string; value: number; valueColor: string; accent: string; bg?: string; index: number;
}) {
  return (
    <div style={{
      background: bg || 'var(--bg-2)',
      borderTop: `2px solid ${value > 0 ? accent : 'var(--border)'}`,
      padding: '16px 20px',
      opacity: value === 0 ? 0.4 : 1,
      animation: `fadeInUp 0.4s ease ${index * 0.06}s both`,
      transition: 'opacity 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      minHeight: '90px',
    }}>
      <p style={{ fontFamily: 'Space Mono', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', marginTop: 0 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '32px', color: valueColor, lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  );
}
