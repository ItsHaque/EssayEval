from pydantic import BaseModel
from typing import Optional

class TextIssue(BaseModel):
    start: int
    end: int
    message: str
    category: str

class CategoryScore(BaseModel):
    categoryId: str
    score: float
    band: int  # 1-4
    bandLabel: str
    issues: list[TextIssue]
    suggestions: list[str]

class EvaluationResult(BaseModel):
    id: str
    submissionId: str
    rubricId: str
    rubricVersion: str
    overallScore: float
    letterGrade: str
    categoryScores: list[CategoryScore]
    strengths: list[str]
    improvements: list[str]
    evaluatedAt: str

class Submission(BaseModel):
    id: str
    label: str
    text: str
    wordCount: int
    rubricId: str
    resultId: Optional[str] = None
    createdAt: str