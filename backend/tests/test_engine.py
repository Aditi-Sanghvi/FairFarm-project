
from app.engine import Inputs, Market, rank, net_return


def test_closer_market_beats_higher_price():
    i = Inputs("tomato", 40, "A", 20, 12)

    far = Market("far", 120, 1800, 2000, 2200, 1, 2, 5)
    near = Market("near", 20, 1700, 1900, 2100, 1, 2, 5)

    results = rank(i, [far, near])

    assert results[0]["market_id"] == "near"

def test_net_return_calculation():
    inputs = Inputs("tomato", 40, "A", 20, 12)

    market = Market(
        "near",
        20,       # distance in km
        1700,     # minimum price
        1900,     # modal price
        2100,     # maximum price
        1,        # market fee percentage
        2,        # commission percentage
        5,        # handling cost per quintal
    )

    result = net_return(inputs, market, market.price_modal)

    assert result["revenue"] == 72200
    assert result["transport"] == 960
    assert result["fees"] == 2166
    assert result["handling"] == 200
    assert result["net"] == 68874


def test_grade_b_reduces_revenue():
    inputs_a = Inputs("tomato", 40, "A", 20, 12)
    inputs_b = Inputs("tomato", 40, "B", 20, 12)

    market = Market("near", 20, 1700, 1900, 2100, 1, 2, 5)

    result_a = net_return(inputs_a, market, market.price_modal)

    result_b = net_return(inputs_b, market, market.price_modal)

    assert result_b["revenue"] < result_a["revenue"]


def test_quantity_limit_adjusts_costs_and_unsold_quantity():
    inputs = Inputs("tomato", 40, "A", 20, 12)

    market = Market(
        "limited",
        20,
        1700,
        1900,
        2100,
        1,
        2,
        5,
        max_qty_qtl=25,
    )

    result = net_return(inputs, market, market.price_modal)

    assert result["accepted_qtl"] == 25
    assert result["unsold_qtl"] == 15
    assert result["trips"] == 2
    assert result["transport"] == 960
    assert result["handling"] == 125


def test_zero_quantity_limit_means_nothing_is_accepted():
    inputs = Inputs("tomato", 40, "A", 20, 12)

    market = Market(
        "closed",
        20,
        1700,
        1900,
        2100,
        1,
        2,
        5,
        max_qty_qtl=0,
    )

    result = net_return(inputs, market, market.price_modal)

    assert result["accepted_qtl"] == 0
    assert result["unsold_qtl"] == 40
    assert result["trips"] == 0
    assert result["revenue"] == 0
    assert result["handling"] == 0
    assert result["accepted_per_qtl"] is None
