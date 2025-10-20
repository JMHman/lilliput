import re
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from .models import Waiting

def normalize_phone(phone: str) -> str:
    return re.sub(r"\D+", "", phone or "")

def list_all(db: Session):
    q = select(Waiting).order_by(Waiting.created_at.asc())
    return db.execute(q).scalars().all()

def get_open_index_and_total(db: Session, phone: str):
    phone = normalize_phone(phone)
    # 방문하지 않은 목록
    q = select(Waiting).where(Waiting.visited == False).order_by(Waiting.created_at.asc())  # noqa: E712
    rows = db.execute(q).scalars().all()
    total = len(rows)
    for idx, r in enumerate(rows):
        if r.phone == phone:
            return idx, total
    return None, total

def add_or_position(db: Session, name: str, phone: str, adults: int, children: int):
    phone = normalize_phone(phone)
    idx, total = get_open_index_and_total(db, phone)
    if idx is not None:
        return idx, total
    w = Waiting(name=name, phone=phone, adults=adults, children=children)
    db.add(w)
    db.commit()
    db.refresh(w)
    # 새로 추가 후 다시 계산
    idx, total = get_open_index_and_total(db, phone)
    return idx or 0, total

def mark_called(db: Session, phone: str) -> bool:
    phone = normalize_phone(phone)
    q = select(Waiting).where(Waiting.phone == phone, Waiting.visited == False).order_by(Waiting.created_at.asc())  # noqa: E712
    w = db.execute(q).scalars().first()
    if not w:
        return False
    w.called = True
    db.commit()
    return True

def mark_visited(db: Session, phone: str) -> bool:
    phone = normalize_phone(phone)
    q = select(Waiting).where(Waiting.phone == phone, Waiting.visited == False).order_by(Waiting.created_at.asc())  # noqa: E712
    w = db.execute(q).scalars().first()
    if not w:
        return False
    w.visited = True
    db.commit()
    return True

def reset(db: Session):
    # 운영 중엔 신중히. 지금은 개발용
    db.query(Waiting).delete()
    db.commit()
