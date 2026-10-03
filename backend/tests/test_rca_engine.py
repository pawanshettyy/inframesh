import pytest
from backend.app.services.rca_engine import rca_engine

def test_rca_engine_identifies_database_origin():
    anomalous_services = ["api-gateway", "order-service", "payment-service", "postgres-db"]
    rca = rca_engine.analyze_incident(
        incident_id="INC-2026-0817",
        anomalous_services=anomalous_services,
        telemetry_metrics={},
        log_records=[]
    )

    assert rca.incidentId == "INC-2026-0817"
    assert "Database" in rca.rootCauseTitle
    assert rca.aiConfidence >= 0.90, f"Expected AI confidence >= 0.90, got {rca.aiConfidence}"
    assert len(rca.causalChain) == 3
    assert len(rca.evidence) >= 4
    assert len(rca.suggestedMitigations) >= 2
    assert "HikariCP" in rca.executiveSummary

def test_rca_evidence_values():
    rca = rca_engine.analyze_incident(
        incident_id="INC-2026-0817",
        anomalous_services=["postgres-db"],
        telemetry_metrics={},
        log_records=[]
    )
    metric_ev = next((e for e in rca.evidence if e.type == "metric_correlation"), None)
    assert metric_ev is not None
    assert metric_ev.metadata.get("correlationCoefficient") == 0.914
