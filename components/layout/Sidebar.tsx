"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  MessageSquare,
  Share2,
  Settings,
  Building2,
  Palette,
  LogOut,
  Wallet,
  UserCheck,
  QrCode,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import "./Sidebar.css";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export function Sidebar({ isOpen, onClose, isCollapsed = true }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const mainNavItems: Array<{ name: string; href: string; icon: any; badge?: string }> = [
    { name: "Home", href: "/main", icon: LayoutDashboard },
    { name: "Locations", href: "/main/manage-organization", icon: Building2 },
    { name: "Teams", href: "/main/teams", icon: Users },
    { name: "Forms", href: "/main/forms", icon: FileText },
    { name: "Invites", href: "/main/all-invites", icon: Sparkles },
    { name: "Messaging", href: "/main/messages", icon: MessageSquare },
    { name: "Brand Identity", href: "/main/brand", icon: Palette },
    { name: "Settings", href: "/main/settings", icon: Settings },
  ];

  const locationNavItems: Array<{ name: string; href: string; icon: any; badge?: string }> = [
    { name: "Performance", href: "/branch", icon: LayoutDashboard },
    { name: "Teams", href: "/branch/teams", icon: Users },
    { name: "Settings", href: "/branch/settings", icon: Settings },
  ];

  const workerNavItems: Array<{ name: string; href: string; icon: any; badge?: string }> = [
    { name: "Dashboard", href: "/worker/overview", icon: LayoutDashboard },
    { name: "Share Link", href: "/worker/share", icon: Share2 },
    { name: "Members", href: "/worker/invites", icon: Users },
    { name: "Messaging", href: "/worker/messages", icon: MessageSquare },
    { name: "Profile", href: "/worker/profile", icon: Settings },
  ];

  const navItems =
    user?.role === "super_admin" || user?.role === "organization_admin"
      ? mainNavItems
      : (user?.role === "branch_admin" || user?.role === "location_admin")
        ? locationNavItems
        : workerNavItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">H</div>
            {!isCollapsed && <span className="brand-name">Harvite</span>}
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/main" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                title={isCollapsed ? item.name : ""}
                onClick={() => {
                  if (window.innerWidth <= 1024) onClose();
                }}
              >
                <item.icon size={22} />
                {!isCollapsed && <span className="nav-label">{item.name}</span>}
                {item.badge && !isCollapsed && <span className="nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role?.replace("_", " ")}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
