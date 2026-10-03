'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  Copy,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
  Server
} from 'lucide-react';
import { mockRCA, mockIncidents } from '@/lib/mock/data';

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<'rca' | 'reliability' | 'weekly'>('rca');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Intelligence Reports & Post-Mortems</h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono text-xs">
              Apple Intelligence Synthesized
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Automated engineering post-mortems, root cause summaries, and distributed system reliability scorecards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-apple-textSecondary hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-1.5 rounded-lg bg-apple-accent hover:bg-blue-600 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Compiling PDF...' : 'Export Document'}</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-xs w-fit">
        <button
          onClick={() => setSelectedReportType('rca')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedReportType === 'rca'
              ? 'bg-white/[0.12] text-white shadow-sm'
              : 'text-apple-textSecondary hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-apple-critical" />
          <span>Incident RCA (INC-2026-0817)</span>
        </button>

        <button
          onClick={() => setSelectedReportType('reliability')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedReportType === 'reliability'
              ? 'bg-white/[0.12] text-white shadow-sm'
              : 'text-apple-textSecondary hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-apple-accent" />
          <span>Service Reliability & SLOs</span>
        </button>

        <button
          onClick={() => setSelectedReportType('weekly')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedReportType === 'weekly'
              ? 'bg-white/[0.12] text-white shadow-sm'
              : 'text-apple-textSecondary hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Weekly Architecture Health</span>
        </button>
      </div>

      {/* Document-Style Canvas Container */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-2xl liquid-glass border border-white/[0.1] shadow-2xl space-y-6 text-sm text-white/90 leading-relaxed font-sans">
        {selectedReportType === 'rca' && (
          <>
            {/* Document Header */}
            <div className="border-b border-white/[0.1] pb-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-apple-critical px-2 py-0.5 rounded bg-apple-critical/20 border border-apple-critical/30">
                    INC-2026-0817
                  </span>
                  <span className="text-xs text-apple-textTertiary font-mono">SEV-1 CRITICAL</span>
                </div>
                <span className="text-xs text-apple-textTertiary font-mono">Date: 2026-08-21 13:30 UTC</span>
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">
                Incident Post-Mortem: Payment Service Latency Degradation
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-apple-textSecondary pt-1">
                <span>Author: <strong>InferMesh Automated RCA Engine</strong></span>
                <span>·</span>
                <span>Reviewer: <strong>SRE Platform Team</strong></span>
                <span>·</span>
                <span>Status: <strong>Investigating / Stabilizing</strong></span>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-2">
              <h2 className="text-sm uppercase font-semibold tracking-wider text-apple-textTertiary">
                1. Executive Summary
              </h2>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs leading-relaxed space-y-2">
                <p>
                  At 13:11 UTC, the distributed payment processing cluster experienced severe latency degradation with P95 response times climbing from a baseline of 220ms to 4.82s (+4.8×). Upstream cascading timeouts caused Order Service circuit breakers to trip, resulting in elevated HTTP 504 Gateway Timeouts across client checkout routes.
                </p>
                <p className="text-indigo-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    InferMesh AI identified <strong>PostgreSQL Primary HikariCP connection pool saturation (97%)</strong> as the definitive root cause with 96% diagnostic confidence.
                  </span>
                </p>
              </div>
            </div>

            {/* Section 2: Causal Chain Analysis */}
            <div className="space-y-2">
              <h2 className="text-sm uppercase font-semibold tracking-wider text-apple-textTertiary">
                2. Root Cause & Causal Propagation
              </h2>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 text-xs">
                <div className="font-mono text-apple-critical font-bold text-[11px]">
                  IDENTIFIED FAILURE ORIGIN:
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-apple-critical">
                  {mockRCA.chainOfThought.map((thought, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-apple-textTertiary shrink-0">{idx + 1}.</span>
                      <span className="text-white/90">{thought}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Telemetry Evidence Table */}
            <div className="space-y-2">
              <h2 className="text-sm uppercase font-semibold tracking-wider text-apple-textTertiary">
                3. Corroborating Evidence & Telemetry Findings
              </h2>
              <div className="border border-white/[0.08] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.04] text-apple-textTertiary font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Evidence Type</th>
                      <th className="p-2.5">Observed Finding</th>
                      <th className="p-2.5 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {mockRCA.evidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-semibold text-white/90 whitespace-nowrap">{ev.title}</td>
                        <td className="p-2.5 text-apple-textSecondary">{ev.statement}</td>
                        <td className="p-2.5 text-right font-mono text-indigo-300">
                          {Math.round(ev.confidenceScore * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Action Items */}
            <div className="space-y-2">
              <h2 className="text-sm uppercase font-semibold tracking-wider text-apple-textTertiary">
                4. Remediation & Preventative Action Items
              </h2>
              <div className="space-y-2 text-xs">
                {mockRCA.suggestedMitigations.map((mit, i) => (
                  <div key={mit.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-apple-success shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">{mit.title}</div>
                      <div className="text-apple-textSecondary mt-0.5">{mit.description}</div>
                      {mit.commandSnippet && (
                        <div className="mt-1.5 font-mono text-[10px] text-apple-textTertiary p-1.5 rounded bg-black/60 border border-white/[0.04]">
                          {mit.commandSnippet}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedReportType === 'reliability' && (
          <div className="space-y-4 text-xs">
            <h1 className="text-xl font-bold text-white tracking-tight">Service Reliability & SLO Scorecard</h1>
            <p className="text-apple-textSecondary">
              Evaluated against 99.9% target uptime, P95 &lt; 300ms SLA, and &lt; 0.05% error budget limits over the last 30 days.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-apple-textTertiary text-[10px]">Payment Service Error Budget</div>
                <div className="text-2xl font-mono font-bold text-apple-critical mt-1">4.2% Remaining</div>
                <div className="text-apple-critical text-[10px] mt-1">SLA At Risk due to INC-2026-0817</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-apple-textTertiary text-[10px]">Fleet Overall Availability</div>
                <div className="text-2xl font-mono font-bold text-apple-success mt-1">99.94%</div>
                <div className="text-apple-success text-[10px] mt-1">Within SLO target (99.90%)</div>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'weekly' && (
          <div className="space-y-4 text-xs">
            <h1 className="text-xl font-bold text-white tracking-tight">Weekly Architecture Health Summary</h1>
            <p className="text-apple-textSecondary">
              Consolidated anomaly clusters, deployment regressions, and capacity forecasts across 24 distributed services.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="font-semibold text-white">Key Insights (Aug 15 - Aug 21, 2026)</div>
              <ul className="list-disc pl-4 space-y-1 text-apple-textSecondary">
                <li>Total requests processed: <strong>4.28 Billion</strong> with 99.94% overall success rate.</li>
                <li>PostgreSQL connection pool load identified as top vulnerability across high-concurrency peak hours.</li>
                <li>Recommended capacity increase on database worker replicas prior to upcoming marketing campaign.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
