from sqlalchemy.orm import Session
from .auth import hash_password
from .models import Feature, Package, User, UserCredit

FEATURES = [
    {"code": "generate_image", "name": "Generate Image", "description": "Create AI images using credits."},
    {"code": "auto_post", "name": "Auto Post", "description": "Schedule and auto publish posts."},
    {"code": "advanced_analytics", "name": "Advanced Analytics", "description": "View advanced SaaS usage analytics."},
]

PACKAGES = [
    {
        "name": "Starter",
        "description": "For trying basic AI image generation.",
        "price": 9.0,
        "credits": 100,
        "features": ["generate_image"],
    },
    {
        "name": "Pro",
        "description": "For creators who need image generation and auto posting.",
        "price": 19.0,
        "credits": 300,
        "features": ["generate_image", "auto_post"],
    },
    {
        "name": "Business",
        "description": "For teams who need all premium features.",
        "price": 49.0,
        "credits": 1000,
        "features": ["generate_image", "auto_post", "advanced_analytics"],
    },
]


def seed_database(db: Session):
    if not db.query(User).filter(User.email == "admin@example.com").first():
        admin = User(name="Admin User", email="admin@example.com", password_hash=hash_password("password"), role="admin")
        admin.credit = UserCredit(balance=0)
        db.add(admin)
    if not db.query(User).filter(User.email == "user@example.com").first():
        demo = User(name="Demo User", email="user@example.com", password_hash=hash_password("password"), role="user")
        demo.credit = UserCredit(balance=20)
        db.add(demo)
    db.commit()

    # Ensure existing users have a credit balance row
    for user in db.query(User).all():
        if not user.credit:
            db.add(UserCredit(user_id=user.id, balance=0))
    db.commit()

    feature_map = {}
    for item in FEATURES:
        feature = db.query(Feature).filter(Feature.code == item["code"]).first()
        if not feature:
            feature = Feature(**item)
            db.add(feature)
            db.commit()
            db.refresh(feature)
        feature_map[feature.code] = feature

    if db.query(Package).count() == 0:
        for item in PACKAGES:
            feature_codes = item.pop("features")
            package = Package(**item)
            package.features = [feature_map[code] for code in feature_codes]
            db.add(package)
        db.commit()
