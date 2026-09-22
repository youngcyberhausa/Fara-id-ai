from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class HeirInput(BaseModel):
    type: str
    count: int = 1
    names: Optional[List[str]] = None  # optional individual names


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
    share_token: Optional[str] = None

    class Config:
        from_attributes = True


class CalculateRequest(BaseModel):
    estate_amount: float
    currency: str = "NGN"
    funeral_cost: float = 0
    debts: float = 0
    wasiyyah_amount: float = 0
    heirs: List[HeirInput]


class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    is_premium: bool = False
    premium_expires_at: Optional[datetime] = None
    is_admin: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str = Field(min_length=6)


class RequestAccountDeletionRequest(BaseModel):
    email: str


class ConfirmAccountDeletionRequest(BaseModel):
    email: str
    otp: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AnnouncementCreate(BaseModel):
    title: str
    message: Optional[str] = None
    video_url: Optional[str] = None


class AnnouncementOut(BaseModel):
    id: str
    title: str
    message: Optional[str] = None
    video_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminStats(BaseModel):
    total_users: int
    total_cases: int
    premium_users: int
    new_users_7d: int
