import language_tool_python
from analyzers.base import TextIssue, AnalyzerResult
import spacy
nlp = spacy.load("en_core_web_sm")

# Initialize once at module level — starts the JVM, do NOT call this per request
tool = language_tool_python.LanguageTool('en-US')


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    matches = tool.check(text)
    doc = nlp(text)
    entity_spans = [(ent.start_char, ent.end_char) for ent in doc.ents]

    def is_named_entity(token_start: int, token_text: str) -> bool:
        in_span = any(start <= token_start < end for start, end in entity_spans)
        is_camel = token_text[0].isupper() and any(c.isupper() for c in token_text[1:])
        return in_span or is_camel

    issues = [
        TextIssue(
            start=m.offset,
            end=m.offset + m.error_length,
            message=m.message,
            category='grammar',
        )
        for m in matches
        if not is_named_entity(m.offset, text[m.offset:m.offset + m.error_length])
    ]

    word_count = max(len(text.split()), 1)
    error_rate = len(issues) / word_count * 100
    score = max(0, 100 - error_rate * 3)  # softer penalty

    suggestions = [f"'{m.context}' — {m.message}" for m in matches 
               if not is_named_entity(m.offset, text[m.offset:m.offset + m.error_length])][:3]

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)