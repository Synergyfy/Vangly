"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ArrowLeft, 
  MoreHorizontal, 
  ChevronRight,
  Layout,
  Info,
  Trash2,
  Edit2,
  UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRouter, useParams } from 'next/navigation';
import '../groups.css';

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id;
  
  const [activeTab, setActiveTab] = useState<'teams' | 'forms'>('teams');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // New member form state
  const [newMemberName, setNewMemberName] = useState("");

  // Mock data for the specific team
  const [team] = useState({
    id: teamId,
    name: teamId === '1' ? 'Evangelism Team' : teamId === '2' ? 'Youth Outreach' : 'Community Care',
    members: 42,
    forms: 3,
    souls: 450,
    status: 'High',
    lead: 'Sarah Jenkins'
  });

  const [members, setMembers] = useState([
    { id: 'm1', name: 'John Doe', phone: '+234 801 234 5678', joined: '2026-05-01', role: 'Team Admin', outreach: 45, addedBy: 'Alex Rivera' },
    { id: 'm2', name: 'Jane Smith', phone: '+234 801 234 5679', joined: '2026-05-02', role: 'Worker', outreach: 32, addedBy: 'Sarah Jenkins' },
    { id: 'm3', name: 'David Kalu', phone: '+234 801 234 5680', joined: '2026-05-05', role: 'Worker', outreach: 28, addedBy: 'Sarah Jenkins' },
  ]);

  const handleAddMember = () => {
    if (!newMemberName) return;
    
    const newMember = {
      id: `m${members.length + 1}`,
      name: newMemberName,
      phone: '+234 800 000 0000',
      joined: new Date().toISOString().split('T')[0],
      role: 'Worker',
      outreach: 0,
      addedBy: 'Sarah Jenkins' // Assuming Sarah is the one adding
    };
    
    setMembers([...members, newMember]);
    setNewMemberName("");
    setIsAddMemberModalOpen(false);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setActiveActionId(null);
  };

  const [mockForms] = useState([
    { id: 'f1', title: 'Member Registration', submissions: 120, status: 'Active' },
    { id: 'f2', title: 'Weekly Outreach Feedback', submissions: 45, status: 'Active' },
  ]);

  return (
    <div className="hq-dashboard-premium teams-container-v2 animate-premium">
      <header className="dashboard-header-premium" style={{ border: 'none', background: 'transparent', padding: '24px 0' }}>
        <div className="header-left">
          <button className="back-link-premium" onClick={() => router.push('/branch/teams')}>
            <ArrowLeft size={18} /> Back to Teams
          </button>
          
          <div className="badge-premium purple">TEAM DETAILS</div>
          <h1>{team.name}</h1>
          <p>Manage team members and outreach performance.</p>
        </div>
      </header>

      <div className="team-detail-view fade-in">
        <div className="tab-switcher-premium">
          <button 
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
          <button 
            className="tab-btn"
            onClick={() => router.push('/branch/teams/forms')}
          >
            Forms
          </button>
        </div>

        <div className="team-tab-content">
          <div className="fade-in">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Members ({members.length})</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" size="sm" onClick={() => alert('Import feature coming soon!')}>Import</Button>
                <Button className="btn-premium" size="sm" onClick={() => setIsAddMemberModalOpen(true)}>
                  <Plus size={16} /> Add Member
                </Button>
              </div>
            </div>

            <Card className="user-list-card-premium">
              <table className="location-users-table">
                <thead>
                  <tr>
                    <th>Member Info</th>
                    <th>Role</th>
                    <th>Added By</th>
                    <th style={{ textAlign: 'center' }}>Outreach</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="user-avatar-tiny">{m.name[0]}</div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{m.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge-mini blue" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#3b82f6', fontWeight: '700' }}>
                          {m.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                           <UserCheck size={14} /> {m.addedBy}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>{m.outreach}</td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <button 
                          className="icon-action" 
                          onClick={() => setActiveActionId(activeActionId === m.id ? null : m.id)}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {activeActionId === m.id && (
                          <div className="action-dropdown" style={{ display: 'flex' }}>
                             <button className="dropdown-item" onClick={() => { setActiveActionId(null); alert('Edit Member Role'); }}>
                                <Edit2 size={14} /> Edit Role
                             </button>
                             <button className="dropdown-item text-danger" onClick={() => removeMember(m.id)}>
                                <Trash2 size={14} /> Remove
                             </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Team Member">
        <div className="form-stack-premium">
          <Input 
            label="Worker Name" 
            placeholder="Search by name or phone..." 
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
             <Info size={16} color="#3b82f6" />
             <span style={{ fontSize: '12px', color: '#64748b' }}>Only registered branch workers can be added to teams.</span>
          </div>
          <Button className="btn-premium" fullWidth size="lg" onClick={handleAddMember}>Add to Team</Button>
        </div>
      </Modal>

      {/* Global click handler to close dropdowns */}
      {activeActionId && <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setActiveActionId(null)} />}
    </div>
  );
}
