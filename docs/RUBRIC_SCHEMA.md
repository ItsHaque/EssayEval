# EduEval — Rubric JSON Schema

Rubrics are stored in browser localStorage and can be exported/imported as `.json` files.

---

## Full Schema

```json
{
  "id": "string (UUID)",
  "version": "string",
  "name": "string",
  "prompt": "string (optional) — used by Relevance analyzer",
  "wordLimitMin": "number",
  "wordLimitMax": "number",
  "gradeBands": {
    "A": "number (minimum score for A)",
    "B": "number",
    "C": "number",
    "D": "number"
  },
  "categories": [
    {
      "id": "string — must match a key in the analyzer REGISTRY",
      "name": "string — display name shown in UI",
      "weight": "number — percentage weight, all weights must sum to 100",
      "bands": {
        "4": "string — descriptor for Excellent band",
        "3": "string — descriptor for Good band",
        "2": "string — descriptor for Developing band",
        "1": "string — descriptor for Beginning band"
      }
    }
  ],
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string"
}
```

---

## Example

```json
{
  "id": "c6fcabbf-a224-42f3-a027-5169257b9572",
  "version": "1",
  "name": "Argumentative Essay",
  "prompt": "Should social media be regulated by governments?",
  "wordLimitMin": 300,
  "wordLimitMax": 1000,
  "gradeBands": { "A": 85, "B": 70, "C": 55, "D": 40 },
  "categories": [
    {
      "id": "cat_grammar",
      "name": "Grammar & Mechanics",
      "weight": 20,
      "bands": {
        "4": "Virtually no errors; sophisticated sentence variety.",
        "3": "Minor errors that do not impede understanding.",
        "2": "Several errors; some impact on readability.",
        "1": "Frequent errors that impede comprehension."
      }
    },
    {
      "id": "cat_relevance",
      "name": "Relevance to Prompt",
      "weight": 20,
      "bands": {
        "4": "Essay directly and thoroughly addresses the prompt.",
        "3": "Essay mostly addresses the prompt with minor gaps.",
        "2": "Essay partially addresses the prompt with notable gaps.",
        "1": "Essay largely ignores or misunderstands the prompt."
      }
    }
  ],
  "createdAt": "2026-07-01T00:00:00Z",
  "updatedAt": "2026-07-01T00:00:00Z"
}
```

---

## Built-in Category IDs

| ID | Default Name |
|---|---|
| `cat_grammar` | Grammar & Mechanics |
| `cat_clarity` | Clarity & Readability |
| `cat_vocabulary` | Vocabulary & Style |
| `cat_relevance` | Relevance to Prompt |
| `cat_organization` | Organization & Structure |
| `cat_argument` | Argument Quality |

Custom categories can use any ID as long as a matching analyzer is registered in `orchestrator.py`.

---

## Validation Rules

- All `weight` values must sum to exactly 100
- `wordLimitMin` must be less than `wordLimitMax`
- Each category must have all 4 band descriptors (keys 1–4)
- `gradeBands` values must be in descending order (A > B > C > D)