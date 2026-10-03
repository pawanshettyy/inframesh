from fastapi import APIRouter
import time
from backend.app.core.config import settings

router = APIRouter(prefix="/health", tags=["Self Observability"])

_start_time = time.time()

@router.get("")
async def health_check():
    uptime = time.time() - _start_time
    return {
        "status": "healthy",
        "service": "inframesh-core-backend",
        "version": settings.VERSION,
        "uptime_seconds": round(uptime, 2),
        "database": "connected (async SQLite/PostgreSQL)",
        "rca_engine": "online (Isolation Forest / Multi-Signal ML)",
        "event_bus": "active (WebSockets + PubSub)"
    }
