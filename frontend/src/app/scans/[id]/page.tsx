"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getScan, ScanDetail } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { FindingCard } from "@/components/FindingCard";

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-400",
    running: "bg-blue-400 animate-pulse",
    completed: "bg-emerald-400",
    failed: "bg-red-400",
  };
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || "bg-gray-500"}`} />;
}

export default function ScanDetailPage({ params }: { params: { id: string } }) {
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        setLoading(true);
        const data = await getScan(params.id);
        setScan(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load scan");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [params.id]);

  if (loading) {
    return <div className="text-center text-gray-500 py-12">Loading scan details…</div>;
  }

  if (error || !scan) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm">
          ← Back to Dashboard
        </Link>
        <div className="bg-red-950/20 border border-red-900 rounded-lg p-4 text-red-400">
          {error || "Scan not found"}
        </div>
      </div>
    );
  }

  const severityCounts = {
    critical: scan.critical,
    high: scan.high,
    medium: scan.medium,
    low: scan.low,
  };

  return (
    <div className="space-y-6">
      <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm inline-block">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusDot status={scan.status} />
              <h1 className="text-2xl font-bold">{scan.source_value.replace(/.*\//, "")}</h1>
            </div>
            <p className="text-sm text-gray-500">{scan.source_type} • {new Date(scan.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {severityCounts.critical > 0 && <SeverityBadge severity="critical" count={severityCounts.critical} />}
            {severityCounts.high > 0 && <SeverityBadge severity="high" count={severityCounts.high} />}
            {severityCounts.medium > 0 && <SeverityBadge severity="medium" count={severityCounts.medium} />}
            {severityCounts.low > 0 && <SeverityBadge severity="low" count={severityCounts.low} />}
            {scan.findings.length === 0 && scan.status === "completed" && (
              <span className="text-sm text-emerald-400">✓ Clean</span>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <p>Status: <span className="capitalize">{scan.status}</span></p>
          {scan.completed_at && (
            <p>Completed: {new Date(scan.completed_at).toLocaleString()}</p>
          )}
          {scan.error_message && (
            <p className="text-red-400 mt-2">Error: {scan.error_message}</p>
          )}
        </div>
      </div>

      {/* Findings */}
      {scan.findings.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Findings <span className="text-gray-500 text-sm font-normal">({scan.findings.length})</span>
          </h2>
          <div className="space-y-3">
            {scan.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>
      ) : (
        scan.status === "completed" && (
          <div className="bg-emerald-950/20 border border-emerald-900 rounded-lg p-6 text-center text-emerald-400">
            <p className="text-lg font-medium">✓ No vulnerabilities found</p>
            <p className="text-sm text-emerald-400/70 mt-1">This scan completed successfully with no security issues detected.</p>
          </div>
        )
      )}
    </div>
  );
}
