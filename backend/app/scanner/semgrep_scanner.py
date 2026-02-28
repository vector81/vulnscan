import json
import subprocess
from pathlib import Path

from app.scanner.normalizer import NormalizedFinding

SEVERITY_MAP = {
    "ERROR": "high",
    "WARNING": "medium",
    "INFO": "low",
}


def run_semgrep(target: Path) -> list[NormalizedFinding]:
    findings: list[NormalizedFinding] = []

    try:
        result = subprocess.run(
            [
                "semgrep", "scan",
                "--config", "auto",
                "--json",
                "--quiet",
                str(target),
            ],
            capture_output=True,
            text=True,
            timeout=300,
        )
        data = json.loads(result.stdout) if result.stdout else {}
    except (subprocess.TimeoutExpired, json.JSONDecodeError):
        return findings

    for r in data.get("results", []):
        sev = SEVERITY_MAP.get(r.get("extra", {}).get("severity", "INFO"), "low")

        # read a snippet
        snippet = r.get("extra", {}).get("lines", "")

        findings.append(
            NormalizedFinding(
                tool="semgrep",
                rule_id=r.get("check_id", "unknown"),
                severity=sev,
                title=r.get("check_id", "").split(".")[-1].replace("-", " ").title(),
                description=r.get("extra", {}).get("message", ""),
                file_path=str(Path(r.get("path", "")).relative_to(target))
                if r.get("path", "").startswith(str(target))
                else r.get("path", ""),
                line_start=r.get("start", {}).get("line"),
                line_end=r.get("end", {}).get("line"),
                snippet=snippet[:1000] if snippet else None,
            )
        )

    return findings
