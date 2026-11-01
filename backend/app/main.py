
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from app.engine import Inputs, Market, rank


app = FastAPI(
    title="FairFarm API",
    description="Compare agricultural markets by estimated net return.",
    version="0.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class MarketRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    id: str = Field(min_length=1)
    distance_km: float = Field(ge=0)
    price_min: float = Field(ge=0)
    price_modal: float = Field(ge=0)
    price_max: float = Field(ge=0)
    fee_pct: float = Field(ge=0)
    commission_pct: float = Field(ge=0)
    handling_per_qtl: float = Field(ge=0)
    max_qty_qtl: float | None = Field(default=None, ge=0)


class CompareRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    crop: str = Field(min_length=1)
    qty_qtl: float = Field(gt=0)
    grade: Literal["A", "B", "C"]
    vehicle_capacity_qtl: float = Field(gt=0)
    rate_per_km: float = Field(ge=0)
    markets: list[MarketRequest] = Field(min_length=1)


@app.get("/")
def home():
    return {"message": "Welcome to FairFarm API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/compare")
def compare_markets(request: CompareRequest):
    try:
        inputs = Inputs(
            crop=request.crop,
            qty_qtl=request.qty_qtl,
            grade=request.grade,
            vehicle_capacity_qtl=request.vehicle_capacity_qtl,
            rate_per_km=request.rate_per_km,
        )

        markets = [
            Market(**market.model_dump())
            for market in request.markets
        ]

        results = rank(inputs, markets)
        return {"results": results}

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
