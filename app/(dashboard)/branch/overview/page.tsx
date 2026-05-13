"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  MessageSquare,
  Wallet,
  Settings,
  Plus,
  FileText,
  Building2,
  Layout,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import '../branch.css';

export default function BranchOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- BANNERS ---
  const banners = [
    {
      badge: "TEAMS",
      title: "Structure for Growth",
      desc: "Organize your workforce into powerful units and track their collaborative growth.",
      btnText: "Manage Teams",
      path: "/branch/teams",
      icon: Users
    },
    {
      badge: "FORMS",
      title: "Capture Every Soul",
      desc: "Build location-specific outreach forms and collect high-impact data.",
      btnText: "Create Forms",
      path: "/branch/forms",
      icon: FileText
    },
    {
      badge: "MESSAGING",
      title: "Instant Outreach",
      desc: "Broadcast messages to your entire branch network with instant delivery.",
      btnText: "Send SMS",
      path: "/branch/messages",
      icon: MessageSquare
    },
    {
      badge: "WORKERS",
      title: "Track Your Workforce",
      desc: "Monitor staff and volunteer performance across all your branch units.",
      btnText: "View Workers",
      path: "/branch/workers",
      icon: UserPlus
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const stats = {
    branchName: 'Downtown HQ',
    totalTeams: 8,
    totalMembers: 156,
    totalSubmissions: 1240,
    smsCredits: 45200,
    growth: '+14%',
    conversions: '24%'
  };

  const teamsData = [
    { id: 't1', name: 'Evangelism Team', members: 42, souls: 450, status: 'High' },
    { id: 't2', name: 'Community Care', members: 25, souls: 320, status: 'High' },
    { id: 't3', name: 'Youth Outreach', members: 35, souls: 280, status: 'High' },
  ];

  return (
    <div className="location-dashboard-v3 hq-dashboard-premium hub-v2-container animate-fade-in">
      <header className="mobile-dashboard-header" style={{ border: 'none', background: 'transparent', padding: '24px 20px' }}>
        <div className="header-top">
          <div className="location-badge admin-badge-premium">Location Admin</div>
          <div className="wallet-pill" onClick={() => router.push('/branch/wallet')}>
            <Wallet size={14} /><span>{stats.smsCredits.toLocaleString()}</span>
          </div>
        </div>
        <h1 className="location-title" style={{ fontSize: '32px', marginBottom: '4px' }}>Hello, {user?.name.split(' ')[0] || 'Demo'}</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>Branch growth overview for {stats.branchName}</p>
      </header>

      <main className="dashboard-scroll-area" style={{ padding: '0 20px 100px' }}>
        <div style={{ padding: '24px 0 0' }}>
          {/* Stats Grid Match */}
          <div className="stats-cards-grid" style={{ marginBottom: '32px' }}>
            {[
              { label: 'Outreach Units', value: stats.totalTeams, sub: 'Active Groups', icon: Building2, color: '#a855f7' },
              { label: 'Total Members', value: stats.totalMembers, sub: stats.growth, icon: Users, color: '#3b82f6', trend: true },
              { label: 'Form Submissions', value: stats.totalSubmissions, sub: stats.conversions, icon: FileText, color: '#10b981' },
            ].map((card, i) => (
              <Card key={i} className="stat-card-premium">
                <div className="stat-icon" style={{ backgroundColor: `${card.color}10`, color: card.color }}>
                  <card.icon size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">{card.label}</span>
                  <div className="stat-value-group">
                    <span className="stat-value">{card.value}</span>
                    <span className={`stat-sub ${card.trend ? 'up' : ''}`}>{card.sub}</span>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="stat-card-premium full-width" style={{ marginBottom: '32px' }}>
              <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
                <Wallet size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">SMS Credits</span>
                <div className="stat-value-group">
                  <span className="stat-value">{stats.smsCredits.toLocaleString()}</span>
                  <span className="stat-sub">Available</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Outreach Teams Match */}
          <div className="top-teams-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Top Outreach Teams</h2>
            <div className="top-teams-list">
              {teamsData.map((team, i) => (
                <div key={team.id} className="top-team-item">
                  <div className="team-rank-box">{i + 1}</div>
                  <div className="team-main-info">
                    <h4>{team.name}</h4>
                    <p>{team.members} members • {team.souls} souls</p>
                  </div>
                  <span className="team-status-tag">{team.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner V2 */}
        <section className="banner-v2-purple">
          <div className="banner-v2-content">
            <div className="banner-v2-badge">{banners[currentSlide].badge}</div>
            <h2>{banners[currentSlide].title}</h2>
            <p>{banners[currentSlide].desc}</p>
            <Button className="btn-banner-v2" onClick={() => router.push(banners[currentSlide].path)}>
              {banners[currentSlide].btnText}
            </Button>
          </div>
          <div className="banner-v2-icon">
            {React.createElement(banners[currentSlide].icon, { size: 120, className: "opacity-20", style: { color: 'white' } })}
          </div>
          <div className="slider-indicators" style={{ bottom: '24px', left: '40px', justifyContent: 'flex-start' }}>
            {banners.map((_, i) => (
              <div 
                key={i} 
                className={`indicator ${currentSlide === i ? 'active' : ''}`}
                style={{ background: currentSlide === i ? 'white' : 'rgba(255,255,255,0.3)', width: currentSlide === i ? '24px' : '8px' }}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </section>

        {/* Hub Grid V2 */}
        <section className="hub-grid-v2">
          {[
            { label: 'Overview', icon: Layout, path: '/branch/overview', color: '#a855f7' },
            { label: 'Teams', icon: Users, path: '/branch/teams', color: '#3b82f6' },
            { label: 'Workers', icon: UserPlus, path: '/branch/workers', color: '#a855f7' },
            { label: 'Forms', icon: FileText, path: '/branch/forms', color: '#10b981' },
            { label: 'Messaging', icon: MessageSquare, path: '/branch/messages', color: '#0ea5e9' },
            { label: 'Invitees', icon: Sparkles, path: '/branch/invitees', color: '#f59e0b' },
            { label: 'Wallet', icon: Wallet, path: '/branch/wallet', color: '#ec4899' },
            { label: 'Settings', icon: Settings, path: '/branch/settings', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} className="hub-card-v2" onClick={() => router.push(item.path)}>
              <div className="hub-card-icon-v2">
                <item.icon size={24} style={{ color: item.color }} />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
