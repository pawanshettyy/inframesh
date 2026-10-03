'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Zap,
  Server,
  Activity,
  Terminal,
  Radio,
  FileText,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X,
  Sliders
} from 'lucide-react';
import { mockIncidents, mockServices } from '@/lib/mock/data';

interface SpotlightPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightPalette({ isOpen, onClose }: SpotlightPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredIncidents = mockIncidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(query.toLowerCase()) ||
      inc.code.toLowerCase().includes(query.toLowerCase()) ||
      inc.rootCauseBrief.toLowerCase().includes(query.toLowerCase())
  );

  const filteredServices = mockServices.filter(
    (svc) =>
      svc.name.toLowerCase().includes(query.toLowerCase()) ||
      svc.tier.toLowerCase().includes(query.toLowerCase())
  );

  const navigationActions = [
    { title: 'System Overview Dashboard', path: '/', icon: Activity, category: 'View' },
    { title: 'Live Incident Investigation (INC-2026-0817)', path: '/incidents/INC-2026-0817', icon: Zap, category: 'Investigation' },
    { title: 'Simulation Control Center & Fault Injection', path: '/simulation', icon: Sliders, category: 'Simulation' },
    { title: 'Interactive Service Topology Graph', path: '/topology', icon: Server, category: 'View' },
    { title: 'Unified Telemetry Console (Metrics, Logs, Traces)', path: '/telemetry', icon: Terminal, category: 'View' },
    { title: 'Anomaly Intelligence Radar', path: '/anomalies', icon: Radio, category: 'View' },
    { title: 'Root Cause & Post-Mortem Reports', path: '/reports', icon: FileText, category: 'View' },
  ].filter((act) => act.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-[#14171E]/90 border border-white/15 rounded-2xl shadow-apple-popover overflow-hidden flex flex-col backdrop-blur-spatial specular-top-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-apple-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search: type a service, incident code, trace ID, or action..."
            className="w-full bg-transparent text-sm text-white placeholder-apple-textTertiary focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-white/[0.08] text-white/50 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Views / Actions */}
          {navigationActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-apple-textTertiary uppercase tracking-wider">
                Workspaces & Views
              </div>
              <div className="space-y-0.5 mt-1">
                {navigationActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-left hover:bg-white/[0.08] text-white/90 group transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-apple-textSecondary group-hover:text-apple-accent transition-colors" />
                        <span className="font-medium text-white/90 group-hover:text-white">{item.title}</span>
                      </div>
                      <CornerDownLeft className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Incidents */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-apple-textTertiary uppercase tracking-wider flex items-center justify-between">
                <span>Incidents</span>
                <span className="font-mono text-apple-critical">{filteredIncidents.length} Found</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredIncidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleSelect(`/incidents/${inc.code}`)}
                    className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-left bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-apple-critical shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-apple-critical text-[11px]">{inc.code}</span>
                          <span className="text-white font-medium">{inc.title}</span>
                        </div>
                        <div className="text-[11px] text-apple-textTertiary">
                          AI Root Cause: <span className="text-white/80">{inc.rootCauseBrief}</span> · Confidence {Math.round(inc.aiConfidence * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-apple-accent opacity-0 group-hover:opacity-100 transition">
                      <span>Investigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {filteredServices.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-apple-textTertiary uppercase tracking-wider">
                Services ({filteredServices.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {filteredServices.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleSelect(`/topology?inspect=${svc.id}`)}
                    className="px-3 py-2 rounded-lg flex items-center justify-between text-left hover:bg-white/[0.08] bg-white/[0.02] border border-white/[0.04] group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          svc.health === 'critical'
                            ? 'bg-apple-critical animate-pulse'
                            : svc.health === 'degraded'
                            ? 'bg-apple-degraded'
                            : 'bg-apple-success'
                        }`}
                      />
                      <span className="font-medium text-white/90 group-hover:text-white">{svc.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-apple-textTertiary uppercase">{svc.tier}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredIncidents.length === 0 && filteredServices.length === 0 && navigationActions.length === 0 && (
            <div className="py-8 text-center text-apple-textTertiary">
              No matching intelligence artifacts found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-black/30 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-apple-textTertiary">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Apple Intelligence Semantic Correlation active</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono">↑↓</kbd></span>
            <span>Select <kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono">↵</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
