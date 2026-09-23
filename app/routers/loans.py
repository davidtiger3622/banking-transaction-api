from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Loan, Transaction, TransactionType, User
from app.routers.accounts import get_owned_account
from app.schemas import LoanCreate, LoanOut

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post("", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan_in: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_account(loan_in.account_id, db, current_user)
    loan = Loan(account_id=loan_in.account_id)
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/disburse", response_model=LoanOut)
def disburse_loan(
    loan_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime

    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")

    account = get_owned_account(loan.account_id, db, current_user)

    if loan.disbursed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Loan already disbursed"
        )

    account.balance += loan.principal_amount
    loan.disbursed = True
    loan.disbursed_at = datetime.utcnow()

    db.add(
        Transaction(
            account_id=account.id,
            type=TransactionType.LOAN_DISBURSEMENT,
            amount=loan.principal_amount,
        )
    )
    db.commit()
    db.refresh(loan)
    return loan
