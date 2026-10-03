from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
async def list_alert_rules() -> List[Dict[str, Any]]:
    return [
        {
            "id": "alt-1",
            "name": "Database Connection Pool High Saturation",
            "service": "postgres-db",
            "metric": "hikaricp.connections.active",
            "condition": "> 85%",
            "severity": "critical",
            "isEnabled": True
        },
        {
            "id": "alt-2",
            "name": "Payment Service P95 Latency Degradation",
            "service": "payment-service",
            "metric": "http.server.latency.p95",
            "condition": "> 1000ms",
            "severity": "critical",
            "isEnabled": True
        },
        {
            "id": "alt-3",
            "name": "Order Service Circuit Breaker Tripped",
            "service": "order-service",
            "metric": "resilience4j.circuitbreaker.state",
            "condition": "== OPEN or HALF_OPEN",
            "severity": "degraded",
            "isEnabled": True
        },
        {
            "id": "alt-4",
            "name": "API Gateway 5xx Spike",
            "service": "api-gateway",
            "metric": "http.server.requests.5xx",
            "condition": "> 1.0%",
            "severity": "degraded",
            "isEnabled": True
        }
    ]
