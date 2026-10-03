export type HealthStatus = 'healthy' | 'warning' | 'degraded' | 'critical';

export type ServiceTier = 'edge' | 'application' | 'database' | 'cache' | 'messaging';

export interface ServiceNode {
  id: string;
  name: string;
  tier: ServiceTier;
  health: HealthStatus;
  rps: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number; // percentage e.g. 8.4
  cpuPercent: number;
  memoryPercent: number;
  dbPoolUtilization?: number; // percentage e.g. 97
  activeAnomaliesCount: number;
  dependencies: string[]; // downstream service ids
  dependents: string[]; // upstream service ids
  version: string;
  replicas: { ready: number; desired: number };
  x: number;
  y: number;
}

export type IncidentSeverity = 'critical' | 'degraded' | 'warning' | 'info';
export type IncidentStatus = 'investigating' | 'mitigating' | 'mitigated' | 'resolved';

export interface CausalHop {
  sourceService: string;
  targetService: string;
  delaySeconds: number;
  phenomenon: string;
  telemetryEvidence: string;
}

export interface EvidenceItem {
  id: string;
  type: 'metric_correlation' | 'temporal_precedence' | 'dependency_topology' | 'log_pattern' | 'trace_waterfall';
  title: string;
  statement: string;
  confidenceScore: number;
  metadata: {
    correlationCoefficient?: number;
    timeDeltaSec?: number;
    p95Spike?: string;
    sampleLogMessage?: string;
    traceSpanId?: string;
    metricKey?: string;
  };
}

export interface RootCauseAnalysis {
  incidentId: string;
  rootCauseTitle: string;
  suspectedComponent: string;
  aiConfidence: number; // e.g. 0.96
  executiveSummary: string;
  chainOfThought: string[];
  causalChain: CausalHop[];
  evidence: EvidenceItem[];
  suggestedMitigations: {
    id: string;
    title: string;
    description: string;
    actionType: 'scale_pool' | 'restart_pod' | 'circuit_break' | 'rollback';
    riskLevel: 'low' | 'medium' | 'high';
    commandSnippet?: string;
  }[];
}

export interface Incident {
  id: string;
  code: string; // e.g. "INC-2026-0817"
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: string; // ISO or relative
  durationString: string;
  affectedServices: string[];
  rootCauseBrief: string;
  aiConfidence: number; // e.g. 0.96
  blastRadiusScore: number; // 0-100
  rca?: RootCauseAnalysis;
}

export interface MetricDataPoint {
  timestamp: string;
  timeSec: number;
  rps: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  cpuPercent: number;
  memoryPercent: number;
  dbConnectionPoolPercent?: number;
  isAnomalyWindow?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  traceId: string;
  spanId: string;
  message: string;
  component?: string;
  errorStack?: string;
  metadata?: Record<string, string | number | boolean>;
  highlighted?: boolean;
}

export interface TraceSpan {
  id: string;
  parentId?: string;
  service: string;
  name: string;
  endpoint: string;
  startOffsetMs: number;
  durationMs: number;
  status: 'ok' | 'error';
  httpStatus: number;
  tags: Record<string, string | number | boolean>;
  logsCount: number;
  hasRootCauseFlag?: boolean;
}

export interface DistributedTrace {
  id: string;
  traceId: string;
  rootEndpoint: string;
  initiatingService: string;
  totalDurationMs: number;
  status: 'ok' | 'error';
  timestamp: string;
  spansCount: number;
  errorSpansCount: number;
  spans: TraceSpan[];
}

export interface AnomalyEvent {
  id: string;
  service: string;
  signal: string; // e.g. "P95 Latency", "Pool Exhaustion"
  timestamp: string;
  severity: IncidentSeverity;
  anomalyScore: number; // 0.00 - 1.00
  expectedRange: string; // "180–320 ms"
  observedValue: string; // "4.82 s"
  deviationRatio: string; // "+4.8x"
  correlatedIncidentId?: string;
  status: 'active' | 'evaluating' | 'cleared';
}

export interface SystemHealthSummary {
  overallHealthPercent: number; // 99.2
  totalServices: number; // 24
  activeIncidentsCount: number; // 3
  activeAnomaliesCount: number; // 17
  globalRps: number;
  globalAvgP95LatencyMs: number;
  globalErrorRatePercent: number;
  statusMessage: string;
}
