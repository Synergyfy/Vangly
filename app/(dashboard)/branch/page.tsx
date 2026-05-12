"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  Download,
  ClipboardList,
  MessageSquare,
  QrCode,
  Wallet,
  Settings,
  Zap,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import './branch.css';

export default function BranchDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // Mock Location stats
  const stats = {
    branchName: 'Downtown HQ',
    totalWorkers: 45,
    totalInvites: 650,
    totalAttended: 182,
    conversionRate: 28,
  };

  const quickLinks = [
    { label: "Add Worker", icon: UserPlus, path: "/branch/users", color: "var(--blue)" },
    { label: "Invites", icon: ClipboardList, path: "/branch/workers/invites", color: "var(--green)" },
    { label: "Messaging", icon: MessageSquare, path: "/branch/messages", color: "var(--blue)" },
    { label: "QR Code", icon: QrCode, path: "/branch/display-qr", color: "var(--orange)" },
    { label: "Wallet", icon: Wallet, path: "/branch/wallet", color: "var(--green)" },
    { label: "Attendance", icon: CheckCircle2, path: "/branch/attendance", color: "var(--purple)" },
    { label: "Settings", icon: Settings, path: "/branch/settings", color: "var(--text-tertiary)" },
    { label: "Support", icon: Zap, path: "/branch/support", color: "var(--orange)" },
  ];

  const workerStats = [
    { id: '1', name: 'Sarah Johnson', invites: 142, attended: 42, performance: 92 },
    { id: '2', name: 'Michael Brown', invites: 128, attended: 35, performance: 88 },
    { id: '3', name: 'David Smith', invites: 95, attended: 25, performance: 75 },
    { id: '4', name: 'Emily Davis', invites: 85, attended: 18, performance: 64 },
    { id: '5', name: 'James Wilson', invites: 72, attended: 12, performance: 58 },
  ];

  const handleViewInvites = (worker: any) => {
    router.push(`/location/workers/invites?id=${worker.id}&name=${encodeURIComponent(worker.name)}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="location-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Location Admin</div>
          <h1>{stats.branchName}</h1>
          <p>Managing {stats.totalWorkers} active workers</p>
        </div>
        <div className="header-actions">
          <div className="credit-pill-premium" onClick={() => router.push('/location/wallet')}>
            <Wallet size={16} />
            <span>45.2k Cr</span>
          </div>
        </div>
      </header>

      {/* Premium Banner */}
      <div className="premium-banner location-banner">
        <div className="banner-content">
          <div className="banner-badge">LOCAL GROWTH</div>
          <h2>Nurture Your Community</h2>
          <p>Track your top performers and optimize your location's outreach strategy.</p>
          <Button className="btn-banner" onClick={() => {}}>View Weekly Trends</Button>
        </div>
        <div className="banner-illustration">
          <Sparkles size={48} className="sparkle-icon" />
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="quick-access-grid">
        {quickLinks.map((link, index) => (
          <div key={index} className="grid-item" onClick={() => router.push(link.path)}>
            <div className="grid-icon-box" style={{ color: link.color }}>
              <link.icon size={24} />
            </div>
            <span className="grid-label">{link.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-main-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Top Performers</h2>
            <button className="text-link" onClick={() => router.push('/location/users')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          <Card className="table-card-premium">
            <div className="mobile-list-view">
              {workerStats.map((worker) => {
                const conversion = Math.round((worker.attended / worker.invites) * 100) || 0;
                return (
                  <div key={worker.id} className="location-performance-card" onClick={() => handleViewInvites(worker)}>
                    <div className="location-card-top">
                      <div className="location-card-identity">
                        <div className="worker-avatar-sm">{getInitials(worker.name)}</div>
                        <span className="location-card-name">{worker.name}</span>
                      </div>
                      <ChevronRight size={18} className="text-tertiary" />
                    </div>

                    <div className="location-card-stats-grid">
                      <div className="location-card-stat">
                        <span className="label">Invites</span>
                        <span className="value">{worker.invites}</span>
                      </div>
                      <div className="location-card-stat">
                        <span className="label">Attended</span>
                        <span className="value text-success">{worker.attended}</span>
                      </div>
                      <div className="location-card-stat">
                        <span className="label">Success</span>
                        <span className="value">{conversion}%</span>
                      </div>
                    </div>

                    <div className="location-card-progress">
                      <div className="progress-track">
                        <div
                          className="progress-bar"
                          style={{ 
                            width: `${conversion}%`,
                            background: conversion > 30 ? 'var(--green)' : 'var(--blue)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="table-responsive desktop-only">
              <table className="data-table-premium">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Invites</th>
                    <th>Attended</th>
                    <th>Success Rate</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workerStats.map((worker) => {
                    const conversion = Math.round((worker.attended / worker.invites) * 100) || 0;
                    return (
                      <tr key={worker.id}>
                        <td>
                          <div className="location-info-cell">
                            <div className="worker-avatar-sm">{getInitials(worker.name)}</div>
                            <span className="location-name-text">{worker.name}</span>
                          </div>
                        </td>
                        <td>{worker.invites}</td>
                        <td className="text-success font-medium">{worker.attended}</td>
                        <td>
                          <div className="conversion-cell">
                            <div className="mini-progress-bg">
                              <div
                                className="mini-progress-fill"
                                style={{ 
                                  width: `${conversion}%`,
                                  background: conversion > 30 ? 'var(--green)' : 'var(--blue)'
                                }}
                              ></div>
                            </div>
                            <span className="conversion-text">{conversion}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewInvites(worker)}
                          >
                            <ChevronRight size={18} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
