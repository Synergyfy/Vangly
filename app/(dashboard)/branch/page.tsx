"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  Download,
  ClipboardList,
  MessageSquare,
  QrCode,
  Wallet,
  Settings,
  Zap,
  Sparkles,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import './branch.css';

export default function BranchDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'performance' | 'teams' | 'settings'>('performance');

  const stats = {
    branchName: 'Downtown HQ',
    teams: 6,
    members: 145,
    submissions: 850,
  };

  const performanceStats = [
    { label: 'Total Invites', value: '1,284', change: '+12.5%', isUp: true },
    { label: 'Attended', value: '842', change: '+8.2%', isUp: true },
    { label: 'Conversion', value: '65%', change: '-2.1%', isUp: false },
  ];

  const teams = [
    { id: 't1', name: 'Evangelism Team', members: 42, submissions: 310, performance: 92 },
    { id: 't2', name: 'Youth Outreach', members: 35, submissions: 245, performance: 88 },
    { id: 't3', name: 'Community Care', members: 25, submissions: 120, performance: 75 },
  ];

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Location Hub</div>
          <h1>{stats.branchName}</h1>
          <p>Managing {stats.teams} teams and {stats.members} members.</p>
        </div>
        <div className="header-actions">
           <div className="credit-pill-premium" onClick={() => router.push('/branch/wallet')}>
             <Wallet size={16} />
             <span>45.2k Credits</span>
           </div>
        </div>
      </header>

      <div className="location-management-hub">
        <Card 
          className={`hub-card-premium ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <div className="hub-card-flex">
            <div className="hub-card-icon-box blue">
              <TrendingUp size={20} />
            </div>
            <div>
              <strong>Performance</strong>
              <span>Analytics & Trends</span>
            </div>
          </div>
        </Card>

        <Card 
          className={`hub-card-premium ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <div className="hub-card-flex">
            <div className="hub-card-icon-box green">
              <Users size={20} />
            </div>
            <div>
              <strong>Teams</strong>
              <span>Manage Members</span>
            </div>
          </div>
        </Card>

        <Card 
          className={`hub-card-premium ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="hub-card-flex">
            <div className="hub-card-icon-box grey">
              <Settings size={20} />
            </div>
            <div>
              <strong>Settings</strong>
              <span>Configuration</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-main-content">
        {activeTab === 'performance' && (
          <div className="fade-in">
            <div className="stats-grid-mobile">
              {performanceStats.map((stat, i) => (
                <Card key={i} className="stat-card-premium">
                  <span className="stat-label">{stat.label}</span>
                  <div className="stat-value-group">
                    <span className="stat-value">{stat.value}</span>
                    <span className={`stat-trend ${stat.isUp ? 'up' : 'down'}`}>
                      {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} style={{ transform: 'rotate(90deg)' }} />}
                      {stat.change}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="performance-card-mobile">
               <div className="section-header">
                 <h2>Top Teams</h2>
                 <Button variant="ghost" size="sm" onClick={() => setActiveTab('teams')}>
                   View All <ChevronRight size={14} />
                 </Button>
               </div>
               <div className="performance-list">
                 {teams.map(team => (
                   <div key={team.id} className="performance-item" onClick={() => router.push(`/branch/teams?id=${team.id}`)}>
                     <div>
                       <span className="perf-name">{team.name}</span>
                       <span className="perf-sub">{team.members} Members • {team.submissions} Forms</span>
                     </div>
                     <div className="perf-trend">
                        <TrendingUp size={12} /> {team.performance}%
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="fade-in">
            <div className="section-header">
              <h2>Active Teams</h2>
              <Button className="btn-premium" size="sm" onClick={() => router.push('/branch/teams')}>
                <Plus size={16} /> Create Team
              </Button>
            </div>
            <div className="locations-grid-mobile" style={{ marginTop: '20px' }}>
              {teams.map(team => (
                <Card key={team.id} className="location-modern-card" onClick={() => router.push(`/branch/teams?id=${team.id}`)}>
                  <div className="loc-card-header">
                    <div className="loc-icon-bg">
                      <Users size={24} />
                    </div>
                    <div className="loc-title-group">
                      <h3>{team.name}</h3>
                      <span className="loc-status-badge high">Active</span>
                    </div>
                    <ChevronRight size={20} className="text-tertiary" />
                  </div>
                  <div className="loc-stats-grid">
                    <div className="loc-stat-item">
                      <span className="label">Members</span>
                      <span className="value">{team.members}</span>
                    </div>
                    <div className="loc-stat-item">
                      <span className="label">Submissions</span>
                      <span className="value">{team.submissions}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-in">
            <div className="section-header">
              <h2>Location Settings</h2>
            </div>
            <div className="settings-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
               <Card className="setting-item-premium" onClick={() => router.push('/branch/settings')}>
                  <div className="setting-icon-box">
                    <Settings size={20} />
                  </div>
                  <div className="setting-info">
                    <strong>General Config</strong>
                    <span>Location details and protocols</span>
                  </div>
                  <ChevronRight size={18} />
               </Card>
               <Card className="setting-item-premium" onClick={() => router.push('/branch/display-qr')}>
                  <div className="setting-icon-box">
                    <QrCode size={20} />
                  </div>
                  <div className="setting-info">
                    <strong>Display QR Code</strong>
                    <span>Physical signage for this location</span>
                  </div>
                  <ChevronRight size={18} />
               </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
