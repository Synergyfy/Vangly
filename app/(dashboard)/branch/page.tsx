"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import './branch.css';

export default function BranchDashboard() {
  const router = useRouter();

  // Mock Branch stats
  const stats = {
    branchName: 'HQ Branch (Downtown)',
    totalWorkers: 45,
    totalInvites: 650,
    totalAttended: 180,
  };

  const workerStats = [
    { id: '1', name: 'Sarah Johnson', invites: 42, attended: 12 },
    { id: '2', name: 'Michael Brown', invites: 38, attended: 15 },
    { id: '3', name: 'David Smith', invites: 25, attended: 5 },
    { id: '4', name: 'Emily Davis', invites: 15, attended: 8 },
    { id: '5', name: 'James Wilson', invites: 10, attended: 2 },
  ];

  const handleViewInvites = (worker: any) => {
    router.push(`/branch/workers/invites?id=${worker.id}&name=${encodeURIComponent(worker.name)}`);
  };

  return (
    <div className="branch-dashboard">
      <div className="dashboard-header">
        <h1>{stats.branchName} Dashboard</h1>
        <p>Monitor your branch's evangelism performance</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <h3 className="stat-title">Active Workers</h3>
          <p className="stat-value text-primary">{stats.totalWorkers}</p>
        </Card>
        <Card className="stat-card">
          <h3 className="stat-title">Total Invited</h3>
          <p className="stat-value text-accent">{stats.totalInvites}</p>
        </Card>
        <Card className="stat-card">
          <h3 className="stat-title">Total Attended</h3>
          <p className="stat-value text-success">{stats.totalAttended}</p>
        </Card>
      </div>

      <div className="worker-performance">
        <h2>Worker Performance Leaderboard</h2>
        <Card className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Worker Name</th>
                  <th>Total Invites</th>
                  <th>Total Attended</th>
                  <th>Conversion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workerStats.map((worker, index) => {
                  const conversion = Math.round((worker.attended / worker.invites) * 100) || 0;
                  return (
                    <tr key={worker.id}>
                      <td data-label="Rank" className="rank-cell">#{index + 1}</td>
                      <td data-label="Worker Name" className="worker-name">{worker.name}</td>
                      <td data-label="Total Invites">{worker.invites}</td>
                      <td data-label="Total Attended" className="text-success font-medium">{worker.attended}</td>
                      <td data-label="Conversion">
                        <div className="progress-container">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${conversion}%` }}></div>
                          </div>
                          <span className="progress-text">{conversion}%</span>
                        </div>
                      </td>
                      <td data-label="Actions">
                        <Button variant="outline" size="sm" onClick={() => handleViewInvites(worker)}>View Invites</Button>
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
