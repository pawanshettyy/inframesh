import asyncio
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
import numpy as np
from backend.app.schemas.telemetry import (
    ServiceNodeSchema,
    MetricDataPointSchema,
    LogEntrySchema,
    DistributedTraceSchema,
    TraceSpanSchema,
    AnomalyEventSchema
)
from backend.app.schemas.incident import (
    IncidentSchema,
    FailureInjectionRequest,
    SimulationStateSchema
)
from backend.app.services.anomaly_detector import anomaly_detector
from backend.app.services.rca_engine import rca_engine
from backend.app.core.events import event_bus

class LiveTrafficSimulator:
    """
    Continuous live traffic simulator and rolling telemetry stream engine.
    Generates real-time ticking metrics, streaming structured logs, and dynamic trace graphs.
    """
    def __init__(self):
        self.is_running: bool = False
        self.active_injections: List[Dict[str, Any]] = []
        self.active_scenario: Optional[str] = "database_connection_saturation"
        self.phase: str = "cascading" # nominal, cascading, mitigating, recovered
        self.scenario_start_time: float = time.time() - 480 # Started 8 mins ago by default
        
        # Initialize rolling time series buffer with real-time timestamps
        self.rolling_metrics: List[MetricDataPointSchema] = []
        self._init_rolling_metrics()

    def _init_rolling_metrics(self):
        now = datetime.now()
        self.rolling_metrics = []
        for i in range(25, -1, -1):
            t = now - timedelta(seconds=i * 10)
            t_str = t.strftime("%H:%M:%S")
            is_anomaly = i <= 15 and self.active_scenario == "database_connection_saturation" and self.phase != "recovered"
            
            p95 = 4820 + np.random.normal(0, 40) if is_anomaly else 230 + np.random.normal(0, 10)
            p50 = 1200 + np.random.normal(0, 20) if is_anomaly else 110 + np.random.normal(0, 5)
            p99 = 8400 + np.random.normal(0, 80) if is_anomaly else 380 + np.random.normal(0, 15)
            err = 8.4 + np.random.normal(0, 0.2) if is_anomaly else 0.01 + np.random.exponential(0.005)
            pool = 97.2 + np.random.normal(0, 0.4) if is_anomaly else 34.0 + np.random.normal(0, 1.5)
            rps = 12400 + np.random.normal(0, 150)
            cpu = 71 + np.random.normal(0, 2) if is_anomaly else 40 + np.random.normal(0, 2)
            mem = 64 + np.random.normal(0, 1) if is_anomaly else 45 + np.random.normal(0, 1)

            self.rolling_metrics.append(
                MetricDataPointSchema(
                    timestamp=t_str,
                    timeSec=int(t.timestamp()),
                    rps=round(float(rps), 0),
                    p50Latency=round(float(p50), 1),
                    p95Latency=round(float(p95), 1),
                    p99Latency=round(float(p99), 1),
                    errorRate=round(float(err), 2),
                    cpuPercent=round(float(cpu), 1),
                    memoryPercent=round(float(mem), 1),
                    dbConnectionPoolPercent=round(float(pool), 1),
                    isAnomalyWindow=is_anomaly
                )
            )

    def tick(self):
        """Advances live telemetry by one time tick with current local clock."""
        now = datetime.now()
        t_str = now.strftime("%H:%M:%S")
        is_failing = self.active_scenario == "database_connection_saturation" and self.phase != "recovered"

        # Calculate dynamic values with live natural noise
        if is_failing:
            p95 = max(4200.0, 4820.0 + np.random.normal(0, 60))
            p50 = max(900.0, 1200.0 + np.random.normal(0, 30))
            p99 = max(7500.0, 8400.0 + np.random.normal(0, 120))
            err = max(6.5, 8.4 + np.random.normal(0, 0.3))
            pool = min(100.0, max(95.0, 97.2 + np.random.normal(0, 0.5)))
            cpu = min(95.0, 71.0 + np.random.normal(0, 2.5))
            mem = 64.0 + np.random.normal(0, 1.0)
            rps = 12400.0 + np.random.normal(0, 200)
        else:
            p95 = max(180.0, 230.0 + np.random.normal(0, 15))
            p50 = max(90.0, 110.0 + np.random.normal(0, 8))
            p99 = max(300.0, 380.0 + np.random.normal(0, 25))
            err = max(0.00, 0.01 + np.random.exponential(0.005))
            pool = max(20.0, 34.0 + np.random.normal(0, 2.0))
            cpu = max(25.0, 40.0 + np.random.normal(0, 2.0))
            mem = max(35.0, 45.0 + np.random.normal(0, 1.5))
            rps = 12000.0 + np.random.normal(0, 180)

        new_point = MetricDataPointSchema(
            timestamp=t_str,
            timeSec=int(now.timestamp()),
            rps=round(float(rps), 0),
            p50Latency=round(float(p50), 1),
            p95Latency=round(float(p95), 1),
            p99Latency=round(float(p99), 1),
            errorRate=round(float(err), 2),
            cpuPercent=round(float(cpu), 1),
            memoryPercent=round(float(mem), 1),
            dbConnectionPoolPercent=round(float(pool), 1),
            isAnomalyWindow=is_failing
        )

        self.rolling_metrics.append(new_point)
        if len(self.rolling_metrics) > 30:
            self.rolling_metrics.pop(0)

        # Broadcast live tick over WebSocket
        asyncio.create_task(event_bus.broadcast("telemetry.updated", {
            "latest": new_point.model_dump(),
            "is_anomaly": is_failing,
            "services_health": "degraded" if is_failing else "healthy"
        }))

    def get_services(self) -> List[ServiceNodeSchema]:
        is_failing = self.active_scenario == "database_connection_saturation" and self.phase != "recovered"
        
        return [
            ServiceNodeSchema(
                id="api-gateway",
                name="API Gateway",
                tier="edge",
                health="degraded" if is_failing else "healthy",
                rps=round(18400 + np.random.normal(0, 150), 0),
                p50LatencyMs=round(140 + np.random.normal(0, 5), 1),
                p95LatencyMs=round(420 + np.random.normal(0, 15) if is_failing else 45 + np.random.normal(0, 3), 1),
                p99LatencyMs=round(2400 + np.random.normal(0, 50) if is_failing else 95 + np.random.normal(0, 5), 1),
                errorRate=round(2.1 + np.random.normal(0, 0.1) if is_failing else 0.01, 2),
                cpuPercent=54,
                memoryPercent=62,
                activeAnomaliesCount=2 if is_failing else 0,
                dependencies=["auth-service", "order-service", "user-service"],
                dependents=[],
                version="v3.14.2",
                replicas={"ready": 12, "desired": 12},
                x=450,
                y=80
            ),
            ServiceNodeSchema(
                id="auth-service",
                name="Auth Service",
                tier="application",
                health="healthy",
                rps=round(8200 + np.random.normal(0, 80), 0),
                p50LatencyMs=12,
                p95LatencyMs=18,
                p99LatencyMs=35,
                errorRate=0.01,
                cpuPercent=32,
                memoryPercent=41,
                activeAnomaliesCount=0,
                dependencies=["redis-cache", "postgres-db"],
                dependents=["api-gateway"],
                version="v2.8.0",
                replicas={"ready": 6, "desired": 6},
                x=180,
                y=220
            ),
            ServiceNodeSchema(
                id="order-service",
                name="Order Service",
                tier="application",
                health="degraded" if is_failing else "healthy",
                rps=round(14100 + np.random.normal(0, 120), 0),
                p50LatencyMs=round(380 + np.random.normal(0, 10) if is_failing else 35, 1),
                p95LatencyMs=round(1840 + np.random.normal(0, 30) if is_failing else 85, 1),
                p99LatencyMs=round(5200 + np.random.normal(0, 80) if is_failing else 160, 1),
                errorRate=round(5.2 + np.random.normal(0, 0.2) if is_failing else 0.02, 2),
                cpuPercent=68,
                memoryPercent=74,
                activeAnomaliesCount=3 if is_failing else 0,
                dependencies=["payment-service", "inventory-service", "kafka-bus"],
                dependents=["api-gateway"],
                version="v4.1.0",
                replicas={"ready": 10, "desired": 10},
                x=450,
                y=220
            ),
            ServiceNodeSchema(
                id="user-service",
                name="User Service",
                tier="application",
                health="healthy",
                rps=round(11200 + np.random.normal(0, 90), 0),
                p50LatencyMs=18,
                p95LatencyMs=24,
                p99LatencyMs=48,
                errorRate=0.01,
                cpuPercent=28,
                memoryPercent=39,
                activeAnomaliesCount=0,
                dependencies=["redis-cache", "postgres-db"],
                dependents=["api-gateway"],
                version="v2.12.1",
                replicas={"ready": 8, "desired": 8},
                x=720,
                y=220
            ),
            ServiceNodeSchema(
                id="payment-service",
                name="Payment Service",
                tier="application",
                health="critical" if is_failing else "healthy",
                rps=round(12400 + np.random.normal(0, 110), 0),
                p50LatencyMs=round(1200 + np.random.normal(0, 25) if is_failing else 45, 1),
                p95LatencyMs=round(4820 + np.random.normal(0, 60) if is_failing else 120, 1),
                p99LatencyMs=round(8400 + np.random.normal(0, 120) if is_failing else 240, 1),
                errorRate=round(8.4 + np.random.normal(0, 0.2) if is_failing else 0.01, 2),
                cpuPercent=71,
                memoryPercent=64,
                dbPoolUtilization=round(97.2 + np.random.normal(0, 0.5) if is_failing else 34, 1),
                activeAnomaliesCount=5 if is_failing else 0,
                dependencies=["postgres-db", "stripe-gateway", "kafka-bus"],
                dependents=["order-service"],
                version="v3.9.4",
                replicas={"ready": 8, "desired": 8},
                x=320,
                y=380
            ),
            ServiceNodeSchema(
                id="inventory-service",
                name="Inventory Service",
                tier="application",
                health="healthy",
                rps=round(9100 + np.random.normal(0, 70), 0),
                p50LatencyMs=28,
                p95LatencyMs=42,
                p99LatencyMs=88,
                errorRate=0.02,
                cpuPercent=36,
                memoryPercent=48,
                activeAnomaliesCount=0,
                dependencies=["postgres-db", "redis-cache"],
                dependents=["order-service"],
                version="v2.3.1",
                replicas={"ready": 6, "desired": 6},
                x=580,
                y=380
            ),
            ServiceNodeSchema(
                id="notification-service",
                name="Notification Service",
                tier="application",
                health="healthy",
                rps=3400,
                p50LatencyMs=45,
                p95LatencyMs=65,
                p99LatencyMs=120,
                errorRate=0.00,
                cpuPercent=22,
                memoryPercent=31,
                activeAnomaliesCount=0,
                dependencies=["kafka-bus"],
                dependents=[],
                version="v1.9.0",
                replicas={"ready": 4, "desired": 4},
                x=820,
                y=380
            ),
            ServiceNodeSchema(
                id="postgres-db",
                name="PostgreSQL Primary",
                tier="database",
                health="critical" if is_failing else "healthy",
                rps=round(32800 + np.random.normal(0, 250), 0),
                p50LatencyMs=42,
                p95LatencyMs=round(340 + np.random.normal(0, 15) if is_failing else 12, 1),
                p99LatencyMs=round(1450 + np.random.normal(0, 40) if is_failing else 35, 1),
                errorRate=round(4.8 + np.random.normal(0, 0.2) if is_failing else 0.00, 2),
                cpuPercent=round(91 + np.random.normal(0, 2) if is_failing else 35, 0),
                memoryPercent=88 if is_failing else 42,
                dbPoolUtilization=round(97.2 + np.random.normal(0, 0.4) if is_failing else 35, 1),
                activeAnomaliesCount=4 if is_failing else 0,
                dependencies=[],
                dependents=["payment-service", "inventory-service", "auth-service", "user-service"],
                version="PostgreSQL 16.2",
                replicas={"ready": 3, "desired": 3},
                x=320,
                y=530
            ),
            ServiceNodeSchema(
                id="redis-cache",
                name="Redis Cluster",
                tier="cache",
                health="healthy",
                rps=45200,
                p50LatencyMs=0.8,
                p95LatencyMs=1.2,
                p99LatencyMs=2.4,
                errorRate=0.00,
                cpuPercent=31,
                memoryPercent=58,
                activeAnomaliesCount=0,
                dependencies=[],
                dependents=["auth-service", "user-service", "inventory-service"],
                version="Redis 7.2",
                replicas={"ready": 6, "desired": 6},
                x=580,
                y=530
            ),
            ServiceNodeSchema(
                id="kafka-bus",
                name="Kafka Event Bus",
                tier="messaging",
                health="healthy",
                rps=28000,
                p50LatencyMs=2.1,
                p95LatencyMs=4.1,
                p99LatencyMs=9.8,
                errorRate=0.00,
                cpuPercent=44,
                memoryPercent=62,
                activeAnomaliesCount=0,
                dependencies=[],
                dependents=["order-service", "payment-service", "notification-service"],
                version="Apache Kafka 3.6",
                replicas={"ready": 5, "desired": 5},
                x=820,
                y=530
            ),
            ServiceNodeSchema(
                id="stripe-gateway",
                name="Stripe External Gateway",
                tier="edge",
                health="healthy",
                rps=1200,
                p50LatencyMs=140,
                p95LatencyMs=190,
                p99LatencyMs=310,
                errorRate=0.01,
                cpuPercent=12,
                memoryPercent=18,
                activeAnomaliesCount=0,
                dependencies=[],
                dependents=["payment-service"],
                version="API v2024-04",
                replicas={"ready": 1, "desired": 1},
                x=120,
                y=380
            )
        ]

    def get_metrics_timeseries(self) -> List[MetricDataPointSchema]:
        if len(self.rolling_metrics) < 5:
            self._init_rolling_metrics()
        return self.rolling_metrics

    def get_logs(self, service_id: Optional[str] = None, level: Optional[str] = None) -> List[LogEntrySchema]:
        now = datetime.now()
        t0 = (now - timedelta(seconds=2)).strftime("%H:%M:%S.%f")[:-3]
        t1 = (now - timedelta(seconds=4)).strftime("%H:%M:%S.%f")[:-3]
        t2 = (now - timedelta(seconds=7)).strftime("%H:%M:%S.%f")[:-3]
        t3 = (now - timedelta(seconds=11)).strftime("%H:%M:%S.%f")[:-3]
        t4 = (now - timedelta(seconds=15)).strftime("%H:%M:%S.%f")[:-3]

        logs = [
            LogEntrySchema(
                id="log-01",
                timestamp=t0,
                service="payment-service",
                level="FATAL",
                traceId="7f9b2c1a8e01",
                spanId="span-db-checkout-991",
                message="com.zaxxer.hikari.pool.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30000ms.",
                component="HikariCP",
                errorStack="at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:216)\n\tat com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:100)\n\tat com.apple.payment.dao.LedgerDao.acquireLock(LedgerDao.java:84)",
                metadata={"activeConnections": 50, "idleConnections": 0, "threadsAwaitingConnection": 84},
                highlighted=True
            ),
            LogEntrySchema(
                id="log-02",
                timestamp=t1,
                service="payment-service",
                level="ERROR",
                traceId="7f9b2c1a8e01",
                spanId="span-pay-charge-042",
                message="Failed to process payment authorization for customerId=c_98142: pool lease timeout",
                component="PaymentExecutor",
                metadata={"orderId": "ord_918231", "amountCents": 149900, "currency": "USD"},
                highlighted=True
            ),
            LogEntrySchema(
                id="log-03",
                timestamp=t2,
                service="order-service",
                level="ERROR",
                traceId="7f9b2c1a8e01",
                spanId="span-ord-checkout-112",
                message="Read timed out executing POST http://payment-service.internal/v2/charge after 3000ms",
                component="PaymentClientFeign",
                metadata={"retryCount": 2, "circuitBreakerState": "HALF_OPEN"},
                highlighted=True
            ),
            LogEntrySchema(
                id="log-04",
                timestamp=t3,
                service="api-gateway",
                level="WARN",
                traceId="7f9b2c1a8e01",
                spanId="span-gw-root-001",
                message="HTTP 504 Gateway Timeout downstream for route /v1/checkout/complete from upstream order-service",
                component="ReverseProxy",
                metadata={"clientIp": "17.253.14.92", "latencyMs": 5120, "userAgent": "AppleStoreApp/8.2 iOS/18.1"},
                highlighted=True
            ),
            LogEntrySchema(
                id="log-05",
                timestamp=t4,
                service="postgres-db",
                level="WARN",
                traceId="7f9b2c1a8e00",
                spanId="span-pg-lock-001",
                message='process 29141 still waiting for ExclusiveLock on relation 48121 "ledger_entries" after 15000.412 ms',
                component="lockmgr",
                metadata={"database": "payments_prod", "relation": "ledger_entries", "lockType": "row-exclusive"},
                highlighted=True
            ),
        ]
        if service_id and service_id != "all":
            logs = [l for l in logs if l.service == service_id]
        if level and level != "ALL":
            logs = [l for l in logs if l.level == level]
        return logs

    def get_traces(self) -> DistributedTraceSchema:
        now_str = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        return DistributedTraceSchema(
            id="trace-1",
            traceId="7f9b2c1a8e01",
            rootEndpoint="POST /v1/checkout/complete",
            initiatingService="api-gateway",
            totalDurationMs=5120,
            status="error",
            timestamp=now_str,
            spansCount=7,
            errorSpansCount=3,
            spans=[
                TraceSpanSchema(
                    id="span-gw-root-001",
                    service="api-gateway",
                    name="POST /v1/checkout/complete",
                    endpoint="/v1/checkout/complete",
                    startOffsetMs=0,
                    durationMs=5120,
                    status="error",
                    httpStatus=504,
                    tags={"http.method": "POST", "http.status_code": 504, "http.route": "/v1/checkout/complete"},
                    logsCount=1
                ),
                TraceSpanSchema(
                    id="span-auth-verify-002",
                    parentId="span-gw-root-001",
                    service="auth-service",
                    name="POST /v1/auth/verify",
                    endpoint="/v1/auth/verify",
                    startOffsetMs=8,
                    durationMs=16,
                    status="ok",
                    httpStatus=200,
                    tags={"auth.subject": "usr_8192a", "auth.cached": True},
                    logsCount=1
                ),
                TraceSpanSchema(
                    id="span-ord-checkout-112",
                    parentId="span-gw-root-001",
                    service="order-service",
                    name="POST /v2/orders/checkout",
                    endpoint="/v2/orders/checkout",
                    startOffsetMs=32,
                    durationMs=5080,
                    status="error",
                    httpStatus=500,
                    tags={"order.id": "ord_918231", "order.items_count": 2},
                    logsCount=2
                ),
                TraceSpanSchema(
                    id="span-inv-res-098",
                    parentId="span-ord-checkout-112",
                    service="inventory-service",
                    name="POST /v1/inventory/reserve",
                    endpoint="/v1/inventory/reserve",
                    startOffsetMs=44,
                    durationMs=38,
                    status="ok",
                    httpStatus=200,
                    tags={"inventory.reserved": True, "inventory.warehouse": "US-EAST-DC1"},
                    logsCount=1
                ),
                TraceSpanSchema(
                    id="span-pay-charge-042",
                    parentId="span-ord-checkout-112",
                    service="payment-service",
                    name="POST /v2/charge",
                    endpoint="/v2/charge",
                    startOffsetMs=90,
                    durationMs=4980,
                    status="error",
                    httpStatus=503,
                    tags={"payment.amount": "$1,499.00", "payment.provider": "stripe", "error.type": "ConnectionPoolTimeoutException"},
                    logsCount=3
                ),
                TraceSpanSchema(
                    id="span-db-checkout-991",
                    parentId="span-pay-charge-042",
                    service="postgres-db",
                    name="HikariCP: acquireConnection",
                    endpoint="payments_prod:5432",
                    startOffsetMs=95,
                    durationMs=4720,
                    status="error",
                    httpStatus=0,
                    tags={"db.pool.name": "HikariPool-1", "db.pool.timeout": "30000ms", "db.pool.active": 50, "db.pool.max": 50},
                    logsCount=2,
                    hasRootCauseFlag=True
                ),
                TraceSpanSchema(
                    id="span-kf-pub-009",
                    parentId="span-ord-checkout-112",
                    service="kafka-bus",
                    name="Produce: orders.failed",
                    endpoint="orders.failed:partition-4",
                    startOffsetMs=5074,
                    durationMs=5,
                    status="ok",
                    httpStatus=200,
                    tags={"kafka.topic": "orders.failed", "kafka.partition": 4},
                    logsCount=1
                )
            ]
        )

    def get_anomalies(self) -> List[AnomalyEventSchema]:
        is_failing = self.active_scenario == "database_connection_saturation" and self.phase != "recovered"
        if not is_failing:
            return []
        
        now = datetime.now()
        return [
            AnomalyEventSchema(
                id="anom-1",
                service="Payment Service",
                signal="P95 Latency Spike",
                timestamp=(now - timedelta(seconds=12)).strftime("%H:%M:%S"),
                severity="critical",
                anomalyScore=0.97,
                expectedRange="180–320 ms",
                observedValue="4.82 s",
                deviationRatio="+4.8×",
                correlatedIncidentId="INC-2026-0817",
                status="active"
            ),
            AnomalyEventSchema(
                id="anom-2",
                service="PostgreSQL Primary",
                signal="Connection Pool Saturation",
                timestamp=(now - timedelta(seconds=30)).strftime("%H:%M:%S"),
                severity="critical",
                anomalyScore=0.99,
                expectedRange="25–45 %",
                observedValue="97.2 %",
                deviationRatio="+2.8×",
                correlatedIncidentId="INC-2026-0817",
                status="active"
            ),
            AnomalyEventSchema(
                id="anom-3",
                service="Order Service",
                signal="Upstream Timeout Amplification",
                timestamp=(now - timedelta(seconds=8)).strftime("%H:%M:%S"),
                severity="degraded",
                anomalyScore=0.89,
                expectedRange="0.01–0.10 %",
                observedValue="5.20 %",
                deviationRatio="+52.0×",
                correlatedIncidentId="INC-2026-0817",
                status="active"
            ),
            AnomalyEventSchema(
                id="anom-4",
                service="API Gateway",
                signal="HTTP 5xx Rate Jump",
                timestamp=(now - timedelta(seconds=4)).strftime("%H:%M:%S"),
                severity="degraded",
                anomalyScore=0.84,
                expectedRange="0.00–0.05 %",
                observedValue="2.10 %",
                deviationRatio="+42.0×",
                correlatedIncidentId="INC-2026-0817",
                status="active"
            )
        ]

    def inject_failure(self, request: FailureInjectionRequest) -> Dict[str, Any]:
        self.active_scenario = request.failure_type
        self.phase = "cascading"
        self.scenario_start_time = time.time()
        
        injection = {
            "id": f"inj-{int(datetime.now().timestamp())}",
            "type": request.failure_type,
            "severity": request.severity,
            "duration": request.duration_seconds,
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        self.active_injections.append(injection)
        
        asyncio.create_task(event_bus.broadcast("incident.created", {
            "code": "INC-2026-0817",
            "title": "Payment Service Latency Degradation",
            "severity": "critical"
        }))
        return {"success": True, "message": f"Injected {request.failure_type}. Telemetry degrading live.", "injection": injection}

    def reset_simulation(self) -> Dict[str, Any]:
        self.active_scenario = None
        self.phase = "recovered"
        self.active_injections = []
        asyncio.create_task(event_bus.broadcast("incident.resolved", {
            "code": "INC-2026-0817",
            "status": "resolved"
        }))
        return {"success": True, "message": "Simulation reset to nominal operating conditions."}

traffic_simulator = LiveTrafficSimulator()
