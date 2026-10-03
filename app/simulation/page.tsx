'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  Clock,
  Terminal
} from 'lucide-react';
import { triggerFailureInjection, resetSimulationEnvironment } from '@/lib/services/api';

export default function SimulationPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>('database_connection_saturation');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const failureScenarios = [
    {
      id: 'database_connection_saturation',
      title: 'Database Connection Pool Saturation',
      target: 'PostgreSQL Primary (HikariCP)',
      severity: 'critical',
      description:
        'Saturates available worker connection pool (50/50, 97% util) on table ledger_entries. Causes 4.8× query latency, cascading payment timeouts, and upstream HTTP 504 gateway errors.',
      isPrimaryDemo: true,
      chain: ['PostgreSQL (97% Pool)', 'Payment Service (4.82s)', 'Order Service (504)', 'API Gateway (5xx)'],
    },
    {
      id: 'payment_latency',
      title: 'Payment Service Thread Exhaustion',
      target: 'Payment Service / JVM Executor',
      severity: 'degraded',
      description: 'Artificially delays payment processing worker threads by 3500ms, causing Order Service circuit breaker to trip.',
      chain: ['Payment Service', 'Order Service', 'API Gateway'],
    },
    {
      id: 'inventory_timeout',
      title: 'Inventory Stock Reservation Deadlock',
      target: 'Inventory Service / Redis Cache',
      severity: 'degraded',
      description: 'Simulates Redis lock contention on SKU reservations, inducing tail latency spikes on checkout RPC.',
      chain: ['Redis Cluster', 'Inventory Service', 'Order Service'],
    },
    {
      id: 'cpu_pressure_surge',
      title: 'Compute Node CPU Pressure Surge (95%)',
      target: 'Order Service Pod Cluster',
      severity: 'warning',
      description: 'Simulates intensive JSON serialization load driving CPU utilization to 95% across all 10 worker pods.',
      chain: ['Order Service CPU', 'Garbage Collector Pause'],
    },
  ];

  const handleInject = async (scenarioId: string) => {
    setIsExecuting(true);
    setStatusMessage(null);
    try {
      const res = await triggerFailureInjection(scenarioId);
      setActiveScenario(scenarioId);
      setStatusMessage(res.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = async () => {
    setIsExecuting(true);
    try {
      const res = await resetSimulationEnvironment();
      setActiveScenario(null);
      setStatusMessage(res.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Simulation Control Center & Fault Injection
            </h1>
            <span className="px-2 py-0.5 rounded-[4px] bg-indigo-500/15 text-indigo-300 font-mono text-[10px] font-semibold">
              Live Microservice Mesh
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Deliberately inject failure modes across distributed components to test automated anomaly detection and multi-signal RCA accuracy.
          </p>
        </div>

        {/* Global Reset Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-[5px] macos-toolbar-item text-white/90 hover:text-white text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Nominal State</span>
          </button>
        </div>
      </div>

      {/* Status Alert if Active */}
      {statusMessage && (
        <div className="p-3 rounded-lg bg-apple-success/15 border border-apple-success/30 text-apple-success text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {activeScenario && (
            <Link
              href="/incidents/INC-2026-0817"
              className="font-semibold underline hover:text-white flex items-center gap-1 text-[11px]"
            >
              <span>View in Diagnostic Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Active Incident State Banner */}
      <div className="p-4 rounded-xl bg-[#16161A] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-critical animate-pulse" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              {activeScenario ? 'Active Failure Injection State' : 'System Operating in Nominal State'}
            </span>
          </div>
          <p className="text-xs text-apple-textSecondary">
            {activeScenario === 'database_connection_saturation'
              ? 'HikariCP connection pool saturated at 97%. Anomaly detector triggered incident INC-2026-0817 with 96% AI root-cause attribution.'
              : activeScenario
              ? `Simulating fault: ${activeScenario}`
              : 'All 24 microservices operating within nominal baseline bounds.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/incidents/INC-2026-0817"
            className="px-3 py-1.5 rounded-[5px] bg-[#0A84FF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Live Investigation (INC-2026-0817)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {failureScenarios.map((sc) => {
          const isActive = activeScenario === sc.id;

          return (
            <div
              key={sc.id}
              className={`p-4 rounded-xl bg-[#16161A] border transition flex flex-col justify-between space-y-3 ${
                isActive
                  ? 'border-apple-critical/40 ring-1 ring-apple-critical/30 shadow-md'
                  : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sc.severity === 'critical'
                          ? 'bg-apple-critical'
                          : sc.severity === 'degraded'
                          ? 'bg-apple-degraded'
                          : 'bg-apple-warning'
                      }`}
                    />
                    <h3 className="font-semibold text-white text-sm">{sc.title}</h3>
                  </div>

                  {sc.isPrimaryDemo && (
                    <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-indigo-500/30">
                      PRIMARY DEMO
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-apple-textTertiary font-mono">
                  Target Component: <strong className="text-white/80">{sc.target}</strong>
                </div>

                <p className="text-xs text-apple-textSecondary leading-relaxed">
                  {sc.description}
                </p>

                {/* Causal propagation preview */}
                <div className="pt-2 border-t border-white/[0.04]">
                  <div className="text-[10px] text-apple-textTertiary uppercase font-mono mb-1">
                    Expected Failure Propagation
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-apple-textSecondary">
                    {sc.chain.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-1.5 py-0.2 rounded bg-[#101014] text-white/80 border border-white/[0.04]">
                          {step}
                        </span>
                        {idx < sc.chain.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trigger Button */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-apple-textTertiary font-mono">
                  Duration: 180s (Automated recovery)
                </span>

                <button
                  onClick={() => handleInject(sc.id)}
                  disabled={isExecuting}
                  className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-apple-critical text-white shadow-sm'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-white'
                  } disabled:opacity-50`}
                >
                  <Play className="w-3 h-3" />
                  <span>{isActive ? 'Active Fault Injected' : 'Trigger Failure Injection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
