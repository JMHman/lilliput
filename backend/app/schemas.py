from typing import Optional
from pydantic import BaseModel, Field

class WaitingIn(BaseModel):
    name: str = Field(min_length=1)
    phone: str = Field(min_length=6)  # 국제번호 고려, 최소 길이 완화
    adults: int = Field(ge=0, default=1)
    children: int = Field(ge=0, default=0)

class WaitingOut(BaseModel):
    position: int   # 앞에 몇 팀
    total: int      # 전체 웨이팅 수

class WaitingItem(BaseModel):
    name: str
    phone: str
    adults: int
    children: int
    ts: str
    called: bool
    visited: bool
    
class PhoneCheckOut(BaseModel):
    exists: bool
    position: Optional[int] = None
    total: Optional[int] = None
