
from app.engine import Inputs, Market, rank


def test_closer_market_beats_higher_price():
    i = Inputs("tomato", 40, "A", 20, 12)

    far = Market("far", 120, 1800, 2000, 2200, 1, 2, 5)
    near = Market("near", 20, 1700, 1900, 2100, 1, 2, 5)

    results = rank(i, [far, near])

    assert results[0]["market_id"] == "near"
