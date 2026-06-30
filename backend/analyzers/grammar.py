import language_tool_python
from analyzers.base import TextIssue, AnalyzerResult

# Initialize once at module level — starts the JVM, do NOT call this per request
tool = language_tool_python.LanguageTool('en-US')


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    matches = tool.check(text)

    issues = [
        TextIssue(
            start=m.offset,
            end=m.offset + m.error_length,
            message=m.message,
            category='grammar',
        )
        for m in matches
    ]

    word_count = max(len(text.split()), 1)
    error_rate = len(matches) / word_count * 100
    score = max(0, 100 - error_rate * 10)

    suggestions = [f"'{m.context}' — {m.message}" for m in matches[:3]]

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)