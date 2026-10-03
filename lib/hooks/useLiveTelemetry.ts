'use client';

import { useState, useEffect, useRef } from 'react';
import { getMetrics, getSystemHealth, getServices } from '../services/api';
import { MetricDataPoint, SystemHealthSummary, ServiceNode } from '../types';
import { getWebSocketUrl } from '../api/client';

export function useLiveTelemetry(refreshIntervalMs: number = 2000) {
  const [metrics, setMetrics] = useState<MetricDataPoint[]>([]);
  const [health, setHealth] = useState<SystemHealthSummary | null>(null);
  const [services, setServices] = useState<ServiceNode[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastTick, setLastTick] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);

  // Initial fetch and regular polling fallback
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [m, h, s] = await Promise.all([
          getMetrics(),
          getSystemHealth(),
          getServices(),
        ]);
        if (isMounted) {
          if (m && m.length > 0) setMetrics(m);
          if (h) setHealth(h);
          if (s && s.length > 0) setServices(s);
          setLastTick(new Date());
        }
      } catch (err) {
        // Silently continue
      }
    }

    loadData();
    const interval = setInterval(loadData, refreshIntervalMs);

    // WebSocket real-time connection
    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'telemetry.updated' && payload.data?.latest) {
            setMetrics((prev) => {
              const updated = [...prev, payload.data.latest];
              return updated.length > 30 ? updated.slice(updated.length - 30) : updated;
            });
            setLastTick(new Date());
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        if (isMounted) setIsConnected(false);
      };
    } catch (e) {}

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [refreshIntervalMs]);

  return {
    metrics,
    health,
    services,
    isConnected,
    lastTick,
  };
}
