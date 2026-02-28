"""
Simple Redis-based worker. Polls a list for scan job IDs.
Run with: python -m app.worker
"""
import time
import uuid
from datetime import datetime, timezone

from redis import Redis
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.models import Scan, Finding, ScanStatus, Base
from app.scanner.engine import run_all_scans

# Sync DB connection for the worker
sync_url = settings.DATABASE_URL.replace("+asyncpg", "")
engine = create_engine(sync_url)
SessionLocal = sessionmaker(bind=engine)

redis_client = Redis.from_url(settings.REDIS_URL)


def process_scan(scan_id: str):
    db: Session = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == uuid.UUID(scan_id)).first()
        if not scan:
            print(f"[worker] scan {scan_id} not found")
            return

        scan.status = ScanStatus.RUNNING
        db.commit()
        print(f"[worker] running scan {scan_id} — {scan.source_type}: {scan.source_value}")

        try:
            results = run_all_scans(scan.source_type, scan.source_value)
        except Exception as e:
            scan.status = ScanStatus.FAILED
            scan.error_message = str(e)[:2000]
            scan.completed_at = datetime.now(timezone.utc)
            db.commit()
            print(f"[worker] scan {scan_id} FAILED: {e}")
            return

        for r in results:
            finding = Finding(
                scan_id=scan.id,
                tool=r.tool,
                rule_id=r.rule_id,
                severity=r.severity,
                title=r.title,
                description=r.description,
                file_path=r.file_path,
                line_start=r.line_start,
                line_end=r.line_end,
                snippet=r.snippet,
            )
            db.add(finding)

        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.now(timezone.utc)
        db.commit()
        print(f"[worker] scan {scan_id} COMPLETED — {len(results)} findings")

    finally:
        db.close()


def main():
    print("[worker] VulnScan worker started. Waiting for jobs...")
    Base.metadata.create_all(engine)

    while True:
        # Blocking pop with 5s timeout
        job = redis_client.blpop("vulnscan:jobs", timeout=5)
        if job:
            _, scan_id = job
            process_scan(scan_id.decode())
        else:
            time.sleep(0.1)


if __name__ == "__main__":
    main()
