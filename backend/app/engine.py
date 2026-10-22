from dataclasses import dataclass
from math import ceil

GRADE_MULT = {"A": 1.0, "B": 0.92, "C": 0.82}
SHRINK = {"tomato": 0.05, "onion": 0.03, "wheat": 0.01}

@dataclass
class Inputs:
    crop: str
    qty_qtl: float
    grade: str
    vehicle_capacity_qtl: float
    rate_per_km: float          # per trip, per km

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
    sellable = min(i.qty_qtl, m.max_qty_qtl or float("inf"))
    after_shrink = sellable * (1 - SHRINK.get(i.crop, 0.02))
    revenue = after_shrink * price * GRADE_MULT[i.grade]
    trips = ceil(i.qty_qtl / i.vehicle_capacity_qtl)
    transport = trips * m.distance_km * 2 * i.rate_per_km
    fees = revenue * (m.fee_pct + m.commission_pct) / 100
    handling = i.qty_qtl * m.handling_per_qtl
    net = revenue - transport - fees - handling
    return {"revenue": revenue, "transport": transport, "fees": fees,
            "handling": handling, "net": net, "per_qtl": net / i.qty_qtl,
            "unsold_qtl": i.qty_qtl - sellable}

def rank(i: Inputs, markets: list[Market]) -> list[dict]:
    rows = [{"market_id": m.id,
             "low": net_return(i, m, m.price_min),
             "mid": net_return(i, m, m.price_modal),
             "high": net_return(i, m, m.price_max)} for m in markets]
    return sorted(rows, key=lambda r: r["low"]["net"], reverse=True)