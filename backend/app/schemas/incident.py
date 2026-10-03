from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class CausalHopSchema(BaseModel):
    sourceService: str
    targetService: str
    delaySeconds: int
    phenomenon: str
    telemetryEvidence: str

class EvidenceItemSchema(BaseModel):
    id: str
    type: str # metric_correlation, temporal_precedence, dependency_topology, log_pattern, trace_waterfall
    title: str
    statement: str
    confidenceScore: float
    metadata: Dict[str, Any] = {}

class SuggestedMitigationSchema(BaseModel):
    id: str
    title: str
    description: str
    actionType: str
    riskLevel: str
    commandSnippet: Optional[str] = None

class RootCauseAnalysisSchema(BaseModel):
    incidentId: str
    rootCauseTitle: str
    suspectedComponent: str
    aiConfidence: float # e.g. 0.96
    executiveSummary: str
    chainOfThought: List[str]
    causalChain: List[CausalHopSchema]
    evidence: List[EvidenceItemSchema]
    suggestedMitigations: List[SuggestedMitigationSchema]

class IncidentSchema(BaseModel):
    id: str
    code: str # e.g. "INC-2026-0817"
    title: str
    severity: str # critical, degraded, warning, info
    status: str # detected, investigating, mitigating, resolved, closed
    startedAt: str
    durationString: str
    affectedServices: List[str]
    rootCauseBrief: str
    aiConfidence: float
    blastRadiusScore: float
    rca: Optional[RootCauseAnalysisSchema] = None

class FailureInjectionRequest(BaseModel):
    failure_type: str = "database_connection_saturation"
    severity: str = "critical"
    duration_seconds: int = 180
    parameters: Dict[str, Any] = {}

class SimulationStateSchema(BaseModel):
    active_injections: List[Dict[str, Any]]
    is_incident_active: bool
    current_scenario: Optional[str] = None
    elapsed_seconds: int = 0
    phase: str # nominal, injected, cascading, detected, mitigating, recovered
