# EduEval — Development Roadmap (Revised)

> **Duration:** 13 weeks | **Frontend:** React 18 + TypeScript + Vite + Tailwind  
> **Backend:** FastAPI (Python) + sentence-transformers + spaCy + language-tool-python  
> **Constraint:** No LLM/AI model APIs (OpenAI, Claude, etc.). All models run locally on your server.  
> **PRD Version:** 1.1

---

## Architecture Overview

```
Browser (React)
     ↕ REST (JSON)
FastAPI Backend
     ├── sentence-transformers  →  Relevance, Coherence (BERT embeddings)
     ├── language-tool-python   →  Grammar
     ├── spaCy                  →  POS tagging, sentence splitting, argument heuristics
     ├── textstat               →  Clarity / readability formulae
     └── custom freq lookup     →  Vocabulary (COCA word list)
```

**No WASM. No Service Worker. No browser-side ML. No external AI APIs.**

---

## How to use this file

- Check off steps as you complete them (`- [x]`)
- Each step has a **Why** — don't skip it
- 🔴 Blocking — nothing after starts until this is done
- 🟡 Parallelisable with the previous step
- 🟢 Non-blocking polish, can slip to next phase

---

## Phase 1 — Foundation (Weeks 1–2)

**Goal:** Project skeleton, core types, state management, layout shell, rubric builder, essay editor.

---

### Step 1.1 — Backend Scaffold 🔴

**Why:** Frontend API calls need endpoints to exist. Stand up the backend first, even with stub responses.

- [ ] Create project structure:
  ```
  edueval/
    frontend/     # React app
    backend/      # FastAPI app
  ```
- [ ] Inside `backend/`:
  ```bash
  python -m venv venv
  source venv/bin/activate
  pip install fastapi uvicorn[standard] pydantic
  ```
- [ ] Create `backend/main.py`:
  ```python
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware

  app = FastAPI()
  app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                     allow_methods=["*"], allow_headers=["*"])

  @app.post("/evaluate")
  async def evaluate(payload: dict):
      return {"status": "stub", "scores": {}}
  ```
- [ ] Run: `uvicorn main:app --reload` — verify `/docs` loads
- [ ] Commit: `chore: backend scaffold`

---

### Step 1.2 — Frontend Scaffold 🔴

**Why:** Everything else is a React component or a Zustand store.

- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] Install dependencies:
  ```
  npm install tailwindcss@3 postcss autoprefixer zustand react-chartjs-2 chart.js @tiptap/react @tiptap/starter-kit axios
  ```
- [ ] Configure Tailwind: `npx tailwindcss init -p`, set `darkMode: 'class'`
- [ ] Set up absolute imports in `tsconfig.json`: `"@/*": ["src/*"]`
- [ ] Create folder structure:
  ```
  src/
    api/          # Axios calls to FastAPI
    stores/       # Zustand stores
    components/   # UI components
    lib/          # Shared utilities
    types/        # TypeScript interfaces
  ```
- [ ] Set up Vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Commit: `chore: frontend scaffold`

---


### Step 1.3 — Define Core TypeScript Types 🔴

**Why:** Types are the contract between frontend and backend. Lock them down before writing any logic.

- [ ] Create `src/types/rubric.ts`:
  ```ts
  export interface RubricBands { 4: string; 3: string; 2: string; 1: string; }
  export interface RubricCategory {
    id: string; name: string; weight: number; bands: RubricBands;
  }
  export interface Rubric {
    id: string; version: string; name: string;
    prompt?: string;           // used by relevance analyzer
    wordLimitMin: number; wordLimitMax: number;
    gradeBands: Record<string, number>;
    categories: RubricCategory[];
    createdAt: string; updatedAt: string;
  }
  ```
- [ ] Create `src/types/evaluation.ts`:
  ```ts
  export interface TextIssue {
    start: number; end: number; message: string; category: string;
  }
  export interface CategoryScore {
    categoryId: string; score: number; band: 1|2|3|4;
    bandLabel: string; issues: TextIssue[]; suggestions: string[];
  }
  export interface EvaluationResult {
    id: string; submissionId: string; rubricId: string; rubricVersion: string;
    overallScore: number; letterGrade: string;
    categoryScores: CategoryScore[];
    strengths: string[]; improvements: string[];
    evaluatedAt: string;
  }
  ```
