from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .routers import health, waiting

BASE_DIR = Path(__file__).resolve().parent.parent   # .../backend
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Lilliput Backend")

# CORS (필요시 도메인 제한)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 나중에 admin/pad 도메인만 허용으로 좁히자
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터
app.include_router(health.router, prefix="/api")
app.include_router(waiting.router, prefix="/api")

# 정적 페이지(나중에 넣을 폴더들; 지금은 폴더 없어도 에러 안나게 주석 처리 가능)
app.mount("/pad",   StaticFiles(directory=str(STATIC_DIR / "pad"), html=True), name="pad")
app.mount("/admin", StaticFiles(directory=str(STATIC_DIR / "admin"), html=True), name="admin")
# app.mount("/menu",  StaticFiles(directory=str(STATIC_DIR / "menu"), html=True), name="menu")
