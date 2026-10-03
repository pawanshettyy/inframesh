'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { mockAnomalies } from '@/lib/mock/data';

export default function AnomaliesPage() {
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = mockAnomalies.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (query && !a.service.toLowerCase().includes(query.toLowerCase()) && !a.signal.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Anomaly Intelligence</h1>
            <span className="px-2 py-0.5 rounded-full bg-apple-warning/20 text-apple-warning font-mono text-xs font-semibold">
              17 Anomalies Detected (30m)
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Statistical deviation tracking, time-series anomaly detection, and automated causality clustering.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <Search className="w-3.5 h-3.5 text-apple-textTertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by service or signal..."
              className="bg-transparent text-white placeholder-apple-textTertiary text-xs focus:outline-none w-48"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none"
          >
            <option value="all" className="bg-[#161920]">All Severities</option>
            <option value="critical" className="bg-[#161920]">Critical</option>
            <option value="degraded" className="bg-[#161920]">Degraded</option>
            <option value="warning" className="bg-[#161920]">Warning</option>
          </select>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {filtered.map((anomaly) => {
          const isCritical = anomaly.severity === 'critical';
          const isDegraded = anomaly.severity === 'degraded';

          return (
            <div
              key={anomaly.id}
              className={`p-4 rounded-2xl liquid-glass-card transition duration-200 ${
                isCritical ? 'border-apple-critical/30 ring-1 ring-apple-critical/20' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Service, Signal, Score */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCritical
                          ? 'bg-apple-critical animate-pulse shadow-critical-glow'
                          : isDegraded
                          ? 'bg-apple-degraded'
                          : 'bg-apple-warning'
                      }`}
                    />
                    <span className="font-semibold text-white text-sm">{anomaly.service}</span>
                    <span className="text-apple-textTertiary">·</span>
                    <span className="text-xs text-white/80 font-medium">{anomaly.signal}</span>
                    <span className="text-[11px] font-mono text-apple-textTertiary">({anomaly.timestamp})</span>
                  </div>

                  {/* Comparison Stats: Expected vs Observed */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-[10px] text-apple-textTertiary">Anomaly Score</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-sm font-bold text-apple-critical">
                          {anomaly.anomalyScore.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-apple-textTertiary font-mono">/ 1.00</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-[10px] text-apple-textTertiary">Expected Baseline Range</div>
                      <div className="font-mono text-xs font-semibold text-apple-textSecondary mt-0.5">
                        {anomaly.expectedRange}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-[10px] text-apple-textTertiary">Observed Spike Deviation</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-apple-critical">
                          {anomaly.observedValue}
                        </span>
                        <span className="text-[10px] font-mono text-apple-critical font-bold">
                          ({anomaly.deviationRatio})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {anomaly.correlatedIncidentId && (
                    <Link
                      href={`/incidents/${anomaly.correlatedIncidentId}`}
                      className="px-3.5 py-2 rounded-xl bg-apple-critical/20 hover:bg-apple-critical/30 border border-apple-critical/40 text-apple-critical text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Investigate in Incident</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