- [ ] Create `src/types/submission.ts`:
  ```ts
  export interface Submission {
    id: string; label: string; text: string;
    wordCount: number; rubricId: string;
    resultId?: string; createdAt: string;
  }
  ```
- [ ] Mirror these as Pydantic models in `backend/models.py`
- [ ] Commit: `types: core interfaces frontend + backend`

---

### Step 1.4 — Zustand Stores 🔴

- [ ] `src/stores/rubricStore.ts` — CRUD, import/export JSON, persist to localStorage
- [ ] `src/stores/submissionStore.ts` — save/delete submissions, LRU eviction at 8MB
- [ ] `src/stores/evaluationStore.ts` — store results, `isEvaluating` flag
- [ ] Unit tests: weight validation, LRU eviction, JSON round-trip
- [ ] Commit: `stores: rubric, submission, evaluation`

---

### Step 1.5 — Three-Panel Layout Shell 🔴

- [ ] `src/components/Layout.tsx` — CSS grid, three columns:
  - Left 240px: rubric selector + history
  - Centre flex-grow: essay editor
  - Right 360px: results
  - Each panel collapsible
- [ ] Dark mode toggle (`dark` class on `<html>`)
- [ ] Responsive: single column below 768px
- [ ] Commit: `ui: three-panel layout shell`

---

### Step 1.6 — Rubric Builder UI 🔴

- [ ] `src/components/RubricBuilder.tsx`:
  - Rubric name, prompt field, word limits
  - Dynamic category list with add/remove
  - Per category: name, weight slider, 4 band descriptor textareas
  - Live weight validator (running total, red if ≠ 100)
  - Grade band editor (letter → threshold)
- [ ] `src/components/RubricSelector.tsx` (left panel): dropdown, New/Edit/Delete, Import/Export
- [ ] Seed 3 built-in templates on first load if localStorage empty
- [ ] Tests: weight validation, template seeding, JSON round-trip
- [ ] Commit: `feature: rubric builder UI`

---

### Step 1.7 — Essay Editor 🔴

- [ ] `src/components/EssayEditor.tsx` using TipTap:
  - Plaintext mode (no formatting toolbar)
  - Live word count, colour red when outside rubric limits
  - Auto-save to submissionStore (debounced 500ms)
  - Paste + .txt upload
- [ ] Stub `src/lib/highlightEngine.ts` — empty `applyHighlights()` for now
- [ ] Commit: `feature: essay editor`

---

### Phase 1 Checkpoint

- [ ] Backend `/evaluate` stub returns 200
- [ ] Can create, edit, delete, export, import a rubric
- [ ] Essay text autosaves across page refresh
- [ ] All Phase 1 tests pass

---

## Phase 2 — Backend: Rule-Based Analyzers (Weeks 3–5)

**Goal:** Grammar, Clarity, Vocabulary analyzers running on FastAPI. No ML yet.

---

### Step 2.1 — Install Backend NLP Dependencies 🔴

```bash
pip install spacy textstat language-tool-python
python -m spacy download en_core_web_sm
```

- [ ] Verify each imports without error
- [ ] Add to `requirements.txt`
- [ ] Commit: `chore: backend NLP dependencies`

---

### Step 2.2 — Define Backend Analyzer Interface 🔴

**Why:** All 6 analyzers must return the same shape. Define it once here.

- [ ] Create `backend/analyzers/base.py`:
  ```python
  from dataclasses import dataclass
  from typing import List

  @dataclass
  class TextIssue:
      start: int      # character offset
      end: int
      message: str
      category: str

  @dataclass
  class AnalyzerResult:
      score: float    # 0–100
      issues: List[TextIssue]
      suggestions: List[str]
  ```
- [ ] All analyzers implement: `def analyze(text: str, rubric: dict) -> AnalyzerResult`
- [ ] Commit: `core: analyzer base interface`

---

### Step 2.3 — Scoring Utilities 🔴

- [ ] Create `backend/lib/scoring.py`:
  - `compute_band(score: float) -> int` — maps 0–100 to band 1–4
  - `compute_grade(score: float, grade_bands: dict) -> str`
  - `compute_overall(scores: list[float], weights: list[float]) -> float`
- [ ] Unit tests: boundary values (0, 100, band thresholds)
- [ ] Commit: `core: scoring utilities`

---

### Step 2.4 — Clarity Analyzer 🟢

