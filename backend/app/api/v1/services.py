from typing import List, Optional
from fastapi import APIRouter, HTTPException
from backend.app.schemas.telemetry import ServiceNodeSchema, SystemHealthSummarySchema
from backend.app.services.traffic_simulator import traffic_simulator

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("", response_model=List[ServiceNodeSchema])
async def list_services(tier: Optional[str] = None):
    services = traffic_simulator.get_services()
    if tier and tier != "all":
        services = [s for s in services if s.tier == tier]
    return services

@router.get("/health/summary", response_model=SystemHealthSummarySchema)
async def get_health_summary():
    services = traffic_simulator.get_services()
    total = len(services)
    degraded = len([s for s in services if s.health != "healthy"])
    health_pct = round(((total - degraded) / total) * 100, 1) if total > 0 else 99.2
    
    return SystemHealthSummarySchema(
        overallHealthPercent=health_pct,
        totalServices=total,
        activeIncidentsCount=3 if degraded > 0 else 0,
        activeAnomaliesCount=17 if degraded > 0 else 0,
        globalRps=148200.0,
        globalAvgP95LatencyMs=420.0 if degraded > 0 else 85.0,
        globalErrorRatePercent=0.74 if degraded > 0 else 0.01,
        statusMessage="3 active incidents require attention" if degraded > 0 else "All systems nominal"
    )

@router.get("/{service_id}", response_model=ServiceNodeSchema)
async def get_service(service_id: str):
    services = traffic_simulator.get_services()
    found = next((s for s in services if s.id == service_id), None)
    if not found:
        raise HTTPException(status_code=404, detail="Service not found")
    return found
