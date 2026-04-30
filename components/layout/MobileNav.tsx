"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  UserPlus,
  ClipboardList,
  QrCode
} from 'lucide-react';
import './MobileNav.css';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'super_admin':
        return [
          { href: '/hq', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/hq/all-invites', label: 'Invites', icon: ClipboardList },
          { href: '/hq/workers', label: 'Workers', icon: Users },
          { href: '/messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'branch_admin':
        return [
          { href: '/branch', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/manage-users', label: 'Workers', icon: Users },
          { href: '/messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'worker':
        return [
          { href: '/worker', label: 'Home', icon: LayoutDashboard },
          { href: '/worker/add-invite', label: 'Add', icon: UserPlus },
          { href: '/worker/share', label: 'Share', icon: QrCode },
          { href: '/worker/invites', label: 'Invites', icon: ClipboardList },
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
