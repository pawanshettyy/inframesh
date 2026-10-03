from fastapi import APIRouter
from typing import List, Optional
from backend.app.schemas.telemetry import AnomalyEventSchema
from backend.app.services.traffic_simulator import traffic_simulator

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.get("", response_model=List[AnomalyEventSchema])
async def list_anomalies(service: Optional[str] = None, severity: Optional[str] = None):
    anomalies = traffic_simulator.get_anomalies()
    if service and service != "all":
        anomalies = [a for a in anomalies if a.service.lower() == service.lower()]
    if severity and severity != "all":
        anomalies = [a for a in anomalies if a.severity.lower() == severity.lower()]
    return anomalies
