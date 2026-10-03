'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts';
import { useLiveTelemetry } from '@/lib/hooks/useLiveTelemetry';
import { mockIncidents, mockServices } from '@/lib/mock/data';
import { TopologyGraph } from '@/components/topology/TopologyGraph';

type Metric = 'latency' | 'dbPool' | 'errorRate' | 'throughput';

const metricConfig: Record<Metric, { label: string; key: string; color: string; unit: (v: number) => string }> = {
  latency: { label: 'P95 Latency', key: 'p95Latency', color: '#ff5b52', unit: (v) => `${v}ms` },
  dbPool: { label: 'DB Conn Pool %', key: 'dbConnectionPoolPercent', color: '#7774ff', unit: (v) => `${v}%` },
  errorRate: { label: 'Error Rate %', key: 'errorRate', color: '#f5a623', unit: (v) => `${v}%` },
  throughput: { label: 'RPS Volume', key: 'rps', color: '#369eff', unit: (v) => `${(v / 1000).toFixed(0)}k` },
};

export default function OverviewPage() {
  const { metrics: liveMetrics, services: liveServices, isConnected } = useLiveTelemetry(2000);
  const [metric, setMetric] = useState<Metric>('latency');
  const cfg = metricConfig[metric];

  const metricsData = liveMetrics.length > 0 ? liveMetrics : [];
  const servicesData = liveServices.length > 0 ? liveServices : mockServices;


  return (
    <>
      <section className="page-heading">
        <div>
          <div className="title">Overview</div>
          <p>Production systems at a glance <span>·</span> Last updated just now</p>
        </div>
        <div className="heading-meta">
          <span className="connected" style={{ color: isConnected ? undefined : 'var(--warning)' }}>
            <i /> {isConnected ? 'STREAM CONNECTED' : 'STREAM OFFLINE (MOCK)'}
          </span>
          <span>UTC {new Date().toISOString().slice(11, 19)}</span>
        </div>
      </section>

      <section className="incident-banner">
        <div className="incident-icon"><AlertTriangle className="icon" /></div>
        <div className="incident-copy">
          <div>
            <span className="badge badge-danger">SEV-1</span>
            <strong>Payment Service Latency Degradation</strong>
            <span className="incident-id">INC-2026-0817</span>
          </div>
          <p>Database connection saturation is propagating timeouts from payment-service to order-service and api-gateway</p>
        </div>
        <div className="incident-stats">
          <div><small>Duration</small><strong>8m 31s</strong></div>
          <div><small>Impact</small><strong className="danger-text">3 services</strong></div>
          <div><small>Status</small><strong className="warning-text"><i /> Investigating</strong></div>
        </div>
        <Link href="/incidents/INC-2026-0817" className="investigate-control">
          Investigate <ArrowRight className="icon icon-small" />
        </Link>
      </section>

      <section className="dashboard-grid">
        {/* Fleet health */}
        <div className="card fleet-card">
          <div className="card-head">
            <div><span className="eyebrow">FLEET HEALTH</span><div className="title card-title">System reliability</div></div>
            <span className="badge badge-success"><span className="pulse-dot" /> OPERATIONAL</span>
          </div>
          <div className="fleet-summary">
            <div className="health-score">
              <strong>99.2<span>%</span></strong>
              <small>Uptime SLA (target 99.0%)</small>
              <em>Nominal</em>
            </div>
            <div className="kpi-grid">
              <div className="kpi"><small>Services</small><strong>24</strong><span><i className="ok" /> 21 healthy</span></div>
              <div className="kpi"><small>Incidents</small><strong className="danger-text">3</strong><span>1 Sev-1 · 2 degraded</span></div>
              <div className="kpi"><small>Anomalies (30m)</small><strong className="warning-text">17</strong><span>3 incident clusters</span></div>
              <div className="kpi"><small>Request rate</small><strong>148k</strong><span>req / sec</span></div>
            </div>
          </div>
          <div className="health-bar"><span className="healthy-segment" /><span className="warning-segment" /><span className="danger-segment" /></div>
          <div className="health-legend">
            <span><i className="ok" /> Healthy <strong>21</strong></span>
            <span><i className="warn" /> Degraded <strong>2</strong></span>
            <span><i className="bad" /> Critical <strong>1</strong></span>
          </div>
        </div>

        {/* AI diagnosis */}
        <div className="card ai-card">
          <div className="ai-glow" />
          <div className="card-head">
            <div className="ai-label">
              <span className="ai-icon"><Sparkles className="icon" /></span>
              <div><span className="eyebrow">INFER AI</span><div className="title card-title">Active diagnosis</div></div>
            </div>
            <span className="badge badge-indigo">96% CONFIDENCE</span>
          </div>
          <p className="ai-summary">Connection pool exhaustion in <code>payment-service</code> is causing cascading timeouts upstream.</p>
          <div className="root-cause">
            <span>LIKELY ROOT CAUSE</span>
            <strong>postgres-db connection saturation</strong>
            <small>Correlated across 4 signals · Detected 6m ago</small>
          </div>
          <div className="ai-signals">
            <span><i /> DB pool <strong>97%</strong></span>
            <span><i /> Payment <strong>4.8s</strong></span>
            <span><i /> Order <strong>504</strong></span>
          </div>
          <Link href="/incidents/INC-2026-0817" className="ai-action">
            View full diagnosis <ArrowRight className="icon icon-small" />
          </Link>
        </div>

        {/* Telemetry chart */}
        <div className="card span-12" style={{ padding: 16 }}>
          <div className="card-head" style={{ flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">REAL-TIME TELEMETRY</span>
              <div className="title card-title">Metric correlations</div>
            </div>
            <div className="flex items-center macos-segmented-button">
              {(Object.keys(metricConfig) as Metric[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={`px-2.5 py-1 rounded-[4px] text-[10px] font-medium transition ${metric === m ? 'macos-segmented-item-active' : 'text-[#a1a1a1] hover:text-white'}`}
                >
                  {metricConfig[m].label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 240, width: '100%', marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={cfg.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" stroke="#5c5c68" fontSize={9} tickLine={false} axisLine={{ stroke: '#242424' }} />
                <YAxis stroke="#5c5c68" fontSize={9} tickLine={false} axisLine={false} tickFormatter={cfg.unit} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 6, fontSize: 11, color: '#ededed', fontFamily: 'DM Mono, monospace' }}
                  formatter={(value: any) => [cfg.unit(Number(value)), cfg.label]}
                />
                <ReferenceArea
                  x1="13:12" x2="13:30" strokeOpacity={0.3} fill="#ff5b52" fillOpacity={0.06}
                  label={{ value: 'INC-2026-0817', fill: '#ff5b52', fontSize: 9, position: 'insideTopLeft' }}
                />
                <Area type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={1.8} fill="url(#cGrad)" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents */}
        <div className="card incidents-card span-5">
          <div className="card-head">
            <div><span className="eyebrow">ACTIVE INCIDENTS</span><div className="title card-title">3 require attention</div></div>
            <Link href="/incidents" className="text-control">View all <ArrowRight className="icon icon-small" /></Link>
          </div>
          <div className="incident-list">
            {mockIncidents.slice(0, 3).map((inc, i) => (
              <Link key={inc.id} href={`/incidents/${inc.code}`} className="incident-row">
                <span className={`severity-bar ${i === 0 ? 'critical' : i === 1 ? 'warning' : 'info'}`} />
                <div>
                  <span>
                    <span className={`badge ${i === 0 ? 'badge-danger' : i === 1 ? 'badge-warning' : 'badge-blue'}`}>SEV-{i + 1}</span>
                    <strong>{inc.title}</strong>
                  </span>
                  <small>{inc.code} · {inc.rootCauseBrief}</small>
                </div>
                <ChevronRight className="icon icon-small" />
              </Link>
            ))}
          </div>
        </div>

        {/* Topology (existing graph component) */}
        <div className="span-7 flex flex-col">
          <TopologyGraph
            services={servicesData}
            highlightPath={['postgres-db', 'payment-service', 'order-service', 'api-gateway']}
            compact={true}
          />
        </div>
      </section>
    </>
  );
}