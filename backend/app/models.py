from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base


class PackageFeature(Base):
    __tablename__ = "package_features"
    package_id = Column(Integer, ForeignKey("packages.id", ondelete="CASCADE"), primary_key=True)
    feature_id = Column(Integer, ForeignKey("features.id", ondelete="CASCADE"), primary_key=True)


class UserFeature(Base):
    __tablename__ = "user_features"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    feature_id = Column(Integer, ForeignKey("features.id", ondelete="CASCADE"), primary_key=True)
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    credit_logs = relationship("CreditLog", back_populates="user", cascade="all, delete-orphan")
    features = relationship("Feature", secondary="user_features", back_populates="users")
    credit = relationship("UserCredit", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def credits_balance(self):
        return self.credit.balance if self.credit else 0


class UserCredit(Base):
    __tablename__ = "user_credits"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    balance = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="credit")


class Package(Base):
    __tablename__ = "packages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    credits = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    features = relationship("Feature", secondary="package_features", back_populates="packages")
    transactions = relationship("Transaction", back_populates="package")


class Feature(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(80), nullable=False, unique=True, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)

    packages = relationship("Package", secondary="package_features", back_populates="features")
    users = relationship("User", secondary="user_features", back_populates="features")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    amount = Column(Float, nullable=False)
    credits = Column(Integer, nullable=False)
    status = Column(String(30), nullable=False, default="success")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="transactions")
    package = relationship("Package", back_populates="transactions")


class CreditLog(Base):
    __tablename__ = "credit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(40), nullable=False)
    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="credit_logs")
