from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.app.schemas.incident import IncidentSchema, RootCauseAnalysisSchema
from backend.app.services.traffic_simulator import traffic_simulator
from backend.app.services.rca_engine import rca_engine
from backend.app.core.events import event_bus

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentSchema])
async def list_incidents(status: Optional[str] = None, severity: Optional[str] = None):
    rca = rca_engine.analyze_incident(
        incident_id="INC-2026-0817",
        anomalous_services=["postgres-db", "payment-service", "order-service", "api-gateway"],
        telemetry_metrics={},
        log_records=[]
    )
    
    incidents = [
        IncidentSchema(
            id="inc-1",
            code="INC-2026-0817",
            title="Payment Service Latency Degradation",
            severity="critical",
            status="investigating" if traffic_simulator.phase != "recovered" else "resolved",
            startedAt="8m 31s ago",
            durationString="8m 31s",
            affectedServices=["Payment Service", "Order Service", "API Gateway", "PostgreSQL Primary"],
            rootCauseBrief="Database Connection Pool Saturation",
            aiConfidence=0.96,
            blastRadiusScore=78.0,
            rca=rca
        ),
        IncidentSchema(
            id="inc-2",
            code="INC-2026-0816",
            title="Redis Cache Eviction Surge in User Profile Service",
            severity="degraded",
            status="mitigated",
            startedAt="1h 14m ago",
            durationString="42m 10s",
            affectedServices=["User Service", "Redis Cluster"],
            rootCauseBrief="Memory fragmentation during batch reindex",
            aiConfidence=0.91,
            blastRadiusScore=34.0
        ),
        IncidentSchema(
            id="inc-3",
            code="INC-2026-0814",
            title="Kafka Consumer Lag Amplification on Ingestion Workers",
            severity="warning",
            status="resolved",
            startedAt="4h 22m ago",
            durationString="28m 05s",
            affectedServices=["Notification Service", "Kafka Event Bus"],
            rootCauseBrief="Unbalanced partition rebalance storm",
            aiConfidence=0.88,
            blastRadiusScore=22.0
        )
    ]
    
    if status and status != "all":
        incidents = [i for i in incidents if i.status == status]
    if severity and severity != "all":
        incidents = [i for i in incidents if i.severity == severity]
    return incidents

@router.get("/{incident_id}", response_model=IncidentSchema)
async def get_incident(incident_id: str):
    incidents = await list_incidents()
    found = next((i for i in incidents if i.id == incident_id or i.code == incident_id), None)
    if not found:
        # Default to primary incident for demonstration
        return incidents[0]
    return found

@router.post("/{incident_id}/acknowledge")
async def acknowledge_incident(incident_id: str):
    await event_bus.broadcast("incident.updated", {"id": incident_id, "status": "investigating"})
    return {"success": True, "message": f"Incident {incident_id} acknowledged by SRE on-call engineer."}

@router.post("/{incident_id}/mitigate")
async def mitigate_incident(incident_id: str, action_id: Optional[str] = "mit-1"):
    traffic_simulator.phase = "mitigating"
    await event_bus.broadcast("incident.updated", {"id": incident_id, "status": "mitigating"})
    return {
        "success": True,
        "message": f"Mitigation command applied for {incident_id}. Connection limits dynamically scaled. Health telemetry stabilizing."
    }

@router.post("/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    traffic_simulator.phase = "recovered"
    await event_bus.broadcast("incident.resolved", {"id": incident_id, "status": "resolved"})
    return {"success": True, "message": f"Incident {incident_id} resolved."}
