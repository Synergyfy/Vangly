"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import './hq.css';

export default function HQDashboard() {
  // Mock HQ stats
  const stats = {
    totalBranches: 4,
    totalWorkers: 125,
    totalInvites: 1450,
    totalAttended: 320,
  };

  const branchStats = [
    { id: '1', name: 'HQ Branch (Downtown)', workers: 45, invites: 650, attended: 180 },
    { id: '2', name: 'Northside Branch', workers: 30, invites: 400, attended: 85 },
    { id: '3', name: 'Westend Campus', workers: 25, invites: 250, attended: 40 },
    { id: '4', name: 'Southpark Satellite', workers: 25, invites: 150, attended: 15 },
  ];

  return (
    <div className="hq-dashboard">
      <div className="dashboard-header">
        <h1>Global Dashboard</h1>
        <p>Church-wide evangelism overview</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <h3 className="stat-title">Total Branches</h3>
          <p className="stat-value text-primary">{stats.totalBranches}</p>
        </Card>
        <Card className="stat-card">
          <h3 className="stat-title">Total Workers</h3>
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

      <div className="branch-performance">
        <h2>Branch Performance</h2>
        <Card className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Active Workers</th>
                  <th>Total Invites</th>
                  <th>Total Attended</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {branchStats.map((branch) => {
                  const conversion = Math.round((branch.attended / branch.invites) * 100) || 0;
                  return (
                    <tr key={branch.id}>
                      <td data-label="Branch Name" className="branch-name">{branch.name}</td>
                      <td data-label="Active Workers">{branch.workers}</td>
                      <td data-label="Total Invites">{branch.invites}</td>
                      <td data-label="Total Attended" className="text-success font-medium">{branch.attended}</td>
                      <td data-label="Conversion">
                        <div className="progress-container">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${conversion}%` }}></div>
                          </div>
                          <span className="progress-text">{conversion}%</span>
                        </div>
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
