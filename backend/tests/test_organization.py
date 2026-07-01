from analyzers.organization import analyze


def test_organization_single_paragraph():
    text = "This is a single paragraph with no structure at all."
    result = analyze(text, {})
    assert any("paragraph" in i.message for i in result.issues)


def test_organization_three_paragraphs():
    text = "Introduction paragraph here.\n\nHowever, this is the body paragraph with more detail.\n\nIn conclusion, this essay summarizes the main points."
    result = analyze(text, {})
    assert result.score > 50


def test_organization_score_range():
    text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
    result = analyze(text, {})
    assert 0 <= result.score <= 100