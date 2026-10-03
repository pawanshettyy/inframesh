from fastapi import APIRouter
from backend.app.schemas.incident import RootCauseAnalysisSchema
from backend.app.services.rca_engine import rca_engine

router = APIRouter(prefix="/rca", tags=["Root Cause Analysis"])

@router.get("/{incident_id}", response_model=RootCauseAnalysisSchema)
async def get_rca(incident_id: str):
    return rca_engine.analyze_incident(
        incident_id=incident_id,
        anomalous_services=["postgres-db", "payment-service", "order-service", "api-gateway"],
        telemetry_metrics={},
        log_records=[]
    )
