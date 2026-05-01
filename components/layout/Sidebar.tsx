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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import "./Sidebar.css";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const hqNavItems: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[] = [
    { name: "Dashboard", href: "/hq", icon: LayoutDashboard },
    { name: "Branches", href: "/hq/manage-church", icon: Building2 },
    { name: "Branch QR", href: "/hq/branch-qr", icon: QrCode },
    { name: "User Setup", href: "/hq/user-setup", icon: UserSquare2 },
    { name: "Invitees", href: "/hq/invitees", icon: UserCheck },
    { name: "Messaging", href: "/hq/messages", icon: MessageSquare },
    { name: "Brand Identity", href: "/hq/brand", icon: Palette },
    { name: "Wallet/Credits", href: "/hq/wallet", icon: Wallet, badge: "New" },
    { name: "Settings", href: "/hq/settings", icon: Settings },
  ];

  const branchNavItems: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[] = [
    { name: "Dashboard", href: "/branch", icon: LayoutDashboard },
    { name: "Workers", href: "/branch/workers", icon: Users },
    { name: "Settings", href: "/branch/settings", icon: Settings },
  ];

  const workerNavItems: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[] = [
    { name: "Dashboard", href: "/worker", icon: LayoutDashboard },
    { name: "Share Invite", href: "/worker/share", icon: Share2 },
    { name: "Invites", href: "/worker/invites", icon: Users },
    { name: "Messaging", href: "/worker/messages", icon: MessageSquare },
    { name: "Profile", href: "/worker/profile", icon: Settings },
  ];

  const navItems =
    user?.role === "super_admin"
      ? hqNavItems
      : user?.role === "branch_admin"
        ? branchNavItems
        : workerNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">V</div>
        <span className="brand-name">Vangly</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span className="nav-label">{item.name}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
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
  );
}
