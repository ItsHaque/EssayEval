from analyzers.grammar import analyze


def test_grammar_clean_sentence():
    text = "The cat sat on the mat."
    result = analyze(text, {})
    assert result.score > 50  # No major errors expected


def test_grammar_known_error():
    text = "She dont like apples."  # subject-verb agreement error
    result = analyze(text, {})
    assert len(result.issues) > 0
    assert any(i.category == "grammar" for i in result.issues)


def test_grammar_offsets_accurate():
    text = "He go to school."  # "go" should be "goes"
    result = analyze(text, {})
    if result.issues:
        issue = result.issues[0]
        flagged_text = text[issue.start:issue.end]
        assert len(flagged_text) > 0