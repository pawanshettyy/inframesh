'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  HardDrive,
  Database,
  Terminal,
  Activity
} from 'lucide-react';
import { mockServices } from '@/lib/mock/data';
import { formatLatency, formatNumber, formatPercent } from '@/lib/utils';
import { ServiceInspector } from '@/components/inspector/ServiceInspector';
import { ServiceNode } from '@/lib/types';

export default function ServicesPage() {
  const [query, setQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);

  const filteredServices = mockServices.filter((s) => {
    if (selectedTier !== 'all' && s.tier !== selectedTier) return false;
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.id.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Service Directory & Golden Signals</h1>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 font-mono text-xs">
              {mockServices.length} Registered Services
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Real-time telemetry, error rates, compute load, and dependency topologies.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <Search className="w-3.5 h-3.5 text-apple-textTertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search service by name or id..."
              className="bg-transparent text-white placeholder-apple-textTertiary text-xs focus:outline-none w-48"
            />
          </div>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none"
          >
            <option value="all" className="bg-[#161920]">All Tiers</option>
            <option value="edge" className="bg-[#161920]">Edge</option>
            <option value="application" className="bg-[#161920]">Application</option>
            <option value="database" className="bg-[#161920]">Database</option>
            <option value="cache" className="bg-[#161920]">Cache</option>
            <option value="messaging" className="bg-[#161920]">Messaging</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredServices.map((svc) => {
          const isCritical = svc.health === 'critical';
          const isDegraded = svc.health === 'degraded';

          return (
            <div
              key={svc.id}
              onClick={() => setSelectedService(svc)}
              className={`p-4 rounded-2xl liquid-glass-card cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                isCritical
                  ? 'border-apple-critical/30 shadow-critical-glow ring-1 ring-apple-critical/20'
                  : isDegraded
                  ? 'border-apple-degraded/30 ring-1 ring-apple-degraded/20'
                  : ''
              }`}
            >
              {/* Top Row: Name, Health, Tier */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCritical
                        ? 'bg-apple-critical animate-pulse shadow-critical-glow'
                        : isDegraded
                        ? 'bg-apple-degraded'
                        : 'bg-apple-success'
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{svc.name}</h3>
                    <div className="text-[10px] text-apple-textTertiary font-mono">{svc.id}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-apple-textTertiary">
                  {svc.tier}
                </span>
              </div>

              {/* Middle: Golden Signals */}
              <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-white/[0.04]">
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-apple-textTertiary">P95 Latency</div>
                  <div
                    className={`text-xs font-mono font-semibold mt-0.5 ${
                      svc.p95LatencyMs > 1000
                        ? 'text-apple-critical'
                        : svc.p95LatencyMs > 300
                        ? 'text-apple-degraded'
                        : 'text-white'
                    }`}
                  >
                    {formatLatency(svc.p95LatencyMs)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-apple-textTertiary">Throughput</div>
                  <div className="text-xs font-mono font-semibold text-white mt-0.5">
                    {formatNumber(svc.rps)} <span className="text-[9px] text-apple-textTertiary">/m</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-apple-textTertiary">Error Rate</div>
                  <div
                    className={`text-xs font-mono font-semibold mt-0.5 ${
                      svc.errorRate > 1.0 ? 'text-apple-critical' : 'text-apple-success'
                    }`}
                  >
                    {formatPercent(svc.errorRate)}
                  </div>
                </div>
              </div>

              {/* Bottom: CPU, Memory, Replicas, DB Pool if any */}
              <div className="flex items-center justify-between pt-2.5 text-[11px] text-apple-textSecondary">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-apple-textTertiary" /> {svc.cpuPercent}%
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-apple-textTertiary" /> {svc.memoryPercent}%
                  </span>
                  {svc.dbPoolUtilization !== undefined && (
                    <span className="text-apple-critical font-mono font-bold text-[10px]">
                      Pool {svc.dbPoolUtilization}%
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-apple-textTertiary font-mono">
                  {svc.replicas.ready}/{svc.replicas.desired} pods
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Inspector */}
      {selectedService && (
        <ServiceInspector
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSelectService={(serviceId) => {
            const found = mockServices.find((s) => s.id === serviceId);
            if (found) setSelectedService(found);
          }}
        />
      )}
    </div>
  );
}
