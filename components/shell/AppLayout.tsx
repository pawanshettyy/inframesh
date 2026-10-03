'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity, Zap, Server, Network, Terminal, Radio, FileText, Sliders,
  Search, Bell, ChevronRight, ChevronDown, Clock, Pause, Play, CheckCircle2,
} from 'lucide-react';
import { SpotlightPalette } from './SpotlightPalette';
import { mockIncidents } from '@/lib/mock/data';

const navItems = [
  { href: '/', label: 'Overview', icon: Activity },
  { href: '/incidents', label: 'Incidents', icon: Zap, count: '3' },
  { href: '/services', label: 'Services', icon: Server, count: '24' },
  { href: '/topology', label: 'Topology', icon: Network },
  { href: '/telemetry', label: 'Telemetry', icon: Terminal },
  { href: '/anomalies', label: 'Anomalies', icon: Radio, count: '17' },
  { href: '/simulation', label: 'Simulation', icon: Sliders },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const environments = ['production-us-east-1', 'production-eu-central-1', 'staging-us-east-1'];
const timeRanges = ['Last 5m', 'Last 15m', 'Last 30m', 'Last 1h', 'Last 6h', 'Last 24h'];

function BrandMark() {
  return <div className="brand-mark"><span /><span /><span /></div>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [live, setLive] = useState(true);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [env, setEnv] = useState(environments[0]);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 30m');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((v) => !v);
      }
      if (e.key === 'Escape') setSpotlightOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const current = navItems.find((n) => isActive(n.href))?.label ?? 'Overview';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <div><strong>InframeSH</strong><small>CONTROL PLANE</small></div>
          <span className="badge">v2.4.1</span>
        </div>

        <div style={{ position: 'relative' }}>
          <button type="button" className="environment" style={{ width: 'calc(100% - 24px)', textAlign: 'left' }} onClick={() => setEnvOpen(!envOpen)}>
            <span className="env-dot" />
            <span><small>ENVIRONMENT</small><strong style={{ fontSize: 11 }}>{env}</strong></span>
            <ChevronDown className="icon icon-small" />
          </button>
          {envOpen && (
            <div className="alert-popover" style={{ left: 12, right: 12, width: 'auto', top: 58, zIndex: 30 }}>
              {environments.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="popover-alert"
                  style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer', justifyContent: 'space-between', textAlign: 'left' }}
                  onClick={() => { setEnv(e); setEnvOpen(false); }}
                >
                  <span style={{ font: '500 10px "DM Mono"' }}>{e}</span>
                  {env === e && <CheckCircle2 className="icon icon-small" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="nav-list" aria-label="Primary">
          <div className="nav-label">WORKSPACE</div>
          {navItems.map(({ href, label, icon: Icon, count }) => (
            <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
              <Icon className="icon" />
              <span>{label}</span>
              {count && <em>{count}</em>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="oncall">
            <span className="avatar">AM</span>
            <span><small>ON CALL</small><strong>Alex Morgan</strong></span>
            <span className="badge badge-success">ACTIVE</span>
          </div>
          <div className="system-status"><span><i /> All systems operational</span><small>Updated 12s ago</small></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><BrandMark /><strong>InframeSH</strong></div>
          <div className="breadcrumb">
            <span>Workspace</span><ChevronRight className="icon icon-small" /><strong>{current}</strong>
          </div>

          <div className="top-actions">
            <button type="button" className={`live-control ${live ? '' : 'paused'}`} onClick={() => setLive(!live)} style={{ padding: '0 8px' }}>
              <span className="live-dot" />{live ? 'LIVE' : 'PAUSED'}
              {live ? <Pause className="icon icon-small" /> : <Play className="icon icon-small" />}
            </button>

            <div className="alert-wrap">
              <button type="button" className="time-control" onClick={() => setTimeOpen(!timeOpen)}>
                <Clock className="icon icon-small" /> {timeRange} <ChevronDown className="icon icon-small" />
              </button>
              {timeOpen && (
                <div className="alert-popover" style={{ width: 150 }}>
                  {timeRanges.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="popover-alert"
                      style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer', justifyContent: 'space-between' }}
                      onClick={() => { setTimeRange(r); setTimeOpen(false); }}
                    >
                      <span style={{ fontSize: 11 }}>{r}</span>
                      {timeRange === r && <CheckCircle2 className="icon icon-small" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="search-control" onClick={() => setSpotlightOpen(true)}>
              <Search className="icon icon-small" /><span>Search</span><kbd>⌘ K</kbd>
            </button>

            <div className="alert-wrap">
              <button type="button" className="icon-control" title="Alerts" onClick={() => setAlertsOpen(!alertsOpen)}>
                <Bell className="icon" /><span className="notification">3</span>
              </button>
              {alertsOpen && (
                <div className="alert-popover">
                  <div className="popover-head"><strong>Active alerts</strong><span className="badge badge-danger">3 OPEN</span></div>
                  {mockIncidents.slice(0, 3).map((inc) => (
                    <button
                      key={inc.id}
                      type="button"
                      className="popover-alert"
                      style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => { setAlertsOpen(false); router.push(`/incidents/${inc.code}`); }}
                    >
                      <span className="incident-icon"><Zap className="icon" /></span>
                      <span>
                        <strong style={{ fontSize: 11 }}>{inc.title}</strong>
                        <small>{inc.code} · {inc.startedAt}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mobile-nav">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} className={isActive(href) ? 'active' : ''}
              style={{ flex: '0 0 auto', padding: '11px 10px 9px', fontSize: 10, color: isActive(href) ? 'var(--text)' : 'var(--muted)', borderBottom: `2px solid ${isActive(href) ? 'var(--text)' : 'transparent'}` }}>
              {label}
            </Link>
          ))}
        </div>

        <div className="content">{children}</div>
      </main>

      <SpotlightPalette isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
    </div>
  );
}