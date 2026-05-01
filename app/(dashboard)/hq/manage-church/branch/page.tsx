"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Target,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import '../management.css';

function BranchPerformanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchName = searchParams.get('name') || 'Branch';

  // Mock Performance Data
  const stats = [
    { label: 'Total Invites', value: '1,284', change: '+12.5%', isUp: true, icon: Users, color: 'blue' },
    { label: 'Total Attended', value: '842', change: '+8.2%', isUp: true, icon: UserCheck, color: 'green' },
    { label: 'Conversion Rate', value: '65.5%', change: '-2.1%', isUp: false, icon: Target, color: 'purple' },
    { label: 'Avg. Weekly Growth', value: '18%', change: '+4.3%', isUp: true, icon: TrendingUp, color: 'orange' },
  ];

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={() => router.push('/hq/manage-church')} className="back-btn-header">
          <ArrowLeft size={18} /> Back to Network
        </Button>
        <div style={{ marginTop: '16px' }}>
          <div className="branch-badge">Active Branch</div>
          <h1>{branchName} Performance</h1>
          <p>Real-time growth metrics and evangelism conversion data.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <Card key={i} className="stat-card">
            <div className={`stat-icon-box ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
              <div className={`stat-change ${stat.isUp ? 'positive' : 'negative'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{stat.change} this month</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="performance-layout-grid">
        <Card className="chart-placeholder-card main-chart">
          <div className="card-header">
            <h3>Attendance Overview</h3>
            <div className="chart-filters">
              <span className="active">Week</span>
              <span>Month</span>
              <span>Year</span>
            </div>
          </div>
          <div className="visual-indicator">
            <BarChart3 size={48} className="placeholder-icon" />
            <p>Attendance trends visualization showing growth over the selected period.</p>
          </div>
        </Card>

        <Card className="performance-breakdown-card">
          <div className="card-header">
            <h3>Recent Milestones</h3>
          </div>
          <div className="milestone-list">
            {[
              { label: 'Highest Attendance', value: '245 people', date: 'Last Sunday', icon: Calendar },
              { label: 'Most Invites Sent', value: '182 invites', date: '2 days ago', icon: Users },
              { label: 'New Record Conversion', value: '78%', date: 'March 2026', icon: Target },
            ].map((m, i) => (
              <div key={i} className="milestone-item">
                <div className="m-icon"><m.icon size={18} /></div>
                <div className="m-info">
                  <p className="m-label">{m.label}</p>
                  <p className="m-value">{m.value}</p>
                </div>
                <span className="m-date">{m.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function BranchPerformancePage() {
  return (
    <Suspense fallback={<div>Loading branch performance...</div>}>
      <BranchPerformanceContent />
    </Suspense>
  );
}
