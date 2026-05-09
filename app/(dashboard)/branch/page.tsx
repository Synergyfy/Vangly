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
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import './branch.css';

export default function BranchDashboard() {
  const router = useRouter();

  // Mock Branch stats
  const stats = {
    branchName: 'Downtown HQ',
    totalWorkers: 45,
    totalInvites: 650,
    totalAttended: 182,
    conversionRate: 28,
  };

  const workerStats = [
    { id: '1', name: 'Sarah Johnson', invites: 142, attended: 42, performance: 92 },
    { id: '2', name: 'Michael Brown', invites: 128, attended: 35, performance: 88 },
    { id: '3', name: 'David Smith', invites: 95, attended: 25, performance: 75 },
    { id: '4', name: 'Emily Davis', invites: 85, attended: 18, performance: 64 },
    { id: '5', name: 'James Wilson', invites: 72, attended: 12, performance: 58 },
  ];

  const handleViewInvites = (worker: any) => {
    router.push(`/branch/workers/invites?id=${worker.id}&name=${encodeURIComponent(worker.name)}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="branch-dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{stats.branchName}</h1>
            <p>Managing {stats.totalWorkers} active workers and branch growth.</p>
          </div>
          <Button variant="outline" size="sm" style={{ gap: '0.5rem' }}>
            <Download size={16} />
            Export Data
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="stat-card blue">
          <div className="stat-icon-wrapper">
            <UserPlus size={24} />
          </div>
          <div className="stat-label">Branch Invites</div>
          <div className="stat-value">{stats.totalInvites.toLocaleString()}</div>
          <div className="stat-trend up">
            <ArrowUpRight size={14} />
            <span>12% from last month</span>
          </div>
        </Card>

        <Card className="stat-card green">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-label">Total Attendance</div>
          <div className="stat-value">{stats.totalAttended.toLocaleString()}</div>
          <div className="stat-trend up">
            <ArrowUpRight size={14} />
            <span>8.4% from last month</span>
          </div>
        </Card>

        <Card className="stat-card orange">
          <div className="stat-icon-wrapper">
            <TrendingUp size={24} />
          </div>
          <div className="stat-label">Conversion Rate</div>
          <div className="stat-value">{stats.conversionRate}%</div>
          <div className="stat-trend up">
            <ArrowUpRight size={14} />
            <span>2.1% improvement</span>
          </div>
        </Card>

        <Card className="stat-card purple">
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-label">Group Performance</div>
          <div className="stat-value">High</div>
          <div className="stat-trend up">
            <ArrowUpRight size={14} />
            <span>Top 5% of all branches</span>
          </div>
        </Card>
      </div>

      <div className="worker-performance">
        <div className="section-title-wrapper">
          <h2 className="section-title">Top Performing Workers</h2>
          <Button variant="ghost" size="sm" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            View All Workers
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <Card className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Worker</th>
                  <th>Invites</th>
                  <th>Attended</th>
                  <th>Success Rate</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workerStats.map((worker, index) => {
                  const conversion = Math.round((worker.attended / worker.invites) * 100) || 0;
                  return (
                    <tr key={worker.id}>
                      <td data-label="Rank">
                        <span className="rank-badge">{index + 1}</span>
                      </td>
                      <td data-label="Worker">
                        <div className="worker-info">
                          <div className="worker-avatar">{getInitials(worker.name)}</div>
                          <div style={{ fontWeight: 600 }}>{worker.name}</div>
                        </div>
                      </td>
                      <td data-label="Invites">{worker.invites}</td>
                      <td data-label="Attended">{worker.attended}</td>
                      <td data-label="Success Rate">
                        <div className="progress-bar-wrapper">
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${conversion}%`,
                                background: conversion > 30 ? 'var(--green)' : 'var(--blue)'
                              }} 
                            />
                          </div>
                          <span className="progress-value">{conversion}%</span>
                        </div>
                      </td>
                      <td data-label="Action" style={{ textAlign: 'right' }}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewInvites(worker)}
                          style={{ padding: '0.5rem', color: 'var(--text-tertiary)' }}
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
  );
}
