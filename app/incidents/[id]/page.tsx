'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Zap,
  ArrowLeft,
  Share2,
  FileText,
  Terminal,
  Activity,
  CheckCircle2,
  Sparkles,
  AlertOctagon,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { mockIncidents, mockServices, mockRCA } from '@/lib/mock/data';
import { IncidentTimeline } from '@/components/investigation/IncidentTimeline';
import { TopologyGraph } from '@/components/topology/TopologyGraph';
import { AIDiagnosisPanel } from '@/components/investigation/AIDiagnosisPanel';

export default function IncidentInvestigationPage() {
  const params = useParams();
  const router = useRouter();
  const incidentCode = (params?.id as string) || 'INC-2026-0817';

  const incident =
    mockIncidents.find((inc) => inc.code === incidentCode || inc.id === incidentCode) ||
    mockIncidents[0];

  const rca = incident.rca || mockRCA;
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      {/* Workspace Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            href="/incidents"
            className="p-1 rounded-[5px] macos-toolbar-item text-apple-textSecondary hover:text-white transition flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Incidents</span>
          </Link>

          <div className="h-3.5 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-apple-critical px-2 py-0.5 rounded bg-apple-critical/15 border border-apple-critical/30">
              {incident.code}
            </span>
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight font-sans">
              {incident.title}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-2.5 py-1 rounded-[5px] macos-toolbar-item text-apple-textSecondary hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <Link
            href="/reports"
            className="px-2.5 py-1 rounded-[5px] macos-toolbar-item text-apple-textSecondary hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export RCA Post-Mortem</span>
          </Link>

          <Link
            href="/telemetry?service=payment-service"
            className="px-3 py-1 rounded-[5px] bg-[#0A84FF] hover:bg-blue-600 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetry Studio</span>
          </Link>
        </div>
      </div>

      {/* Incident Status Meta Strip */}
      <div className="p-3 rounded-lg bg-[#16161A] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="text-apple-textTertiary">Status:</span>
            <span className="px-2 py-0.5 rounded bg-apple-critical/20 text-apple-critical font-medium font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-critical animate-pulse" />
              {incident.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-apple-textTertiary" />
            <span className="text-apple-textTertiary">Duration:</span>
            <span className="font-mono text-white font-medium">{incident.durationString}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-apple-textTertiary">Diagnostic Confidence:</span>
            <span className="font-mono text-indigo-300 font-bold">
              {Math.round(incident.aiConfidence * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-apple-degraded" />
            <span className="text-apple-textTertiary">Blast Radius:</span>
            <span className="font-mono text-apple-degraded font-medium">
              {incident.affectedServices.length} Components Impacted
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-apple-textTertiary text-[11px]">Impacted:</span>
          {incident.affectedServices.map((svc) => (
            <span
              key={svc}
              className="px-1.5 py-0.2 rounded bg-[#101014] text-white/80 font-mono text-[10px] border border-white/[0.06]"
            >
              {svc}
            </span>
          ))}
        </div>
      </div>

      {/* 3-Column Diagnostic Spatial Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch min-h-[640px]">
        {/* Left: Incident Timeline (3 Cols) */}
        <div className="lg:col-span-3 h-full">
          <IncidentTimeline />
        </div>

        {/* Center: Topology Graph (5 Cols) */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <TopologyGraph
            services={mockServices}
            highlightPath={['postgres-db', 'payment-service', 'order-service', 'api-gateway']}
            focusedServiceId="payment-service"
            compact={true}
          />
        </div>

        {/* Right: AI Diagnosis (4 Cols) */}
        <div className="lg:col-span-4 h-full">
          <AIDiagnosisPanel rca={rca} />
        </div>
      </div>

      {/* Bottom Contextual Quick Jumps to Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <Link
          href="/telemetry?service=payment-service&tab=metrics"
          className="p-3 rounded-lg bg-[#16161A] hover:bg-[#1C1C22] border border-white/[0.08] transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-apple-accent" />
            <div>
              <div className="font-semibold text-white text-xs">Metric Correlation Signal</div>
              <div className="text-[10px] text-apple-textTertiary font-mono">r = 0.914 HikariCP vs P95 Latency</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-apple-textTertiary group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/telemetry?service=payment-service&tab=logs"
          className="p-3 rounded-lg bg-[#16161A] hover:bg-[#1C1C22] border border-white/[0.08] transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-apple-critical" />
            <div>
              <div className="font-semibold text-white text-xs">Structured Error Logs (1,420 events)</div>
              <div className="text-[10px] text-apple-textTertiary font-mono">HikariPool-1 connection lease timeout</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-apple-textTertiary group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/telemetry?service=payment-service&tab=traces"
          className="p-3 rounded-lg bg-[#16161A] hover:bg-[#1C1C22] border border-white/[0.08] transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="font-semibold text-white text-xs">Distributed Trace Waterfall</div>
              <div className="text-[10px] text-apple-textTertiary font-mono">92% delay in acquireConnection span</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-apple-textTertiary group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}
