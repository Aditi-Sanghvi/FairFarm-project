from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.engine import Inputs, Market, rank

app = FastAPI(
    title="FairFarm API",
    description="Compare agricultural markets by estimated net return.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class CompareRequest(BaseModel):
    crop: str
    qty_qtl: float = Field(gt=0)
    grade: str
    vehicle_capacity_qtl: float = Field(gt=0)
    rate_per_km: float = Field(ge=0)
    markets: list[dict]


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

        markets = [Market(**market) for market in request.markets]

        if not markets:
            raise HTTPException(
                status_code=400,
                detail="Provide at least one market to compare.",
            )

        return {"results": rank(inputs, markets)}

    except (TypeError, ValueError, KeyError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
