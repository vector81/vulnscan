from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel

from app.models import ScanStatus, Severity


# --- Requests ---

class ScanRepoRequest(BaseModel):
    repo_url: str


class ScanFileRequest(BaseModel):
    filename: str


# --- Responses ---

class FindingOut(BaseModel):
    id: uuid.UUID
    tool: str
    rule_id: str
    severity: Severity
    title: str
    description: str
    file_path: str
    line_start: int | None
    line_end: int | None
    snippet: str | None

    class Config:
        from_attributes = True


class ScanOut(BaseModel):
    id: uuid.UUID
    source_type: str
    source_value: str
    status: ScanStatus
    created_at: datetime
    completed_at: datetime | None
    error_message: str | None
    findings: list[FindingOut] = []

    class Config:
        from_attributes = True


class ScanSummary(BaseModel):
    id: uuid.UUID
    source_type: str
    source_value: str
    status: ScanStatus
    created_at: datetime
    completed_at: datetime | None
    finding_count: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0

    class Config:
        from_attributes = True
