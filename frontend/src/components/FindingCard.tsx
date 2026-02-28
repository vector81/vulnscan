import { Finding } from "@/lib/api";
import { SeverityBadge } from "./SeverityBadge";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      borderLeft: `2px solid ${
        finding.severity === 'critical' ? 'var(--critical)' :
        finding.severity === 'high' ? 'var(--high)' :
        finding.severity === 'medium' ? 'var(--medium)' :
        'var(--low)'
      }`,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <SeverityBadge severity={finding.severity} />
            <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              {finding.tool}
            </span>
          </div>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: 'var(--text)', margin: 0 }}>
            {finding.title}
          </h3>
        </div>
      </div>

      <p style={{ fontFamily: 'Syne', fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
        {finding.description}
      </p>

      <div style={{ fontFamily: 'Space Mono', fontSize: '11px', color: 'var(--accent)', opacity: 0.7 }}>
        {finding.file_path}
        {finding.line_start && `  :${finding.line_start}`}
        {finding.line_end && finding.line_end !== finding.line_start && `–${finding.line_end}`}
      </div>

      {finding.snippet && (
        <pre style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          padding: '12px 16px',
          fontFamily: 'Space Mono',
          fontSize: '11px',
          color: 'var(--text-muted)',
          overflowX: 'auto',
          margin: 0,
          lineHeight: 1.6,
        }}>
          {finding.snippet}
        </pre>
      )}

      <div style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
        RULE: {finding.rule_id}
      </div>
    </div>
  );
}