**Why:** Zero ML dependency. Validates the analyzer interface returns correct shape.

- [ ] Create `backend/analyzers/clarity.py`:
  - Use `textstat` for: `flesch_kincaid_grade()`, `smog_index()`, `coleman_liau_index()`
  - Average the three readability scores for robustness
  - Use `spaCy` for sentence splitting (more accurate than regex)
  - Flag sentences where `len(sent.text.split()) > 40` as issues with character offsets
  - Passive voice: spaCy dependency parse — `nsubjpass` or `auxpass` relations
  - Score formula: map average grade level to 0–100 (grade 6 → 90, grade 14+ → 30)
- [ ] Unit tests: known FK scores on sample sentences
- [ ] Commit: `module: clarity analyzer`

---

### Step 2.5 — Vocabulary Analyzer 🟢

- [ ] Download COCA top-20k word frequency list (offline, commit as `backend/assets/coca_20k.json`)
  - Format: `{ "word": frequency_rank }` where rank 1 = most common
- [ ] Create `backend/analyzers/vocabulary.py`:
  - Tokenise with spaCy (`.lemma_` for normalisation, filter punctuation and stopwords)
  - **TTR:** `unique_lemmas / total_tokens`
  - **MTLD:** sequential algorithm — split sequence when TTR drops below 0.72, average factor lengths
  - **Frequency bands:** Band 1 (rank ≤ 1000), Band 2 (1001–5000), Band 3 (5001–20000), Band 4 (not in list)
  - Score: MTLD-based score (60%) + Band 1+2 coverage (40%)
  - Issues: Band 4 words flagged with character offsets (possible misspellings or overly obscure)
- [ ] Unit tests: MTLD algorithm correctness on two controlled texts
- [ ] Commit: `module: vocabulary analyzer`

---

### Step 2.6 — Grammar Analyzer 🔴

**Why:** `language-tool-python` spawns a Java process — validate it works in your environment early.

- [ ] Create `backend/analyzers/grammar.py`:
  ```python
  import language_tool_python
  tool = language_tool_python.LanguageTool('en-US')  # initialise once, reuse

  def analyze(text, rubric):
      matches = tool.check(text)
      issues = [TextIssue(
          start=m.offset, end=m.offset + m.errorLength,
          message=m.message, category='grammar'
      ) for m in matches]
      error_rate = len(matches) / max(len(text.split()), 1) * 100
      score = max(0, 100 - error_rate * 10)
      suggestions = [f"'{m.context}' — {m.message}" for m in matches[:3]]
      return AnalyzerResult(score=score, issues=issues, suggestions=suggestions)
  ```
- [ ] Important: initialise `LanguageTool` once at module level, not per request — it starts a JVM
- [ ] Unit tests: 10 sentences with known errors, verify offset accuracy
- [ ] Commit: `module: grammar analyzer`

---

### Step 2.7 — Evaluation Orchestrator (Rule-Based) 🔴

**Why:** Wire the 3 rule-based analyzers together and expose `/evaluate` before ML modules arrive.

- [ ] Create `backend/orchestrator.py`:
  ```python
  from analyzers import clarity, vocabulary, grammar

  REGISTRY = {
      'cat_clarity': clarity.analyze,
      'cat_vocabulary': vocabulary.analyze,
      'cat_grammar': grammar.analyze,
      # ML analyzers added in Phase 3
  }

  async def evaluate(text: str, rubric: dict) -> dict:
      results = {}
      for cat in rubric['categories']:
          analyzer = REGISTRY.get(cat['id'])
          if analyzer:
              results[cat['id']] = analyzer(text, rubric)
      overall = compute_overall(results, rubric)
      return assemble_result(results, overall, rubric)
  ```
- [ ] Update `/evaluate` endpoint to call orchestrator
- [ ] Return full `EvaluationResult` JSON shape
- [ ] Commit: `core: orchestrator wired to rule-based analyzers`

---

### Step 2.8 — Frontend Evaluation API Call 🔴

- [ ] Create `src/api/evaluate.ts`:
  ```ts
  import axios from 'axios';
  export async function evaluateEssay(text: string, rubric: Rubric): Promise<EvaluationResult> {
    const res = await axios.post('http://localhost:8000/evaluate', { text, rubric });
    return res.data;
  }
  ```
