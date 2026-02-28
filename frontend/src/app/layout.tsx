import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VulnScan — Security Scanner",
  description: "Scan repos and files for security vulnerabilities",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛡</text></svg>',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)',
          padding: '0 24px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '28px',
              height: '28px',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L2 3.5V7C2 9.8 4.2 12.4 7 13C9.8 12.4 12 9.8 12 7V3.5L7 1Z" stroke="var(--accent)" strokeWidth="1" fill="none"/>
                <path d="M5 7L6.5 8.5L9 5.5" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '16px', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                VULNSCAN
              </span>
              <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                v1.0
              </span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" className="nav-link">
              Dashboard
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              API Docs
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
                animation: 'pulse-scan 2s ease infinite',
              }} />
              <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
