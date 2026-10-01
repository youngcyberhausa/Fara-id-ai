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
    push_notifications_enabled: bool = True
    rubuu_dinar_currency: str = "NGN"
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


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


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


class DeviceTokenRequest(BaseModel):
    token: str = Field(min_length=10, max_length=4096)
    platform: str = Field(default="android", min_length=2, max_length=32)


class NotificationPreferenceRequest(BaseModel):
    enabled: bool
    currency: Optional[str] = None


class NotificationPreferenceOut(BaseModel):
    enabled: bool
    currency: str = "NGN"


class RubuuDinarPriceOut(BaseModel):
    currency: str
    gold_price_per_gram: float
    rubuu_dinar_price: float
    previous_rubuu_dinar_price: Optional[float] = None
    checked_at: Optional[datetime] = None
    grams: float = 1.0625

    class Config:
        from_attributes = True
