from analyzers.argument import analyze


def test_argument_no_claims():
    text = "The sky is blue. Water is wet. Trees are green."
    result = analyze(text, {})
    assert any("claims" in s.lower() for s in result.suggestions)


def test_argument_with_claim_and_evidence():
    text = "I believe social media is harmful. According to studies, excessive use leads to anxiety."
    result = analyze(text, {})
    assert result.score > 0


def test_argument_counterargument_bonus():
    text = "I argue this policy is effective. Evidence shows positive results. Although critics argue otherwise, the data supports this view."
    result = analyze(text, {})
    assert result.score > 50


def test_argument_score_range():
    text = "This proves my point. Therefore, we should act now."
    result = analyze(text, {})
    assert 0 <= result.score <= 100