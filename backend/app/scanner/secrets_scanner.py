import json
import subprocess
from pathlib import Path

from app.scanner.normalizer import NormalizedFinding


def run_secrets_scan(target: Path) -> list[NormalizedFinding]:
    findings = []

    try:
        result = subprocess.run(
            [
                "gitleaks", "detect",
                "--source", str(target),
                "--report-format", "json",
                "--report-path", "/dev/stdout",
                "--no-git",
            ],
            capture_output=True, text=True, timeout=120,
        )
        data = json.loads(result.stdout) if result.stdout else []
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        # gitleaks not installed — fall back to regex-based scan
        return _regex_fallback(target)

    for leak in data:
        findings.append(
            NormalizedFinding(
                tool="gitleaks",
                rule_id=leak.get("RuleID", "unknown"),
                severity="critical",
                title=f"Secret detected: {leak.get('Description', 'Unknown secret')}",
                description=f"Match: {leak.get('Match', '')[:80]}...",
                file_path=leak.get("File", ""),
                line_start=leak.get("StartLine"),
                line_end=leak.get("EndLine"),
                snippet=leak.get("Secret", "")[:20] + "****",
            )
        )
    return findings


def _regex_fallback(target: Path) -> list[NormalizedFinding]:
    """Basic regex-based secrets detection when gitleaks isn't available."""
    import re

    patterns = {
        "aws_key": (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
        "generic_secret": (r"""(?i)(secret|password|token|apikey|api_key)\s*[:=]\s*['"][^'"]{8,}['"]""", "Hardcoded secret"),
        "private_key": (r"-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----", "Private key file"),
        "github_token": (r"gh[pousr]_[A-Za-z0-9_]{36,}", "GitHub token"),
    }

    findings = []
    for path in target.rglob("*"):
        if not path.is_file() or path.stat().st_size > 1_000_000:
            continue
        try:
            text = path.read_text(errors="ignore")
        except Exception:
            continue

        for rule_id, (pattern, desc) in patterns.items():
            for match in re.finditer(pattern, text):
                line_num = text[: match.start()].count("\n") + 1
                findings.append(
                    NormalizedFinding(
                        tool="regex-secrets",
                        rule_id=rule_id,
                        severity="critical",
                        title=desc,
                        description=f"Potential secret found via pattern match",
                        file_path=str(path.relative_to(target)),
                        line_start=line_num,
                        snippet=match.group()[:20] + "****",
                    )
                )
    return findings
