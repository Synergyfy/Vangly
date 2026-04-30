"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu, UserCircle, LogOut, ShieldCheck } from 'lucide-react';
import './Topbar.css';

interface TopbarProps {
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
          <Menu size={20} />
        </button>
        {user && (
          <div className="topbar-context">
            <ShieldCheck size={14} />
            <span className="context-label">Role:</span>
            <span className="context-value">{user.role?.replace('_', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="topbar-right">
        {user ? (
          <div className="user-menu">
            <div className="user-info">
              <UserCircle size={18} />
              <span className="user-name">Hello, {user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        ) : (
          <div className="user-menu">
            <span className="user-name">Not logged in</span>
          </div>
        )}
      </div>
    </header>
  );
};
