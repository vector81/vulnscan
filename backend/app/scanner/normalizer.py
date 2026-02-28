from dataclasses import dataclass


@dataclass
class NormalizedFinding:
    tool: str
    rule_id: str
    severity: str      # critical, high, medium, low, info
    title: str
    description: str
    file_path: str
    line_start: int | None = None
    line_end: int | None = None
    snippet: str | None = None
