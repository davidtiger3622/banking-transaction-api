import random
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Account, Transaction, TransactionType, User
from app.schemas import (
    AccountCreate,
    AccountOut,
    DepositRequest,
    TransactionOut,
    TransferRequest,
    WithdrawRequest,
)

router = APIRouter(prefix="/accounts", tags=["accounts"])


def generate_account_number(db: Session) -> str:
    while True:
        candidate = str(random.randint(10**9, (10**10) - 1))
        if not db.query(Account).filter(Account.account_number == candidate).first():
            return candidate


def get_owned_account(account_id, db: Session, current_user: User) -> Account:
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    if account.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your account")
    return account


@router.post("", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = Account(
        account_number=generate_account_number(db),
        account_holder_name=account_in.account_holder_name,
        balance=account_in.initial_deposit,
        owner_id=current_user.id,
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    if account_in.initial_deposit > 0:
        db.add(
            Transaction(
                account_id=account.id,
                type=TransactionType.DEPOSIT,
                amount=account_in.initial_deposit,
            )
        )
        db.commit()

    return account


@router.get("", response_model=list[AccountOut])
def list_accounts(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(Account).filter(Account.owner_id == current_user.id).all()


@router.post("/{account_id}/deposit", response_model=AccountOut)
def deposit(
    account_id,
    deposit_in: DepositRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = get_owned_account(account_id, db, current_user)
    account.balance += deposit_in.amount
    db.add(
        Transaction(
            account_id=account.id,
            type=TransactionType.DEPOSIT,
            amount=deposit_in.amount,
        )
    )
    db.commit()
    db.refresh(account)
    return account


@router.post("/{account_id}/withdraw", response_model=AccountOut)
def withdraw(
    account_id,
    withdraw_in: WithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = get_owned_account(account_id, db, current_user)
    if account.balance < withdraw_in.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance"
        )
    account.balance -= withdraw_in.amount
    db.add(
        Transaction(
            account_id=account.id,
            type=TransactionType.WITHDRAWAL,
            amount=withdraw_in.amount,
        )
    )
    db.commit()
    db.refresh(account)
    return account


@router.post("/transfer", response_model=list[AccountOut])
def transfer(
    transfer_in: TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if transfer_in.from_account_id == transfer_in.to_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot transfer to the same account"
        )

    from_account = get_owned_account(transfer_in.from_account_id, db, current_user)
    to_account = db.query(Account).filter(Account.id == transfer_in.to_account_id).first()
    if not to_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Destination account not found"
        )
    if from_account.balance < transfer_in.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance"
        )

    from_account.balance -= transfer_in.amount
    to_account.balance += transfer_in.amount

    db.add(
        Transaction(
            account_id=from_account.id,
            type=TransactionType.TRANSFER_OUT,
            amount=transfer_in.amount,
            related_account_id=to_account.id,
        )
    )
    db.add(
        Transaction(
            account_id=to_account.id,
            type=TransactionType.TRANSFER_IN,
            amount=transfer_in.amount,
            related_account_id=from_account.id,
        )
    )
    db.commit()
    db.refresh(from_account)
    db.refresh(to_account)
    return [from_account, to_account]


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = get_owned_account(account_id, db, current_user)
    if account.balance != Decimal("0"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only dormant (zero-balance) accounts can be deleted",
        )
    db.delete(account)
    db.commit()


@router.get("/{account_id}/transactions", response_model=list[TransactionOut])
def list_transactions(
    account_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = get_owned_account(account_id, db, current_user)
    return (
        db.query(Transaction)
        .filter(Transaction.account_id == account.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
