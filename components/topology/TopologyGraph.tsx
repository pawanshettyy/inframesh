'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Layers,
  Sparkles,
  AlertCircle,
  Activity,
  Cpu,
  Database,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { ServiceNode } from '@/lib/types';
import { formatLatency, formatNumber, formatPercent } from '@/lib/utils';
import { ServiceInspector } from '../inspector/ServiceInspector';

interface TopologyGraphProps {
  services: ServiceNode[];
  highlightPath?: string[];
  focusedServiceId?: string;
  onSelectService?: (service: ServiceNode) => void;
  compact?: boolean;
}

export function TopologyGraph({
  services,
  highlightPath = ['postgres-db', 'payment-service', 'order-service', 'api-gateway'],
  focusedServiceId,
  onSelectService,
  compact = false,
}: TopologyGraphProps) {
  const [zoom, setZoom] = useState(compact ? 0.9 : 1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(
    services.find((s) => s.id === (focusedServiceId || 'payment-service')) || null
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const serviceMap = useMemo(() => {
    const map = new Map<string, ServiceNode>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  // Edges
  const edges = useMemo(() => {
    const edgeList: {
      from: ServiceNode;
      to: ServiceNode;
      isIncidentPath: boolean;
    }[] = [];

    services.forEach((source) => {
      source.dependencies.forEach((targetId) => {
        const target = serviceMap.get(targetId);
        if (target) {
          const isIncident =
            highlightPath.includes(source.id) &&
            highlightPath.includes(target.id) &&
            Math.abs(highlightPath.indexOf(source.id) - highlightPath.indexOf(target.id)) === 1;

          edgeList.push({
            from: source,
            to: target,
            isIncidentPath: isIncident,
          });
        }
      });
    });

    return edgeList;
  }, [services, serviceMap, highlightPath]);

  const displayedServices = useMemo(() => {
    return services.filter((s) => {
      if (showCriticalOnly && s.health === 'healthy') return false;
      if (searchFilter && !s.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
      return true;
    });
  }, [services, showCriticalOnly, searchFilter]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleNodeClick = (svc: ServiceNode) => {
    setSelectedService(svc);
    onSelectService?.(svc);
  };

  const resetView = () => {
    setZoom(compact ? 0.9 : 1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#121216] rounded-xl border border-white/[0.08] overflow-hidden select-none shadow-md flex flex-col">
      {/* Top macOS Canvas Toolbar */}
      <div className="px-3 py-2 bg-[#18181E] border-b border-white/[0.08] flex items-center justify-between gap-3 text-xs z-20">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#101014] border border-white/[0.08] rounded-[5px] text-xs">
            <Search className="w-3.5 h-3.5 text-apple-textTertiary" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Find component..."
              className="bg-transparent text-white placeholder-apple-textTertiary text-xs focus:outline-none w-28 sm:w-36"
            />
          </div>

          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`px-2 py-1 rounded-[5px] text-[11px] font-medium transition flex items-center gap-1.5 ${
              showCriticalOnly
                ? 'bg-apple-critical/20 text-apple-critical border border-apple-critical/30'
                : 'text-apple-textSecondary hover:text-white macos-toolbar-item'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Degraded Only</span>
          </button>
        </div>

        {/* Center: Blast radius breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-apple-textTertiary font-mono">
          <span className="text-apple-textSecondary">Root Propagation:</span>
          <span className="text-apple-critical font-bold">PostgreSQL</span>
          <span>→</span>
          <span className="text-apple-critical font-medium">Payment</span>
          <span>→</span>
          <span className="text-apple-degraded font-medium">Order</span>
          <span>→</span>
          <span className="text-apple-degraded">API Gateway</span>
        </div>

        {/* Right: Zoom & Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
            className="p-1 rounded-[5px] macos-toolbar-item text-white/80 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
            className="p-1 rounded-[5px] macos-toolbar-item text-white/80 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1 rounded-[5px] macos-toolbar-item text-white/80 hover:text-white"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 w-full relative overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center bg-[#101014]"
        style={{ minHeight: compact ? '420px' : '560px' }}
      >
        <div
          className="relative transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: '980px',
            height: '640px',
          }}
        >
          {/* Engineering Dot Matrix Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* SVG Dependency Wire Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="incidentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF453A" />
                <stop offset="100%" stopColor="#FF9F0A" />
              </linearGradient>

              <marker id="m-arrow" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="rgba(255,255,255,0.2)" />
              </marker>

              <marker id="m-arrow-crit" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#FF453A" />
              </marker>
            </defs>

            {edges.map((edge, idx) => {
              const x1 = edge.from.x + 85;
              const y1 = edge.from.y + 35;
              const x2 = edge.to.x + 85;
              const y2 = edge.to.y + 35;

              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx1 = x1 + dx * 0.1;
              const cy1 = y1 + dy * 0.6;
              const cx2 = x2 - dx * 0.1;
              const cy2 = y2 - dy * 0.6;

              const pathStr = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

              return (
                <g key={`topo-e-${edge.from.id}-${edge.to.id}-${idx}`}>
                  {edge.isIncidentPath && (
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="#FF453A"
                      strokeWidth="5"
                      strokeOpacity="0.3"
                      className="filter blur-[1px]"
                    />
                  )}
                  <path
                    d={pathStr}
                    fill="none"
                    stroke={edge.isIncidentPath ? 'url(#incidentGrad)' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={edge.isIncidentPath ? 2 : 1}
                    className={edge.isIncidentPath ? 'animate-edge-flow' : ''}
                    markerEnd={edge.isIncidentPath ? 'url(#m-arrow-crit)' : 'url(#m-arrow)'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Component Nodes */}
          {displayedServices.map((svc) => {
            const isSelected = selectedService?.id === svc.id;
            const isCritical = svc.health === 'critical';
            const isDegraded = svc.health === 'degraded';
            const isRoot = svc.id === 'postgres-db';

            return (
              <div
                key={svc.id}
                onClick={() => handleNodeClick(svc)}
                className={`absolute w-44 rounded-lg cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'ring-2 ring-apple-accent shadow-2xl z-30 scale-105'
                    : isCritical
                    ? 'ring-1 ring-apple-critical/60 shadow-lg z-20 hover:scale-102'
                    : isDegraded
                    ? 'ring-1 ring-apple-degraded/50 z-10 hover:scale-102'
                    : 'hover:ring-1 hover:ring-white/20 z-10'
                }`}
                style={{
                  left: `${svc.x}px`,
                  top: `${svc.y}px`,
                }}
              >
                {/* Node Surface */}
                <div className="bg-[#1C1C22] border border-white/[0.08] rounded-lg p-2 text-xs shadow-sm">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical
                            ? 'bg-apple-critical animate-pulse'
                            : isDegraded
                            ? 'bg-apple-degraded'
                            : 'bg-apple-success'
                        }`}
                      />
                      <span className="font-semibold text-white truncate max-w-[95px] text-[11px]">
                        {svc.name}
                      </span>
                    </div>

                    {isRoot ? (
                      <span className="px-1 py-0.2 rounded bg-apple-critical text-white font-mono text-[8px] font-bold">
                        ROOT
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-apple-textTertiary uppercase">
                        {svc.tier}
                      </span>
                    )}
                  </div>

                  {/* Golden Signals Grid */}
                  <div className="grid grid-cols-2 gap-1 pt-1.5 text-[10px] tabular-nums">
                    <div>
                      <div className="text-apple-textTertiary text-[9px]">P95 Latency</div>
                      <div
                        className={`font-mono font-semibold ${
                          svc.p95LatencyMs > 1000
                            ? 'text-apple-critical'
                            : svc.p95LatencyMs > 300
                            ? 'text-apple-degraded'
                            : 'text-white/90'
                        }`}
                      >
                        {formatLatency(svc.p95LatencyMs)}
                      </div>
                    </div>

                    <div>
                      <div className="text-apple-textTertiary text-[9px]">Throughput</div>
                      <div className="font-mono text-white/90 font-medium">
                        {formatNumber(svc.rps)} <span className="text-[8px] text-apple-textTertiary">rps</span>
                      </div>
                    </div>
                  </div>

                  {/* DB Pool or Error Rate */}
                  <div className="mt-1 pt-1 border-t border-white/[0.04] flex items-center justify-between text-[9px] tabular-nums">
                    <span className="text-apple-textTertiary">
                      {svc.dbPoolUtilization !== undefined ? 'Pool Util:' : 'Error Rate:'}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        (svc.dbPoolUtilization ?? 0) > 80 || svc.errorRate > 1.0
                          ? 'text-apple-critical'
                          : 'text-apple-success'
                      }`}
                    >
                      {svc.dbPoolUtilization !== undefined
                        ? `${svc.dbPoolUtilization}%`
                        : formatPercent(svc.errorRate)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Inspector */}
      {selectedService && (
        <ServiceInspector
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSelectService={(serviceId) => {
            const found = services.find((s) => s.id === serviceId);
            if (found) setSelectedService(found);
          }}
        />
      )}
    </div>
  );
}
