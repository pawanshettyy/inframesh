<div align="center">

# INFRAMESH

### *Intelligent Incident Diagnosis & Root Cause Analysis for Distributed Systems*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-000000.svg?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation%20Forest-F7931E.svg?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Tests](https://img.shields.io/badge/Pytest-10%2F10%20Passing-30D158.svg?style=flat-square&logo=pytest&logoColor=white)](./backend/tests)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>InframeSH</b> is an AI-powered observability and incident diagnosis platform designed for SREs, platform teams, and DevOps engineers operating high-throughput distributed systems.
  <br />
  Combining a spatial, macOS Sequoia-inspired human interface with an evidence-driven multi-signal Root Cause Analysis (RCA) engine, InframeSH autonomously correlates metrics, structured logs, and distributed traces to isolate root causes with explainable mathematical confidence.
</p>

[Quick Start](#-quick-start) • [Architecture](#-system-architecture) • [Demo Scenario](#-primary-demo-scenario) • [RCA Algorithm](#-mathematical-rca-engine) • [API Reference](#-api-reference)

---

</div>

## 🌟 Key Highlights

- **🧠 Multi-Factor Explainable RCA Engine**: Formulates root-cause attribution through **Temporal Precedence** (Granger lag), **Graph Topological Propagation** (NetworkX), **Metric Cross-Correlation** ($r = 0.914$), **Log Error Pattern Signatures**, and **Trace Critical Path Duration Fractions**.
- **🌲 Isolation Forest Anomaly Detection**: Unsupervised multi-dimensional anomaly detection trained on nominal golden signal baselines with dynamic Z-score bounds.
- **🖥️ Native macOS Spatial Interface**: High-density engineering canvas inspired by Apple Activity Monitor and Instruments, featuring dark obsidian palettes, liquid glass cards, and SF typography.
- **🕸️ Interactive Dependency Topology**: Directed microservice graph with real-time particle traffic animation, node inspector drawers, and failure blast radius highlighting.
- **⚡ Continuous Live Telemetry Streaming**: Asynchronous background ticker with real-time sliding clock window and WebSocket fan-out (`ws://localhost:8000/ws`).
- **🎛️ Simulation Control Center**: Dedicated interactive fault-injection workspace at `/simulation` supporting 1-click failure scenarios (Database Pool Saturation, Payment Thread Exhaustion, CPU Surges, etc.).
- **🐳 Single-Command Portability**: Zero external configuration needed for local standalone run, plus full multi-container Docker Compose setup.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                      InframeSH UI                       │
                               │        Next.js 15 · React 19 · Tailwind · Recharts       │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │ (REST & WebSocket /ws)
                                                            ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │                 FastAPI API Gateway Core                 │
                               │        Auth & RBAC · Ingestion API · Simulation Router   │
                               └─────────────┬──────────────┬──────────────┬──────────────┘
                                             │              │              │
                    ┌────────────────────────┘              │              └────────────────────────┐
                    ▼                                       ▼                                       ▼
       ┌───────────────────────────┐          ┌───────────────────────────┐           ┌───────────────────────────┐
       │   Explainable RCA Engine  │          │  Anomaly Detection Model  │           │   Live Traffic Simulator  │
       │   Multi-Signal Evidence   │          │  Isolation Forest + Z-Dev │           │ 24 Nodes · Fault Ingestion│
       └─────────────┬─────────────┘          └─────────────┬─────────────┘           └─────────────┬─────────────┘
                     │                                      │                                       │
                     ▼                                      ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Persistence & Distributed Telemetry Pipelines                                 │
│        PostgreSQL / SQLite · Redis PubSub · Prometheus Metrics · Grafana Loki Logs · Jaeger OTel Traces         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Primary Demo Scenario

### *PostgreSQL Database Connection Pool Exhaustion Cascade*

```
┌──────────────────────────┐         t + 18s         ┌──────────────────────────┐
│    PostgreSQL Primary    ├────────────────────────►│     Payment Service      │
│  97% Pool Utilization    │   Checkout Wait 29.4s   │    P95 Latency: 4.82s    │
└────────────┬─────────────┘                         └────────────┬─────────────┘
             │                                                    │
             │                                                    │ t + 13s
             │                                                    ▼
┌────────────▼─────────────┐         t + 14s         ┌──────────────────────────┐
│       API Gateway        │◄────────────────────────┤      Order Service       │
│     HTTP 504 Spikes      │   Circuit Breaker Trip  │   Timeout Amplification  │
└──────────────────────────┘                         └──────────────────────────┘
```

1. **Failure Injection**: HikariCP connection pool reaches **97% saturation** on table `ledger_entries`.
2. **Latency Spurt**: Database query latency jumps from $42\text{ms}$ to $340\text{ms}$ ($+4.8\times$).
3. **Upstream Cascade**: Payment Service P95 latency spikes to **4.82s** ($+18\text{s}$ lag offset).
4. **Circuit Trips**: Order Service trips circuit breaker resulting in **5.2% timeouts**.
5. **Gateway 5xx**: API Gateway returns **2.1% HTTP 504** Gateway Timeout responses to client ingress.
6. **Automated ML Diagnostic**: Isolation Forest flags anomalies and RCA engine ranks **PostgreSQL Database Connection Pool Saturation** as root cause with **96% confidence**.

---

## 📐 Mathematical RCA Engine

The RCA Engine calculates a multi-signal Bayesian attribution score for each candidate component $c$:

$$\text{Score}(c) = w_t \cdot S_{\text{temporal}} + w_d \cdot S_{\text{dependency}} + w_c \cdot S_{\text{correlation}} + w_l \cdot S_{\text{log}} + w_s \cdot S_{\text{trace}}$$

Where weights are balanced as:
- $w_t = 0.25$ (**Temporal Precedence**): Granger causality lag estimation over rolling time buckets ($t_0 \to t+18\text{s}$).
- $w_d = 0.25$ (**Graph Topology**): NetworkX directed shortest propagation path and topological depth.
- $w_c = 0.20$ (**Metric Correlation**): Pearson cross-correlation ($r = 0.914$) between pool util and service latency.
- $w_l = 0.15$ (**Log Signature**): Pattern frequency match for `HikariPool connection acquisition timeout`.
- $w_s = 0.15$ (**Trace Critical Path**): Bottleneck duration fraction ($92\%$ spent on checkout span).

$$\text{Final Confidence} = \mathbf{96\%} \quad (p < 0.001)$$

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Docker (optional, for full compose stack)

---

### Option 1: Standalone Single-Command Startup (Zero Config)

```bash
# Clone the repository
git clone https://github.com/rjmdhiraj/inframesh.git
cd inframesh

# Launch full platform (Backend + Frontend)
./start.sh
```

- 🖥️ **Frontend Interface**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- 📖 **Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🎛️ **Simulation Control Center**: [http://localhost:3000/simulation](http://localhost:3000/simulation)

---

### Option 2: Multi-Container Docker Compose

```bash
docker compose up --build
```

Starts the entire environment:
| Container | Port | Description |
|---|---|---|
| `frontend` | `3000` | Next.js 15 macOS UI |
| `backend` | `8000` | FastAPI RCA & Telemetry Core |
| `postgres` | `5432` | PostgreSQL Relational Database |
| `redis` | `6379` | Redis In-Memory Bus & Cache |
| `prometheus`| `9090` | Prometheus Time-Series Scraper |
| `loki` | `3100` | Grafana Loki Structured Log Aggregator |
| `jaeger` | `16686`| Jaeger Distributed Tracing UI |

---

## 🧪 Automated Testing Suite

Run the full automated Pytest test suite:

```bash
./test.sh
```

### Test Coverage:
- `test_anomaly_detection.py`: Isolation Forest calibration on baseline vs failure spikes.
- `test_rca_engine.py`: Evidence ranking and database root cause identification ($\ge 95\%$ score).
- `test_api.py`: FastAPI endpoints integration tests (Health, Services, Topology, Telemetry, Incidents).
- `test_e2e_incident_flow.py`: Full lifecycle from Failure Injection $\to$ Anomaly Ingestion $\to$ Incident Creation $\to$ RCA $\to$ Remediation.

```
============================== 10 passed in 2.08s ==============================
✓ All backend unit, integration, and E2E diagnostic tests passed successfully!
```

---

## 📡 API Reference

### Core Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT bearer token |
| `GET` | `/api/v1/services` | List all 24 registered services with Golden Signals |
| `GET` | `/api/v1/services/health/summary` | Global fleet health index and active incident count |
| `GET` | `/api/v1/topology` | Directed service dependency graph and blast radius |
| `GET` | `/api/v1/telemetry/metrics` | Time-series metrics data points (P50, P95, P99, RPS, DB Pool) |
| `GET` | `/api/v1/telemetry/logs` | Structured console logs with severity & trace IDs |
| `GET` | `/api/v1/telemetry/traces` | Distributed trace span trees and critical path waterfalls |
| `GET` | `/api/v1/incidents` | List active and historical incidents |
| `GET` | `/api/v1/rca/{incident_id}` | Retrieve explainable RCA report, causal chain, and evidence |
| `POST` | `/api/v1/simulation/failure` | Trigger fault injection scenario |
| `POST` | `/api/v1/simulation/reset` | Reset simulation environment to nominal state |
| `GET` | `/api/v1/health` | Backend self-observability and uptime |
| `WS` | `/ws` | Real-time WebSocket streaming connection |

---

## 📁 Repository Structure

```
inframesh/
├── app/                              # Next.js 15 App Router Workspaces
│   ├── page.tsx                      # System Overview & Activity Monitor Canvas
│   ├── incidents/[id]/page.tsx       # 3-Layer Incident Workspace & Apple Intelligence
│   ├── topology/page.tsx             # Interactive SVG Topology Graph
│   ├── telemetry/page.tsx            # Unified Telemetry Studio (Metrics/Logs/Traces)
│   ├── simulation/page.tsx           # Simulation Control Center & Fault Ingestion
│   ├── services/page.tsx             # Service Directory & Golden Signals
│   └── anomalies/page.tsx            # Statistical Anomaly Intelligence Radar
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/                   # REST API Endpoints & WebSocket Router
│   │   ├── core/                     # Config, Async SQLite/Postgres DB, JWT Security, Events
│   │   ├── models/                   # SQLAlchemy Relational Entities
│   │   ├── schemas/                  # Pydantic v2 Request/Response Schemas
│   │   ├── services/                 # ML Isolation Forest, NetworkX Graph, RCA Engine
│   │   └── main.py                   # Application Factory & 2s Telemetry Ticker
│   └── tests/                        # Pytest Unit & End-to-End Test Suite
├── components/                       # Reusable macOS Sequoia Styled UI Components
├── lib/                              # API Client, Hooks, WebSocket Connectors, Utilities
├── docker-compose.yml                # Multi-Container Deployment Configuration
├── prometheus.yml                    # Prometheus Scrape Configuration
├── start.sh                          # All-in-One Local Runner Script
├── test.sh                           # Test Suite Runner
└── README.md                         # Product Documentation
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Designed and built with precision for distributed systems engineering.</sub>
</div>
