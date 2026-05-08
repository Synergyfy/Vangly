"use client";

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import './users.css';

export default function MonitorUsersPage() {
  const [activeTab, setActiveTab] = useState<'workers' | 'volunteers' | 'members'>('workers');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const users = [
    { id: '1', name: 'Sarah Johnson', type: 'worker', status: 'active', invites: 142, attendance: 42, performance: 92, lastActive: '2 mins ago' },
    { id: '2', name: 'Michael Brown', type: 'worker', status: 'active', invites: 128, attendance: 35, performance: 88, lastActive: '1 hour ago' },
    { id: '3', name: 'Emily Davis', type: 'volunteer', status: 'active', invites: 0, attendance: 12, performance: 75, lastActive: '1 day ago' },
    { id: '4', name: 'David Smith', type: 'member', status: 'active', invites: 0, attendance: 8, performance: 64, lastActive: '3 days ago' },
    { id: '5', name: 'James Wilson', type: 'worker', status: 'inactive', invites: 72, attendance: 12, performance: 45, lastActive: '1 week ago' },
    { id: '6', name: 'Anna White', type: 'volunteer', status: 'active', invites: 0, attendance: 15, performance: 82, lastActive: '5 mins ago' },
  ];

  const filteredUsers = users.filter(u => 
    (activeTab === 'workers' ? u.type === 'worker' : 
     activeTab === 'volunteers' ? u.type === 'volunteer' : 
     u.type === 'member') &&
    (statusFilter === 'all' ? true : u.status === statusFilter) &&
    (performanceFilter === 'all' ? true : 
      performanceFilter === 'high' ? u.performance >= 85 :
      performanceFilter === 'mid' ? (u.performance >= 60 && u.performance < 85) :
      u.performance < 60) &&
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerformanceClass = (score: number) => {
    if (score >= 85) return 'high';
    if (score >= 60) return 'mid';
    return 'low';
  };

  return (
    <div className="monitor-users-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Monitor Users</h1>
            <p>Track performance and engagement across all branch roles.</p>
          </div>
          <div className="activity-summary" style={{ display: 'flex', gap: '1rem' }}>
            <Card style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="activity-indicator active" />
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>12 Online Now</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="performance-overview" style={{ marginTop: '2rem' }}>
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Workers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>45</div>
            <span style={{ fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600 }}>+4 this week</span>
          </div>
        </Card>
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Volunteers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>128</div>
            <span style={{ fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600 }}>+12% vs last month</span>
          </div>
        </Card>
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg. Engagement</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>78%</div>
            <span style={{ fontSize: '0.875rem', color: 'var(--blue)', fontWeight: 600 }}>Stable</span>
          </div>
        </Card>
      </div>

      <div className="monitor-tabs">
        <div className={`monitor-tab ${activeTab === 'workers' ? 'active' : ''}`} onClick={() => setActiveTab('workers')}>Workers</div>
        <div className={`monitor-tab ${activeTab === 'volunteers' ? 'active' : ''}`} onClick={() => setActiveTab('volunteers')}>Volunteers</div>
        <div className={`monitor-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</div>
      </div>

      <Card className="management-filter-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 3rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Button 
              variant="outline" 
              style={{ gap: '0.5rem' }} 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={18} />
              Filters
              {(statusFilter !== 'all' || performanceFilter !== 'all') && (
                <span style={{ width: '8px', height: '8px', background: 'var(--blue)', borderRadius: '50%' }} />
              )}
            </Button>

            {isFilterOpen && (
              <div className="filter-dropdown fade-in">
                <div className="filter-section">
                  <div className="filter-label">Status</div>
                  <div className="filter-options">
                    {['all', 'active', 'inactive'].map(s => (
                      <button 
                        key={s} 
                        className={`filter-option ${statusFilter === s ? 'active' : ''}`}
                        onClick={() => setStatusFilter(s as any)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-section">
                  <div className="filter-label">Performance</div>
                  <div className="filter-options">
                    {['all', 'high', 'mid', 'low'].map(p => (
                      <button 
                        key={p} 
                        className={`filter-option ${performanceFilter === p ? 'active' : ''}`}
                        onClick={() => setPerformanceFilter(p as any)}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <button 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)', background: 'none', border: 'none', textAlign: 'center' }}
                    onClick={() => {
                      setStatusFilter('all');
                      setPerformanceFilter('all');
                      setIsFilterOpen(false);
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-secondary)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              <th style={{ padding: '1.25rem 1.5rem' }}>User</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Activity Status</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Metrics</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Performance</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                      <span className={`user-status-pill ${user.type}`}>{user.type}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Clock size={14} />
                    {user.lastActive}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="metrics-strip">
                    {user.type === 'worker' && (
                      <>
                        <div className="metric-item">
                          <span className="metric-label">Invites</span>
                          <span className="metric-value">{user.invites}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Attended</span>
                          <span className="metric-value">{user.attendance}</span>
                        </div>
                      </>
                    )}
                    {(user.type === 'volunteer' || user.type === 'member') && (
                      <div className="metric-item">
                        <span className="metric-label">Presence</span>
                        <span className="metric-value">{user.attendance} Days</span>
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div className={`performance-score ${getPerformanceClass(user.performance)}`}>
                    {user.performance}%
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}>
                    <ChevronRight size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* User Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Intelligence"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: 'var(--radius-lg)', 
                background: 'var(--blue-light)', 
                color: 'var(--blue)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.5rem', 
                fontWeight: 700 
              }}>
                {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedUser.name}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className={`user-status-pill ${selectedUser.type}`}>{selectedUser.type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'var(--bg)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    ID: {selectedUser.id}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Card style={{ padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Contact</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>+234 801 234 5678</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--blue)', marginTop: '0.25rem', cursor: 'pointer' }}>Message Now</div>
              </Card>
              <Card style={{ padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Activity</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedUser.lastActive}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.25rem' }}>Online</div>
              </Card>
            </div>

            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} style={{ color: 'var(--blue)' }} /> Performance Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Invite Conversion Rate</span>
                  <span style={{ fontWeight: 700 }}>{selectedUser.performance}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${selectedUser.performance}%`, background: 'var(--blue)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedUser.invites}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Invites</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedUser.attendance}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Attended</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{Math.round(selectedUser.attendance * 1.5)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Points</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button fullWidth variant="outline">Message User</Button>
              <Button fullWidth onClick={() => setIsModalOpen(false)}>Close Intelligence</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
