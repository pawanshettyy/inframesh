'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Server,
  Activity,
  AlertTriangle,
  Cpu,
  HardDrive,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
  Terminal,
  ExternalLink,
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';
import { ServiceNode } from '@/lib/types';
import { formatNumber, formatLatency, formatPercent } from '@/lib/utils';
import { mockServices } from '@/lib/mock/data';

interface ServiceInspectorProps {
  service: ServiceNode | null;
  onClose: () => void;
  onSelectService?: (serviceId: string) => void;
}

export function ServiceInspector({ service, onClose, onSelectService }: ServiceInspectorProps) {
  if (!service) return null;

  const upstreamServices = mockServices.filter((s) => service.dependents.includes(s.id));
  const downstreamServices = mockServices.filter((s) => service.dependencies.includes(s.id));

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#121419]/95 border-l border-white/10 shadow-2xl backdrop-blur-spatial flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              service.health === 'critical'
                ? 'bg-apple-critical shadow-critical-glow animate-pulse'
                : service.health === 'degraded'
                ? 'bg-apple-degraded'
                : 'bg-apple-success'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">{service.name}</h2>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-apple-textTertiary">
                {service.tier}
              </span>
            </div>
            <span className="text-[11px] text-apple-textTertiary font-mono">
              ID: {service.id} · {service.version}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-apple-textSecondary hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-xs">
        {/* Health Alert Banner if degraded/critical */}
        {service.health !== 'healthy' && (
          <div className="p-3 rounded-xl bg-apple-critical/10 border border-apple-critical/25 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-apple-critical shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-apple-critical text-[11px]">
                {service.health.toUpperCase()} SIGNAL DETECTED
              </div>
              <p className="text-white/80 text-[11px] mt-0.5 leading-relaxed">
                {service.id === 'payment-service'
                  ? 'HikariCP connection pool saturated (97%). P95 latency is 4.82s (+4.8× baseline). Correlated with active root cause incident INC-2026-0817.'
                  : service.id === 'postgres-db'
                  ? 'Active lock contention on ledger_entries table. 50/50 worker connections held by Payment Service.'
                  : service.id === 'order-service'
                  ? 'Upstream RPC timeout amplification (+31% circuit trips) caused by downstream payment degradation.'
                  : 'Elevated anomaly rate detected across golden telemetry signals.'}
              </p>
              <Link
                href="/incidents/INC-2026-0817"
                className="inline-flex items-center gap-1 text-[11px] text-apple-accent hover:underline font-medium mt-2"
              >
                <span>Jump to Live Diagnostic Workspace</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Golden Signals Grid */}
        <div>
          <div className="text-[11px] font-semibold text-apple-textTertiary uppercase tracking-wider mb-2.5">
            Golden Signals (Real-Time)
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {/* P95 Latency */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-apple-textTertiary font-medium">P95 Latency</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span
                  className={`text-lg font-mono font-semibold ${
                    service.p95LatencyMs > 1000
                      ? 'text-apple-critical'
                      : service.p95LatencyMs > 300
                      ? 'text-apple-degraded'
                      : 'text-white'
                  }`}
                >
                  {formatLatency(service.p95LatencyMs)}
                </span>
                <span className="text-[10px] text-apple-textTertiary font-mono">P50: {formatLatency(service.p50LatencyMs)}</span>
              </div>
            </div>

            {/* Request Rate */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-apple-textTertiary font-medium">Throughput</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-mono font-semibold text-white">
                  {formatNumber(service.rps)}
                </span>
                <span className="text-[10px] text-apple-textTertiary font-mono">req/min</span>
              </div>
            </div>

            {/* Error Rate */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-apple-textTertiary font-medium">Error Rate</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span
                  className={`text-lg font-mono font-semibold ${
                    service.errorRate > 1.0 ? 'text-apple-critical' : 'text-apple-success'
                  }`}
                >
                  {formatPercent(service.errorRate)}
                </span>
                <span className="text-[10px] text-apple-textTertiary font-mono">5xx/4xx</span>
              </div>
            </div>

            {/* DB Pool or P99 */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-apple-textTertiary font-medium">
                {service.dbPoolUtilization !== undefined ? 'DB Connection Pool' : 'P99 Latency'}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span
                  className={`text-lg font-mono font-semibold ${
                    (service.dbPoolUtilization ?? 0) > 85 ? 'text-apple-critical' : 'text-white'
                  }`}
                >
                  {service.dbPoolUtilization !== undefined
                    ? `${service.dbPoolUtilization}%`
                    : formatLatency(service.p99LatencyMs)}
                </span>
                <span className="text-[10px] text-apple-textTertiary font-mono">
                  {service.dbPoolUtilization !== undefined ? 'HikariCP' : 'Tail'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div>
          <div className="text-[11px] font-semibold text-apple-textTertiary uppercase tracking-wider mb-2.5">
            Host & Runtime Capacity
          </div>
          <div className="space-y-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            {/* CPU */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-apple-textSecondary">
                  <Cpu className="w-3.5 h-3.5 text-apple-textTertiary" /> CPU Utilization
                </span>
                <span className="font-mono text-white font-medium">{service.cpuPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    service.cpuPercent > 80 ? 'bg-apple-critical' : service.cpuPercent > 60 ? 'bg-apple-degraded' : 'bg-apple-accent'
                  }`}
                  style={{ width: `${service.cpuPercent}%` }}
                />
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-apple-textSecondary">
                  <HardDrive className="w-3.5 h-3.5 text-apple-textTertiary" /> Memory (RSS)
                </span>
                <span className="font-mono text-white font-medium">{service.memoryPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-apple-accent"
                  style={{ width: `${service.memoryPercent}%` }}
                />
              </div>
            </div>

            {/* Replicas */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.04]">
              <span className="text-apple-textSecondary">Active Pod Replicas</span>
              <span className="font-mono text-white font-medium">
                {service.replicas.ready} / {service.replicas.desired} Ready
              </span>
            </div>
          </div>
        </div>

        {/* Upstream & Downstream Dependencies */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-apple-textTertiary uppercase tracking-wider">
            Topological Relationships
          </div>

          {/* Upstream / Dependents */}
          <div>
            <div className="text-[10px] text-apple-textTertiary mb-1.5 flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-apple-textTertiary" /> Upstream Callers ({upstreamServices.length})
            </div>
            {upstreamServices.length === 0 ? (
              <div className="text-[11px] text-apple-textMuted italic pl-2">None (Root Edge Entrypoint)</div>
            ) : (
              <div className="space-y-1">
                {upstreamServices.map((us) => (
                  <button
                    key={us.id}
                    onClick={() => onSelectService?.(us.id)}
                    className="w-full p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          us.health === 'critical' ? 'bg-apple-critical' : us.health === 'degraded' ? 'bg-apple-degraded' : 'bg-apple-success'
                        }`}
                      />
                      <span className="font-medium text-white/90">{us.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-apple-textTertiary">{formatLatency(us.p95LatencyMs)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Downstream / Dependencies */}
          <div>
            <div className="text-[10px] text-apple-textTertiary mb-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-apple-textTertiary" /> Downstream Dependencies ({downstreamServices.length})
            </div>
            {downstreamServices.length === 0 ? (
              <div className="text-[11px] text-apple-textMuted italic pl-2">None (Leaf Component)</div>
            ) : (
              <div className="space-y-1">
                {downstreamServices.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => onSelectService?.(ds.id)}
                    className="w-full p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ds.health === 'critical' ? 'bg-apple-critical' : ds.health === 'degraded' ? 'bg-apple-degraded' : 'bg-apple-success'
                        }`}
                      />
                      <span className="font-medium text-white/90">{ds.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-apple-textTertiary">{formatLatency(ds.p95LatencyMs)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Deep Diagnostic Actions */}
        <div className="pt-2 border-t border-white/[0.08] space-y-2">
          <Link
            href={`/telemetry?service=${service.id}&tab=logs`}
            className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between text-apple-textSecondary hover:text-white transition"
          >
            <span className="flex items-center gap-2 text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-apple-accent" />
              <span>Inspect Structured Console Logs</span>
            </span>
            <ExternalLink className="w-3 h-3 text-apple-textTertiary" />
          </Link>

          <Link
            href={`/telemetry?service=${service.id}&tab=traces`}
            className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between text-apple-textSecondary hover:text-white transition"
          >
            <span className="flex items-center gap-2 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sample Distributed Traces</span>
            </span>
            <ExternalLink className="w-3 h-3 text-apple-textTertiary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
