def compute_band(score: float) -> int:
    """Maps a 0-100 score to a band 1-4."""
    if score >= 85:
        return 4
    elif score >= 70:
        return 3
    elif score >= 50:
        return 2
    else:
        return 1


def compute_grade(score: float, grade_bands: dict) -> str:
    """Maps a score to a letter grade using rubric-defined thresholds.

    grade_bands example: {"A": 85, "B": 70, "C": 55, "D": 40}
    Bands must be checked from highest threshold to lowest.
    """
    sorted_bands = sorted(grade_bands.items(), key=lambda x: x[1], reverse=True)
    for letter, threshold in sorted_bands:
        if score >= threshold:
            return letter
    return "F"


def compute_overall(scores: list[float], weights: list[float]) -> float:
    """Weighted average of category scores.

    weights are expected to sum to 100 (validated at rubric save time).
    """
    if not scores or not weights or len(scores) != len(weights):
        return 0.0
    weighted_sum = sum(s * w for s, w in zip(scores, weights))
    return round(weighted_sum / 100, 2)