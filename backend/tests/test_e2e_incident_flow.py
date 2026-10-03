import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app

@pytest.mark.asyncio
async def test_full_incident_diagnostic_and_remediation_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Inject database connection pool saturation failure
        inj_resp = await client.post("/api/v1/simulation/failure", json={
            "failure_type": "database_connection_saturation",
            "severity": "critical",
            "duration_seconds": 120
        })
        assert inj_resp.status_code == 200
        assert inj_resp.json()["success"] is True

        # Step 2: Verify services degrade and anomalies are emitted
        svc_resp = await client.get("/api/v1/services")
        assert svc_resp.status_code == 200
        payment_svc = next((s for s in svc_resp.json() if s["id"] == "payment-service"), None)
        assert payment_svc is not None
        assert payment_svc["health"] == "critical"
        assert payment_svc["dbPoolUtilization"] == 97

        anom_resp = await client.get("/api/v1/anomalies")
        assert anom_resp.status_code == 200
        anomalies = anom_resp.json()
        assert len(anomalies) >= 3

        # Step 3: Verify incident is generated with RCA ranking database root cause
        inc_resp = await client.get("/api/v1/incidents/INC-2026-0817")
        assert inc_resp.status_code == 200
        incident = inc_resp.json()
        assert incident["code"] == "INC-2026-0817"
        assert incident["severity"] == "critical"
        assert incident["rca"]["aiConfidence"] >= 0.95
        assert "Database" in incident["rca"]["rootCauseTitle"]

        # Step 4: Mitigate incident via API action
        mit_resp = await client.post("/api/v1/incidents/INC-2026-0817/mitigate", json={"action_id": "mit-1"})
        assert mit_resp.status_code == 200
        assert mit_resp.json()["success"] is True

        # Step 5: Reset simulation to nominal
        rst_resp = await client.post("/api/v1/simulation/reset")
        assert rst_resp.status_code == 200
        assert rst_resp.json()["success"] is True
