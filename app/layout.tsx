import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/shell/AppLayout';

export const metadata: Metadata = {
  title: 'InferMesh — Intelligent Incident Diagnosis for Distributed Systems',
  description:
    'Next-generation macOS-style engineering intelligence and observability platform with automated root-cause diagnosis, spatial service topology, and multi-signal telemetry correlation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090C] text-[#F5F5F7] antialiased selection:bg-blue-500/30 selection:text-white min-h-screen">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
