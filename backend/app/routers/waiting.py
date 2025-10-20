from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from ..schemas import WaitingIn, WaitingOut, WaitingItem, PhoneCheckOut
from ..database import get_db
from .. import crud

router = APIRouter(tags=["waiting"])

@router.get("/waiting/check", response_model=PhoneCheckOut)
def check_phone(phone: str = Query(..., min_length=4), db: Session = Depends(get_db)):
    idx, total = crud.get_open_index_and_total(db, phone)
    if idx is None:
        return PhoneCheckOut(exists=False)
    return PhoneCheckOut(exists=True, position=idx, total=total)

@router.post("/waiting", response_model=WaitingOut)
def add_waiting(data: WaitingIn, db: Session = Depends(get_db)):
    pos, total = crud.add_or_position(db, data.name, data.phone, data.adults, data.children)
    return WaitingOut(position=pos, total=total)

@router.get("/waiting/list", response_model=list[WaitingItem])
def list_waiting(db: Session = Depends(get_db)):
    rows = crud.list_all(db)
    return [
        WaitingItem(
            name=r.name, phone=r.phone, adults=r.adults, children=r.children,
            ts=r.created_at.isoformat() if r.created_at else "", called=r.called, visited=r.visited
        )
        for r in rows
    ]

@router.get("/waiting/{phone}", response_model=WaitingOut)
def get_waiting(phone: str, db: Session = Depends(get_db)):
    idx, total = crud.get_open_index_and_total(db, phone)
    if idx is None:
        raise HTTPException(status_code=404, detail="Not in waiting list")
    return WaitingOut(position=idx, total=total)

@router.patch("/waiting/{phone}/call")
def mark_called(phone: str, db: Session = Depends(get_db)):
    ok = crud.mark_called(db, phone)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

@router.patch("/waiting/{phone}/visit")
def mark_visited(phone: str, db: Session = Depends(get_db)):
    ok = crud.mark_visited(db, phone)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

@router.delete("/waiting/reset")
def reset(db: Session = Depends(get_db)):
    crud.reset(db)
    return {"ok": True}
