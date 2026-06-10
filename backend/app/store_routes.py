from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from . import schemas, models
from .database import get_db
from .deps import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["store"])


@router.get("/packages", response_model=schemas.ApiResponse)
def list_packages(db: Session = Depends(get_db)):
    pkgs = db.query(models.Package).filter(models.Package.is_active == True).all()
    data = [schemas.PackageOut.from_orm(p) for p in pkgs]
    return {"success": True, "message": "OK", "data": data}


@router.get("/features", response_model=schemas.ApiResponse)
def list_features(db: Session = Depends(get_db)):
    feats = db.query(models.Feature).all()
    data = [schemas.FeatureOut.from_orm(f) for f in feats]
    return {"success": True, "message": "OK", "data": data}


@router.get("/features/me", response_model=schemas.ApiResponse)
def my_features(current_user: models.User = Depends(get_current_user)):
    data = [schemas.FeatureOut.from_orm(f) for f in current_user.features]
    return {"success": True, "message": "OK", "data": data}


@router.post("/purchases", response_model=schemas.ApiResponse)
def purchase(payload: schemas.PurchaseRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    pkg = db.query(models.Package).filter(models.Package.id == payload.package_id, models.Package.is_active == True).first()
    if not pkg:
        return {"success": False, "message": "Package not found", "data": None}
    # create transaction
    tx = models.Transaction(user_id=current_user.id, package_id=pkg.id, amount=pkg.price, credits=pkg.credits, status="success")
    db.add(tx)
    # ensure user credit record exists
    if not current_user.credit:
        current_user.credit = models.UserCredit(balance=0)
    current_user.credit.balance += pkg.credits
    # unlock features
    for f in pkg.features:
        if f not in current_user.features:
            current_user.features.append(f)
    # credit log
    log = models.CreditLog(user_id=current_user.id, type="purchase", amount=pkg.credits, balance_after=current_user.credits_balance, description=f"Purchase {pkg.name}")
    db.add(log)
    db.commit()
    db.refresh(tx)
    return {"success": True, "message": "Purchase successful", "data": schemas.TransactionOut.from_orm(tx)}


@router.get("/credits/me", response_model=schemas.ApiResponse)
def my_credits(current_user: models.User = Depends(get_current_user)):
    return {"success": True, "message": "OK", "data": {"credits_balance": current_user.credits_balance}}


@router.get("/transactions/me", response_model=schemas.ApiResponse)
def my_transactions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).order_by(models.Transaction.created_at.desc()).all()
    data = [schemas.TransactionOut.from_orm(t) for t in txs]
    return {"success": True, "message": "OK", "data": data}


@router.get("/credit-logs/me", response_model=schemas.ApiResponse)
def my_credit_logs(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(models.CreditLog).filter(models.CreditLog.user_id == current_user.id).order_by(models.CreditLog.created_at.desc()).all()
    data = [schemas.CreditLogOut.from_orm(l) for l in logs]
    return {"success": True, "message": "OK", "data": data}


# Admin endpoints for package management
@router.post("/packages", response_model=schemas.ApiResponse)
def create_package(payload: schemas.PackageCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    pkg = models.Package(name=payload.name, description=payload.description, price=payload.price, credits=payload.credits, is_active=payload.is_active)
    db.add(pkg)
    db.flush()
    # attach features (normalize codes: dash -> underscore)
    for code in payload.feature_codes:
        normalized_code = code.replace('-', '_')
        f = db.query(models.Feature).filter(models.Feature.code == normalized_code).first()
        if f:
            pkg.features.append(f)
    db.commit()
    # query package with eager load
    pkg = db.query(models.Package).options(selectinload(models.Package.features)).filter(models.Package.id == pkg.id).first()
    return {"success": True, "message": "Package created", "data": schemas.PackageOut.from_orm(pkg)}


@router.put("/packages/{id}", response_model=schemas.ApiResponse)
def update_package(id: int, payload: schemas.PackageUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    pkg = db.query(models.Package).filter(models.Package.id == id).first()
    if not pkg:
        return {"success": False, "message": "Package not found", "data": None}
    if payload.name:
        pkg.name = payload.name
    if payload.description is not None:
        pkg.description = payload.description
    if payload.price is not None:
        pkg.price = payload.price
    if payload.credits is not None:
        pkg.credits = payload.credits
    if payload.is_active is not None:
        pkg.is_active = payload.is_active
    if payload.feature_codes is not None:
        pkg.features = []
        for code in payload.feature_codes:
            normalized_code = code.replace('-', '_')
            f = db.query(models.Feature).filter(models.Feature.code == normalized_code).first()
            if f:
                pkg.features.append(f)
    db.commit()
    # query package with eager load
    pkg = db.query(models.Package).options(selectinload(models.Package.features)).filter(models.Package.id == pkg.id).first()
    return {"success": True, "message": "Package updated", "data": schemas.PackageOut.from_orm(pkg)}


@router.delete("/packages/{id}", response_model=schemas.ApiResponse)
def delete_package(id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    pkg = db.query(models.Package).filter(models.Package.id == id).first()
    if not pkg:
        return {"success": False, "message": "Package not found", "data": None}
    pkg.is_active = False  # soft delete
    db.commit()
    return {"success": True, "message": "Package deleted", "data": None}


# Feature usage endpoints
FEATURE_COSTS = {
    "generate_image": 5,
    "auto_post": 3,
    "advanced_analytics": 2,
}


@router.post("/features/{code}/use", response_model=schemas.ApiResponse)
def use_feature(code: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Normalize code
    normalized_code = code.replace('-', '_')
    
    # Check if user has the feature
    feature = db.query(models.Feature).filter(models.Feature.code == normalized_code).first()
    if not feature:
        return {"success": False, "message": "Feature not found", "data": None}
    
    has_feature = any(f.code == normalized_code for f in current_user.features)
    if not has_feature:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Feature not unlocked")
    
    # Deduct credits
    cost = FEATURE_COSTS.get(normalized_code, 1)
    if current_user.credits_balance < cost:
        return {"success": False, "message": "Insufficient credits", "data": {"credits_balance": current_user.credits_balance}}
    
    if not current_user.credit:
        current_user.credit = models.UserCredit(balance=0)
    current_user.credit.balance -= cost
    
    # Log credit deduction
    log = models.CreditLog(
        user_id=current_user.id,
        type="usage",
        amount=-cost,
        balance_after=current_user.credits_balance,
        description=f"Used {feature.name}"
    )
    db.add(log)
    db.commit()
    
    return {"success": True, "message": f"Used {feature.name}", "data": {"credits_balance": current_user.credits_balance}}
