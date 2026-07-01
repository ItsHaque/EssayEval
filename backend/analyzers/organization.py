import json
import os
import spacy
from lib.embeddings import encode, cosine_similarity
from analyzers.base import TextIssue, AnalyzerResult

nlp = spacy.load("en_core_web_sm")

# Transition words list
TRANSITION_WORDS = {
    "however", "therefore", "furthermore", "moreover", "nevertheless",
    "consequently", "additionally", "meanwhile", "subsequently", "thus",
    "hence", "otherwise", "nonetheless", "accordingly", "indeed",
    "similarly", "conversely", "alternatively", "finally", "firstly",
    "secondly", "thirdly", "lastly", "in conclusion", "in summary",
    "for example", "for instance", "in contrast", "on the other hand",
    "as a result", "in addition", "that is", "in other words"
}

INTRO_SIGNALS = {"introduction", "begin", "first", "this essay", "this paper", "aim", "purpose"}
CONCLUSION_SIGNALS = {"conclusion", "conclude", "summary", "summarize", "finally", "overall", "in sum"}


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    issues = []
    suggestions = []

    # Paragraph structure check
    if len(paragraphs) < 3:
        issues.append(TextIssue(
            start=0, end=len(text),
            message=f"Essay has only {len(paragraphs)} paragraph(s); aim for at least 3",
            category="organization",
        ))
        suggestions.append("Structure your essay with an introduction, body paragraphs, and conclusion")

    # Transition word check per paragraph
    transition_count = 0
    for para in paragraphs:
        doc = nlp(para)
        first_sentence = next(doc.sents, None)
        if first_sentence:
            first_tokens = first_sentence.text.lower()
            if any(tw in first_tokens for tw in TRANSITION_WORDS):
                transition_count += 1

    transition_ratio = transition_count / max(len(paragraphs), 1)

    # Intro/conclusion signal check
    if paragraphs:
        first_para = paragraphs[0].lower()
        last_para = paragraphs[-1].lower()
        has_intro = any(sig in first_para for sig in INTRO_SIGNALS)
        has_conclusion = any(sig in last_para for sig in CONCLUSION_SIGNALS)

        if not has_intro and len(paragraphs) >= 2:
            suggestions.append("Consider adding a clearer introduction to your essay")
        if not has_conclusion and len(paragraphs) >= 2:
            suggestions.append("Consider adding a clearer conclusion to your essay")

    # Coherence: encode paragraphs and check adjacent similarity
    coherence_issues = 0
    if len(paragraphs) >= 2:
        para_embeddings = encode(paragraphs)
        for i in range(len(paragraphs) - 1):
            sim = cosine_similarity(para_embeddings[i], para_embeddings[i + 1])
            if sim < 0.25:
                coherence_issues += 1
                issues.append(TextIssue(
                    start=text.find(paragraphs[i + 1]),
                    end=text.find(paragraphs[i + 1]) + len(paragraphs[i + 1]),
                    message=f"Abrupt topic shift detected between paragraphs (similarity: {sim:.2f})",
                    category="organization",
                ))
            elif sim > 0.95:
                issues.append(TextIssue(
                    start=text.find(paragraphs[i + 1]),
                    end=text.find(paragraphs[i + 1]) + len(paragraphs[i + 1]),
                    message="Paragraphs may be too repetitive",
                    category="organization",
                ))

    # Score: paragraph structure (30%) + transitions (30%) + coherence (40%)
    structure_score = 100 if len(paragraphs) >= 3 else (len(paragraphs) / 3) * 100
    transition_score = min(100, transition_ratio * 100 * 2)  # reward transitions
    coherence_score = max(0, 100 - (coherence_issues / max(len(paragraphs) - 1, 1)) * 100)

    score = (structure_score * 0.3) + (transition_score * 0.3) + (coherence_score * 0.4)

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)