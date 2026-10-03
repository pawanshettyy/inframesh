from fastapi import APIRouter
from typing import List, Optional
from backend.app.schemas.telemetry import (
    MetricDataPointSchema,
    LogEntrySchema,
    DistributedTraceSchema
)
from backend.app.services.traffic_simulator import traffic_simulator

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.get("/metrics", response_model=List[MetricDataPointSchema])
async def get_metrics(service_id: Optional[str] = None):
    return traffic_simulator.get_metrics_timeseries()

@router.get("/logs", response_model=List[LogEntrySchema])
async def get_logs(
    service_id: Optional[str] = None,
    level: Optional[str] = None,
    query: Optional[str] = None
):
    logs = traffic_simulator.get_logs(service_id=service_id, level=level)
    if query:
        q = query.lower()
        logs = [
            l for l in logs
            if q in l.message.lower() or q in l.service.lower() or q in l.traceId.lower()
        ]
    return logs

@router.get("/traces", response_model=DistributedTraceSchema)
async def get_traces(trace_id: Optional[str] = None):
    return traffic_simulator.get_traces()
