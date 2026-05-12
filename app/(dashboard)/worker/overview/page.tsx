"use client";

import React from "react";
import { 
  TrendingUp, 
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import "../worker.css";

export default function WorkerOverview() {
  const router = useRouter();
  
  // Mock user data - in real app this comes from auth/context
  const userData = {
    name: "Sarah Jenkins",
    role: "Staff Member",
    location: "Lagos Headquarters",
    credits: 1250,
    stats: {
      totalInvites: 42,
      attended: 18,
      goal: 50
    }
  };

  const pendingForms = [
    { id: 'f1', title: 'Daily Attendance', deadline: 'Today, 6:00 PM', urgency: 'high' },
    { id: 'f2', title: 'Equipment Safety Check', deadline: 'Tomorrow', urgency: 'medium' },
    { id: 'f3', title: 'Weekly Feedback', deadline: 'Friday', urgency: 'low' },
  ];

  const conversionRate = Math.round((userData.stats.attended / userData.stats.totalInvites) * 100) || 0;
  const goalProgress = Math.round((userData.stats.totalInvites / userData.stats.goal) * 100);

  return (
    <div className="worker-dashboard animate-fade-in">
      {/* 1. Personalized Header */}
      <header className="dashboard-header-premium" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <div className="location-context-pill">
               <MapPin size={12} /> {userData.location}
             </div>
             <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.04em', marginTop: '8px' }}>
               Welcome back, {userData.name.split(' ')[0]}!
             </h1>
             <p style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>
               You are logged in as <span style={{ color: 'var(--blue)', fontWeight: '700' }}>{userData.role}</span>
             </p>
          </div>
          <div className="credit-pill-premium" onClick={() => router.push('/worker/top-up')}>
             <Sparkles size={16} />
             <span>{userData.credits.toLocaleString()} Credits</span>
          </div>
        </div>
      </header>

      {/* 2. Quick Action Hub */}
      <section style={{ marginBottom: '40px' }}>
        <h3 className="section-title-premium">Quick Actions</h3>
        <div className="quick-access-grid">
           {[
             { label: 'Forms', icon: FileText, color: 'blue', path: '/worker/forms' },
             { label: 'Invite', icon: UserPlus, color: 'purple', path: '/worker/add-invite' },
             { label: 'Messages', icon: MessageSquare, color: 'green', path: '/worker/messages' },
             { label: 'Scan QR', icon: QrCode, color: 'orange', path: '/worker/share' },
             { label: 'History', icon: Clock, color: 'indigo', path: '/worker/invites' },
             { label: 'Profile', icon: Settings, color: 'gray', path: '/worker/profile' },
           ].map((action, i) => (
             <div key={i} className="grid-item" onClick={() => router.push(action.path)}>
                <div className={`grid-icon-box ${action.color}-theme`}>
                  <action.icon size={24} />
                </div>
                <span className="grid-label">{action.label}</span>
             </div>
           ))}
        </div>
      </section>

      <div className="dashboard-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* 3. Pending Tasks / Forms */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="section-title-premium" style={{ margin: 0 }}>Pending Tasks</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/worker/forms')} style={{ fontSize: '13px' }}>View All</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingForms.map(form => (
              <Card key={form.id} className="task-card-premium" onClick={() => router.push('/worker/forms')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div className={`urgency-dot ${form.urgency}`} />
                   <div style={{ flex: 1 }}>
                     <strong style={{ display: 'block', fontSize: '15px' }}>{form.title}</strong>
                     <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Due: {form.deadline}</span>
                   </div>
                   <ChevronRight size={18} color="var(--border)" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. Impact / Performance */}
        <section>
           <h3 className="section-title-premium">Performance Impact</h3>
           <Card className="impact-goal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ color: 'var(--blue)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Weekly Outreach</h4>
                  <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Almost at your goal!</h2>
                </div>
                <div className="goal-percentage-ring">
                   {goalProgress}%
                </div>
              </div>
              
              <div className="progress-bar-container" style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                 <div style={{ width: `${goalProgress}%`, height: '100%', background: 'var(--blue)', borderRadius: '4px' }} />
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                <strong>{userData.stats.totalInvites}</strong> of <strong>{userData.stats.goal}</strong> invites sent this week.
              </p>

              <div className="mini-stats-row" style={{ display: 'flex', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                 <div>
                   <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Attendance</span>
                   <div style={{ fontSize: '18px', fontWeight: '800' }}>{userData.stats.attended}</div>
                 </div>
                 <div>
                   <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Success Rate</span>
                   <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--green)' }}>{conversionRate}%</div>
                 </div>
              </div>
           </Card>
        </section>
      </div>

      <style jsx>{`
        .section-title-premium {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .location-context-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--blue-subtle);
          color: var(--blue);
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
        }
        .task-card-premium {
          padding: 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border-light);
        }
        .task-card-premium:hover {
          border-color: var(--blue-light);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .urgency-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .urgency-dot.high { background: #EF4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
        .urgency-dot.medium { background: #F59E0B; }
        .urgency-dot.low { background: #10B981; }
        
        .impact-goal-card {
          padding: 24px;
          border-radius: 24px;
          background: white;
          border: 1px solid var(--border-light);
        }
        .goal-percentage-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid var(--blue-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: var(--blue);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .dashboard-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .quick-access-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

// Add missing imports at the top
import { 
  MapPin, 
  FileText, 
  UserPlus, 
  MessageSquare, 
  QrCode, 
  Clock, 
  Settings, 
  ChevronRight 
} from "lucide-react";
