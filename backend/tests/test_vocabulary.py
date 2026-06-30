from analyzers.vocabulary import analyze, compute_mtld, get_frequency_band


def test_frequency_band_common_word():
    assert get_frequency_band("the") == 1


def test_frequency_band_rare_word():
    band = get_frequency_band("xyzzyplugh")
    assert band == 4


def test_mtld_repetitive_text():
    lemmas = ["cat"] * 20
    score = compute_mtld(lemmas)
    assert score > 0


def test_vocabulary_analyze_basic():
    text = "The quick brown fox jumps over the lazy dog."
    result = analyze(text, {})
    assert 0 <= result.score <= 100