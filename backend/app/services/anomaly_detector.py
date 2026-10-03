import abc
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class BaseAnomalyDetector(abc.ABC):
    @abc.abstractmethod
    def fit(self, baseline_data: pd.DataFrame) -> None:
        """Fit detector on nominal baseline telemetry."""
        pass

    @abc.abstractmethod
    def evaluate(self, current_features: Dict[str, float]) -> Tuple[bool, float, Dict[str, Any]]:
        """
        Evaluate current metrics.
        Returns:
            is_anomaly: bool
            anomaly_score: float (0.0 to 1.0)
            details: dict with expected bounds and deviation
        """
        pass

class IsolationForestDetector(BaseAnomalyDetector):
    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100
        )
        self.feature_names: List[str] = []
        self.baseline_stats: Dict[str, Dict[str, float]] = {}
        self.is_fitted: bool = False

    def fit(self, baseline_data: pd.DataFrame) -> None:
        self.feature_names = list(baseline_data.columns)
        for col in self.feature_names:
            vals = baseline_data[col].values
            self.baseline_stats[col] = {
                "mean": float(np.mean(vals)),
                "std": float(np.std(vals)) if np.std(vals) > 0 else 1.0,
                "p5": float(np.percentile(vals, 5)),
                "p95": float(np.percentile(vals, 95)),
                "min": float(np.min(vals)),
                "max": float(np.max(vals)),
            }
        self.model.fit(baseline_data)
        self.is_fitted = True

    def evaluate(self, current_features: Dict[str, float]) -> Tuple[bool, float, Dict[str, Any]]:
        if not self.is_fitted:
            # Self-initialize with standard baseline if not fitted
            self._fit_default_baseline()

        # Build feature vector
        vector = []
        for feat in self.feature_names:
            vector.append(current_features.get(feat, self.baseline_stats.get(feat, {}).get("mean", 0.0)))
        
        df_vec = pd.DataFrame([vector], columns=self.feature_names)
        
        # Decision function: negative values indicate anomaly, positive indicate inlier
        raw_score = self.model.decision_function(df_vec)[0]
        prediction = self.model.predict(df_vec)[0]
        
        # Calculate max z-score across features to scale severity accurately
        max_z = 0.0
        top_deviating_metric = "latency_p95"
        expected_range = "180–320 ms"
        observed_str = "220 ms"
        deviation_ratio = "+1.0x"

        for feat, val in current_features.items():
            stats = self.baseline_stats.get(feat)
            if stats:
                z = abs(val - stats["mean"]) / stats["std"]
                if z > max_z:
                    max_z = z
                    top_deviating_metric = feat
                    if "latency" in feat:
                        expected_range = f"{int(stats['p5'])}–{int(stats['p95'])} ms"
                        observed_str = f"{val/1000:.2f} s" if val >= 1000 else f"{int(val)} ms"
                        ratio = val / stats["mean"] if stats["mean"] > 0 else 1.0
                        deviation_ratio = f"+{ratio:.1f}×"
                    elif "pool" in feat or "connection" in feat:
                        expected_range = f"{int(stats['p5'])}–{int(stats['p95'])} %"
                        observed_str = f"{val:.1f} %"
                        ratio = val / stats["mean"] if stats["mean"] > 0 else 1.0
                        deviation_ratio = f"+{ratio:.1f}×"
                    elif "error" in feat:
                        expected_range = f"{stats['p5']:.2f}–{stats['p95']:.2f} %"
                        observed_str = f"{val:.2f} %"
                        ratio = max(val / max(stats["mean"], 0.01), 1.0)
                        deviation_ratio = f"+{ratio:.1f}×"
                    else:
                        expected_range = f"{stats['p5']:.1f}–{stats['p95']:.1f}"
                        observed_str = f"{val:.1f}"
                        ratio = val / stats["mean"] if stats["mean"] > 0 else 1.0
                        deviation_ratio = f"+{ratio:.1f}×"

        # Combine Isolation Forest decision margin with z-score deviation
        z_factor = float(np.clip(max_z / 6.0, 0.0, 1.0))
        if_factor = float(np.clip(0.5 - (raw_score * 2.0), 0.0, 1.0))
        normalized_anomaly_score = float(np.clip(0.6 * if_factor + 0.4 * z_factor, 0.0, 1.0))
        
        is_anomaly = bool(prediction == -1 or max_z >= 3.0 or normalized_anomaly_score >= 0.60)

        return is_anomaly, normalized_anomaly_score, {
            "top_metric": top_deviating_metric,
            "max_z_score": float(max_z),
            "expected_range": expected_range,
            "observed_value": observed_str,
            "deviation_ratio": deviation_ratio,
        }

    def _fit_default_baseline(self) -> None:
        """Generate nominal baseline distribution for typical microservice operations."""
        np.random.seed(42)
        n = 1000
        data = {
            "rps": np.random.normal(12000, 500, n),
            "latency_p50": np.random.normal(110, 10, n),
            "latency_p95": np.random.normal(230, 25, n),
            "latency_p99": np.random.normal(380, 40, n),
            "error_rate": np.random.exponential(0.02, n),
            "cpu_percent": np.random.normal(40, 5, n),
            "memory_percent": np.random.normal(45, 4, n),
            "db_connections_percent": np.random.normal(35, 5, n),
        }
        df = pd.DataFrame(data)
        self.fit(df)

# Global anomaly detector instance
anomaly_detector = IsolationForestDetector()
