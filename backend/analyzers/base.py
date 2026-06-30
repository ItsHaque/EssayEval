from dataclasses import dataclass
from typing import List


@dataclass
class TextIssue:
    start: int      # character offset where the issue begins
    end: int        # character offset where the issue ends
    message: str    # human-readable description of the issue
    category: str   # which category this issue belongs to (e.g. 'grammar')


@dataclass
class AnalyzerResult:
    score: float            # 0–100
    issues: List[TextIssue]
    suggestions: List[str]