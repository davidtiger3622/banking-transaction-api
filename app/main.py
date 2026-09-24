from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import accounts, auth, loans

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Banking Transaction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(loans.router)


@app.get("/")
def root():
    return {"status": "ok"}
