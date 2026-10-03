'use client';

import React, { useState } from 'react';
import { Network, Server, Layers, Filter, Sparkles, AlertOctagon } from 'lucide-react';
import { mockServices } from '@/lib/mock/data';
import { TopologyGraph } from '@/components/topology/TopologyGraph';

export default function TopologyPage() {
  const [activeTier, setActiveTier] = useState<string>('all');

  const filteredServices = mockServices.filter((s) => {
    if (activeTier !== 'all' && s.tier !== activeTier) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">System Service Topology</h1>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 font-mono text-xs">
              24 Nodes · 38 Edges
            </span>
          </div>
          <p className="text-xs text-apple-textTertiary mt-0.5">
            Distributed microservice dependency graph with real-time traffic packet simulation and incident blast radius tracing.
          </p>
        </div>

        {/* Tier Selector */}
        <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-xs">
          {['all', 'edge', 'application', 'database', 'cache', 'messaging'].map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                activeTier === tier
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-apple-textSecondary hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Main Full-Height Spatial Topology Map Canvas */}
      <div className="h-[calc(100vh-210px)] min-h-[580px] w-full">
        <TopologyGraph
          services={filteredServices}
          highlightPath={['postgres-db', 'payment-service', 'order-service', 'api-gateway']}
          compact={false}
        />
      </div>
    </div>
  );
}
