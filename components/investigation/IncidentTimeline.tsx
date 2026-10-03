'use client';

import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Database,
  ArrowRight,
  CheckCircle2,
  Server,
  Zap,
  Activity
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  timeOffset: string;
  absoluteTime: string;
  service: string;
  title: string;
  description: string;
  severity: 'critical' | 'degraded' | 'warning' | 'info';
  isRootCauseOrigin?: boolean;
}

interface IncidentTimelineProps {
  onSelectEvent?: (eventId: string) => void;
}

export function IncidentTimeline({ onSelectEvent }: IncidentTimelineProps) {
  const [selectedId, setSelectedId] = useState('t-1');

  const events: TimelineEvent[] = [
    {
      id: 't-1',
      timeOffset: 't + 0s',
      absoluteTime: '13:11:42',
      service: 'PostgreSQL Primary',
      title: 'HikariCP Pool Saturation (97%)',
      description: 'Exclusive row lock held on ledger_entries table. 50/50 worker pool connections exhausted.',
      severity: 'critical',
      isRootCauseOrigin: true,
    },
    {
      id: 't-2',
      timeOffset: 't + 18s',
      absoluteTime: '13:12:00',
      service: 'Payment Service',
      title: 'P95 Latency Degradation (4.82s)',
      description: 'Connection lease timeouts begin. Payment processing threads queued waiting for database connection.',
      severity: 'critical',
    },
    {
      id: 't-3',
      timeOffset: 't + 31s',
      absoluteTime: '13:12:13',
      service: 'Order Service',
      title: 'Timeout Amplification (+31%)',
      description: 'Synchronous POST /v2/charge RPC calls breach 3000ms SLA. Circuit breaker enters HALF_OPEN state.',
      severity: 'degraded',
    },
    {
      id: 't-4',
      timeOffset: 't + 45s',
      absoluteTime: '13:12:27',
      service: 'API Gateway',
      title: 'HTTP 504 Rate Jump (+18%)',
      description: 'Client edge ingress experiences elevated 504 Gateway Timeouts on /v1/checkout/complete.',
      severity: 'degraded',
    },
    {
      id: 't-5',
      timeOffset: 't + 2m',
      absoluteTime: '13:13:45',
      service: 'InframeSH AI',
      title: 'Automated Root Cause Correlation',
      description: 'Multi-signal causal graph converged on PostgreSQL connection pool with 96% AI confidence.',
      severity: 'info',
    },
  ];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectEvent?.(id);
  };

  return (
    <div className="flex flex-col h-full bg-[#121419]/70 backdrop-blur-md rounded-2xl border border-white/[0.08] p-4 text-xs surface-l1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-apple-accent" />
          <span className="font-semibold text-white text-xs">Temporal Incident Timeline</span>
        </div>
        <span className="font-mono text-[10px] text-apple-textTertiary">Window: 13:11 – 13:25</span>
      </div>

      {/* Events List */}
      <div className="relative flex-1 overflow-y-auto mt-3 pr-1 space-y-3">
        {/* Continuous timeline vertical line */}
        <div className="absolute left-[15px] top-2 bottom-4 w-px bg-white/10" />

        {events.map((evt) => {
          const isSelected = selectedId === evt.id;
          return (
            <div
              key={evt.id}
              onClick={() => handleSelect(evt.id)}
              className={`relative pl-8 cursor-pointer group transition-all`}
            >
              {/* Timeline Marker Dot */}
              <div
                className={`absolute left-[9px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  evt.isRootCauseOrigin
                    ? 'bg-apple-critical border-white ring-4 ring-apple-critical/20'
                    : evt.severity === 'critical'
                    ? 'bg-apple-critical border-[#121419]'
                    : evt.severity === 'degraded'
                    ? 'bg-apple-degraded border-[#121419]'
                    : 'bg-apple-accent border-[#121419]'
                } ${isSelected ? 'scale-125 ring-2 ring-apple-accent' : 'group-hover:scale-110'}`}
              />

              {/* Event Card */}
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/20 shadow-apple-card'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-white/90">{evt.timeOffset}</span>
                    <span className="text-apple-textTertiary">({evt.absoluteTime})</span>
                  </div>
                  {evt.isRootCauseOrigin && (
                    <span className="px-1.5 py-0.2 rounded bg-apple-critical/20 text-apple-critical font-bold text-[9px] uppercase tracking-wider">
                      Origin T0
                    </span>
                  )}
                </div>

                {/* Service Tag & Title */}
                <div className="font-medium text-white/90 text-[11px] mb-0.5">{evt.title}</div>
                <div className="text-[10px] text-apple-textTertiary font-mono flex items-center gap-1">
                  <Server className="w-3 h-3" />
                  <span>{evt.service}</span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-apple-textSecondary mt-1 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
