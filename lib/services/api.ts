import {
  Incident,
  ServiceNode,
  MetricDataPoint,
  LogEntry,
  DistributedTrace,
  AnomalyEvent,
  SystemHealthSummary,
} from '../types';
import {
  mockSystemHealth,
  mockServices,
  mockIncidents,
  mockTimeSeriesMetrics,
  mockLogs,
  mockTrace,
  mockAnomalies,
} from '../mock/data';
import { fetchFromApi } from '../api/client';

/**
 * Service API layer connecting Next.js UI to FastAPI Backend.
 * Automatically falls back to high-fidelity mock state if backend is offline.
 */
export async function getSystemHealth(): Promise<SystemHealthSummary> {
  const data = await fetchFromApi<SystemHealthSummary>('/services/health/summary');
  return data || mockSystemHealth;
}

export async function getServices(): Promise<ServiceNode[]> {
  const data = await fetchFromApi<ServiceNode[]>('/services');
  return data || mockServices;
}

export async function getServiceById(id: string): Promise<ServiceNode | undefined> {
  const data = await fetchFromApi<ServiceNode>(`/services/${id}`);
  if (data) return data;
  return mockServices.find((s) => s.id === id);
}

export async function getIncidents(): Promise<Incident[]> {
  const data = await fetchFromApi<Incident[]>('/incidents');
  return data || mockIncidents;
}

export async function getIncidentById(id: string): Promise<Incident | undefined> {
  const data = await fetchFromApi<Incident>(`/incidents/${id}`);
  if (data) return data;
  return mockIncidents.find((inc) => inc.id === id || inc.code === id);
}

export async function getMetrics(serviceId?: string): Promise<MetricDataPoint[]> {
  const data = await fetchFromApi<MetricDataPoint[]>('/telemetry/metrics');
  return data || mockTimeSeriesMetrics;
}

export async function getLogs(query?: string, serviceId?: string, level?: string): Promise<LogEntry[]> {
  let endpoint = '/telemetry/logs?';
  if (serviceId && serviceId !== 'all') endpoint += `service_id=${serviceId}&`;
  if (level && level !== 'ALL') endpoint += `level=${level}&`;
  if (query) endpoint += `query=${encodeURIComponent(query)}&`;

  const data = await fetchFromApi<LogEntry[]>(endpoint);
  if (data) return data;

  let logs = [...mockLogs];
  if (serviceId && serviceId !== 'all') {
    logs = logs.filter((l) => l.service === serviceId);
  }
  if (level && level !== 'ALL') {
    logs = logs.filter((l) => l.level === level);
  }
  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.message.toLowerCase().includes(q) ||
        l.service.toLowerCase().includes(q) ||
        l.traceId.toLowerCase().includes(q)
    );
  }
  return logs;
}

export async function getTrace(traceId?: string): Promise<DistributedTrace> {
  const data = await fetchFromApi<DistributedTrace>('/telemetry/traces');
  return data || mockTrace;
}

export async function getAnomalies(): Promise<AnomalyEvent[]> {
  const data = await fetchFromApi<AnomalyEvent[]>('/anomalies');
  return data || mockAnomalies;
}

export async function executeMitigation(incidentId: string, actionId: string): Promise<{ success: boolean; message: string }> {
  const data = await fetchFromApi<{ success: boolean; message: string }>(`/incidents/${incidentId}/mitigate`, {
    method: 'POST',
    body: JSON.stringify({ action_id: actionId }),
  });
  if (data) return data;
  return {
    success: true,
    message: `Mitigation command applied successfully to ${incidentId}. Health signals stabilizing.`,
  };
}

export async function triggerFailureInjection(failureType: string, durationSeconds: number = 180): Promise<{ success: boolean; message: string }> {
  const data = await fetchFromApi<{ success: boolean; message: string }>('/simulation/failure', {
    method: 'POST',
    body: JSON.stringify({
      failure_type: failureType,
      severity: 'critical',
      duration_seconds: durationSeconds,
    }),
  });
  if (data) return data;
  return {
    success: true,
    message: `Triggered simulation: ${failureType}.`,
  };
}

export async function resetSimulationEnvironment(): Promise<{ success: boolean; message: string }> {
  const data = await fetchFromApi<{ success: boolean; message: string }>('/simulation/reset', {
    method: 'POST',
  });
  if (data) return data;
  return {
    success: true,
    message: 'Simulation environment reset to nominal operating conditions.',
  };
}
