"use client";

import React from "react";
import { 
  UserPlus, 
  Building2, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Share2,
  ClipboardList,
  LayoutDashboard,
  Wallet,
  ArrowLeft
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/auth";
import "./worker.css";

export default function WorkerDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const quickLinks = [
    { label: "Overview", icon: LayoutDashboard, path: "/worker/overview", color: "var(--purple)" },
    { label: "Add Invite", icon: UserPlus, path: "/worker/add-invite", color: "var(--blue)" },
    { label: "My Invites", icon: ClipboardList, path: "/worker/invites", color: "var(--green)" },
    { label: "Forms", icon: FileText, path: "/worker/forms", color: "var(--purple)" },
    { label: "Messaging", icon: MessageSquare, path: "/worker/messages", color: "var(--blue)" },
    { label: "Top Up", icon: Wallet, path: "/worker/top-up", color: "var(--orange)" },
    { label: "Share QR", icon: Share2, path: "/worker/share", color: "var(--orange)" },
    { label: "My Profile", icon: Zap, path: "/worker/profile", color: "var(--blue)" },
  ];

  return (
    <div className="worker-dashboard">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill">
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <h1>Hello, {user?.name.split(' ')[0] || 'Worker'}</h1>
            <p>Your outreach is making a difference today!</p>
          </div>
        </div>
        <div className="credit-pill-premium" onClick={() => router.push('/worker/top-up')}>
          <Wallet size={16} />
          <span>{user?.credits || 0} Credits</span>
        </div>
      </header>

      {/* Premium Banner */}
      <div className="premium-banner">
        <div className="banner-content">
          <div className="banner-badge">NEW FEATURE</div>
          <h2>Track Your Eternal Impact</h2>
          <p>Check out your detailed performance metrics in the new Overview section.</p>
          <Button className="btn-banner" onClick={() => router.push('/worker/overview')}>View Analytics</Button>
        </div>
        <div className="banner-illustration">
          <Sparkles size={48} className="sparkle-icon" />
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="quick-access-grid">
        {quickLinks.map((link, index) => (
          <div key={index} className="grid-item" onClick={() => router.push(link.path)}>
            <div className="grid-icon-box" style={{ color: link.color }}>
              <link.icon size={28} />
            </div>
            <span className="grid-label">{link.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
