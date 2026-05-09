"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import '../hq.css';

export default function HQWorkersPage() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for all workers
  const allWorkers = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', role: 'worker', branch: 'HQ Branch', invites: 42, attended: 12 },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', role: 'worker', branch: 'HQ Branch', invites: 38, attended: 15 },
    { id: '3', name: 'Jane Doe', phone: '+1 555 0105', role: 'branch_admin', branch: 'HQ Branch', invites: 0, attended: 0 },
    { id: '4', name: 'David Smith', phone: '+1 555 0103', role: 'worker', branch: 'Northside Branch', invites: 25, attended: 5 },
    { id: '5', name: 'Emily Davis', phone: '+1 555 0104', role: 'worker', branch: 'Westend Campus', invites: 15, attended: 8 },
  ];

  const filteredWorkers = allWorkers.filter(worker => {
    const matchesBranch = selectedBranch === 'all' || worker.branch === selectedBranch;
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         worker.phone.includes(searchTerm);
    return matchesBranch && matchesSearch;
  });

  const handleViewInvites = (worker: any) => {
    router.push(`/hq/workers/invites?id=${worker.id}&name=${encodeURIComponent(worker.name)}`);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div>
          <h1>Church Workers</h1>
          <p>Manage and view performance of workers across all branches.</p>
        </div>
        <Button variant="primary">Export Worker Data</Button>
      </div>

      <Card className="filter-card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <Input 
            label="Search Worker" 
            placeholder="Name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="input-wrapper">
            <label className="input-label">Filter by Branch</label>
            <select 
              className="input-field select-field"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              <option value="HQ Branch">HQ Branch</option>
              <option value="Northside Branch">Northside Branch</option>
              <option value="Westend Campus">Westend Campus</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Role</th>
                <th>Invites</th>
                <th>Attended</th>
                <th>Conversion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => {
                const conversion = worker.invites > 0 ? Math.round((worker.attended / worker.invites) * 100) : 0;
                return (
                  <tr key={worker.id}>
                    <td data-label="Worker Name"><div className="worker-name">{worker.name}</div></td>
                    <td data-label="Phone" className="monospace">{worker.phone}</td>
                    <td data-label="Branch">{worker.branch}</td>
                    <td data-label="Role">
                      <span className={`role-badge role-${worker.role}`}>
                        {worker.role === 'branch_admin' ? 'Branch Admin' : 'Worker'}
                      </span>
                    </td>
                    <td data-label="Invites">{worker.invites}</td>
                    <td data-label="Attended" className="text-success font-medium">{worker.attended}</td>
                    <td data-label="Conversion">
                      <div className="progress-container">
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${conversion}%` }}></div>
                        </div>
                        <span className="progress-text">{conversion}%</span>
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div className="action-btn-container">
                        <Button variant="outline" size="sm" fullWidth onClick={() => handleViewInvites(worker)}>View Invites</Button>
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
  );
}
