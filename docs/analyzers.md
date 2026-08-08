# EduEval — Analyzer Documentation

Each analyzer receives the full essay text and rubric as input and returns a score (0–100), a list of text issues with character offsets, and improvement suggestions.

---

## 1. Grammar Analyzer

**File:** `backend/analyzers/grammar.py`  
**Library:** `language-tool-python` + `spaCy`  
**BERT:** No

### Algorithm
1. Run `language-tool-python` on the essay text — returns a list of grammar/spelling matches with character offsets
2. Filter out matches where the flagged token is a named entity (spaCy NER) or camelCase word to reduce false positives on proper nouns and brand names
3. Count remaining errors, compute error rate per word

### Scoring Formula

```
error_rate = len(filtered_issues) / word_count * 100
score = max(0, 100 - error_rate * 3)
```

### Issues Returned
Word or phrase-level spans with grammar error messages.

---

## 2. Clarity Analyzer

**File:** `backend/analyzers/clarity.py`  
**Library:** `textstat` + `spaCy`  
**BERT:** No

### Algorithm
1. Compute three readability scores via `textstat`:
   - Flesch-Kincaid Grade Level
   - SMOG Index
   - Coleman-Liau Index
2. Average the three scores for robustness
3. Detect passive voice using spaCy dependency parse (`nsubjpass`, `auxpass`)
4. Flag sentences longer than 40 words as issues

### Scoring Formula

```
avg_grade = mean(FK, SMOG, Coleman-Liau)
score = max(0, 100 - (avg_grade - 6) * 7)
```
Grade 6 → ~100, Grade 14+ → ~44

### Issues Returned
Sentence-level spans for passive voice and overly long sentences.

---

## 3. Vocabulary Analyzer

**File:** `backend/analyzers/vocabulary.py`  
**Library:** `spaCy` + `wordfreq`  
**BERT:** No

### Algorithm
1. Tokenise with spaCy, filter punctuation and stopwords, lemmatise
2. Compute **TTR** (Type-Token Ratio): `unique_lemmas / total_tokens`
3. Compute **MTLD** (Measure of Textual Lexical Diversity): sequential pass, split factor when TTR drops below 0.72
4. Map each token to a Zipf frequency band via `wordfreq`:
   - Band 1: Zipf ≥ 5.0 (very common)
   - Band 2: Zipf ≥ 3.5
   - Band 3: Zipf ≥ 2.0
   - Band 4: Zipf < 2.0 or not found (rare/misspelled)
5. Exclude named entities and camelCase tokens from Band 4 flagging

### Scoring Formula

```
mtld_normalized = min(100, (mtld / 150) * 100)
band_1_2_coverage = (band1_count + band2_count) / total_tokens * 100
score = mtld_normalized * 0.6 + band_1_2_coverage * 0.4
```

### Issues Returned
Word-level spans for Band 4 tokens (rare or possibly misspelled), excluding proper nouns.

---

## 4. Relevance Analyzer

**File:** `backend/analyzers/relevance.py`  
**Library:** `sentence-transformers` (all-MiniLM-L6-v2) + `spaCy`  
**BERT:** Yes

### Algorithm
1. If rubric has no `prompt` field: return score = 70, no issues
2. Encode essay text and prompt together in one `encode()` call
3. Compute cosine similarity between essay embedding and prompt embedding
4. Split essay into sentences (spaCy), encode each sentence
5. Flag sentences with similarity < 0.25 to the prompt as potentially off-topic

### Scoring Formula
```

score = cosine_similarity(essay_embedding, prompt_embedding) * 100
```
### Issues Returned
Sentence-level spans for off-topic sentences, with similarity score in the message.

---

## 5. Organization Analyzer

**File:** `backend/analyzers/organization.py`  
**Library:** `sentence-transformers` + `spaCy`  
**BERT:** Yes

### Algorithm
1. Split essay into paragraphs on double newline
2. Flag essays with fewer than 3 paragraphs
3. Check for transition words at sentence starts against a static list of ~80 discourse markers
4. Detect introduction signals (argues, contends, this essay) in first paragraph
5. Detect conclusion signals (in summary, to conclude) in last paragraph
6. Encode each paragraph, compute cosine similarity between adjacent paragraph pairs:
   - similarity < 0.25 → abrupt topic shift (flagged)
   - similarity > 0.95 → repetitive content (flagged)

### Scoring Formula

```
score = paragraph_score * 0.30 + transition_score * 0.30 + coherence_score * 0.40
```
### Issues Returned
Paragraph-level spans for structural problems and coherence issues.

---

## 6. Argument Quality Analyzer

**File:** `backend/analyzers/argument.py`  
**Library:** `spaCy`  
**BERT:** No

### Algorithm
1. **Claim detection:** sentences with modal verbs (MD POS tag) or assertion phrases (it is clear, I argue, evidence shows)
2. **Evidence detection:** sentences with citation signals (according to, studies show, for example) within 2 sentences of a claim
3. **Claim-evidence ratio:** claims with at least one evidence sentence / total claims
4. **Counterargument bonus:** presence of concession language (although, critics argue, on the other hand)
5. **Logical connector density:** however, therefore, because, since — normalized by sentence count

### Scoring Formula
```
score = claim_evidence_ratio * 40
+ counterargument_bonus * 20
+ connector_density_score * 20
+ claim_presence_score * 20
```
### Issues Returned
Sentence-level spans for claims with no following evidence.

---

## Adding a Custom Analyzer

1. Create `backend/analyzers/your_analyzer.py`
2. Implement the interface:
```python
from analyzers.base import TextIssue, AnalyzerResult

def analyze(text: str, rubric: dict) -> AnalyzerResult:
    # your logic here
    return AnalyzerResult(
        score=float,        # 0–100
        issues=[TextIssue(start=int, end=int, message=str, category=str)],
        suggestions=[str]
    )
```
3. Register in `backend/orchestrator.py`:
```python
from analyzers import your_analyzer

REGISTRY = {
    ...
    'cat_your_category': your_analyzer.analyze,
}
```
4. Add the category to your rubric with a matching `id` field
