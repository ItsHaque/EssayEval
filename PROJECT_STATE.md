# EssayEval — Project State for AI Assistants

Date: 2026-07-04
Status: Mid-stage MVP
Scope: Backend evaluation pipeline is implemented; frontend UI shell is present; the remaining work is integration, UX polish, and robustness.

## 1. What this project is

EssayEval is a local-first essay evaluation application. It evaluates essays across several dimensions without depending on external LLM APIs. The system combines:

- a FastAPI backend for orchestration and scoring
- a React + TypeScript frontend for editing, rubric management, and result viewing
- local NLP libraries such as spaCy, sentence-transformers, language-tool-python, and textstat

This repository is both a working prototype and a solid base for the 4.2 milestone work that has already been implemented.

## 2. Current repository snapshot

### Backend

The backend is the strongest part of the project.

- The FastAPI app is defined in [backend/main.py](backend/main.py)
- Evaluation orchestration lives in [backend/orchestrator.py](backend/orchestrator.py)
- Response and submission models are defined in [backend/models.py](backend/models.py)
- Analyzer implementations are in [backend/analyzers](backend/analyzers)
- Scoring helpers are in [backend/lib/scoring.py](backend/lib/scoring.py)
- Embedding loading is handled in [backend/lib/embeddings.py](backend/lib/embeddings.py)

### Frontend

The frontend is no longer just a scaffold. The core 4.2-style experience is now present in the codebase.

- The app shell is assembled in [frontend/src/App.tsx](frontend/src/App.tsx)
- The essay editor is implemented in [frontend/src/components/EssayEditor.tsx](frontend/src/components/EssayEditor.tsx)
- Rubric creation and selection are implemented in [frontend/src/components/RubricBuilder.tsx](frontend/src/components/RubricBuilder.tsx) and [frontend/src/components/RubricSelector.tsx](frontend/src/components/RubricSelector.tsx)
- Results display is implemented in [frontend/src/components/ResultsPanel.tsx](frontend/src/components/ResultsPanel.tsx)
- State management uses Zustand in [frontend/src/stores](frontend/src/stores)
- Shared typing is in [frontend/src/types](frontend/src/types)
- Evaluation API communication is implemented in [frontend/src/api/evaluate.ts](frontend/src/api/evaluate.ts)

## 3. Current architecture

### Request flow

1. A user writes or pastes an essay.
2. A rubric is selected or created.
3. The frontend sends the essay and rubric to the backend endpoint /evaluate.
4. The backend runs the registered analyzers.
5. The orchestrator aggregates scores and returns a structured evaluation result.
6. The frontend is expected to store and display that result.

### Runtime behavior

- The backend runs locally and does not depend on external AI services.
- The sentence-transformers model is loaded during app startup through the lifespan hook.
- Most analyzers are deterministic or heuristic-based; relevance uses embedding similarity.

## 4. Important implementation contracts

These contracts should be preserved unless a change is explicitly intended and tested.

### Analyzer contract

Each analyzer is expected to expose a function with this shape:

```python
def analyze(text: str, rubric: dict) -> AnalyzerResult
```

Expected output includes:

- a numeric score in the 0–100 range
- a list of issue objects with start/end offsets and messages
- a list of suggestions

### Category IDs

The backend expects rubric categories to use these IDs:

- cat_clarity
- cat_vocabulary
- cat_grammar
- cat_relevance
- cat_organization
- cat_argument

### Evaluation response shape

The backend returns an object with:

- id
- submissionId
- rubricId
- rubricVersion
- overallScore
- letterGrade
- categoryScores
- strengths
- improvements
- evaluatedAt

## 5. Current status by area

### Backend: largely complete

Implemented:
- FastAPI app with CORS enabled
- request and response models
- evaluation orchestration
- six analyzers wired into the pipeline
- scoring utilities for bands, grades, and weighted overall results

Still incomplete:
- some analyzer heuristics are simple and may be noisy
- error handling and fallback logic are not yet robust
- performance tuning has not been prioritized

### Frontend: milestone-level implementation is present

Implemented:
- Vite + React + TypeScript app structure
- Zustand stores for rubric, submission, and evaluation state
- a three-panel layout shell
- essay editing with word-count feedback and upload support
- rubric creation and selection UI
- evaluation trigger from the editor
- results display integration with highlighted feedback in the editor

Still incomplete:
- some validation and polish remain
- loading and error states are still basic
- the experience can be made more robust and user-friendly

## 6. Key files to know about

- [backend/main.py](backend/main.py) — FastAPI entry point and /evaluate endpoint
- [backend/orchestrator.py](backend/orchestrator.py) — coordinates analyzer execution and aggregates results
- [backend/models.py](backend/models.py) — Pydantic models for the API contract
- [backend/analyzers](backend/analyzers) — grammar, clarity, vocabulary, relevance, organization, and argument analyzers
- [backend/lib/scoring.py](backend/lib/scoring.py) — band, grade, and overall scoring logic
- [backend/lib/embeddings.py](backend/lib/embeddings.py) — sentence-transformer loading and encoding
- [frontend/src/App.tsx](frontend/src/App.tsx) — main app wire-up
- [frontend/src/components](frontend/src/components) — editor, rubric, and results UI
- [frontend/src/stores](frontend/src/stores) — Zustand state management
- [frontend/src/api/evaluate.ts](frontend/src/api/evaluate.ts) — evaluation API helper

## 7. Known gaps and risks

### High priority

- the full app experience is now present, but validation and resilience still need tightening
- there is no persistence layer for rubrics or submissions yet
- user-facing error handling and loading states are still basic

### Medium priority

- some analyzers rely on heuristic logic that may be noisy
- the results panel still needs more polish and clearer explanation
- there is no comprehensive end-to-end test covering the app experience

### Nice to have

- dark mode and mobile responsiveness improvements
- stronger rubric validation and better UX feedback
- performance optimization for repeated evaluations

## 8. Recommended next steps

### Priority 1 — harden the current experience

- improve validation around rubric structure and evaluation input
- add stronger loading and error feedback in the UI
- refine the results panel and highlight presentation

### Priority 2 — improve reliability

- add more backend test coverage for edge cases
- improve analyzer robustness and fallback behavior
- reduce noise in heuristic-based scoring

### Priority 3 — polish and productization

- add persistence for rubrics and submissions
- add end-to-end frontend tests
- document analyzer limitations and scoring assumptions

## 9. Quick start

### Backend

```bash
cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 10. Notes for future AI-assisted edits

When editing this project:

- preserve the existing analyzer interface unless there is a strong reason to change it
- keep the category IDs stable so the orchestrator continues routing correctly
- preserve the response structure expected by the frontend
- prefer targeted changes over broad rewrites
- if adding a new analyzer, register it in the orchestrator and keep rubric mappings consistent
