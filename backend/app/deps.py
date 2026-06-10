from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .auth import decode_token
from .database import get_db
from .models import Feature, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def api_error(status_code: int, message: str):
    raise HTTPException(status_code=status_code, detail={"success": False, "message": message})


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user_id = decode_token(token)
    if not user_id:
        api_error(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        api_error(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        api_error(status.HTTP_403_FORBIDDEN, "Admin permission required")
    return current_user


def ensure_feature_unlocked(db: Session, user: User, feature_code: str) -> Feature:
    feature = db.query(Feature).filter(Feature.code == feature_code).first()
    if not feature:
        api_error(status.HTTP_404_NOT_FOUND, "Feature not found")
    if feature not in user.features:
        api_error(status.HTTP_403_FORBIDDEN, f"Feature '{feature_code}' is not unlocked. Please buy a suitable package.")
    return feature