- [ ] Add Evaluate button to editor — calls `evaluateEssay`, sets `isEvaluating`, saves result
- [ ] Log result to console (UI comes in Phase 4)
- [ ] Commit: `feature: evaluate button calls backend`

---

### Phase 2 Checkpoint

- [ ] Evaluate button returns a real `EvaluationResult` with Grammar, Clarity, Vocabulary scores
- [ ] Character offsets in issues are accurate (manually verify)
- [ ] LanguageTool JVM starts once per server run, not per request
- [ ] All tests pass

---

## Phase 3 — Backend: BERT-Based Analyzers (Weeks 6–8)

**Goal:** Add Relevance and Organization analyzers using sentence-transformers. Add rule-based Argument analyzer using spaCy.

---

### Step 3.1 — Install sentence-transformers 🔴

```bash
pip install sentence-transformers torch
```

- [ ] Test in a Python shell:
  ```python
  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer('all-MiniLM-L6-v2')
  emb = model.encode(["test sentence"])
  print(emb.shape)  # should be (1, 384)
  ```
- [ ] Note: `all-MiniLM-L6-v2` is 80MB — downloads once to `~/.cache/huggingface/`
- [ ] Add to `requirements.txt`
- [ ] Commit: `chore: sentence-transformers installed`

---

### Step 3.2 — Model Singleton 🔴

**Why:** Loading a 80MB model per request would make every evaluation take 10+ seconds.

- [ ] Create `backend/lib/embeddings.py`:
  ```python
  from sentence_transformers import SentenceTransformer
  import numpy as np

  _model = None

  def get_model() -> SentenceTransformer:
      global _model
      if _model is None:
          _model = SentenceTransformer('all-MiniLM-L6-v2')
      return _model

  def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
      return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

  def encode(texts: list[str]) -> np.ndarray:
      return get_model().encode(texts)
  ```
- [ ] FastAPI startup event: call `get_model()` on server start to pre-warm
- [ ] Commit: `core: sentence-transformer model singleton`

---

### Step 3.3 — Relevance Analyzer 🔴

**Why:** First BERT-based module. Validates embeddings are working and cosine similarity returns sensible values.

- [ ] Create `backend/analyzers/relevance.py`:
  - If rubric has no `prompt`: return score = 70, suggestion = "Add a prompt to rubric for accurate relevance scoring"
  - Encode essay + prompt: `embeddings = encode([essay_text, prompt])`
  - Overall similarity: `cosine_similarity(embeddings[0], embeddings[1]) * 100`
  - Sentence-level: split essay into sentences (spaCy), encode each, compute similarity to prompt
  - Issues: sentences with similarity < 0.25 flagged as potentially off-topic (with character offsets)
  - Suggestions: list the 2 most off-topic sentences
- [ ] Unit tests: mock `encode()`, test cosine similarity, test offset computation
- [ ] Register in orchestrator as `cat_relevance`
- [ ] Commit: `module: relevance analyzer`

---

### Step 3.4 — Organization Analyzer 🟡

**Why:** Also uses embeddings but for coherence — parallelisable with testing Step 3.3.

- [ ] Create `backend/analyzers/organization.py`:
  - **Paragraph detection:** split on `\n\n`; flag < 3 paragraphs as issue
  - **Transition words:** check sentence-start tokens against `backend/assets/transition_words.json`
    - Source: compile a list of ~80 discourse markers (however, therefore, furthermore, etc.)
  - **Intro/conclusion signals:** keyword check on first and last paragraph
  - **Coherence:** encode each paragraph, compute cosine similarity between adjacent pairs
    - similarity < 0.25 → abrupt topic shift (flag)
    - similarity > 0.95 → repetitive (flag)
  - Score: paragraph structure (30%) + transitions (30%) + coherence (40%)
- [ ] Unit tests: paragraph split, transition detection
- [ ] Register in orchestrator as `cat_organization`
- [ ] Commit: `module: organization analyzer`

---

### Step 3.5 — Argument Quality Analyzer 🟡

**Why:** Rule-based using spaCy — no ML needed here. Parallelisable with Step 3.4 testing.

