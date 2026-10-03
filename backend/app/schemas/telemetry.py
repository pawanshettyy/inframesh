from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class ServiceNodeSchema(BaseModel):
    id: str
    name: str
    tier: str # edge, application, database, cache, messaging
    health: str # healthy, warning, degraded, critical
    rps: float
    p50LatencyMs: float
    p95LatencyMs: float
    p99LatencyMs: float
    errorRate: float
    cpuPercent: float
    memoryPercent: float
    dbPoolUtilization: Optional[float] = None
    activeAnomaliesCount: int = 0
    dependencies: List[str] = []
    dependents: List[str] = []
    version: str = "v1.0.0"
    replicas: Dict[str, int] = {"ready": 1, "desired": 1}
    x: float = 0.0
    y: float = 0.0

class SystemHealthSummarySchema(BaseModel):
    overallHealthPercent: float = 99.2
    totalServices: int = 24
    activeIncidentsCount: int = 3
    activeAnomaliesCount: int = 17
    globalRps: float = 148200.0
    globalAvgP95LatencyMs: float = 240.0
    globalErrorRatePercent: float = 0.74
    statusMessage: str = "Real-time telemetry operational"

class MetricDataPointSchema(BaseModel):
    timestamp: str
    timeSec: int
    rps: float
    p50Latency: float
    p95Latency: float
    p99Latency: float
    errorRate: float
    cpuPercent: float
    memoryPercent: float
    dbConnectionPoolPercent: Optional[float] = None
    isAnomalyWindow: Optional[bool] = False

class LogEntrySchema(BaseModel):
    id: str
    timestamp: str
    service: str
    level: str # INFO, WARN, ERROR, FATAL
    traceId: str
    spanId: str
    message: str
    component: Optional[str] = None
    errorStack: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    highlighted: Optional[bool] = False

class TraceSpanSchema(BaseModel):
    id: str
    parentId: Optional[str] = None
    service: str
    name: str
    endpoint: str
    startOffsetMs: int
    durationMs: int
    status: str # ok, error
    httpStatus: int = 200
    tags: Dict[str, Any] = {}
    logsCount: int = 0
    hasRootCauseFlag: Optional[bool] = False

class DistributedTraceSchema(BaseModel):
    id: str
    traceId: str
    rootEndpoint: str
    initiatingService: str
    totalDurationMs: int
    status: str
    timestamp: str
    spansCount: int
    errorSpansCount: int
    spans: List[TraceSpanSchema]

class AnomalyEventSchema(BaseModel):
    id: str
    service: str
    signal: str
    timestamp: str
    severity: str
    anomalyScore: float
    expectedRange: str
    observedValue: str
    deviationRatio: str
    correlatedIncidentId: Optional[str] = None
    status: str = "active"
