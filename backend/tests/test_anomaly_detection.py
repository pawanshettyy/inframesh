import pytest
import numpy as np
import pandas as pd
from backend.app.services.anomaly_detector import IsolationForestDetector

def test_isolation_forest_nominal_data():
    detector = IsolationForestDetector(contamination=0.05)
    np.random.seed(42)
    nominal_df = pd.DataFrame({
        "rps": np.random.normal(12000, 200, 200),
        "latency_p95": np.random.normal(230, 15, 200),
        "error_rate": np.random.normal(0.01, 0.002, 200),
        "db_connections_percent": np.random.normal(35, 3, 200),
    })
    detector.fit(nominal_df)

    # Test nominal point
    nominal_features = {
        "rps": 12050,
        "latency_p95": 235,
        "error_rate": 0.012,
        "db_connections_percent": 36,
    }
    is_anomaly, score, details = detector.evaluate(nominal_features)
    assert score < 0.65, f"Expected low score for nominal data, got {score}"

def test_isolation_forest_severe_spike():
    detector = IsolationForestDetector(contamination=0.05)
    detector._fit_default_baseline()

    # Test severe incident spike: 97% DB pool and 4.82s latency
    failing_features = {
        "rps": 12400,
        "latency_p95": 4820,
        "error_rate": 8.4,
        "db_connections_percent": 97,
    }
    is_anomaly, score, details = detector.evaluate(failing_features)
    assert is_anomaly is True
    assert score >= 0.70, f"Expected high score for failure, got {score}"
    assert details["max_z_score"] > 3.0