- [ ] Create `backend/analyzers/argument.py`:
  - **Claim detection** (spaCy):
    - Sentences containing modal verbs (`MD` POS tag: should, must, ought, will)
    - Or assertion phrases: "it is clear", "evidence shows", "this proves", "I argue"
  - **Evidence detection:**
    - Citation signals: "according to", "studies show", "research indicates", "for example", "statistics show"
    - Sentences following a claim within 2-sentence window
  - **Claim-evidence ratio:** claims with at least one evidence sentence in next 2 sentences / total claims
  - **Counterargument bonus:** presence of concession language ("although", "while it is true", "critics argue", "on the other hand", "admittedly")
  - **Logical connectors:** "however", "therefore", "because", "since", "as a result", "consequently" — count normalized by sentence count
  - Score: claim-evidence ratio (40%) + counterargument (20%) + connector density (20%) + claim presence (20%)
  - Issues: claim sentences with no following evidence, flagged with offsets
- [ ] Unit tests: claim detection, evidence detection on 5 controlled paragraphs
- [ ] Register in orchestrator as `cat_argument`
- [ ] Commit: `module: argument quality analyzer`

---

### Step 3.6 — Performance Check 🔴

**Why:** With 6 analyzers running, you need to know the bottleneck before building the UI around it.

- [ ] Time a full evaluation of a 500-word essay end-to-end
- [ ] Expected bottleneck: sentence-transformers encoding (Relevance + Organization both call `encode()`)
- [ ] Optimisation: batch all `encode()` calls into one:
  ```python
  # Instead of two separate encode() calls in two analyzers:
  all_texts = [essay, prompt] + paragraphs + sentences
  all_embeddings = encode(all_texts)  # one forward pass
  # Slice results per analyzer
  ```
- [ ] Target: < 5 seconds for 500-word essay after model is warm
- [ ] If still slow: run Relevance and Organization in parallel with `asyncio.gather()`
- [ ] Commit: `perf: batch embedding calls`

---

### Phase 3 Checkpoint

- [ ] All 6 analyzers return scores
- [ ] Off-topic essay scores < 50 on Relevance; on-topic essay scores > 70
- [ ] Full evaluation of 500-word essay < 5 seconds (warm model)
- [ ] All tests pass

---

## Phase 4 — Feedback UI (Weeks 9–10)

**Goal:** Make results visible and useful in the browser.

---

### Step 4.1 — Results Panel: Scores & Charts 🔴

- [ ] Create `src/components/ResultsPanel.tsx`:
  - Overall score (large) + letter grade badge + band label
  - Horizontal bar chart per category (Chart.js), colour by band:
    - Band 4 (85–100): green
    - Band 3 (70–84): yellow
    - Band 2 (50–69): orange
    - Band 1 (0–49): red
  - Radar chart: all 6 category scores
- [ ] Panel hidden until result exists; animates in on completion
- [ ] Commit: `ui: results panel scores and charts`

---

### Step 4.2 — Inline Highlights 🔴

**Why:** Most technically precise step. Character offsets from backend must map to TipTap editor positions exactly.

- [ ] Implement `src/lib/highlightEngine.ts` as a TipTap Extension:
  - Use `Decoration.inline` from ProseMirror
  - Map backend `TextIssue.start/end` to TipTap positions
  - **Critical:** TipTap adds +1 to positions (document node). Account for this.
  - Colour per category:
    - grammar → red
    - clarity → blue
    - vocabulary → purple
    - relevance → orange
    - organization → teal
    - argument → yellow
- [ ] Hover: tooltip showing `issue.message`
- [ ] Click highlight: scroll results panel to that category's feedback card
- [ ] Test with a 10-word essay first to verify offset accuracy before using real analyzer output
- [ ] Commit: `feature: inline highlights`

---

### Step 4.3 — Feedback Cards 🔴

- [ ] Create `src/components/FeedbackCard.tsx`:
  - Category name + colour-coded icon
  - Score + band label
  - Band descriptor text (from rubric definition for this band)
  - Improvement suggestions list (from `CategoryScore.suggestions`)
  - Collapsible — open by default for bands 1 and 2
- [ ] Create `src/lib/feedbackEngine.ts`:
  - Map score → band → rubric band descriptor
  - Supplement backend suggestions with frontend display logic
- [ ] Commit: `feature: feedback cards`

---

### Step 4.4 — Strengths & Improvements Summary 🟢

