import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k';
  }
  return num.toLocaleString();
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + 's';
  }
  return Math.round(ms) + 'ms';
}

export function formatPercent(val: number): string {
  return val.toFixed(1) + '%';
}
