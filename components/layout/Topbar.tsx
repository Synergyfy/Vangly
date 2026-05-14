"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Send,
  CheckCircle2,
  Users,
  MoreHorizontal,
} from "lucide-react";
import "./Topbar.css";

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand" onClick={() => router.push(user?.role?.includes('branch') || user?.role?.includes('location') ? '/branch' : '/main')}>
          <div className="brand-icon">V</div>
          <span className="brand-name">Vangly</span>
        </div>

        <div className="topbar-search">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search everywhere..." />
          <div className="search-shortcut">⌘K</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">
          <button
            className="action-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="notification-dot" />
          </button>
        </div>

        <div className="divider" />

        {user ? (
          <div className="user-profile-dropdown">
            <div
              className={`profile-trigger ${isDropdownOpen ? "active" : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="profile-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">
                  {user.role?.replace("_", " ")}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`dropdown-arrow ${isDropdownOpen ? "rotate" : ""}`}
              />
            </div>

            {isDropdownOpen && (
              <>
                <div
                  className="dropdown-overlay"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.role?.replace("_", " ")}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      router.push("/login");
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="user-menu">
            <span className="user-name">Not logged in</span>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotifications && (
        <div
          className="notification-modal-overlay"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="notification-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-header">
              <h3>Notifications</h3>
              <button
                className="close-btn"
                onClick={() => setShowNotifications(false)}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="notification-list">
              <div className="notification-item">
                <div className="notification-icon blue">
                  <Send size={16} />
                </div>
                <div className="notification-content">
                  <div className="notification-title">New Invites Sent</div>
                  <div className="notification-message">
                    Sarah Jenkins sent 24 new invites to HQ Location
                  </div>
                  <div className="notification-time">2 minutes ago</div>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-icon green">
                  <CheckCircle2 size={16} />
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    New Members Registered
                  </div>
                  <div className="notification-message">
                    Robert Fox registered 5 new members at Northside Location
                  </div>
                  <div className="notification-time">15 minutes ago</div>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-icon purple">
                  <Users size={16} />
                </div>
                <div className="notification-content">
                  <div className="notification-title">New Worker Joined</div>
                  <div className="notification-message">
                    Eleanor Pena joined as a worker at Westend Center
                  </div>
                  <div className="notification-time">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
