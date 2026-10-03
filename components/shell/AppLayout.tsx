'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Zap,
  Server,
  Network,
  Terminal,
  Radio,
  FileText,
  Search,
  Sliders,
  CheckCircle2,
  ChevronDown,
  Bell,
  Sparkles,
  Command,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { SpotlightPalette } from './SpotlightPalette';
import { cn } from '@/lib/utils';
import { mockSystemHealth, mockIncidents } from '@/lib/mock/data';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 30m');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [envDropdown, setEnvDropdown] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState('production-us-east-1');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F2F2F7] flex flex-col selection:bg-blue-600/30 selection:text-white">
      {/* macOS Window Frame & Unified Titlebar Toolbar */}
      <header className="sticky top-0 z-40 w-full macos-titlebar border-b border-white/[0.08]">
        <div className="max-w-[1780px] mx-auto px-3 sm:px-5 h-12 flex items-center justify-between gap-3">
          
          {/* Left: Window Traffic Dots & System App Identifier */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-1">
              <span className="w-3 h-3 rounded-full traffic-dot-close transition-opacity hover:opacity-80 cursor-pointer" title="Close Window" />
              <span className="w-3 h-3 rounded-full traffic-dot-min transition-opacity hover:opacity-80 cursor-pointer" title="Minimize" />
              <span className="w-3 h-3 rounded-full traffic-dot-max transition-opacity hover:opacity-80 cursor-pointer" title="Zoom" />
            </div>

            <div className="h-3.5 w-px bg-white/10" />

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-[#24242A] border border-white/15 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold tracking-tight text-white font-sans">InferMesh</span>
                <span className="text-[10px] text-apple-textTertiary font-mono">v2.4.1</span>
              </div>
            </Link>

            {/* Environment Selector Dropdown */}
            <div className="relative ml-1 hidden md:block">
              <button
                onClick={() => setEnvDropdown(!envDropdown)}
                className="flex items-center gap-1.5 text-xs text-white/85 macos-toolbar-item px-2 py-1 rounded-[5px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-apple-success" />
                <span className="font-mono text-[11px]">{selectedEnv}</span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>

              {envDropdown && (
                <div className="absolute top-full mt-1 left-0 w-52 py-1 bg-[#1C1C22] border border-white/12 rounded-lg shadow-2xl z-50 text-xs">
                  {['production-us-east-1', 'production-eu-central-1', 'staging-us-east-1'].map((env) => (
                    <button
                      key={env}
                      onClick={() => {
                        setSelectedEnv(env);
                        setEnvDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-white/[0.08] text-white/80 flex items-center justify-between"
                    >
                      <span className="font-mono text-[11px]">{env}</span>
                      {selectedEnv === env && <CheckCircle2 className="w-3.5 h-3.5 text-apple-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: macOS Native Segmented Navigation Tabs */}
          <nav className="hidden lg:flex items-center macos-segmented-button">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-[5px] text-[11px] font-medium transition-all duration-100',
                    isActive
                      ? 'macos-segmented-item-active'
                      : 'text-apple-textSecondary hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-apple-textTertiary')} />
                  <span>{item.label}</span>
                  {item.count && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.2 rounded font-mono font-medium',
                        item.count === '3'
                          ? 'bg-apple-critical/20 text-apple-critical border border-apple-critical/30'
                          : 'bg-white/10 text-white/70'
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Live Stream Toggle, Time Range, ⌘K Spotlight */}
          <div className="flex items-center gap-2">
            {/* Live Streaming Indicator Button */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={cn(
                'hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-[5px] text-[11px] font-medium transition macos-toolbar-item',
                isLiveStreaming ? 'text-apple-success' : 'text-apple-textTertiary'
              )}
              title={isLiveStreaming ? 'Live telemetry streaming' : 'Stream paused'}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', isLiveStreaming ? 'bg-apple-success animate-pulse' : 'bg-apple-textTertiary')} />
              <span className="font-mono text-[10px] uppercase">{isLiveStreaming ? 'Live' : 'Paused'}</span>
            </button>

            {/* Global Time Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs text-white/90 macos-toolbar-item"
              >
                <Sliders className="w-3 h-3 text-apple-textTertiary" />
                <span className="font-mono text-[11px]">{timeRange}</span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>

              {showTimeDropdown && (
                <div className="absolute top-full right-0 mt-1 w-36 py-1 bg-[#1C1C22] border border-white/12 rounded-lg shadow-2xl z-50 text-xs">
                  {['Last 5m', 'Last 15m', 'Last 30m', 'Last 1h', 'Last 6h', 'Last 24h'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setShowTimeDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-white/[0.08] text-white/80 flex items-center justify-between"
                    >
                      <span className="text-[11px]">{range}</span>
                      {timeRange === range && <CheckCircle2 className="w-3.5 h-3.5 text-apple-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spotlight ⌘K Command Search */}
            <button
              onClick={() => setSpotlightOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-[5px] text-xs text-apple-textSecondary hover:text-white macos-toolbar-item group"
            >
              <Search className="w-3.5 h-3.5 text-apple-textTertiary group-hover:text-apple-accent" />
              <span className="hidden md:inline text-[11px]">Search</span>
              <kbd className="flex items-center gap-0.5 text-[9px] bg-white/[0.08] px-1 py-0.2 rounded text-apple-textTertiary font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 rounded-[5px] macos-toolbar-item text-apple-textSecondary hover:text-white relative"
                title="System Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-apple-critical" />
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-1.5 w-80 p-3 bg-[#1C1C22] border border-white/12 rounded-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <span className="text-xs font-semibold text-white">Active Incident Alerts</span>
                    <span className="text-[10px] text-apple-textTertiary font-mono">3 Active</span>
                  </div>
                  <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto">
                    {mockIncidents.slice(0, 3).map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => {
                          setShowNotifications(false);
                          router.push(`/incidents/${inc.code}`);
                        }}
                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-apple-critical font-semibold">{inc.code}</span>
                          <span className="text-[10px] text-apple-textTertiary">{inc.startedAt}</span>
                        </div>
                        <div className="text-xs text-white/90 font-medium mt-0.5 truncate">{inc.title}</div>
                        <div className="text-[10px] text-apple-textTertiary mt-1">
                          Cause: {inc.rootCauseBrief}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile / Tablet Horizontal Navigation Strip */}
        <div className="lg:hidden flex items-center gap-1 px-3 py-1 overflow-x-auto border-t border-white/[0.04] bg-[#141418]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] whitespace-nowrap transition-colors',
                  isActive ? 'bg-white/[0.14] text-white font-medium' : 'text-apple-textSecondary'
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Viewport Canvas */}
      <main className="flex-1 w-full max-w-[1780px] mx-auto px-3 sm:px-5 py-4">
        {children}
      </main>

      {/* Spotlight Command Palette Modal */}
      <SpotlightPalette isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
    </div>
  );
}
