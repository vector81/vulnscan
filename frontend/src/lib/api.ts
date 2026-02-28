const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ScanSummary {
  id: string;
  source_type: string;
  source_value: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  finding_count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface Finding {
  id: string;
  tool: string;
  rule_id: string;
  severity: string;
  title: string;
  description: string;
  file_path: string;
  line_start: number | null;
  line_end: number | null;
  snippet: string | null;
}

export interface ScanDetail extends Omit<ScanSummary, "finding_count"> {
  error_message: string | null;
  findings: Finding[];
}

export async function submitRepoScan(repoUrl: string): Promise<ScanDetail> {
  const res = await fetch(`${BASE}/api/scans/repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  return res.json();
}

export async function submitFileScan(file: File): Promise<ScanDetail> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/api/scans/file`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function listScans(): Promise<ScanSummary[]> {
  const res = await fetch(`${BASE}/api/scans/`);
  return res.json();
}

export async function getScan(id: string): Promise<ScanDetail> {
  const res = await fetch(`${BASE}/api/scans/${id}`);
  return res.json();
}

export async function submitCodeScan(code: string, filename?: string): Promise<ScanDetail> {
  const res = await fetch(`${BASE}/api/scans/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, filename: filename || "pasted_code" }),
  });
  return res.json();
}
