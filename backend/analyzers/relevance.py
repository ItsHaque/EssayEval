import spacy
from lib.embeddings import encode, cosine_similarity
from analyzers.base import TextIssue, AnalyzerResult

nlp = spacy.load("en_core_web_sm")


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    prompt = rubric.get('prompt', '').strip()

    if not prompt:
        return AnalyzerResult(
            score=70,
            issues=[],
            suggestions=["Add a prompt to the rubric for accurate relevance scoring"]
        )

    # Encode essay and prompt together in one call
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]

    all_texts = [text, prompt] + sentences
    all_embeddings = encode(all_texts)

    essay_emb = all_embeddings[0]
    prompt_emb = all_embeddings[1]
    sentence_embs = all_embeddings[2:]

    # Overall relevance score
    overall_similarity = cosine_similarity(essay_emb, prompt_emb)
    score = overall_similarity * 100

    # Flag off-topic sentences
    issues = []
    for i, sent in enumerate(sentences):
        if i >= len(sentence_embs):
            break
        sim = cosine_similarity(sentence_embs[i], prompt_emb)
        if sim < 0.25:
            start = text.find(sent)
            issues.append(TextIssue(
                start=start,
                end=start + len(sent),
                message=f"This sentence may be off-topic (relevance: {sim:.2f})",
                category="relevance",
            ))

    # Suggestions: 2 most off-topic sentences
    suggestions = []
    if issues:
        suggestions = [f"Review relevance of: '{text[i.start:i.end][:60]}...'" for i in issues[:2]]

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)