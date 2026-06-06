"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/services/auth';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  UserPlus,
  ClipboardList,
  QrCode,
  Building2,
  Wallet,
  FileText,
  Sparkles
} from 'lucide-react';
import './MobileNav.css';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const getNavItems = () => {
    switch (user?.role) {
      case 'super_admin':
      case 'organization_admin':
        return [
          { href: '/main', label: 'Home', icon: LayoutDashboard },
          { href: '/main/manage-organization', label: 'Locations', icon: Building2 },
          { href: '/main/forms', label: 'Forms', icon: FileText },
          { href: '/main/messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'location_admin':
        return [
          { href: '/branch', label: 'Home', icon: LayoutDashboard },
          { href: '/branch/teams', label: 'Teams', icon: Users },
          { href: '/branch/forms', label: 'Forms', icon: FileText },
          { href: '/branch/messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'worker':
        return [
          { href: '/worker/overview', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/worker/share', label: 'Share', icon: QrCode },
          { href: '/worker/invites', label: 'Members', icon: Users },
          { href: '/worker/messages', label: 'Messages', icon: MessageSquare },
        ];
      default:
        return [];
    }
  };

  const items = getNavItems();

  return (
    <nav className="mobile-nav">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
