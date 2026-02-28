import uuid
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from redis import Redis

from app.config import settings
from app.database import get_db
from app.models import Scan, ScanStatus, Finding, Severity
from app.schemas import ScanRepoRequest, ScanOut, ScanSummary

router = APIRouter()


def get_redis() -> Redis:
    return Redis.from_url(settings.REDIS_URL)


def enqueue_scan(scan_id: str):
    """Push scan job onto Redis list for the worker."""
    r = get_redis()
    r.rpush("vulnscan:jobs", scan_id)


@router.post("/repo", response_model=ScanOut)
async def scan_repo(body: ScanRepoRequest, db: AsyncSession = Depends(get_db)):
    scan = Scan(source_type="repo", source_value=body.repo_url, status=ScanStatus.PENDING)
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    enqueue_scan(str(scan.id))
    return scan


@router.post("/file", response_model=ScanOut)
async def scan_file(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    scan_dir = Path(settings.SCAN_DIR) / "uploads"
    scan_dir.mkdir(parents=True, exist_ok=True)

    file_id = uuid.uuid4().hex
    dest = scan_dir / f"{file_id}_{file.filename}"
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    scan = Scan(source_type="file", source_value=str(dest), status=ScanStatus.PENDING)
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    enqueue_scan(str(scan.id))
    return scan


@router.get("/", response_model=list[ScanSummary])
async def list_scans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scan).options(selectinload(Scan.findings)).order_by(Scan.created_at.desc()).limit(50)
    )
    scans = result.scalars().all()

    summaries = []
    for s in scans:
        counts = {sev: 0 for sev in Severity}
        for f in s.findings:
            counts[f.severity] += 1
        summaries.append(
            ScanSummary(
                id=s.id,
                source_type=s.source_type,
                source_value=s.source_value,
                status=s.status,
                created_at=s.created_at,
                completed_at=s.completed_at,
                finding_count=len(s.findings),
                critical=counts[Severity.CRITICAL],
                high=counts[Severity.HIGH],
                medium=counts[Severity.MEDIUM],
                low=counts[Severity.LOW],
            )
        )
    return summaries


@router.get("/{scan_id}", response_model=ScanOut)
async def get_scan(scan_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scan).where(Scan.id == scan_id).options(selectinload(Scan.findings))
    )
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(404, "Scan not found")
    return scan


@router.delete("/{scan_id}")
async def delete_scan(scan_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(404, "Scan not found")
    await db.delete(scan)
    await db.commit()
    return {"deleted": True}
