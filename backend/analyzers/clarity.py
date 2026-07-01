import textstat
import spacy
from analyzers.base import TextIssue, AnalyzerResult

nlp = spacy.load("en_core_web_sm")


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    doc = nlp(text)
    issues = []

    # Readability: average of three formulae
    fk_grade = textstat.flesch_kincaid_grade(text)
    smog = textstat.smog_index(text)
    coleman_liau = textstat.coleman_liau_index(text)
    avg_grade = (fk_grade + smog + coleman_liau) / 3

    # Map grade level to 0-100 score
    # grade 8 -> 90 (ideal for clear writing), grade 18+ -> 20 (extremely complex)
    if avg_grade <= 8:
        score = 90
    elif avg_grade >= 18:
        score = 20
    else:
        score = 90 - ((avg_grade - 8) / (18 - 8)) * (90 - 20)

    # Flag overly long sentences
    for sent in doc.sents:
        word_count = len(sent.text.split())
        if word_count > 40:
            issues.append(TextIssue(
                start=sent.start_char,
                end=sent.end_char,
                message=f"Sentence is {word_count} words long; consider splitting it",
                category="clarity",
            ))

    # Flag passive voice
    for sent in doc.sents:
        for token in sent:
            if token.dep_ in ("nsubjpass", "auxpass"):
                issues.append(TextIssue(
                    start=sent.start_char,
                    end=sent.end_char,
                    message="Passive voice detected; consider active voice for clarity",
                    category="clarity",
                ))
                break  # one flag per sentence, not per token

    suggestions = []
    if avg_grade > 12:
        suggestions.append("Consider simplifying sentence structure for better readability")
    if any(i.message.startswith("Sentence is") for i in issues):
        suggestions.append("Break up long sentences into shorter ones")

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)