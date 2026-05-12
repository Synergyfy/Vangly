"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Users,
  Send,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  LayoutDashboard,
  UserPlus,
  MessageSquare,
  ClipboardList,
  Wallet,
  Settings,
  FileText,
  Sparkles,
  Palette,
  UserCheck,
  ChevronRight,
  QrCode
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import "./main.css";

export default function MainDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const banners = [
    {
      badge: "LOCATIONS",
      title: "Command Your Network",
      desc: "Manage all your physical and digital hubs from a single central command center.",
      btnText: "Manage Locations",
      path: "/main/manage-organization",
      icon: Building2
    },
    {
      badge: "USERS & GROUPS",
      title: "Streamline Teams",
      desc: "Coordinate your workforce and automate team distributions across all locations.",
      btnText: "Organize Users",
      path: "/main/manage-organization",
      icon: Users
    },
    {
      badge: "FORMS",
      title: "Dynamic Outreach",
      desc: "Build premium outreach tools and collect high-impact data with our form engine.",
      btnText: "Create Forms",
      path: "/main/manage-organization",
      icon: FileText
    },
    {
      badge: "MESSAGING",
      title: "Instant Connection",
      desc: "Broadcast updates and engage your members instantly via SMS and WhatsApp.",
      btnText: "Open Messenger",
      path: "/main/messages",
      icon: MessageSquare
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const [branchStats, setBranchStats] = useState([
    {
      id: "1",
      name: "HQ Location (Downtown)",
      workers: 45,
      invites: 650,
      attended: 180,
      status: "Active",
    },
    {
      id: "2",
      name: "Northside Location",
      workers: 30,
      invites: 400,
      attended: 85,
      status: "Active",
    },
    {
      id: "3",
      name: "Westend Center",
      workers: 25,
      invites: 250,
      attended: 40,
      status: "Warning",
    },
    {
      id: "4",
      name: "Southpark Office",
      workers: 25,
      invites: 150,
      attended: 15,
      status: "Inactive",
    },
  ]);

  const quickLinks = [
    { label: "Overview", icon: LayoutDashboard, path: "/main/overview", color: "var(--purple)" },
    { label: "Locations", icon: Building2, path: "/main/manage-organization", color: "var(--blue)" },
    { label: "Messaging", icon: MessageSquare, path: "/main/messages", color: "var(--blue)" },
    { label: "Brand Identity", icon: Palette, path: "/main/brand", color: "var(--blue)" },
    { label: "Wallet", icon: Wallet, path: "/main/wallet", color: "var(--green)" },
    { label: "Settings", icon: Settings, path: "/main/settings", color: "var(--purple)" },
  ];

  const toggleDropdown = (id: string) => {
    setActiveBranchId(activeBranchId === id ? null : id);
  };

  const handleAction = (action: string, location: any) => {
    setActiveBranchId(null);
    setSelectedBranch(location);

    switch (action) {
      case "view":
        router.push(`/main/manage-organization/location?id=${location.id}`);
        break;
      case "edit":
        setIsEditModalOpen(true);
        break;
      case "open":
        window.open(`https://vangly.com/f/${location.id}`, "_blank");
        break;
      case "remove":
        if (confirm(`Are you sure you want to remove ${location.name}?`)) {
          setBranchStats(branchStats.filter((b) => b.id !== location.id));
        }
        break;
      default:
        break;
    }
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchStats(
      branchStats.map((b) =>
        b.id === selectedBranch.id ? selectedBranch : b
      )
    );
    setIsEditModalOpen(false);
  };

  // Mock HQ stats
  const stats = [
    {
      label: "Total Locations",
      value: "4",
      icon: Building2,
      color: "blue",
      trend: "+1 this month",
    },
    {
      label: "Total Workers",
      value: "125",
      icon: Users,
      color: "purple",
      trend: "+12% vs last month",
    },
    {
      label: "Total Invited",
      value: "1,450",
      icon: Send,
      color: "orange",
      trend: "+240 this week",
    },
    {
      label: "Total Attended",
      value: "320",
      icon: CheckCircle2,
      color: "green",
      trend: "22% conversion",
    },
  ];

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Global Admin</div>
          <h1>Hello, {user?.name.split(' ')[0] || 'Admin'}</h1>
          <p>Real-time organization growth overview</p>
        </div>
        <div className="header-actions">
          <div className="credit-pill-premium" onClick={() => router.push('/main/wallet')}>
            <Wallet size={16} />
            <span>1.2M Cr</span>
          </div>
        </div>
      </header>

      {/* Rotating Banner Slider */}
      <div className="premium-banner hq-banner rotating-slider">
        <div className="banner-content fade-in" key={currentSlide}>
          <div className="banner-badge">{banners[currentSlide].badge}</div>
          <h2>{banners[currentSlide].title}</h2>
          <p>{banners[currentSlide].desc}</p>
          <Button className="btn-banner" onClick={() => router.push(banners[currentSlide].path)}>
            {banners[currentSlide].btnText}
          </Button>
        </div>
        <div className="banner-illustration fade-in" key={`illu-${currentSlide}`}>
          {React.createElement(banners[currentSlide].icon, { size: 48, className: "sparkle-icon" })}
        </div>
        
        {/* Slider Indicators */}
        <div className="slider-indicators">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`indicator ${currentSlide === i ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="quick-access-grid">
        {quickLinks.map((link, index) => (
          <div key={index} className="grid-item" onClick={() => router.push(link.path)}>
            <div className="grid-icon-box" style={{ color: link.color }}>
              <link.icon size={24} />
            </div>
            <span className="grid-label">{link.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-main-content">
        {/* The Growth Metrics section has been moved to the Overview page */}
      </div>

      {/* Edit Location Modal */}
      {selectedBranch && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Location Settings"
        >
          <form className="compose-form" onSubmit={handleUpdateBranch}>
            <div className="form-group-premium">
              <label>Location Name</label>
              <input
                type="text"
                className="premium-input"
                value={selectedBranch.name}
                onChange={(e) =>
                  setSelectedBranch({ ...selectedBranch, name: e.target.value })
                }
              />
            </div>
            <div className="form-group-premium">
              <label>Status</label>
              <select
                className="premium-select"
                value={selectedBranch.status}
                onChange={(e) =>
                  setSelectedBranch({ ...selectedBranch, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="wizard-actions" style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary-premium">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
