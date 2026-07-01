import uuid
from datetime import datetime, timezone
from analyzers import clarity, vocabulary, grammar, relevance, organization, argument
from lib.scoring import compute_band, compute_grade, compute_overall

REGISTRY = {
    'cat_clarity': clarity.analyze,
    'cat_vocabulary': vocabulary.analyze,
    'cat_grammar': grammar.analyze,
    'cat_relevance': relevance.analyze,
    'cat_organization': organization.analyze,
    'cat_argument': argument.analyze,
}

BAND_LABELS = {4: "Excellent", 3: "Good", 2: "Needs Improvement", 1: "Poor"}


async def evaluate(text: str, rubric: dict, submission_id: str = "") -> dict:
    category_scores = []
    scores = []
    weights = []

    for cat in rubric['categories']:
        analyzer = REGISTRY.get(cat['id'])
        if not analyzer:
            continue

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
    strengths = [
        f"Strong performance in {c['categoryId'].replace('cat_', '')}"
        for c in sorted_by_score if c['score'] >= 70
    ][:2]
    improvements = [
        f"Focus on improving {c['categoryId'].replace('cat_', '')}"
        for c in sorted(category_scores, key=lambda c: c['score'])
        if c['score'] < 70
    ][:2]

    return {
        'id': str(uuid.uuid4()),
        'submissionId': submission_id,
        'rubricId': rubric.get('id', ''),
        'rubricVersion': rubric.get('version', '1'),
        'overallScore': overall,
        'letterGrade': letter_grade,
        'categoryScores': category_scores,
        'strengths': strengths,
        'improvements': improvements,
        'evaluatedAt': datetime.now(timezone.utc).isoformat(),
    }