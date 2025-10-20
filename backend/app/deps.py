# app/deps.py
import os
from fastapi import Header, HTTPException

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

def verify_admin(x_admin_token: str = Header(default="")):
    if not ADMIN_TOKEN or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
