import type { Metadata } from 'next';
import './globals.css';
import './inframesh-ui.css';
import { AppLayout } from '@/components/shell/AppLayout';

export const metadata: Metadata = {
  title: 'InframeSH — Intelligent Incident Diagnosis for Distributed Systems',
  description:
    'Engineering intelligence and observability platform with automated root-cause diagnosis, service topology, and multi-signal telemetry correlation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}