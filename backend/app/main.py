from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models, seed
from .auth_routes import router as auth_router

app = FastAPI()

# Allow frontend origin for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # create tables
    Base.metadata.create_all(bind=engine)
    # seed database
    db = SessionLocal()
    try:
        seed.seed_database(db)
    finally:
        db.close()


app.include_router(auth_router)

from .store_routes import router as store_router
app.include_router(store_router)

@app.get("/health")
def health():
    return {"status": "ok"}
