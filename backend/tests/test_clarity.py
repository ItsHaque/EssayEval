from analyzers.clarity import analyze


def test_clarity_simple_sentence():
    text = "The cat sat on the mat."
    result = analyze(text, {})
    assert 0 <= result.score <= 100
    assert isinstance(result.issues, list)


def test_clarity_passive_voice_flagged():
    text = "The ball was thrown by John."
    result = analyze(text, {})
    assert any("Passive voice" in i.message for i in result.issues)


def test_clarity_long_sentence_flagged():
    long_sentence = "This is a very long sentence that goes on and on and on and on and on and on and on and on and on and on and on and on and on and contains way more than forty words in total."
    result = analyze(long_sentence, {})
    assert any("words long" in i.message for i in result.issues)