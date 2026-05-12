"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Check, 
  X,
  ShieldCheck,
  Building2,
  Info,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import './groups.css';

export default function ManageTeamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<'members' | 'forms'>('members');

  const [teams, setTeams] = useState([
    { id: '1', name: 'Evangelism Team', members: 42, forms: 3, status: 'Active' },
    { id: '2', name: 'Youth Outreach', members: 35, forms: 2, status: 'Active' },
    { id: '3', name: 'Community Care', members: 25, forms: 1, status: 'Active' },
  ]);

  const [mockMembers] = useState([
    { id: 'm1', name: 'John Doe', phone: '+234 801 234 5678', joined: '2026-05-01' },
    { id: 'm2', name: 'Jane Smith', phone: '+234 801 234 5679', joined: '2026-05-02' },
  ]);

  const [mockForms] = useState([
    { id: 'f1', title: 'Attendance Form', submissions: 120 },
    { id: 'f2', title: 'Feedback Survey', submissions: 45 },
  ]);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          {selectedTeamId ? (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTeamId(null)} className="back-btn-pill">
              <ArrowLeft size={16} /> Back to Teams
            </Button>
          ) : (
             <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="back-btn-pill">
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Team Ops</div>
            <h1>{selectedTeam ? selectedTeam.name : "Location Teams"}</h1>
            <p>{selectedTeam ? "Manage team members and outreach forms." : "Organize your outreach workers into focused teams."}</p>
          </div>
        </div>
        {!selectedTeamId && (
          <div className="header-actions">
            <Button className="btn-premium" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} /> Create Team
            </Button>
          </div>
        )}
      </header>

      {!selectedTeamId ? (
        <div className="dashboard-main-content fade-in">
          <div className="locations-grid-mobile">
            {teams.map(team => (
              <Card key={team.id} className="location-modern-card" onClick={() => setSelectedTeamId(team.id)}>
                <div className="loc-card-header">
                  <div className="loc-icon-bg">
                    <Users size={24} />
                  </div>
                  <div className="loc-title-group">
                    <h3>{team.name}</h3>
                    <span className="loc-status-badge high">{team.status}</span>
                  </div>
                  <ChevronRight size={20} className="text-tertiary" />
                </div>
                <div className="loc-stats-grid">
                  <div className="loc-stat-item">
                    <span className="label">Members</span>
                    <span className="value">{team.members}</span>
                  </div>
                  <div className="loc-stat-item">
                    <span className="label">Forms</span>
                    <span className="value">{team.forms}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="team-dashboard-content fade-in">
          <div className="tab-switcher-premium">
            <button 
              className={`tab-btn ${activeTeamTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTeamTab('members')}
            >
              Members
            </button>
            <button 
              className={`tab-btn ${activeTeamTab === 'forms' ? 'active' : ''}`}
              onClick={() => setActiveTeamTab('forms')}
            >
              Forms
            </button>
          </div>

          <div className="tab-content" style={{ marginTop: '24px' }}>
            {activeTeamTab === 'members' && (
              <div className="fade-in">
                <div className="section-header">
                  <h3>Team Roster</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm">Import</Button>
                    <Button className="btn-premium" size="sm">Add Member</Button>
                  </div>
                </div>
                <Card className="user-list-card-premium" style={{ marginTop: '16px' }}>
                  <table className="location-users-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th style={{ textAlign: 'right' }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockMembers.map(m => (
                        <tr key={m.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="user-avatar-tiny">{m.name[0]}</div>
                              <div>
                                <div style={{ fontWeight: '700' }}>{m.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {activeTeamTab === 'forms' && (
              <div className="fade-in">
                <div className="section-header">
                  <h3>Team Forms</h3>
                  <Button className="btn-premium" size="sm">Create Form</Button>
                </div>
                <div className="forms-grid-mobile" style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                  {mockForms.map(f => (
                    <Card key={f.id} className="form-item-card-premium" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontWeight: '800' }}>{f.title}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: '700' }}>{f.submissions} Submissions</span>
                        </div>
                        <ChevronRight size={20} className="text-tertiary" />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <Button variant="outline" size="sm" fullWidth>Results</Button>
                        <Button variant="outline" size="sm" fullWidth>Edit</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
