from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import schemas, models
from .database import get_db
from .auth import verify_password, create_access_token, hash_password
from .deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.ApiResponse)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        return {"success": False, "message": "Email already registered", "data": None}
    user = models.User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    user.credit = models.UserCredit(balance=0)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"success": True, "message": "User registered", "data": None}


@router.post("/login", response_model=schemas.ApiResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        return {"success": False, "message": "Invalid credentials", "data": None}
    token = create_access_token(str(user.id))
    return {"success": True, "message": "Login successful", "data": {"access_token": token, "token_type": "bearer", "user": schemas.UserOut.from_orm(user)}}


@router.get("/me", response_model=schemas.ApiResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return {"success": True, "message": "OK", "data": schemas.UserOut.from_orm(current_user)}