- [ ] Create `src/components/SummaryPanel.tsx`:
  - Top 3 strengths: highest scoring categories, one-line positive note
  - Top 3 improvements: largest gap from 100, one-line actionable suggestion
  - One-paragraph narrative from template string:
    ```ts
    `This essay scored ${overall}% (${grade}). Strongest area: ${topCat} (${topScore}%). 
    Priority for revision: ${bottomCat} — ${bottomSuggestion}.`
    ```
- [ ] Commit: `feature: summary panel`

---

### Step 4.5 — Submission History 🟢

- [ ] Create `src/components/HistoryPanel.tsx` in left panel:
  - List: label, date, overall score
  - Click to reload submission text + result
  - Delete per entry
  - Score sparkline for last 5 submissions
- [ ] Commit: `feature: submission history`

---

### Phase 4 Checkpoint

- [ ] Full results visible in results panel after evaluation
- [ ] Clicking a highlight scrolls to the correct feedback card
- [ ] Feedback card band descriptor matches rubric definition for that score
- [ ] History persists and reloads correctly

---

## Phase 5 — Polish, Export & Dashboard (Weeks 11–12)

---

### Step 5.1 — PDF Export 🔴

- [ ] `npm install jspdf html2canvas`
- [ ] `src/lib/reportExporter.ts`:
  - Render hidden `<div id="report">` with: metadata, overall score, category table, charts
  - `html2canvas` captures div → `jsPDF` embeds as image
  - Filename: `EduEval_[label]_[date].pdf`
- [ ] Test: scores display correctly, no page truncation
- [ ] Commit: `feature: PDF export`

---

### Step 5.2 — File Upload (DOCX + PDF) 🟢

- [ ] `npm install mammoth pdfjs-dist`
- [ ] `src/lib/fileParser.ts`:
  - `.txt` → `FileReader.readAsText()`
  - `.docx` → `mammoth.extractRawText({ arrayBuffer })`
  - `.pdf` → `pdfjsLib.getDocument()` → extract text per page
- [ ] Upload button in editor (accept `.txt, .docx, .pdf`)
- [ ] Commit: `feature: file upload`

---

### Step 5.3 — Educator Dashboard 🟡

- [ ] `src/components/Dashboard.tsx`:
  - CSV import: `[student_id, essay_text]` rows
  - Sequential batch evaluation (not parallel — avoid overwhelming backend)
  - Progress: "Evaluating 3 of 30..."
  - Class aggregate: mean ± std per category
  - Score distribution histogram
  - Export: CSV `[student_id, overall, cat1, cat2, ...]`
- [ ] Commit: `feature: educator dashboard`

---

### Step 5.4 — Student Progress View 🟡

- [ ] `src/components/ProgressView.tsx`:
  - Timeline chart: overall score over submissions
  - Radar overlay: current vs. previous submission
  - Highlight improved vs. declined categories
- [ ] Commit: `feature: student progress view`

---

### Step 5.5 — Accessibility Audit 🔴

- [ ] Run axe DevTools — fix all Critical and Serious violations:
  - [ ] All inputs labelled
  - [ ] All icon buttons have `aria-label`
  - [ ] Contrast ratios ≥ 4.5:1
  - [ ] Focus visible on all interactive elements
  - [ ] Charts have `aria-label` text alternatives
  - [ ] Results panel uses `aria-live="polite"` on evaluation complete
- [ ] Full keyboard navigation verified
- [ ] Commit: `a11y: WCAG 2.1 AA`

---

### Step 5.6 — Performance Profiling 🔴

- [ ] Backend: add timing logs per analyzer — identify slowest module
- [ ] Frontend: Chrome DevTools → no main thread blocking > 50ms
- [ ] `npm run build` → initial JS bundle < 500KB gzipped
- [ ] If oversized: `npx vite-bundle-visualizer` → lazy-load heavy deps
- [ ] Commit: `perf: profiling and optimisations`

---

## Phase 6 — Testing & Documentation (Week 13)

---

### Step 6.1 — Backend Unit Tests 🔴

- [ ] `pip install pytest pytest-asyncio httpx`
- [ ] Test each analyzer with known inputs:
  - Grammar: 10 sentences with known errors → verify error count and offsets
  - Clarity: sample texts with known FK grade levels
  - Vocabulary: controlled texts → verify TTR and MTLD
  - Relevance: mock embeddings → verify cosine similarity calculation
  - Organization: texts with/without transitions → verify scoring
  - Argument: paragraphs with/without claims/evidence → verify detection
