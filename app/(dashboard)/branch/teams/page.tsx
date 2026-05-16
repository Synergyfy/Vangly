"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import './groups.css';

export default function ManageTeamsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [teams, setTeams] = useState([
    { id: '1', name: 'Evangelism Team', members: 42, forms: 3, souls: 450, status: 'High', lead: 'Sarah Jenkins' },
    { id: '2', name: 'Youth Outreach', members: 35, forms: 2, souls: 320, status: 'High', lead: 'James Wilson' },
    { id: '3', name: 'Community Care', members: 25, forms: 1, souls: 210, status: 'Medium', lead: 'Grace Oladapo' },
  ]);

  return (
    <div className="hq-dashboard-premium teams-container-v2 animate-premium">
      <header className="dashboard-header-premium" style={{ border: 'none', background: 'transparent', padding: '24px 0' }}>
        <div className="header-left">
          <button className="back-link-premium" onClick={() => router.push('/branch')}>
            <ArrowLeft size={18} /> Back to Hub
          </button>
          
          <div className="badge-premium purple">TEAM OPERATIONS</div>
          <h1>Location Teams</h1>
          <p>Organize your outreach workers into focused, high-impact units.</p>
        </div>

        <div className="header-actions">
          <Button className="btn-premium" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} /> Create New Team
          </Button>
        </div>
      </header>

      <div className="teams-grid-view fade-in">
        <div className="section-actions" style={{ marginBottom: '32px' }}>
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search teams by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="teams-grid-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(team => (
            <Card key={team.id} className="team-main-card" onClick={() => router.push(`/branch/teams/${team.id}`)}>
              <div className="team-card-header">
                <div className="team-icon-box">
                  <Users size={24} />
                </div>
                <div className="team-title-group">
                  <h3>{team.name}</h3>
                  <p>Lead: {team.lead}</p>
                </div>
                <ChevronRight size={20} className="text-tertiary" />
              </div>
              
              <div className="team-card-stats">
                <div className="t-stat">
                  <span className="label">Members</span>
                  <span className="value">{team.members}</span>
                </div>
                <div className="t-stat">
                  <span className="label">Souls</span>
                  <span className="value">{team.souls}</span>
                </div>
                <div className="t-stat">
                  <span className="label">Activity</span>
                  <span className={`value activity-${team.status.toLowerCase()}`}>{team.status}</span>
                </div>
              </div>

              <div className="team-card-footer">
                 <div className="admin-info">{team.forms} Forms Assigned</div>
                 <div className="footer-actions">
                    <button className="icon-action" onClick={(e) => { e.stopPropagation(); }}><Settings size={14} /></button>
                    <button className="icon-action" onClick={(e) => { e.stopPropagation(); }}><MessageSquare size={14} /></button>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Team">
        <div className="form-stack-premium">
          <Input label="Team Name" placeholder="e.g. West Campus Outreach" />
          <Input label="Team Lead (Optional)" placeholder="Search workers..." />
          <Button className="btn-premium" fullWidth size="lg">Create Team</Button>
        </div>
      </Modal>
    </div>
  );
}
