from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.services.traffic_simulator import traffic_simulator
from backend.app.services.dependency_analyzer import dependency_analyzer

router = APIRouter(prefix="/topology", tags=["Topology"])

@router.get("")
async def get_topology():
    services = traffic_simulator.get_services()
    nodes = [s.model_dump() for s in services]
    edges = []
    
    for s in services:
        for dep in s.dependencies:
            is_incident = (
                s.id in ["api-gateway", "order-service", "payment-service"] and
                dep in ["order-service", "payment-service", "postgres-db"]
            )
            edges.append({
                "from": s.id,
                "to": dep,
                "isIncidentPath": is_incident
            })
            
    return {
        "nodes": nodes,
        "edges": edges,
        "blastRadius": dependency_analyzer.calculate_blast_radius("postgres-db"),
        "propagationPath": ["postgres-db", "payment-service", "order-service", "api-gateway"]
    }
