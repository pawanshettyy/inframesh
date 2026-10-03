'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Filter,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { mockIncidents } from '@/lib/mock/data';
import { IncidentSeverity, IncidentStatus } from '@/lib/types';

export default function IncidentsListPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = mockIncidents.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.code.toLowerCase().includes(q) ||
        inc.rootCauseBrief.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Active & Historical Incidents</h1>
            <span className="px-2 py-0.5 rounded-full bg-apple-critical/20 text-apple-critical font-mono text-xs font-semibold">
              3 Active
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Automated correlation, anomaly clustering, and probable root-cause attribution.
          </p>
        </div>

        {/* Quick Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <Search className="w-3.5 h-3.5 text-apple-textTertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents or causes..."
              className="bg-transparent text-white placeholder-apple-textTertiary text-xs focus:outline-none w-44"
            />
          </div>

          {/* Severity filter */}
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

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none"
          >
            <option value="all" className="bg-[#161920]">All Statuses</option>
            <option value="investigating" className="bg-[#161920]">Investigating</option>
            <option value="mitigated" className="bg-[#161920]">Mitigated</option>
            <option value="resolved" className="bg-[#161920]">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List Container */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const isCritical = incident.severity === 'critical';
          const isDegraded = incident.severity === 'degraded';

          return (
            <div
              key={incident.id}
              className={`p-4 rounded-2xl transition-all duration-200 liquid-glass-card hover:bg-white/[0.06] ${
                isCritical
                  ? 'border-apple-critical/30 shadow-critical-glow ring-1 ring-apple-critical/20'
                  : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Code, Title, Cause, Affected */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isCritical
                          ? 'bg-apple-critical/20 text-apple-critical border border-apple-critical/30'
                          : isDegraded
                          ? 'bg-apple-degraded/20 text-apple-degraded border border-apple-degraded/30'
                          : 'bg-apple-warning/20 text-apple-warning border border-apple-warning/30'
                      }`}
                    >
                      {incident.code}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                        incident.status === 'investigating'
                          ? 'bg-apple-critical/20 text-apple-critical animate-pulse font-semibold'
                          : incident.status === 'mitigated'
                          ? 'bg-apple-warning/20 text-apple-warning font-medium'
                          : 'bg-apple-success/20 text-apple-success font-medium'
                      }`}
                    >
                      {incident.status}
                    </span>

                    <span className="text-[11px] text-apple-textTertiary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {incident.startedAt}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {incident.title}
                  </h3>

                  {/* AI Root Cause Pill */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-apple-textSecondary">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Root Cause:</span>
                      <span className="text-white font-medium">{incident.rootCauseBrief}</span>
                    </div>

                    <span className="text-white/20">·</span>

                    <div className="text-[11px] text-indigo-300 font-mono">
                      AI Confidence {Math.round(incident.aiConfidence * 100)}%
                    </div>
                  </div>

                  {/* Affected Services list */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-apple-textTertiary mr-1">Affected:</span>
                    {incident.affectedServices.map((svc) => (
                      <span
                        key={svc}
                        className="px-2 py-0.5 rounded bg-white/[0.04] text-white/70 font-mono text-[10px] border border-white/[0.06]"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                  <Link
                    href={`/incidents/${incident.code}`}
                    className="px-4 py-2 rounded-xl bg-apple-accent hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm group"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredIncidents.length === 0 && (
          <div className="py-12 text-center text-apple-textTertiary bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            No matching incidents found.
          </div>
        )}
      </div>
    </div>
  );
}
