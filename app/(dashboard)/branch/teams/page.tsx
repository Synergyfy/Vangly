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
import '../branch.css';
import './teams.css';

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
            <button onClick={() => setSelectedTeamId(null)} className="back-btn-pill">
              <ArrowLeft size={16} /> Back to Teams
            </button>
          ) : (
             <button onClick={() => window.history.back()} className="back-btn-pill">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ marginTop: '16px' }}>
            <div className="header-badge">Team Ops</div>
            <h1>{selectedTeam ? selectedTeam.name : "Location Teams"}</h1>
            <p>{selectedTeam ? "Manage team members and outreach forms." : "Organize your outreach workers into focused teams."}</p>
          </div>
        </div>
        {!selectedTeamId && (
          <div className="header-actions">
            <button className="credit-pill-premium" style={{ border: 'none', background: 'var(--branch-blue)', color: 'white' }} onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} /> <span>Create Team</span>
            </button>
          </div>
        )}
      </header>

      {!selectedTeamId ? (
        <div className="dashboard-main-content fade-in">
          <div className="teams-grid-modern" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {teams.map(team => (
              <div key={team.id} className="location-modern-card" onClick={() => setSelectedTeamId(team.id)}>
                <div className="loc-card-header">
                  <div className="loc-icon-bg">
                    <Users size={24} />
                  </div>
                  <div className="loc-title-group">
                    <h3>{team.name}</h3>
                    <span className="loc-status-badge">Active</span>
                  </div>
                  <ChevronRight size={20} style={{ marginLeft: 'auto', color: 'var(--branch-text-tertiary)' }} />
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
              </div>
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

          <div className="tab-content">
            {activeTeamTab === 'members' && (
              <div className="fade-in">
                <div className="section-header">
                  <h2>Team Roster</h2>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="credit-pill-premium" style={{ padding: '0.5rem 1rem' }}>
                      <span>Import</span>
                    </button>
                    <button className="credit-pill-premium" style={{ border: 'none', background: 'var(--branch-blue)', color: 'white', padding: '0.5rem 1rem' }}>
                      <Plus size={16} /> <span>Add Member</span>
                    </button>
                  </div>
                </div>
                <div className="user-list-card-premium" style={{ marginTop: '1rem' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div className="user-avatar-tiny">{m.name[0]}</div>
                              <div>
                                <div style={{ fontWeight: '700', color: 'var(--branch-text-primary)' }}>{m.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--branch-text-tertiary)' }}>{m.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--branch-text-tertiary)', fontWeight: '600' }}>{m.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTeamTab === 'forms' && (
              <div className="fade-in">
                <div className="section-header">
                  <h2>Team Forms</h2>
                  <button className="credit-pill-premium" style={{ border: 'none', background: 'var(--branch-blue)', color: 'white', padding: '0.5rem 1rem' }}>
                    <Plus size={16} /> <span>Create Form</span>
                  </button>
                </div>
                <div className="forms-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {mockForms.map(f => (
                    <div key={f.id} className="form-item-card-premium">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontWeight: '800', fontSize: '1.0625rem', color: 'var(--branch-text-primary)', marginBottom: '0.25rem' }}>{f.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--branch-blue)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.submissions} Submissions</span>
                        </div>
                        <div className="hub-card-icon-box blue" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                           <ChevronRight size={18} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button className="credit-pill-premium" style={{ flex: 1, justifyContent: 'center' }}>
                          <span>Results</span>
                        </button>
                        <button className="credit-pill-premium" style={{ flex: 1, justifyContent: 'center' }}>
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
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
