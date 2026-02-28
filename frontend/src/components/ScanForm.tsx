"use client";

import { useState, useRef } from "react";
import { submitRepoScan, submitFileScan, submitCodeScan } from "@/lib/api";

export function ScanForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [tab, setTab] = useState<"repo" | "file" | "code">("repo");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("");

  const handleRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setSubmitting(true);
    try {
      await submitRepoScan(repoUrl.trim());
      setRepoUrl("");
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitting(true);
    try {
      await submitFileScan(file);
      onSubmitted();
    } finally {
      setSubmitting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      await submitCodeScan(code.trim(), filename.trim() || undefined);
      setCode("");
      setFilename("");
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    flex: 1,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    padding: '10px 14px',
    fontFamily: 'Space Mono',
    fontSize: '12px',
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties;

  const tabs = [
    { id: 'repo', label: 'GIT REPO' },
    { id: 'file', label: 'UPLOAD FILE' },
    { id: 'code', label: 'PASTE CODE' },
  ] as const;

  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      animation: 'fadeInUp 0.4s ease 0.3s both',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--text)', letterSpacing: '0.05em' }}>
          NEW SCAN
        </span>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: 'Space Mono',
                fontSize: '10px',
                letterSpacing: '0.1em',
                padding: '6px 14px',
                border: '1px solid var(--border)',
                marginLeft: '-1px',
                background: tab === t.id ? 'var(--accent-dim)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px' }}>
        {tab === 'repo' ? (
          <form onSubmit={handleRepo} style={{ display: 'flex', gap: '0' }}>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo.git"
              style={{ ...inputStyle, borderRight: 'none' }}
              required
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? 'var(--accent-dim)' : 'var(--accent)',
                color: submitting ? 'var(--accent)' : 'var(--bg)',
                border: 'none',
                padding: '10px 28px',
                fontFamily: 'Space Mono',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {submitting ? 'SCANNING...' : 'SCAN →'}
            </button>
          </form>
        ) : tab === 'file' ? (
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px dashed var(--border)',
              padding: '24px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V13M10 3L6 7M10 3L14 7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 15H17" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <p style={{ fontFamily: 'Space Mono', fontSize: '12px', color: 'var(--text)', margin: '0 0 4px' }}>
                  {submitting ? 'Uploading...' : 'Drop file or click to upload'}
                </p>
                <p style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>
                  .py .js .ts .go .rs .java .zip .tar.gz
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                onChange={handleFile}
                disabled={submitting}
                style={{ display: 'none' }}
                accept=".py,.js,.ts,.go,.rs,.java,.zip,.tar.gz,.tgz,.rb,.php,.c,.cpp,.h"
              />
            </label>
          </div>
        ) : (
          <form onSubmit={handleCode} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="filename.js  (optional)"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste code here..."
              rows={8}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: '1.6',
              }}
              required
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? 'var(--accent-dim)' : 'var(--accent)',
                  color: submitting ? 'var(--accent)' : 'var(--bg)',
                  border: 'none',
                  padding: '10px 28px',
                  fontFamily: 'Space Mono',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: submitting ? 'wait' : 'pointer',
                }}
              >
                {submitting ? 'SCANNING...' : 'SCAN →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
