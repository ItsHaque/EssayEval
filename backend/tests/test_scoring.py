from lib.scoring import compute_band, compute_grade, compute_overall


def test_compute_band_boundaries():
    assert compute_band(100) == 4
    assert compute_band(85) == 4
    assert compute_band(84) == 3
    assert compute_band(70) == 3
    assert compute_band(69) == 2
    assert compute_band(50) == 2
    assert compute_band(49) == 1
    assert compute_band(0) == 1


def test_compute_grade():
    bands = {"A": 85, "B": 70, "C": 55, "D": 40}
    assert compute_grade(90, bands) == "A"
    assert compute_grade(85, bands) == "A"
    assert compute_grade(70, bands) == "B"
    assert compute_grade(39, bands) == "F"


def test_compute_overall():
    assert compute_overall([80, 90], [50, 50]) == 85.0
    assert compute_overall([100, 0], [50, 50]) == 50.0
    assert compute_overall([], []) == 0.0