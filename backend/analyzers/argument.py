import spacy
from analyzers.base import TextIssue, AnalyzerResult

nlp = spacy.load("en_core_web_sm")

CLAIM_PHRASES = {"it is clear", "evidence shows", "this proves", "i argue", "i believe", "this demonstrates"}
EVIDENCE_PHRASES = {
    "according to", "studies show", "research indicates", "for example",
    "for instance", "statistics show", "data shows", "evidence shows",
    "evidence suggests", "the data supports", "studies indicate",
    "research shows", "studies suggest"
}
CONCESSION_PHRASES = {"although", "while it is true", "critics argue", "on the other hand", "admittedly", "despite", "even though"}
CONNECTOR_WORDS = {"however", "therefore", "because", "since", "as a result", "consequently", "thus", "hence"}


def has_modal(sent) -> bool:
    return any(token.tag_ == "MD" for token in sent)


def contains_phrase(text: str, phrases: set) -> bool:
    text_lower = text.lower()
    return any(phrase in text_lower for phrase in phrases)


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    doc = nlp(text)
    sentences = list(doc.sents)
    issues = []

    claim_indices = []
    evidence_indices = []

    for i, sent in enumerate(sentences):
        sent_text = sent.text
        if has_modal(sent) or contains_phrase(sent_text, CLAIM_PHRASES):
            claim_indices.append(i)
        if contains_phrase(sent_text, EVIDENCE_PHRASES):
            evidence_indices.append(i)

    # Check claim-evidence pairing
    supported_claims = 0
    for ci in claim_indices:
        # Evidence must appear within 2 sentences after the claim
        has_evidence = any(ci < ei <= ci + 2 for ei in evidence_indices)
        if has_evidence:
            supported_claims += 1
        else:
            sent = sentences[ci]
            issues.append(TextIssue(
                start=sent.start_char,
                end=sent.end_char,
                message="Claim appears unsupported — consider adding evidence",
                category="argument",
            ))

    claim_evidence_ratio = supported_claims / max(len(claim_indices), 1)

    # Counterargument bonus
    has_counterargument = contains_phrase(text, CONCESSION_PHRASES)

    # Connector density
    connector_count = sum(1 for sent in sentences if contains_phrase(sent.text, CONNECTOR_WORDS))
    connector_density = connector_count / max(len(sentences), 1)

    # Claim presence
    has_claims = len(claim_indices) > 0

    # Score components
    claim_evidence_score = claim_evidence_ratio * 100
    counterargument_score = 100 if has_counterargument else 0
    connector_score = min(100, connector_density * 200)
    claim_presence_score = 100 if has_claims else 0

    score = (
        claim_evidence_score * 0.4 +
        counterargument_score * 0.2 +
        connector_score * 0.2 +
        claim_presence_score * 0.2
    )

    suggestions = []
    if not has_claims:
        suggestions.append("Make clear argumentative claims in your essay")
    if claim_evidence_ratio < 0.5:
        suggestions.append("Support your claims with evidence or examples")
    if not has_counterargument:
        suggestions.append("Consider acknowledging counterarguments to strengthen your argument")

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)