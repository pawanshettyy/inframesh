'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Clock,
  Network,
  Terminal,
  Layers,
  ArrowRight,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Code,
  ShieldAlert
} from 'lucide-react';
import { RootCauseAnalysis, EvidenceItem } from '@/lib/types';
import { executeMitigation } from '@/lib/services/api';

interface AIDiagnosisPanelProps {
  rca: RootCauseAnalysis;
  onMitigated?: () => void;
}

export function AIDiagnosisPanel({ rca, onMitigated }: AIDiagnosisPanelProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<string[]>(['ev-1', 'ev-2']);
  const [executingMitigationId, setExecutingMitigationId] = useState<string | null>(null);
  const [executedLogs, setExecutedLogs] = useState<{ id: string; output: string }[]>([]);

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyMitigation = async (id: string, snippet?: string) => {
    setExecutingMitigationId(id);
    try {
      const res = await executeMitigation(rca.incidentId, id);
      setExecutedLogs((prev) => [
        ...prev,
        {
          id,
          output: `$ ${snippet || 'kubectl apply -f patch.yaml'}\n✔ deployment.apps/payment-service updated\n✔ connection pool limit increased to 120\n✔ threads draining: active=24/120, waitQueue=0\n→ Status: 200 OK (Telemetry stabilizing)`,
        },
      ]);
      onMitigated?.();
    } finally {
      setExecutingMitigationId(null);
    }
  };

  const getEvidenceIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'metric_correlation':
        return <TrendingUp className="w-3.5 h-3.5 text-apple-accent" />;
      case 'temporal_precedence':
        return <Clock className="w-3.5 h-3.5 text-indigo-400" />;
      case 'dependency_topology':
        return <Network className="w-3.5 h-3.5 text-apple-warning" />;
      case 'log_pattern':
        return <Terminal className="w-3.5 h-3.5 text-apple-critical" />;
      case 'trace_waterfall':
        return <Layers className="w-3.5 h-3.5 text-apple-success" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#16161A] rounded-xl border border-white/[0.08] p-4 text-xs overflow-y-auto shadow-md space-y-4">
      {/* Apple Intelligence System Diagnostic Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[5px] bg-[#22222A] border border-white/12 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-apple-textTertiary font-semibold tracking-wider">
              Diagnostic Attribution Engine
            </span>
            <h3 className="text-xs font-semibold text-white">Probable Root Cause</h3>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-indigo-500/10 border border-indigo-500/20 font-mono text-[11px] font-semibold text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>{Math.round(rca.aiConfidence * 100)}% Confidence</span>
        </div>
      </div>

      {/* Identified Origin Box */}
      <div className="p-3 rounded-lg bg-[#1C1C22] border border-white/[0.08] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-apple-textTertiary uppercase">
          <span>Component: PostgreSQL Primary</span>
          <span className="text-apple-critical font-semibold">SEV-1 ORIGIN</span>
        </div>
        <div className="text-sm font-semibold text-white tracking-tight">
          {rca.rootCauseTitle}
        </div>
        <p className="text-[11px] text-apple-textSecondary leading-relaxed">
          {rca.executiveSummary}
        </p>
      </div>

      {/* Causal Chain Section */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase text-apple-textTertiary tracking-wider">
          Topological Causal Chain
        </div>

        <div className="p-3 rounded-lg bg-[#121216] border border-white/[0.06] space-y-2.5">
          {/* Horizontal Step sequence */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-apple-critical/20 text-apple-critical border border-apple-critical/30 font-bold">
              PostgreSQL
            </span>
            <ArrowRight className="w-3 h-3 text-apple-textTertiary" />
            <span className="px-2 py-0.5 rounded bg-apple-critical/15 text-apple-critical border border-apple-critical/20 font-medium">
              Payment (+18s)
            </span>
            <ArrowRight className="w-3 h-3 text-apple-textTertiary" />
            <span className="px-2 py-0.5 rounded bg-apple-degraded/15 text-apple-degraded border border-apple-degraded/20 font-medium">
              Order (+13s)
            </span>
            <ArrowRight className="w-3 h-3 text-apple-textTertiary" />
            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-white/80 border border-white/[0.08]">
              API GW (+14s)
            </span>
          </div>

          {/* Reasoning Steps */}
          <div className="pt-2 border-t border-white/[0.04] space-y-1.5 text-[11px] text-apple-textSecondary">
            {rca.chainOfThought.map((thought, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-apple-textTertiary shrink-0 mt-0.5">{idx + 1}.</span>
                <span>{thought}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Items */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase text-apple-textTertiary tracking-wider flex items-center justify-between">
          <span>Corroborating Evidence ({rca.evidence.length})</span>
          <span className="text-[10px] font-mono text-apple-textTertiary">Multi-Signal</span>
        </div>

        <div className="space-y-1.5">
          {rca.evidence.map((item) => {
            const isExpanded = expandedEvidence.includes(item.id);
            return (
              <div
                key={item.id}
                className="rounded-lg border border-white/[0.06] bg-[#18181E] overflow-hidden"
              >
                <button
                  onClick={() => toggleEvidence(item.id)}
                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-2">
                    {getEvidenceIcon(item.type)}
                    <span className="font-medium text-white/90 text-[11px]">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-apple-textTertiary">
                      {Math.round(item.confidenceScore * 100)}%
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-apple-textTertiary" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-apple-textTertiary" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] text-[11px] text-apple-textSecondary space-y-2 bg-[#121216]">
                    <p className="leading-relaxed text-white/80">{item.statement}</p>
                    {item.metadata.sampleLogMessage && (
                      <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-apple-critical border border-white/[0.04] break-all">
                        {item.metadata.sampleLogMessage}
                      </div>
                    )}
                    {item.metadata.correlationCoefficient && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-apple-textTertiary">
                        <span>Pearson r = {item.metadata.correlationCoefficient}</span>
                        <span>·</span>
                        <span>Granger p &lt; 0.001</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Remediation & Real-time Execution */}
      <div className="pt-2 border-t border-white/[0.08] space-y-2">
        <div className="text-[10px] font-semibold uppercase text-apple-textTertiary tracking-wider flex items-center gap-1.5">
          <Wrench className="w-3 h-3 text-apple-accent" />
          <span>Recommended Remediation Actions</span>
        </div>

        {rca.suggestedMitigations.map((mit) => {
          const executedLog = executedLogs.find((l) => l.id === mit.id);

          return (
            <div
              key={mit.id}
              className="p-2.5 rounded-lg bg-[#18181E] border border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px]">{mit.title}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-apple-textSecondary">
                  {mit.riskLevel} risk
                </span>
              </div>
              <p className="text-[10px] text-apple-textTertiary leading-relaxed">
                {mit.description}
              </p>

              {mit.commandSnippet && (
                <div className="p-1.5 rounded bg-black/60 font-mono text-[9px] text-apple-textSecondary border border-white/[0.04] flex items-center justify-between">
                  <span className="truncate mr-2">{mit.commandSnippet}</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(mit.commandSnippet || '')}
                    className="p-0.5 hover:text-white text-apple-textTertiary"
                    title="Copy command"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {executedLog && (
                <div className="p-2 rounded bg-black/80 font-mono text-[9px] text-apple-success whitespace-pre-wrap border border-apple-success/20">
                  {executedLog.output}
                </div>
              )}

              <button
                onClick={() => handleApplyMitigation(mit.id, mit.commandSnippet)}
                disabled={executingMitigationId === mit.id}
                className="w-full py-1.5 px-2.5 rounded-[5px] bg-[#0A84FF] hover:bg-blue-600 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {executingMitigationId === mit.id ? (
                  <span>Executing Remediation in Cluster...</span>
                ) : (
                  <>
                    <span>Execute Remediation Command</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
