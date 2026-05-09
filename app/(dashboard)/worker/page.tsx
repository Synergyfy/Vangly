"use client";

import React from "react";
import { 
  UserPlus, 
  Church, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Share2
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import "./worker.css";

export default function WorkerDashboard() {
  const router = useRouter();
  const stats = {
    totalInvites: 42,
    attended: 18,
    goal: 50
  };

  const conversionRate = Math.round((stats.attended / stats.totalInvites) * 100) || 0;
  const goalProgress = Math.round((stats.totalInvites / stats.goal) * 100);

  return (
    <div className="worker-dashboard">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Worker Dashboard</h1>
          <p>You're making an eternal impact today. Keep it up!</p>
        </div>
        <Button className="btn-premium" style={{ gap: '0.5rem' }} onClick={() => router.push('/worker/share')}>
          <Share2 size={18} />
          Share Invite Link
        </Button>
      </header>

      <div className="stats-grid">
        <Card className="worker-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--blue-subtle)', color: 'var(--blue)' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <div className="stat-value-large">{stats.totalInvites}</div>
            <div className="stat-label-muted">Total Invites</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> +5 this week
          </div>
        </Card>

        <Card className="worker-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
            <Church size={24} />
          </div>
          <div>
            <div className="stat-value-large">{stats.attended}</div>
            <div className="stat-label-muted">Successfully Attended</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={14} /> Amazing work!
          </div>
        </Card>

        <Card className="worker-stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#FAF5FF', color: 'var(--purple)' }}>
            <Zap size={24} />
          </div>
          <div>
            <div className="stat-value-large">{conversionRate}%</div>
            <div className="stat-label-muted">Conversion Rate</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            Engagement Efficiency
          </div>
        </Card>
      </div>

      <div className="impact-tracker">
        <div className="goal-card">
          <div className="goal-info">
            <h4 style={{ color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Your Weekly Impact Goal</h4>
            <h2>You're almost at your goal!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              You've invited 42 people this week. Just 8 more to reach your target of 50. You can do this!
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <Button variant="outline">View History</Button>
              <Button variant="ghost" style={{ color: 'var(--text-tertiary)' }}>Settings</Button>
            </div>
          </div>
          <div className="goal-progress-container">
            <div className="goal-ring">
              <div className="goal-ring-fill" style={{ borderTopColor: 'var(--blue)', borderRightColor: 'var(--blue)' }} />
              <div className="goal-percentage">{goalProgress}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="access-hub">
        <Card className="access-card" onClick={() => router.push('/worker/forms')}>
          <div className="access-icon-box" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
            <FileText size={28} />
          </div>
          <div className="access-info">
            <h3>Available Forms</h3>
            <p>Access and fill out outreach forms.</p>
          </div>
          <ChevronRight size={20} style={{ marginLeft: 'auto', opacity: 0.3 }} />
        </Card>

        <Card className="access-card" onClick={() => router.push('/worker/messages')}>
          <div className="access-icon-box" style={{ background: '#F5F3FF', color: 'var(--purple)' }}>
            <MessageSquare size={28} />
          </div>
          <div className="access-info">
            <h3>Messaging Center</h3>
            <p>Follow up with your invitees.</p>
          </div>
          <ChevronRight size={20} style={{ marginLeft: 'auto', opacity: 0.3 }} />
        </Card>
      </div>
    </div>
  );
}
