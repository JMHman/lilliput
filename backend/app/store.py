from datetime import datetime
from typing import List, Dict, Optional
import re

def normalize_phone(phone: str) -> str:
    # 숫자만 남김: +82 처리 등은 나중에 규칙 확장
    return re.sub(r"\D+", "", phone)

class WaitingStore:
    """
    간단한 인메모리 스토어.
    - 운영 중 프로세스가 재시작되면 초기화됨.
    - 검증 끝나면 SQLite/PG로 교체 예정.
    """
    def __init__(self):
        self.queue: List[Dict] = []  # [{...}, ...]

    def find_index(self, phone: str) -> Optional[int]:
        phone = normalize_phone(phone)
        for idx, item in enumerate(self.queue):
            if item["phone"] == phone and not item["visited"]:
                return idx
        return None

    def add_or_position(self, name: str, phone: str, adults: int, children: int):
        phone = normalize_phone(phone)
        idx = self.find_index(phone)
        if idx is not None:
            return idx, len(self.queue)
        self.queue.append({
            "name": name,
            "phone": phone,
            "adults": adults,
            "children": children,
            "ts": datetime.now().isoformat(timespec="seconds"),
            "called": False,
            "visited": False
        })
        return len(self.queue) - 1, len(self.queue)

    def get_position(self, phone: str) -> Optional[tuple]:
        phone = normalize_phone(phone)
        idx = self.find_index(phone)
        if idx is None:
            return None
        return idx, len(self.queue)

    def list_all(self) -> List[Dict]:
        return self.queue

    def mark_called(self, phone: str) -> bool:
        phone = normalize_phone(phone)
        idx = self.find_index(phone)
        if idx is None:
            return False
        self.queue[idx]["called"] = True
        return True

    def mark_visited(self, phone: str) -> bool:
        phone = normalize_phone(phone)
        idx = self.find_index(phone)
        if idx is None:
            return False
        self.queue[idx]["visited"] = True
        return True

    def reset(self):
        self.queue.clear()

store = WaitingStore()
