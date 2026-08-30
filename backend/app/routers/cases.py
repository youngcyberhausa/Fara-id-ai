from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..faraid_engine import calculate_faraid, HEIR_LABELS
from ..deps import get_current_user

router = APIRouter(prefix="/api", tags=["cases"])


def _build_result(payload: dict) -> dict:
    estate = payload["estate_amount"]
    funeral = payload.get("funeral_cost", 0) or 0
    debts = payload.get("debts", 0) or 0
    wasiyyah_requested = payload.get("wasiyyah_amount", 0) or 0

    net_estate = max(estate - funeral - debts, 0)
    wasiyyah_cap = net_estate / 3
    wasiyyah_capped = min(wasiyyah_requested, wasiyyah_cap)
    distributable = net_estate - wasiyyah_capped

    heirs = payload.get("heirs", [])
    engine_result = calculate_faraid(heirs)

    heir_counts = {h["type"]: h["count"] for h in heirs if h.get("count", 0) > 0}

    breakdown = []
    for htype, frac in engine_result.shares.items():
        if htype == "unallocated":
            continue
        count = heir_counts.get(htype, 1)
        per_head_frac = engine_result.per_head.get(htype)
        if per_head_frac is None:
            per_head_frac = frac / count if count else frac
        breakdown.append({
            "heir_type": htype,
            "label": HEIR_LABELS.get(htype, htype.replace("_", " ").title()),
            "count": count,
            "share_fraction": str(frac),
            "share_percent": round(float(frac) * 100, 4),
            "amount_total": round(float(frac) * distributable, 2),
            "amount_per_person": round(float(per_head_frac) * distributable, 2),
        })

    breakdown.sort(key=lambda x: -x["share_percent"])

    return {
        "estate_amount": estate,
        "funeral_cost": funeral,
        "debts": debts,
        "net_estate": round(net_estate, 2),
        "wasiyyah_requested": wasiyyah_requested,
        "wasiyyah_applied": round(wasiyyah_capped, 2),
        "wasiyyah_cap_note": "Bequest (wasiyyah) is capped at 1/3 of the net estate under Shari'ah."
        if wasiyyah_requested > wasiyyah_cap else None,
        "distributable_estate": round(distributable, 2),
        "currency": payload.get("currency", "NGN"),
        "breakdown": breakdown,
        "awl_applied": engine_result.awl_applied,
        "radd_applied": engine_result.radd_applied,
        "needs_scholar_review": engine_result.needs_scholar_review,
        "notes": engine_result.notes,
    }


@router.post("/calculate")
def calculate(req: schemas.CalculateRequest, user: models.User = Depends(get_current_user)):
    result = _build_result(req.model_dump())
    return result


@router.post("/cases", response_model=schemas.CaseOut)
def create_case(
    case: schemas.CaseCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    payload = case.model_dump()
    result = _build_result(payload)
    db_case = models.Case(
        user_id=user.id,
        title=payload.get("title") or "Untitled Case",
        estate_amount=payload["estate_amount"],
        currency=payload.get("currency", "NGN"),
        funeral_cost=payload.get("funeral_cost", 0),
        debts=payload.get("debts", 0),
        wasiyyah_amount=payload.get("wasiyyah_amount", 0),
        heirs=[h for h in payload["heirs"]],
        result=result,
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


@router.get("/cases", response_model=List[schemas.CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Case)
        .filter(models.Case.user_id == user.id)
        .order_by(models.Case.created_at.desc())
        .all()
    )


@router.get("/cases/{case_id}", response_model=schemas.CaseOut)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    db_case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id, models.Case.user_id == user.id)
        .first()
    )
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case


@router.put("/cases/{case_id}", response_model=schemas.CaseOut)
def update_case(
    case_id: str,
    case: schemas.CaseUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    db_case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id, models.Case.user_id == user.id)
        .first()
    )
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")

    payload = case.model_dump()
    result = _build_result(payload)

    db_case.title = payload.get("title") or "Untitled Case"
    db_case.estate_amount = payload["estate_amount"]
    db_case.currency = payload.get("currency", "NGN")
    db_case.funeral_cost = payload.get("funeral_cost", 0)
    db_case.debts = payload.get("debts", 0)
    db_case.wasiyyah_amount = payload.get("wasiyyah_amount", 0)
    db_case.heirs = payload["heirs"]
    db_case.result = result

    db.commit()
    db.refresh(db_case)
    return db_case


@router.delete("/cases/{case_id}")
def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    db_case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id, models.Case.user_id == user.id)
        .first()
    )
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(db_case)
    db.commit()
    return {"deleted": True}
