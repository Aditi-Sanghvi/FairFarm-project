
from dataclasses import dataclass
from math import ceil, isfinite


GRADE_MULT = {"A": 1.0, "B": 0.92, "C": 0.82}
SHRINK = {"tomato": 0.05, "onion": 0.03, "wheat": 0.01}


@dataclass
class Inputs:
    crop: str
    qty_qtl: float
    grade: str
    vehicle_capacity_qtl: float
    rate_per_km: float  # Cost per trip, per km


@dataclass
class Market:
    id: str
    distance_km: float
    price_min: float
    price_modal: float
    price_max: float
    fee_pct: float
    commission_pct: float
    handling_per_qtl: float
    max_qty_qtl: float | None = None


def net_return(i: Inputs, m: Market, price: float) -> dict:
    # Validate farmer inputs.
    if not isfinite(i.qty_qtl) or i.qty_qtl <= 0:
        raise ValueError("Quantity must be a positive finite number.")

    if (
        not isfinite(i.vehicle_capacity_qtl)
        or i.vehicle_capacity_qtl <= 0
    ):
        raise ValueError("Vehicle capacity must be positive and finite.")

    if not isfinite(i.rate_per_km) or i.rate_per_km < 0:
        raise ValueError("Transport rate must be finite and non-negative.")

    grade = i.grade.strip().upper()
    if grade not in GRADE_MULT:
        raise ValueError("Grade must be A, B, or C.")

    crop = i.crop.strip().lower()
    if not crop:
        raise ValueError("Crop must not be empty.")

    # Validate market inputs.
    numeric_values = {
        "distance": m.distance_km,
        "price": price,
        "minimum price": m.price_min,
        "modal price": m.price_modal,
        "maximum price": m.price_max,
        "market fee": m.fee_pct,
        "commission": m.commission_pct,
        "handling cost": m.handling_per_qtl,
    }

    for name, value in numeric_values.items():
        if not isfinite(value) or value < 0:
            raise ValueError(
                f"{name.capitalize()} must be finite and non-negative."
            )

    if m.max_qty_qtl is not None:
        if not isfinite(m.max_qty_qtl) or m.max_qty_qtl < 0:
            raise ValueError(
                "Market quantity limit must be finite and non-negative."
            )

    # Quantity the market can accept.
    if m.max_qty_qtl is None:
        accepted = i.qty_qtl
    else:
        accepted = min(i.qty_qtl, m.max_qty_qtl)

    # Account for estimated post-harvest shrinkage.
    shrink_rate = SHRINK.get(crop, 0.02)
    after_shrink = accepted * (1 - shrink_rate)

    # Calculate revenue using the selected quality grade.
    revenue = after_shrink * price * GRADE_MULT[grade]

    # Assumption: only the accepted quantity is transported.
    trips = ceil(accepted / i.vehicle_capacity_qtl) if accepted > 0 else 0

    # Rate applies per kilometre, per trip, for the round trip.
    transport = trips * m.distance_km * 2 * i.rate_per_km

    fees = revenue * (m.fee_pct + m.commission_pct) / 100
    handling = accepted * m.handling_per_qtl

    net = revenue - transport - fees - handling

    return {
        "accepted_qtl": accepted,
        "after_shrink_qtl": after_shrink,
        "revenue": revenue,
        "transport": transport,
        "fees": fees,
        "handling": handling,
        "net": net,
        "per_qtl": net / i.qty_qtl,
        "accepted_per_qtl": net / accepted if accepted > 0 else None,
        "unsold_qtl": i.qty_qtl - accepted,
        "trips": trips,
    }


def rank(i: Inputs, markets: list[Market]) -> list[dict]:
    rows = [
        {
            "market_id": m.id,
            "low": net_return(i, m, m.price_min),
            "mid": net_return(i, m, m.price_modal),
            "high": net_return(i, m, m.price_max),
        }
        for m in markets
    ]

    return sorted(
        rows,
        key=lambda row: row["low"]["net"],
        reverse=True,
    )
