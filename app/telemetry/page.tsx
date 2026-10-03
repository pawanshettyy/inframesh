'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Terminal,
  Activity,
  Layers,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Server,
  Zap,
  ExternalLink,
  Code,
  Copy,
  Sliders
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid
} from 'recharts';
import {
  mockTimeSeriesMetrics,
  mockLogs,
  mockTrace,
  mockServices,
} from '@/lib/mock/data';
import { formatLatency, formatNumber, formatPercent } from '@/lib/utils';
import { LogEntry, TraceSpan } from '@/lib/types';
import { useLiveTelemetry } from '@/lib/hooks/useLiveTelemetry';
import { getLogs, getTrace } from '@/lib/services/api';

function TelemetryInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as 'metrics' | 'logs' | 'traces') || 'metrics';
  const initialService = searchParams?.get('service') || 'payment-service';

  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'traces'>(initialTab);
  const [selectedService, setSelectedService] = useState<string>(initialService);

  const { metrics: liveMetrics, services: liveServices } = useLiveTelemetry(2000);
  const [liveLogsList, setLiveLogsList] = useState<LogEntry[]>(mockLogs);

  // Logs state
  const [logQuery, setLogQuery] = useState('');
  const [logLevel, setLogLevel] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>('log-01');

  // Trace state
  const [selectedSpanId, setSelectedSpanId] = useState<string>('span-db-checkout-991');

  // Load live logs on interval
  React.useEffect(() => {
    let isMounted = true;
    async function fetchLogsData() {
      try {
        const data = await getLogs(logQuery, selectedService, logLevel);
        if (isMounted && data && data.length > 0) {
          setLiveLogsList(data);
        }
      } catch (e) {}
    }
    fetchLogsData();
    const interval = setInterval(fetchLogsData, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [logQuery, selectedService, logLevel]);

  const metricsData = liveMetrics.length > 0 ? liveMetrics : mockTimeSeriesMetrics;
  const servicesList = liveServices.length > 0 ? liveServices : mockServices;

  // Filtered logs
  const filteredLogs = liveLogsList.filter((log) => {
    if (selectedService !== 'all' && log.service !== selectedService) return false;
    if (logLevel !== 'ALL' && log.level !== logLevel) return false;
    if (logQuery) {
      const q = logQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q) ||
        log.service.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedSpan = mockTrace.spans.find((s) => s.id === selectedSpanId) || mockTrace.spans[5];

  return (
    <div className="space-y-4">
      {/* Telemetry Studio Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight font-sans">
              Telemetry Studio & Diagnostic Traces
            </h1>
            <span className="px-2 py-0.5 rounded-[4px] bg-white/[0.08] text-white/80 font-mono text-[10px]">
              Cross-Signal Synced
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Synchronous inspection across metric time-series, structured Console logs, and distributed trace waterfalls.
          </p>
        </div>

        {/* Mode Switcher & Component Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Service Picker */}
          <div className="flex items-center gap-1.5 text-xs">
            <Server className="w-3.5 h-3.5 text-apple-textTertiary" />
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-[#18181E] border border-white/[0.08] text-white text-xs px-2.5 py-1 rounded-[5px] focus:outline-none"
            >
              <option value="all" className="bg-[#1C1C22]">All Services</option>
              {servicesList.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1C1C22]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Segmented Controls */}
          <div className="flex items-center macos-segmented-button text-xs">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[5px] text-xs font-medium transition ${
                activeTab === 'metrics'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[5px] text-xs font-medium transition ${
                activeTab === 'logs'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('traces')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[5px] text-xs font-medium transition ${
                activeTab === 'traces'
                  ? 'macos-segmented-item-active'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Distributed Traces</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: HIGH-PRECISION ENGINEERING METRICS
          ========================================================================= */}
      {activeTab === 'metrics' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart 1: Latency Percentiles */}
            <div className="p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-apple-critical" />
                  <h3 className="text-xs font-semibold text-white">HTTP Latency Distribution (P50, P95, P99)</h3>
                </div>
                <span className="font-mono text-[10px] text-apple-critical tabular-nums">P95: 4.82s (+4.8× Baseline)</span>
              </div>
              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mP95" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF453A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF453A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="timestamp" stroke="#636366" fontSize={10} tickLine={false} />
                    <YAxis stroke="#636366" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <ReferenceArea x1="13:12" x2="13:30" fill="#FF453A" fillOpacity={0.07} />
                    <Area type="monotone" dataKey="p99Latency" stroke="#FF9F0A" strokeWidth={1.5} fillOpacity={0} name="P99 Latency" />
                    <Area type="monotone" dataKey="p95Latency" stroke="#FF453A" strokeWidth={1.75} fill="url(#mP95)" name="P95 Latency" />
                    <Area type="monotone" dataKey="p50Latency" stroke="#0A84FF" strokeWidth={1.5} fillOpacity={0} name="P50 Latency" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Database Connection Pool Saturation % */}
            <div className="p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-xs font-semibold text-white">HikariCP Database Connection Pool Saturation</h3>
                </div>
                <span className="font-mono text-[10px] text-indigo-400 font-bold tabular-nums">97.2% Saturated</span>
              </div>
              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mPool" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="timestamp" stroke="#636366" fontSize={10} tickLine={false} />
                    <YAxis stroke="#636366" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <ReferenceArea x1="13:12" x2="13:30" fill="#6366F1" fillOpacity={0.08} />
                    <Area type="monotone" dataKey="dbConnectionPoolPercent" stroke="#6366F1" strokeWidth={2} fill="url(#mPool)" name="HikariPool %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Error Rate */}
            <div className="p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-apple-degraded" />
                  <h3 className="text-xs font-semibold text-white">HTTP 5xx / Circuit Breaker Error Rate</h3>
                </div>
                <span className="font-mono text-[10px] text-apple-degraded tabular-nums">8.4% Max Error</span>
              </div>
              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mErr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9F0A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF9F0A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="timestamp" stroke="#636366" fontSize={10} tickLine={false} />
                    <YAxis stroke="#636366" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Area type="monotone" dataKey="errorRate" stroke="#FF9F0A" strokeWidth={1.75} fill="url(#mErr)" name="Error Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: CPU & Memory Usage */}
            <div className="p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-apple-accent" />
                  <h3 className="text-xs font-semibold text-white">Runtime Resource Footprint (CPU & Memory)</h3>
                </div>
                <span className="font-mono text-[10px] text-apple-textTertiary tabular-nums">CPU 71% · Mem 64%</span>
              </div>
              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="timestamp" stroke="#636366" fontSize={10} tickLine={false} />
                    <YAxis stroke="#636366" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Line type="monotone" dataKey="cpuPercent" stroke="#0A84FF" strokeWidth={1.75} dot={false} name="CPU %" />
                    <Line type="monotone" dataKey="memoryPercent" stroke="#30D158" strokeWidth={1.75} dot={false} name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: APPLE CONSOLE.APP STYLE STRUCTURED LOG VIEWER
          ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-2.5 font-mono shadow-sm">
          {/* Console Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2 flex-1 font-sans">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#101014] border border-white/[0.08] flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-apple-textTertiary" />
                <input
                  type="text"
                  value={logQuery}
                  onChange={(e) => setLogQuery(e.target.value)}
                  placeholder="Filter logs: message, traceId:7f9b2c..., component..."
                  className="bg-transparent text-white placeholder-apple-textTertiary text-xs focus:outline-none w-full font-mono"
                />
              </div>

              {/* Log Severity Pills */}
              <div className="flex items-center macos-segmented-button text-xs">
                {['ALL', 'FATAL', 'ERROR', 'WARN', 'INFO'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogLevel(lvl)}
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium transition ${
                      logLevel === lvl
                        ? 'macos-segmented-item-active'
                        : 'text-apple-textTertiary hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[11px] text-apple-textTertiary font-sans">
              {filteredLogs.length} Stream Events
            </span>
          </div>

          {/* Structured Table Rows */}
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isFatal = log.level === 'FATAL';
              const isError = log.level === 'ERROR';
              const isWarn = log.level === 'WARN';

              return (
                <div
                  key={log.id}
                  className={`rounded-md border transition text-xs ${
                    log.highlighted
                      ? 'bg-apple-critical/10 border-apple-critical/30'
                      : 'bg-[#101014] border-white/[0.04] hover:bg-white/[0.03]'
                  }`}
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-2 flex items-start gap-2.5 cursor-pointer select-none"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-apple-textTertiary shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-apple-textTertiary shrink-0 mt-0.5" />
                    )}

                    <span className="text-apple-textTertiary text-[11px] shrink-0 font-mono">
                      {log.timestamp}
                    </span>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 font-mono ${
                        isFatal
                          ? 'bg-apple-critical text-white'
                          : isError
                          ? 'bg-apple-critical/20 text-apple-critical border border-apple-critical/30'
                          : isWarn
                          ? 'bg-apple-warning/20 text-apple-warning border border-apple-warning/30'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {log.level}
                    </span>

                    <span className="text-white/85 font-semibold shrink-0 text-[11px]">
                      [{log.service}]
                    </span>

                    <span className="text-white/90 truncate flex-1 text-[11px]">
                      {log.message}
                    </span>

                    <span className="text-[10px] text-apple-textTertiary font-mono shrink-0 hidden sm:inline">
                      {log.traceId.slice(0, 8)}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/[0.06] text-[11px] space-y-2 bg-black/60 rounded-b-md">
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-apple-textTertiary pt-1">
                        <span>Trace ID: <strong className="text-white">{log.traceId}</strong></span>
                        <span>Span ID: <strong className="text-white">{log.spanId}</strong></span>
                        {log.component && <span>Component: <strong className="text-white">{log.component}</strong></span>}
                      </div>

                      <div className="p-2 rounded bg-black/80 border border-white/[0.04] text-apple-critical whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
                        {log.errorStack || log.message}
                      </div>

                      {log.metadata && (
                        <div>
                          <div className="text-[10px] text-apple-textTertiary uppercase font-sans font-semibold mb-1">
                            Structured Payload Attributes
                          </div>
                          <pre className="p-2 rounded bg-black/70 border border-white/[0.04] text-white/80 font-mono text-[10px] overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: XCODE / INSTRUMENTS DISTRIBUTED TRACE WATERFALL
          ========================================================================= */}
      {activeTab === 'traces' && (
        <div className="space-y-3">
          {/* Trace Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-apple-critical/20 text-apple-critical font-mono font-bold text-xs">
                HTTP 504
              </span>
              <div>
                <div className="font-semibold text-white text-sm font-mono">{mockTrace.rootEndpoint}</div>
                <div className="text-[11px] text-apple-textTertiary font-mono">
                  Trace ID: {mockTrace.traceId} · {mockTrace.spansCount} Spans · {mockTrace.errorSpansCount} Errors
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-apple-textTertiary uppercase font-mono">Total Execution Time</div>
              <div className="text-base font-mono font-bold text-apple-critical">
                {formatLatency(mockTrace.totalDurationMs)}
              </div>
            </div>
          </div>

          {/* Trace Waterfall Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* Waterfall Timeline (8 Cols) */}
            <div className="lg:col-span-8 p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[10px] font-mono text-apple-textTertiary">
                <span>Span Call Hierarchy</span>
                <span>0ms ────────────── 2560ms ────────────── 5120ms</span>
              </div>

              <div className="space-y-1">
                {mockTrace.spans.map((span) => {
                  const isSelected = selectedSpanId === span.id;
                  const isRootCause = span.hasRootCauseFlag;
                  const isError = span.status === 'error';

                  const leftPercent = (span.startOffsetMs / mockTrace.totalDurationMs) * 100;
                  const widthPercent = Math.max((span.durationMs / mockTrace.totalDurationMs) * 100, 2);

                  return (
                    <div
                      key={span.id}
                      onClick={() => setSelectedSpanId(span.id)}
                      className={`p-2 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? 'bg-white/[0.08] ring-1 ring-apple-accent'
                          : 'bg-[#111114] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isRootCause
                                ? 'bg-apple-critical animate-pulse'
                                : isError
                                ? 'bg-apple-critical'
                                : 'bg-apple-success'
                            }`}
                          />
                          <span className="font-semibold text-white text-[11px] truncate">
                            {span.service}
                          </span>
                          <span className="font-mono text-[10px] text-apple-textTertiary truncate">
                            {span.name}
                          </span>
                        </div>

                        <span className="font-mono text-[11px] font-medium text-white shrink-0">
                          {formatLatency(span.durationMs)}
                        </span>
                      </div>

                      {/* Waterfall Duration Bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/[0.04] relative overflow-hidden">
                        <div
                          className={`absolute top-0 bottom-0 rounded-full ${
                            isRootCause
                              ? 'bg-gradient-to-r from-red-500 to-indigo-500'
                              : isError
                              ? 'bg-apple-critical'
                              : 'bg-apple-success'
                          }`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Span Inspector (4 Cols) */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#16161A] border border-white/[0.08] space-y-3 text-xs shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="font-semibold text-white text-xs">Span Details</h3>
                <span className="font-mono text-[10px] text-apple-textTertiary">{selectedSpan.id}</span>
              </div>

              {selectedSpan.hasRootCauseFlag && (
                <div className="p-2 rounded-lg bg-apple-critical/15 border border-apple-critical/30 text-apple-critical text-[11px] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Bottleneck Critical Path</strong>
                    <p className="text-white/80 text-[10px] mt-0.5">
                      92% of the overall request latency is spent waiting on database connection checkout.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <span className="text-apple-textTertiary text-[10px]">Service</span>
                  <div className="font-semibold text-white">{selectedSpan.service}</div>
                </div>

                <div>
                  <span className="text-apple-textTertiary text-[10px]">Endpoint / Operation</span>
                  <div className="font-mono text-white/90 text-[11px]">{selectedSpan.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 tabular-nums">
                  <div className="p-2 rounded bg-[#101014]">
                    <div className="text-apple-textTertiary text-[10px]">Duration</div>
                    <div className="font-mono font-semibold text-apple-critical">
                      {formatLatency(selectedSpan.durationMs)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#101014]">
                    <div className="text-apple-textTertiary text-[10px]">Start Offset</div>
                    <div className="font-mono font-semibold text-white">
                      +{selectedSpan.startOffsetMs}ms
                    </div>
                  </div>
                </div>

                {/* Tags Table */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-apple-textTertiary text-[10px] uppercase font-mono tracking-wider">
                    Span Attributes
                  </span>
                  <div className="mt-1.5 space-y-1">
                    {Object.entries(selectedSpan.tags).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-1.5 rounded bg-[#101014] border border-white/[0.03] flex items-center justify-between text-[10px] font-mono"
                      >
                        <span className="text-apple-textTertiary">{k}</span>
                        <span className="text-white font-medium truncate max-w-[140px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TelemetryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-apple-textTertiary">Loading Telemetry Studio...</div>}>
      <TelemetryInner />
    </Suspense>
  );
}
