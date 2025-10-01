from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.sql import func
from .database import Base

class Waiting(Base):
    __tablename__ = "waiting"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    phone = Column(String(32), nullable=False, index=True)
    adults = Column(Integer, nullable=False, default=1)
    children = Column(Integer, nullable=False, default=0)
    called = Column(Boolean, nullable=False, default=False)
    visited = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 같은 전화는 방문 처리 전에는 중복 등록 금지
    __table_args__ = (
        Index("uq_waiting_phone_open", "phone", postgresql_where=(~visited)),
    )
