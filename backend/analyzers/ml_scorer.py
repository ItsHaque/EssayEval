import joblib
import os
import numpy as np
from analyzers.base import TextIssue, AnalyzerResult

_model = None
_vectorizer = None

def _load():
    global _model, _vectorizer
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'scorer_model.joblib')
        vec_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'scorer_vectorizer.joblib')
        _model = joblib.load(model_path)
        _vectorizer = joblib.load(vec_path)

def analyze(text: str, rubric: dict) -> AnalyzerResult:
    _load()
    features = _vectorizer.transform([text])
    raw_score = _model.predict(features)[0]
    score = float(np.clip(raw_score, 0, 100))

    suggestions = []
    if score < 50:
        suggestions.append("Overall writing quality needs significant improvement")
    elif score < 70:
        suggestions.append("Overall writing quality is developing — focus on structure and clarity")
    else:
        suggestions.append("Overall writing quality is good — refine your arguments further")

    return AnalyzerResult(score=round(score, 2), issues=[], suggestions=suggestions)