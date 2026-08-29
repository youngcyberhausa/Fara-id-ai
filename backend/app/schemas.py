from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HeirInput(BaseModel):
    type: str  # e.g. "husband", "wife", "son", "daughter", "father", "mother",
    #            "full_brother", "full_sister", "consanguine_brother",
    #            "consanguine_sister", "uterine_brother", "uterine_sister",
    #            "paternal_grandfather", "paternal_grandmother", "maternal_grandmother"
    count: int = 1


class CaseCreate(BaseModel):
    title: Optional[str] = "Untitled Case"
    estate_amount: float = 0
    currency: str = "NGN"
    funeral_cost: float = 0
    debts: float = 0
    wasiyyah_amount: float = 0
    heirs: List[HeirInput] = Field(default_factory=list)


class CaseUpdate(CaseCreate):
    pass


class CaseOut(BaseModel):
    id: str
    title: str
    estate_amount: float
    currency: str
    funeral_cost: float
    debts: float
    wasiyyah_amount: float
    heirs: List[Dict[str, Any]]
    result: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class CalculateRequest(BaseModel):
    estate_amount: float
    currency: str = "NGN"
    funeral_cost: float = 0
    debts: float = 0
    wasiyyah_amount: float = 0
    heirs: List[HeirInput]
