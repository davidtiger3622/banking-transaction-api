import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models import TransactionType


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AccountCreate(BaseModel):
    account_holder_name: str = Field(min_length=2)
    initial_deposit: Decimal = Field(default=Decimal("0"), ge=0)


class AccountOut(BaseModel):
    id: uuid.UUID
    account_number: str
    account_holder_name: str
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class DepositRequest(BaseModel):
    amount: Decimal = Field(gt=0)


class WithdrawRequest(BaseModel):
    amount: Decimal = Field(gt=0)


class TransferRequest(BaseModel):
    from_account_id: uuid.UUID
    to_account_id: uuid.UUID
    amount: Decimal = Field(gt=0)


class TransactionOut(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    type: TransactionType
    amount: Decimal
    related_account_id: Optional[uuid.UUID]
    created_at: datetime

    class Config:
        from_attributes = True


class LoanCreate(BaseModel):
    account_id: uuid.UUID


class LoanOut(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    principal_amount: Decimal
    currency: str
    disbursed: bool
    created_at: datetime
    disbursed_at: Optional[datetime]

    class Config:
        from_attributes = True
