import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "infermesh" in data["service"]

@pytest.mark.asyncio
async def test_services_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/services")
        assert response.status_code == 200
        services = response.json()
        assert len(services) >= 10
        assert any(s["id"] == "payment-service" for s in services)

@pytest.mark.asyncio
async def test_topology_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/topology")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert "postgres-db" in data["propagationPath"]

@pytest.mark.asyncio
async def test_telemetry_metrics_and_logs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        m_resp = await client.get("/api/v1/telemetry/metrics")
        assert m_resp.status_code == 200
        assert len(m_resp.json()) > 5

        l_resp = await client.get("/api/v1/telemetry/logs")
        assert l_resp.status_code == 200
        assert len(l_resp.json()) > 0

@pytest.mark.asyncio
async def test_incidents_and_rca():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        inc_resp = await client.get("/api/v1/incidents")
        assert inc_resp.status_code == 200
        incidents = inc_resp.json()
        assert len(incidents) >= 1
        assert incidents[0]["code"] == "INC-2026-0817"

        rca_resp = await client.get("/api/v1/rca/INC-2026-0817")
        assert rca_resp.status_code == 200
        rca = rca_resp.json()
        assert rca["aiConfidence"] >= 0.90
