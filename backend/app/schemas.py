from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: object | None = None


class FeatureOut(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    credits_balance: int
    created_at: datetime
    features: List[FeatureOut] = []

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PackageBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: Optional[str] = None
    price: float = Field(ge=0)
    credits: int = Field(gt=0)
    is_active: bool = True
    feature_codes: List[str] = []


class PackageCreate(PackageBase):
    pass


class PackageUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    credits: Optional[int] = Field(default=None, gt=0)
    is_active: Optional[bool] = None
    feature_codes: Optional[List[str]] = None


class PackageOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    credits: int
    is_active: bool
    created_at: datetime
    features: List[FeatureOut] = []

    class Config:
        from_attributes = True


class PurchaseRequest(BaseModel):
    package_id: int


class TransactionOut(BaseModel):
    id: int
    amount: float
    credits: int
    status: str
    created_at: datetime
    package: PackageOut

    class Config:
        from_attributes = True


class CreditLogOut(BaseModel):
    id: int
    type: str
    amount: int
    balance_after: int
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
