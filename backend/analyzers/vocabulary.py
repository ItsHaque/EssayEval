import spacy
from wordfreq import zipf_frequency
from analyzers.base import TextIssue, AnalyzerResult

nlp = spacy.load("en_core_web_sm")


def get_frequency_band(word: str) -> int:
    """Maps a word to a frequency band using Zipf frequency (wordfreq library).
    Zipf scale: ~7 = very common ("the"), ~1 = very rare.
    Band 1 (most common) -> Band 4 (rarest / not found).
    """
    freq = zipf_frequency(word, "en")
    if freq == 0:
        return 4  # not found - possible misspelling or very obscure
    elif freq >= 5.0:
        return 1  # very common words
    elif freq >= 3.5:
        return 2
    elif freq >= 2.0:
        return 3
    else:
        return 4


def compute_mtld(lemmas: list[str], threshold: float = 0.72) -> float:
    """Measure of Textual Lexical Diversity - sequential forward pass."""
    if not lemmas:
        return 0.0

    factor_count = 0
    factor_lengths = []
    types_seen = set()
    start_idx = 0

    for i, word in enumerate(lemmas):
        types_seen.add(word)
        ttr = len(types_seen) / (i - start_idx + 1)
        if ttr <= threshold:
            factor_count += 1
            factor_lengths.append(i - start_idx + 1)
            types_seen = set()
            start_idx = i + 1

    # Partial factor at the end
    remaining = len(lemmas) - start_idx
    if remaining > 0:
        partial_ttr = len(types_seen) / remaining if remaining else 0
        partial_factor = (1 - partial_ttr) / (1 - threshold) if partial_ttr < 1 else 0
        factor_count += partial_factor
        factor_lengths.append(remaining)

    if factor_count == 0:
        return len(lemmas)

    return len(lemmas) / factor_count


def analyze(text: str, rubric: dict) -> AnalyzerResult:
    doc = nlp(text)
    tokens = [t for t in doc if not t.is_punct and not t.is_stop and t.is_alpha]
    lemmas = [t.lemma_.lower() for t in tokens]

    if not lemmas:
        return AnalyzerResult(score=0, issues=[], suggestions=["Essay too short to analyze vocabulary"])

    # TTR
    ttr = len(set(lemmas)) / len(lemmas)

    # MTLD
    mtld_score = compute_mtld(lemmas)
    # Normalize MTLD to 0-100 (typical MTLD range: 30-150 for student writing)
    mtld_normalized = min(100, (mtld_score / 150) * 100)

    # Frequency band coverage
    band_counts = {1: 0, 2: 0, 3: 0, 4: 0}
    issues = []
    for token in tokens:
        band = get_frequency_band(token.text.lower())
        band_counts[band] += 1
        if band == 4:
            issues.append(TextIssue(
                start=token.idx,
                end=token.idx + len(token.text),
                message=f"'{token.text}' is rare or possibly misspelled",
                category="vocabulary",
            ))

    band_1_2_coverage = (band_counts[1] + band_counts[2]) / len(tokens) * 100

    # Final score: MTLD (60%) + Band 1+2 coverage (40%)
    score = (mtld_normalized * 0.6) + (band_1_2_coverage * 0.4)

    suggestions = []
    if band_1_2_coverage > 80:
        suggestions.append("Try using more varied or advanced vocabulary")
    if ttr < 0.4:
        suggestions.append("Reduce word repetition by using synonyms")

    return AnalyzerResult(score=round(score, 2), issues=issues, suggestions=suggestions)