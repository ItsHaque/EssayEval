# EduEval — Automatic Essay Evaluation System

A full-stack web application that automatically evaluates student essays across 6 rubric-defined dimensions using locally-run NLP models. No external AI APIs are used.

---

## Architecture
```
Browser (React 18 + TypeScript)
↕ REST JSON
FastAPI Backend (Python)
├── language-tool-python → Grammar
├── textstat + spaCy → Clarity
├── spaCy + COCA list → Vocabulary
├── sentence-transformers → Relevance (BERT)
├── sentence-transformers → Organization (BERT)
└── spaCy heuristics → Argument Quality
```

---

## Requirements

**Backend**
- Python 3.11+
- Java (required by language-tool-python)

**Frontend**
- Node.js 18+

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd EssayEval
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 3. Frontend

```bash
cd frontend
npm install
```

---

## Running the App

**Start the backend** (from `backend/` with venv active):

```bash
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. API docs at `http://127.0.0.1:8000/docs`.

**Start the frontend** (from `frontend/`):

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Running Tests

**Backend** (from `backend/` with venv active):

```bash
pytest tests/ --cov=analyzers --cov=lib --cov-report=term-missing
```

Current coverage: **93%**

**Frontend** (from `frontend/`):

```bash
npx vitest run --coverage
```

Current coverage: **96.77%**

---

## Performance

| Metric | Result |
|---|---|
| Cold evaluation (first run) | ~13 seconds (model loading) |
| Warm evaluation (subsequent) | ~1.35 seconds |
| Frontend bundle size | < 500KB gzipped |

> First evaluation is slow because `sentence-transformers` loads an 80MB model into memory. All subsequent evaluations reuse the loaded model.

---

## Features

- Paste or upload essays (.docx, .pdf)
- Create custom rubrics with configurable categories, weights, and band descriptors
- Evaluate essays across 6 dimensions: Grammar, Clarity, Vocabulary, Relevance, Organization, Argument Quality
- Inline highlights in the editor with category-specific colors
- Feedback cards with rubric band descriptors and improvement suggestions
- Export evaluation report as PDF
- Submission history with scores

---

## Analyzer Summary

| Category | Approach | BERT? |
|---|---|---|
| Grammar | language-tool-python error detection | No |
| Clarity | Flesch-Kincaid, SMOG, Coleman-Liau | No |
| Vocabulary | TTR, MTLD, COCA frequency bands | No |
| Relevance | Cosine similarity: essay vs. prompt | Yes |
| Organization | Paragraph coherence + transition detection | Yes |
| Argument Quality | Claim/evidence/connector heuristics | No |

---

## Known Limitations

- First evaluation takes 13–25 seconds on cold start
- Relevance scoring requires a prompt to be set in the rubric; defaults to 70 if missing
- Argument analyzer is heuristic-based and may miss nuanced claims
- No user authentication — all data stored in browser localStorage

---

## Project Structure
```
EssayEval/
├── backend/
│ ├── main.py # FastAPI entry point
│ ├── orchestrator.py # Evaluation pipeline
│ ├── models.py # Pydantic models
│ ├── requirements.txt
│ ├── analyzers/ # 6 NLP analyzers
│ ├── lib/ # Scoring + embeddings utilities
│ └── tests/ # pytest test suite
└── frontend/
├── src/
│ ├── components/ # React components
│ ├── stores/ # Zustand state
│ ├── lib/ # Utilities
│ ├── api/ # Axios client
│ └── types/ # TypeScript interfaces
└── package.json
```
---

## NLP Course Mini Project
Jagannath University | 2026