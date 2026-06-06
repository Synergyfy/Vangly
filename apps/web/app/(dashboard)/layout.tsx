"use client";

import React, { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/services/auth';
import './layout.css';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div
            className="dashboard-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              color: 'var(--text-tertiary)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Loading session…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <div className="container">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
