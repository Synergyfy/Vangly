"use client";

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ArrowLeft, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Filter,
  Shield,
  Star,
  CheckCircle,
  MoreVertical,
  Plus,
  ShieldCheck,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import '../branch.css';

export default function BranchWorkersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const [workers, setWorkers] = useState([
    { id: 'w1', name: 'Michael Chen', role: 'Team Lead', team: 'Evangelism Team', performance: '98%', status: 'Active', joined: '2026-01-15' },
    { id: 'w2', name: 'Sarah Jenkins', role: 'Team Lead', team: 'Youth Outreach', performance: '95%', status: 'Active', joined: '2026-02-10' },
    { id: 'w3', name: 'Robert Okoro', role: 'Worker', team: 'Evangelism Team', performance: '88%', status: 'Active', joined: '2026-03-05' },
    { id: 'w4', name: 'Blessing Udoh', role: 'Worker', team: 'Community Care', performance: '92%', status: 'Active', joined: '2026-04-12' },
    { id: 'w5', name: 'James Wilson', role: 'Worker', team: 'Unassigned', performance: 'N/A', status: 'Pending', joined: '2026-05-01' },
  ]);

  const removeWorker = (id: string) => {
    setWorkers(workers.filter(w => w.id !== id));
    setActiveActionId(null);
  };

  return (
    <div className="hq-dashboard-premium animate-premium" style={{ paddingBottom: '100px' }}>
      <header className="dashboard-header-premium" style={{ border: 'none', background: 'transparent', padding: '24px 0' }}>
        <div className="header-left">
          <button className="back-link-premium" onClick={() => router.push('/branch')}>
            <ArrowLeft size={18} /> Back to Hub
          </button>
          
          <div className="badge-premium purple">WORKFORCE MANAGEMENT</div>
          <h1>Location Workers</h1>
          <p>Manage roles, track performance, and assign workers to teams.</p>
        </div>

        <div className="header-actions">
           <Button className="btn-premium" onClick={() => setIsAddWorkerModalOpen(true)}>
              <UserPlus size={18} /> Add New Worker
           </Button>
        </div>
      </header>

      <div className="dashboard-main-content">
        {/* Stats Row */}
        <div className="stats-cards-grid" style={{ marginBottom: '32px' }}>
           {[
             { label: 'Total Workers', value: workers.length, icon: Users, color: '#a855f7' },
             { label: 'Active Now', value: '12', icon: CheckCircle, color: '#10b981' },
             { label: 'Avg Performance', value: '92%', icon: TrendingUp, color: '#3b82f6' },
           ].map((s, i) => (
             <Card key={i} className="stat-card-premium">
                <div className="stat-icon" style={{ background: `${s.color}10`, color: s.color }}>
                   <s.icon size={24} />
                </div>
                <div className="stat-info">
                   <span className="stat-label">{s.label}</span>
                   <span className="stat-value">{s.value}</span>
                </div>
             </Card>
           ))}
        </div>

        <div className="section-actions" style={{ marginBottom: '24px' }}>
           <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search workers by name or team..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <Card className="user-list-card-premium">
          <table className="location-users-table">
            <thead>
              <tr>
                <th>Worker Info</th>
                <th>Role & Team</th>
                <th style={{ textAlign: 'center' }}>Performance</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.team.toLowerCase().includes(searchTerm.toLowerCase())).map(w => (
                <tr key={w.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="user-avatar-tiny" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>{w.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{w.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Joined {w.joined}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <span className="admin-badge-mini purple" style={{ width: 'fit-content' }}>{w.role}</span>
                       <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{w.team}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                     <div style={{ fontWeight: '800', color: '#10b981' }}>{w.performance}</div>
                  </td>
                  <td>
                    <span className={`status-pill ${w.status.toLowerCase()}`} style={{ 
                      fontSize: '11px', 
                      padding: '4px 10px', 
                      borderRadius: '20px',
                      background: w.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                      color: w.status === 'Active' ? '#16a34a' : '#dc2626',
                      fontWeight: '700'
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', position: 'relative' }}>
                    <button className="icon-action" onClick={() => setActiveActionId(activeActionId === w.id ? null : w.id)}>
                      <MoreHorizontal size={18} />
                    </button>
                    {activeActionId === w.id && (
                       <div className="action-dropdown" style={{ display: 'flex', right: 0 }}>
                          <button className="dropdown-item"><ShieldCheck size={14} /> Change Role</button>
                          <button className="dropdown-item text-danger" onClick={() => removeWorker(w.id)}><Trash2 size={14} /> Remove</button>
                       </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal isOpen={isAddWorkerModalOpen} onClose={() => setIsAddWorkerModalOpen(false)} title="Invite New Worker">
         <div className="form-stack-premium">
            <p style={{ fontSize: '14px', color: '#64748b' }}>Send an invitation to join your location's workforce.</p>
            <Input label="Full Name" placeholder="e.g. David Mark" />
            <Input label="Email or Phone" placeholder="e.g. david@example.com" />
            <Button className="btn-premium" fullWidth size="lg">Send Invitation</Button>
         </div>
      </Modal>

      {activeActionId && <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setActiveActionId(null)} />}
    </div>
  );
}
