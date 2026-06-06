"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Users,
  MessageSquare,
  FileText,
  Wallet,
  TrendingUp,
  Plus,
  ChevronRight,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal,
  Layout,
  Palette,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/auth";
import "./main.css";

export default function OrganizationOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      badge: "FORMS",
      title: "Dynamic Outreach",
      desc: "Build premium outreach tools and collect high-impact data with our form engine.",
      btnText: "Create Forms",
      path: "/main/forms",
      icon: FileText
    },
    {
      badge: "LOCATIONS",
      title: "Command Your Network",
      desc: "Manage all your physical and digital hubs from a single central command center.",
      btnText: "Manage Locations",
      path: "/main/manage-organization",
      icon: Building2
    },
    {
      badge: "TEAMS",
      title: "Structure for Growth",
      desc: "Organize your workforce into powerful units and track their collaborative growth.",
      btnText: "Manage Teams",
      path: "/main/teams",
      icon: Users
    },
    {
      badge: "MESSAGING",
      title: "High-Impact Outreach",
      desc: "Broadcast personalized messages to your entire network with instant delivery.",
      btnText: "Send SMS",
      path: "/main/messages",
      icon: MessageSquare
    },
    {
      badge: "ANALYTICS",
      title: "Real-time Visibility",
      desc: "Monitor outreach performance and invite metrics across all locations.",
      btnText: "See All Invites",
      path: "/main/all-invites",
      icon: Sparkles
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const stats = [
    { label: "Total Locations", value: "4", icon: Building2, color: "var(--blue)" },
    { label: "Total Teams", value: "12", icon: Users, color: "var(--purple)" },
    { label: "Total Members", value: "125", icon: Sparkles, color: "var(--orange)" },
    { label: "Total Forms", value: "8", icon: FileText, color: "var(--blue)" },
    { label: "Responses", value: "1,450", icon: ClipboardList, color: "var(--green)" },
    { label: "SMS Credits", value: "12,450", icon: Wallet, color: "var(--orange)" },
  ];

  const quickActions = [
    { label: "Create Location", icon: Plus, path: "/main/manage-organization/new", color: "var(--blue)" },
    { label: "Open Messaging", icon: MessageSquare, path: "/main/messages", color: "var(--purple)" },
    { label: "Create Team", icon: Users, path: "/main/manage-organization", color: "var(--orange)" },
    { label: "Create Form", icon: FileText, path: "/main/manage-organization", color: "var(--green)" },
    { label: "Buy Credits", icon: Wallet, path: "/main/wallet", color: "var(--orange)" },
  ];

  const topLocations = [
    { name: "HQ Downtown", submissions: 850, teams: 5, growth: "+12%" },
    { name: "Northside Campus", submissions: 420, teams: 3, growth: "+8%" },
    { name: "Westend Center", submissions: 180, teams: 4, growth: "+5%" },
  ];

  return (
    <div className="hq-dashboard-premium hub-v2-container animate-premium">
      <header className="dashboard-header-premium" style={{ border: 'none', background: 'transparent', padding: '24px 0' }}>
        <div className="header-left">
          <div className="admin-badge-premium">Global Admin</div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Hello, {user?.name.split(' ')[0] || 'Demo'}</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>Real-time organization growth overview</p>
        </div>
      </header>

      <main className="dashboard-main-content" style={{ padding: 0 }}>
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
            { label: 'Overview', icon: Layout, path: '/main/overview', color: '#a855f7' },
            { label: 'Locations', icon: Building2, path: '/main/manage-organization', color: '#3b82f6' },
            { label: 'Teams', icon: Users, path: '/main/teams', color: '#a855f7' },
            { label: 'Forms', icon: FileText, path: '/main/forms', color: '#10b981' },
            { label: 'Messaging', icon: MessageSquare, path: '/main/messages', color: '#0ea5e9' },
            { label: 'Invites', icon: Sparkles, path: '/main/all-invites', color: '#f59e0b' },
            { label: 'Brand', icon: Palette, path: '/main/brand', color: '#ec4899' },
            { label: 'Settings', icon: Settings, path: '/main/settings', color: '#8b5cf6' },
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
