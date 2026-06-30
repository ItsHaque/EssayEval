from analyzers import clarity, vocabulary, grammar
from lib.scoring import compute_band, compute_grade, compute_overall

REGISTRY = {
    'cat_clarity': clarity.analyze,
    'cat_vocabulary': vocabulary.analyze,
    'cat_grammar': grammar.analyze,
    # cat_relevance, cat_organization, cat_argument added in Phase 3
}

BAND_LABELS = {4: "Excellent", 3: "Good", 2: "Needs Improvement", 1: "Poor"}


async def evaluate(text: str, rubric: dict) -> dict:
    category_scores = []
    scores = []
    weights = []

    for cat in rubric['categories']:
        analyzer = REGISTRY.get(cat['id'])
        if not analyzer:
            continue  # category exists but no analyzer registered yet (Phase 3 categories)

        result = analyzer(text, rubric)
        band = compute_band(result.score)

        category_scores.append({
            'categoryId': cat['id'],
            'score': result.score,
            'band': band,
            'bandLabel': BAND_LABELS[band],
            'issues': [vars(i) for i in result.issues],
            'suggestions': result.suggestions,
        })
        scores.append(result.score)
        weights.append(cat['weight'])

    overall = compute_overall(scores, weights)
    letter_grade = compute_grade(overall, rubric.get('gradeBands', {}))

    sorted_by_score = sorted(category_scores, key=lambda c: c['score'], reverse=True)
    # Strengths: top categories scoring 70+ (max 2)
    strengths = [
        f"Strong performance in {c['categoryId'].replace('cat_', '')}"
        for c in sorted_by_score if c['score'] >= 70
    ][:2]

    # Improvements: bottom categories scoring below 70 (max 2)
    improvements = [
        f"Focus on improving {c['categoryId'].replace('cat_', '')}"
        for c in sorted(category_scores, key=lambda c: c['score'])
        if c['score'] < 70
    ][:2]

    return {
        'overallScore': overall,
        'letterGrade': letter_grade,
        'categoryScores': category_scores,
        'strengths': strengths,
        'improvements': improvements,
    }

## vars(i) converts each TextIssue dataclass into a dict for JSON serialization — FastAPI can't serialize dataclasses directly inside a generic dict return. This works but is a bit fragile; if TextIssue ever gains a method or non-serializable field, this breaks. Flag it as a known shortcut.