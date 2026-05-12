"use client";

import React from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import './layout.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <div className="container">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
