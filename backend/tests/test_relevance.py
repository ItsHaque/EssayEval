from analyzers.relevance import analyze


def test_relevance_no_prompt():
    result = analyze("Some essay text here.", {})
    assert result.score == 70
    assert "Add a prompt" in result.suggestions[0]


def test_relevance_on_topic():
    rubric = {'prompt': 'Discuss the impact of social media on mental health'}
    text = "Social media has significant effects on mental health and wellbeing."
    result = analyze(text, rubric)
    assert result.score > 50


def test_relevance_off_topic():
    rubric = {'prompt': 'Discuss the impact of social media on mental health'}
    text = "The French Revolution began in 1789 with the storming of the Bastille."
    result = analyze(text, rubric)
    assert result.score < 70