- [ ] Test orchestrator: correct weight application, overall score rounding
- [ ] Test scoring utilities: boundary values
- [ ] Target: ≥ 80% line coverage (`pytest --cov`)
- [ ] Commit: `test: backend unit tests`

---

### Step 6.2 — Frontend Unit Tests 🟡

- [ ] Store tests: LRU eviction, weight validation, JSON import/export
- [ ] Scoring utilities: band thresholds, grade computation
- [ ] feedbackEngine: band → descriptor mapping
- [ ] Target: ≥ 80% line coverage (`npx vitest --coverage`)
- [ ] Commit: `test: frontend unit tests`

---

### Step 6.3 — End-to-End Tests 🟡

- [ ] `npm install -D playwright @playwright/test`
- [ ] Tests:
  - [ ] Create rubric → refresh → rubric persists
  - [ ] Paste essay → Evaluate → results panel appears with 6 category scores
  - [ ] Export PDF → file downloads
  - [ ] Import rubric JSON → appears in selector
  - [ ] Evaluate with no rubric selected → error state, no crash
  - [ ] Evaluate with no prompt → Relevance returns 70 with note
- [ ] Commit: `test: E2E suite`

---

### Step 6.4 — Documentation 🟢

- [ ] `README.md`: setup (backend + frontend), how to run, how to test
- [ ] `docs/RUBRIC_SCHEMA.md`: full JSON schema documented
- [ ] `docs/ANALYZERS.md`: algorithm + scoring formula per analyzer, which ones use BERT vs. rules
- [ ] `docs/ADDING_ANALYZERS.md`: implement `AnalyzerResult` interface, register in orchestrator
- [ ] Docstrings on all backend analyzer functions
- [ ] Commit: `docs: README, schema, analyzer docs`

---

### Step 6.5 — Final Acceptance Criteria Check 🔴

- [ ] 500-word essay evaluates in < 5 seconds (warm model) ✓/✗
- [ ] Rubric builder supports up to 10 categories with weight validation ✓/✗
- [ ] Grammar highlights cover ≥ 80% of errors in 20-essay test set ✓/✗
- [ ] PDF export in < 5 seconds ✓/✗
- [ ] No LLM/external AI API calls (verify in backend logs) ✓/✗
- [ ] All interactive elements keyboard-navigable ✓/✗
- [ ] Backend test coverage ≥ 80% ✓/✗
- [ ] Frontend test coverage ≥ 80% ✓/✗

---

## Phase Dependencies

```
1.1+1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7
                                        ↓
               2.1 → 2.2 → 2.3 → 2.4, 2.5, 2.6 → 2.7 → 2.8
                                                              ↓
                              3.1 → 3.2 → 3.3, 3.4, 3.5 → 3.6
                                                               ↓
                                       4.1 → 4.2 → 4.3 → 4.4, 4.5
                                                                    ↓
                                         5.1, 5.2, 5.3, 5.4 → 5.5 → 5.6
                                                                          ↓
                                                    6.1, 6.2, 6.3, 6.4 → 6.5
```

---

## Analyzer Summary

| Category | Approach | Library | BERT? |
|---|---|---|---|
| Grammar | Rule-based error detection | language-tool-python | No |
| Clarity | Readability formulae | textstat + spaCy | No |
| Vocabulary | TTR, MTLD, frequency bands | spaCy + COCA list | No |
| Relevance | Semantic similarity (essay vs. prompt) | sentence-transformers | **Yes** |
| Organization | Paragraph coherence + transitions | sentence-transformers + spaCy | **Yes** |
| Argument | Claim/evidence/connector heuristics | spaCy | No |

---

## Key Risks

| Risk | Where | Mitigation |
|---|---|---|
| LanguageTool JVM startup slow | Step 2.6 | Initialise once at module level on server start, not per request |
| sentence-transformers first download is 80MB | Step 3.1 | Happens once; cached in `~/.cache/huggingface/` — document in README |
| Both Relevance and Organization call `encode()` separately | Step 3.6 | Batch all text into a single `encode()` call, slice results |
| TipTap offset +1 mismatch | Step 4.2 | Test with toy essay first; account for document node offset |
| LanguageTool flags too many false positives | Step 2.6 | Filter by `match.ruleId` — disable known noisy rules (e.g. `WHITESPACE_RULE`) |

---

*Last updated: June 2026 | EduEval v1.1*
