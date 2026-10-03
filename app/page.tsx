'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Radio,
  Server,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  ExternalLink,
  Cpu,
  HardDrive,
  CheckCircle2,
  Database,
  Sliders
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid
} from 'recharts';
import { useLiveTelemetry } from '@/lib/hooks/useLiveTelemetry';
import { mockIncidents, mockServices } from '@/lib/mock/data';
import { formatNumber, formatLatency, formatPercent } from '@/lib/utils';
import { TopologyGraph } from '@/components/topology/TopologyGraph';

export default function OverviewPage() {
  const { metrics: liveMetrics, health: liveHealth, services: liveServices, isConnected, lastTick } = useLiveTelemetry(2000);
  const [activeChartMetric, setActiveChartMetric] = useState<'latency' | 'dbPool' | 'errorRate' | 'throughput'>('latency');

  const metricsData = liveMetrics.length > 0 ? liveMetrics : [];
  const healthData = liveHealth || {
    overallHealthPercent: 99.2,
    totalServices: 24,
    activeIncidentsCount: 3,
    activeAnomaliesCount: 17,
    globalRps: 148200,
    globalAvgP95LatencyMs: 420,
    globalErrorRatePercent: 0.74,
    statusMessage: "Real-time telemetry operational"
  };
  const servicesData = liveServices.length > 0 ? liveServices : mockServices;

  return (
    <div className="space-y-4">
      {/* Top System Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight font-sans">
              System Overview & Infrastructure Health
            </h1>
            <span className="w-2 h-2 rounded-full bg-apple-critical animate-pulse" />
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Real-time multi-signal telemetry ingestion across 24 distributed microservices.
          </p>
        </div>

        {/* Global Action Banner */}
        <div className="flex items-center gap-2">
          <Link
            href="/incidents/INC-2026-0817"
            className="px-3 py-1.5 rounded-[5px] bg-apple-critical/15 hover:bg-apple-critical/25 border border-apple-critical/30 text-apple-critical text-xs font-semibold flex items-center gap-2 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Investigate Active SEV-1 Incident (INC-2026-0817)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* SYSTEM HEALTH: Activity Monitor / Instruments Style Hardware & Fleet Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Global Health Index & Cluster Breakdown (7 Cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#16161A] border border-white/[0.08] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-apple-accent" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Fleet Health Index
              </span>
            </div>
            <span className="text-[11px] font-mono text-apple-success bg-apple-success/10 px-2 py-0.5 rounded border border-apple-success/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-success" />
              <span>99.2% Nominal</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 tabular-nums">
            {/* Health Score */}
            <div className="p-2.5 rounded-lg bg-[#111114] border border-white/[0.04]">
              <div className="text-[10px] text-apple-textTertiary uppercase font-mono">Uptime SLA</div>
              <div className="text-2xl font-mono font-bold text-white mt-1">99.2%</div>
              <div className="text-[10px] text-apple-success mt-0.5">Target: 99.0%</div>
            </div>

            {/* Total Services */}
            <div className="p-2.5 rounded-lg bg-[#111114] border border-white/[0.04]">
              <div className="text-[10px] text-apple-textTertiary uppercase font-mono">Services</div>
              <div className="text-2xl font-mono font-bold text-white mt-1">24</div>
              <div className="text-[10px] text-apple-textTertiary mt-0.5">21 Ok · 3 Degraded</div>
            </div>

            {/* Active Incidents */}
            <div className="p-2.5 rounded-lg bg-[#111114] border border-white/[0.04]">
              <div className="text-[10px] text-apple-textTertiary uppercase font-mono">Active Incidents</div>
              <div className="text-2xl font-mono font-bold text-apple-critical mt-1">3</div>
              <div className="text-[10px] text-apple-critical mt-0.5">1 Sev-1 · 2 Degraded</div>
            </div>

            {/* Anomaly clusters */}
            <div className="p-2.5 rounded-lg bg-[#111114] border border-white/[0.04]">
              <div className="text-[10px] text-apple-textTertiary uppercase font-mono">Anomalies (30m)</div>
              <div className="text-2xl font-mono font-bold text-apple-warning mt-1">17</div>
              <div className="text-[10px] text-indigo-400 mt-0.5">3 Incident clusters</div>
            </div>
          </div>

          {/* Service Fleet Distribution Bar */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-apple-textSecondary tabular-nums">
              <span>Fleet Component Distribution (24 Total)</span>
              <span className="font-mono text-apple-textTertiary text-[10px]">87.5% Healthy · 12.5% Degraded</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] flex overflow-hidden">
              <div className="h-full bg-apple-success" style={{ width: '87.5%' }} title="21 Healthy" />
              <div className="h-full bg-apple-degraded" style={{ width: '8.3%' }} title="2 Degraded" />
              <div className="h-full bg-apple-critical" style={{ width: '4.2%' }} title="1 Critical" />
            </div>
          </div>
        </div>

        {/* AI Incident Diagnostic Spotlight (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#16161A] border border-white/[0.08] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Apple Intelligence Diagnostic
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/25">
                96% Confidence
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-apple-critical px-1.5 py-0.2 rounded bg-apple-critical/15 border border-apple-critical/20">
                  INC-2026-0817
                </span>
                <span className="text-xs font-semibold text-white">Payment Service Latency Degradation</span>
              </div>

              <p className="text-xs text-apple-textSecondary leading-relaxed">
                Database connection utilization reached 97%. Query wait timeouts in Payment Service propagated upstream to Order Service and API Gateway.
              </p>

              <div className="p-2 rounded-lg bg-[#111114] border border-white/[0.04] text-[10px] font-mono text-apple-textTertiary flex items-center gap-2">
                <span className="text-apple-critical font-bold">DB (97% Pool)</span>
                <span>→</span>
                <span className="text-apple-critical font-medium">Payment (4.8s)</span>
                <span>→</span>
                <span className="text-apple-degraded">Order (504)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-apple-textTertiary font-mono">Duration: 8m 31s</span>
            <Link
              href="/incidents/INC-2026-0817"
              className="inline-flex items-center gap-1 text-xs text-apple-accent hover:underline font-medium"
            >
              <span>Open Investigation Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* REAL-TIME ACTIVITY: High-Precision Activity Monitor Style Telemetry Charts */}
      <div className="p-4 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-apple-accent" />
            <div>
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-sans">
                Real-Time Telemetry & Metric Correlations
              </h2>
              <span className="text-[10px] text-apple-textTertiary">
                Shaded window demarcates correlated incident anomaly interval (13:12 – 13:30 UTC)
              </span>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center macos-segmented-button text-xs">
            <button
              onClick={() => setActiveChartMetric('latency')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition ${
                activeChartMetric === 'latency'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              P95 Latency
            </button>
            <button
              onClick={() => setActiveChartMetric('dbPool')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition ${
                activeChartMetric === 'dbPool'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              DB Conn Pool %
            </button>
            <button
              onClick={() => setActiveChartMetric('errorRate')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition ${
                activeChartMetric === 'errorRate'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              Error Rate %
            </button>
            <button
              onClick={() => setActiveChartMetric('throughput')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition ${
                activeChartMetric === 'throughput'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              RPS Volume
            </button>
          </div>
        </div>

        {/* Crisp Activity Monitor / Instruments Style Chart Canvas */}
        <div className="h-60 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cGradLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF453A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF453A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cGradPool" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cGradErr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9F0A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF9F0A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cGradRps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

              <XAxis
                dataKey="timestamp"
                stroke="#636366"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <YAxis
                stroke="#636366"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (activeChartMetric === 'latency') return `${val}ms`;
                  if (activeChartMetric === 'dbPool' || activeChartMetric === 'errorRate') return `${val}%`;
                  return `${(val / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C22',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  fontSize: '11px',
                  color: '#F2F2F7',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [
                  activeChartMetric === 'latency'
                    ? `${value} ms`
                    : activeChartMetric === 'dbPool' || activeChartMetric === 'errorRate'
                    ? `${value} %`
                    : `${value} req/min`,
                  activeChartMetric.toUpperCase(),
                ]}
              />

              <ReferenceArea
                x1="13:12"
                x2="13:30"
                strokeOpacity={0.3}
                fill="#FF453A"
                fillOpacity={0.06}
                label={{
                  value: 'INC-2026-0817 Incident Interval',
                  fill: '#FF453A',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />

              {activeChartMetric === 'latency' && (
                <Area
                  type="monotone"
                  dataKey="p95Latency"
                  stroke="#FF453A"
                  strokeWidth={1.75}
                  fillOpacity={1}
                  fill="url(#cGradLatency)"
                  isAnimationActive={true}
                />
              )}

              {activeChartMetric === 'dbPool' && (
                <Area
                  type="monotone"
                  dataKey="dbConnectionPoolPercent"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cGradPool)"
                  isAnimationActive={true}
                />
              )}

              {activeChartMetric === 'errorRate' && (
                <Area
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#FF9F0A"
                  strokeWidth={1.75}
                  fillOpacity={1}
                  fill="url(#cGradErr)"
                  isAnimationActive={true}
                />
              )}

              {activeChartMetric === 'throughput' && (
                <Area
                  type="monotone"
                  dataKey="rps"
                  stroke="#0A84FF"
                  strokeWidth={1.75}
                  fillOpacity={1}
                  fill="url(#cGradRps)"
                  isAnimationActive={true}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Active Incidents List & Topology Micro-Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Incidents (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#16161A] border border-white/[0.08] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-apple-critical" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">Active System Incidents</span>
            </div>
            <Link href="/incidents" className="text-[11px] text-apple-accent hover:underline">
              View All (3)
            </Link>
          </div>

          <div className="space-y-1.5 mt-2 flex-1">
            {mockIncidents.slice(0, 3).map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.code}`}
                className="p-2.5 rounded-lg bg-[#111114] hover:bg-[#1C1C22] border border-white/[0.04] flex items-center justify-between transition group block"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-apple-critical">{inc.code}</span>
                    <span className="text-xs text-white/90 font-medium truncate">{inc.title}</span>
                  </div>
                  <div className="text-[10px] text-apple-textTertiary mt-0.5">
                    Cause: <span className="text-white/80">{inc.rootCauseBrief}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-apple-textTertiary group-hover:text-white transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Mini Topology Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <TopologyGraph
            services={servicesData}
            highlightPath={['postgres-db', 'payment-service', 'order-service', 'api-gateway']}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
