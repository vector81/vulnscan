import json
import subprocess
from pathlib import Path

from app.scanner.normalizer import NormalizedFinding

SEVERITY_MAP = {
    "CRITICAL": "critical",
    "HIGH": "high",
    "MODERATE": "medium",
    "LOW": "low",
}


def _scan_npm(target: Path) -> list[NormalizedFinding]:
    findings = []
    package_json = target / "package.json"
    if not package_json.exists():
        return findings

    try:
        result = subprocess.run(
            ["npm", "audit", "--json"],
            capture_output=True, text=True, cwd=str(target), timeout=120,
        )
        data = json.loads(result.stdout) if result.stdout else {}
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        return findings

    for vuln_id, vuln in data.get("vulnerabilities", {}).items():
        findings.append(
            NormalizedFinding(
                tool="npm-audit",
                rule_id=vuln_id,
                severity=SEVERITY_MAP.get(vuln.get("severity", "").upper(), "medium"),
                title=f"Vulnerable dependency: {vuln_id}",
                description=vuln.get("title", "") or json.dumps(vuln.get("via", [])[:2]),
                file_path="package.json",
                line_start=None,
                line_end=None,
                snippet=f"Range: {vuln.get('range', 'unknown')}",
            )
        )
    return findings


def _scan_pip(target: Path) -> list[NormalizedFinding]:
    findings = []
    req_file = target / "requirements.txt"
    if not req_file.exists():
        return findings

    try:
        result = subprocess.run(
            ["pip-audit", "-r", str(req_file), "-f", "json", "--desc"],
            capture_output=True, text=True, timeout=120,
        )
        data = json.loads(result.stdout) if result.stdout else []
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        return findings

    for vuln in data:
        findings.append(
            NormalizedFinding(
                tool="pip-audit",
                rule_id=vuln.get("id", "unknown"),
                severity="high",
                title=f"Vulnerable package: {vuln.get('name')} {vuln.get('version')}",
                description=vuln.get("description", ""),
                file_path="requirements.txt",
            )
        )
    return findings


def run_dependency_scan(target: Path) -> list[NormalizedFinding]:
    findings = []
    findings.extend(_scan_npm(target))
    findings.extend(_scan_pip(target))
    return findings
