import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Enum as SQLEnum,
    Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    users: Mapped[List["User"]] = relationship("User", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(256), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="engineer") # admin, engineer, viewer
    organization_id: Mapped[str] = mapped_column(String(64), ForeignKey("organizations.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")

class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(64), primary_key=True) # e.g. "payment-service"
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    tier: Mapped[str] = mapped_column(String(32), nullable=False) # edge, application, database, cache, messaging
    health: Mapped[str] = mapped_column(String(32), default="healthy") # healthy, warning, degraded, critical
    version: Mapped[str] = mapped_column(String(32), default="v1.0.0")
    replicas_ready: Mapped[int] = mapped_column(Integer, default=1)
    replicas_desired: Mapped[int] = mapped_column(Integer, default=1)
    x: Mapped[float] = mapped_column(Float, default=0.0)
    y: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

class ServiceDependency(Base):
    __tablename__ = "service_dependencies"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    source_service_id: Mapped[str] = mapped_column(String(64), ForeignKey("services.id"), index=True)
    target_service_id: Mapped[str] = mapped_column(String(64), ForeignKey("services.id"), index=True)
    dependency_type: Mapped[str] = mapped_column(String(32), default="sync_http") # sync_http, grpc, async_queue, database
    weight: Mapped[float] = mapped_column(Float, default=1.0)

class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True) # e.g. "INC-2026-0817"
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="critical", index=True) # critical, degraded, warning, info
    status: Mapped[str] = mapped_column(String(32), default="investigating", index=True) # detected, investigating, identified, mitigating, resolved, closed
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    affected_services: Mapped[List[str]] = mapped_column(JSON, default=list)
    root_cause_service: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    root_cause_type: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    root_cause_brief: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    blast_radius_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

    events: Mapped[List["IncidentEvent"]] = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan")
    rca: Mapped[Optional["RootCauseAnalysis"]] = relationship("RootCauseAnalysis", back_populates="incident", uselist=False, cascade="all, delete-orphan")

class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    incident_id: Mapped[str] = mapped_column(String(64), ForeignKey("incidents.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    time_offset_seconds: Mapped[int] = mapped_column(Integer, default=0)
    service_id: Mapped[str] = mapped_column(String(64), index=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="critical")
    is_root_cause_origin: Mapped[bool] = mapped_column(Boolean, default=False)

    incident: Mapped["Incident"] = relationship("Incident", back_populates="events")

class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    service_id: Mapped[str] = mapped_column(String(64), index=True)
    signal_name: Mapped[str] = mapped_column(String(128), index=True) # e.g. "p95_latency", "db_connections"
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    severity: Mapped[str] = mapped_column(String(32), default="critical")
    anomaly_score: Mapped[float] = mapped_column(Float, default=0.0) # 0.0 - 1.0
    expected_range: Mapped[str] = mapped_column(String(64)) # "180–320 ms"
    observed_value: Mapped[str] = mapped_column(String(64)) # "4.82 s"
    deviation_ratio: Mapped[str] = mapped_column(String(32)) # "+4.8x"
    correlated_incident_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="active") # active, evaluating, cleared

class RootCauseAnalysis(Base):
    __tablename__ = "root_cause_analyses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    incident_id: Mapped[str] = mapped_column(String(64), ForeignKey("incidents.id"), unique=True, index=True)
    root_cause_title: Mapped[str] = mapped_column(String(256), nullable=False)
    suspected_component: Mapped[str] = mapped_column(String(128), nullable=False)
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.96)
    executive_summary: Mapped[str] = mapped_column(Text, nullable=False)
    chain_of_thought: Mapped[List[str]] = mapped_column(JSON, default=list)
    causal_chain: Mapped[List[dict]] = mapped_column(JSON, default=list) # [{source, target, delay_sec, phenomenon, evidence}]
    mitigations: Mapped[List[dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    incident: Mapped["Incident"] = relationship("Incident", back_populates="rca")
    evidence: Mapped[List["RCAEvidence"]] = relationship("RCAEvidence", back_populates="rca", cascade="all, delete-orphan")

class RCAEvidence(Base):
    __tablename__ = "rca_evidence"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    rca_id: Mapped[str] = mapped_column(String(64), ForeignKey("root_cause_analyses.id"), index=True)
    evidence_type: Mapped[str] = mapped_column(String(64), index=True) # metric_correlation, temporal_precedence, dependency_topology, log_pattern, trace_waterfall
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    statement: Mapped[Text] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.95)
    evidence_metadata: Mapped[dict] = mapped_column(JSON, default=dict)

    rca: Mapped["RootCauseAnalysis"] = relationship("RootCauseAnalysis", back_populates="evidence")

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    service_id: Mapped[str] = mapped_column(String(64), index=True)
    metric_name: Mapped[str] = mapped_column(String(64), nullable=False)
    operator: Mapped[str] = mapped_column(String(16), default="gt") # gt, lt, eq
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="critical")
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=gen_uuid)
    failure_type: Mapped[str] = mapped_column(String(64), nullable=False) # database_connection_saturation, payment_latency, etc.
    severity: Mapped[str] = mapped_column(String(32), default="critical")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=120)
    parameters: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(32), default="running") # running, completed, cancelled
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
