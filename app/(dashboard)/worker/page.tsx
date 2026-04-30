"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { UserPlus, Church } from 'lucide-react';
import './worker.css';

export default function WorkerDashboard() {
  // Mock data
  const stats = {
    totalInvites: 42,
    attended: 12,
  };

  const conversionRate = Math.round((stats.attended / stats.totalInvites) * 100) || 0;

  return (
    <div className="worker-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Track your evangelism progress</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <h3 className="stat-title">Total Invited</h3>
          <p className="stat-value text-primary">{stats.totalInvites}</p>
        </Card>

        <Card className="stat-card">
          <h3 className="stat-title">Attended Church</h3>
          <p className="stat-value text-success">{stats.attended}</p>
        </Card>

        <Card className="stat-card">
          <h3 className="stat-title">Conversion Rate</h3>
          <p className="stat-value text-accent">{conversionRate}%</p>
        </Card>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <Card>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon bg-primary-light">
                <UserPlus size={18} className="text-primary" />
              </div>
              <div className="activity-details">
                <p className="activity-text">You invited <strong>Sarah Johnson</strong></p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon bg-success-light">
                <Church size={18} className="text-success" />
              </div>
              <div className="activity-details">
                <p className="activity-text"><strong>Michael Brown</strong> attended church!</p>
                <span className="activity-time">Sunday at 9:00 AM</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon bg-primary-light">
                <UserPlus size={18} className="text-primary" />
              </div>
              <div className="activity-details">
                <p className="activity-text">You invited <strong>David Smith</strong></p>
                <span className="activity-time">Last Friday</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
