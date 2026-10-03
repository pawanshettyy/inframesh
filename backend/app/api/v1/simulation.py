from fastapi import APIRouter
from typing import Dict, Any
from backend.app.schemas.incident import FailureInjectionRequest, SimulationStateSchema
from backend.app.services.traffic_simulator import traffic_simulator

router = APIRouter(prefix="/simulation", tags=["Simulation Control Center"])

@router.post("/failure")
async def trigger_failure(req: FailureInjectionRequest):
    return traffic_simulator.inject_failure(req)

@router.get("/status", response_model=SimulationStateSchema)
async def get_simulation_status():
    return SimulationStateSchema(
        active_injections=traffic_simulator.active_injections,
        is_incident_active=traffic_simulator.phase != "recovered",
        current_scenario=traffic_simulator.active_scenario,
        elapsed_seconds=120 if traffic_simulator.active_scenario else 0,
        phase=traffic_simulator.phase
    )

@router.post("/reset")
async def reset_simulation():
    return traffic_simulator.reset_simulation()
