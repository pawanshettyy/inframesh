import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.api.v1 import (
    auth,
    services,
    topology,
    telemetry,
    incidents,
    rca,
    anomalies,
    alerts,
    simulation,
    health,
    ws
)

from backend.app.services.traffic_simulator import traffic_simulator

async def telemetry_background_ticker():
    """Continuously advances live telemetry every 2 seconds."""
    while True:
        try:
            await asyncio.sleep(2.0)
            traffic_simulator.tick()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in telemetry ticker: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    ticker_task = asyncio.create_task(telemetry_background_ticker())
    print("✓ InframeSH Database initialized")
    print(f"✓ InframeSH Core Engine v{settings.VERSION} ready on port {settings.PORT}")
    print("✓ Live Telemetry Streaming Ticker active (2s interval)")
    yield
    # Shutdown
    ticker_task.cancel()
    print("InframeSH Backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Incident Diagnosis & Root Cause Analysis Platform for Distributed Systems",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev & containers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(topology.router, prefix=settings.API_V1_STR)
app.include_router(telemetry.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(rca.router, prefix=settings.API_V1_STR)
app.include_router(anomalies.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

# Mount WebSocket router
app.include_router(ws.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
