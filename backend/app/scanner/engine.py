import shutil
import tempfile
from pathlib import Path

import git

from app.scanner.semgrep_scanner import run_semgrep
from app.scanner.dependency_scanner import run_dependency_scan
from app.scanner.secrets_scanner import run_secrets_scan
from app.scanner.normalizer import NormalizedFinding


def clone_repo(url: str, dest: Path):
    git.Repo.clone_from(url, str(dest), depth=1)


def prepare_target(source_type: str, source_value: str) -> Path:
    """Clone repo or extract uploaded file into a temp directory."""
    work_dir = Path(tempfile.mkdtemp(prefix="vulnscan_"))

    if source_type == "repo":
        clone_repo(source_value, work_dir)
    elif source_type == "file":
        src = Path(source_value)
        if src.suffix in (".zip", ".tar", ".gz", ".tgz"):
            shutil.unpack_archive(str(src), str(work_dir))
        else:
            target = work_dir / src.name
            shutil.copy2(str(src), str(target))
    return work_dir


def run_all_scans(source_type: str, source_value: str) -> list[NormalizedFinding]:
    work_dir = prepare_target(source_type, source_value)

    findings: list[NormalizedFinding] = []

    try:
        findings.extend(run_semgrep(work_dir))
        findings.extend(run_dependency_scan(work_dir))
        findings.extend(run_secrets_scan(work_dir))
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

    return findings
