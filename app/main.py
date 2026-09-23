from fastapi import FastAPI

from app.database import Base, engine
from app.routers import accounts, auth, loans

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Banking Transaction API")

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(loans.router)


@app.get("/")
def root():
    return {"status": "ok"}
