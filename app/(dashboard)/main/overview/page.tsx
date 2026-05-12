"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
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
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  Filter,
  Download,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import "../main.css";

export default function HQOverviewPage() {
  const router = useRouter();
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  
  const [branchStats] = useState([
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

  const toggleDropdown = (id: string) => {
    setActiveBranchId(activeBranchId === id ? null : id);
  };

  const handleAction = (action: string, location: any) => {
    setActiveBranchId(null);
    switch (action) {
      case "view":
        router.push(`/main/manage-organization/location?id=${location.id}&name=${encodeURIComponent(location.name)}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <h1>Location Performance</h1>
          <p>Detailed growth analytics across all organization hubs</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" style={{ padding: '8px' }}>
            <Filter size={18} />
          </Button>
          <Button variant="outline" size="sm" style={{ padding: '8px' }}>
            <Download size={18} />
          </Button>
        </div>
      </header>

      <div className="dashboard-main-content">
        {/* Quick Actions - Now inside Overview */}
        <section className="quick-actions-section" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Management Actions</h2>
          </div>
          <div className="quick-actions-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { label: "Add Location", icon: Building2, path: "/main/manage-organization/new", color: "#3b82f6" },
              { label: "New Message", icon: Send, path: "/main/messages", color: "#8b5cf6" },
              { label: "Setup Teams", icon: Users, path: "/main/manage-organization", color: "#f59e0b" },
              { label: "Buy Credits", icon: CheckCircle2, path: "/main/wallet", color: "#10b981" },
            ].map((action, i) => (
              <button 
                key={i} 
                className="action-btn-mobile glass-morphism" 
                onClick={() => router.push(action.path)}
                style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <div className="action-icon" style={{ color: action.color, background: `${action.color}10`, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <action.icon size={20} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Global Stats Summary */}
        <div className="content-section" style={{ marginBottom: '32px' }}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Growth Analytics</h2>
          <div className="stats-grid-premium">
            {[
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
            ].map((stat, i) => (
              <Card key={i} className="stat-card-premium glass-morphism">
                <div className={`icon-box ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">{stat.label}</span>
                  <div className="stat-value-row">
                    <span className="stat-value">{stat.value}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{stat.trend}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="table-card-premium" style={{ marginTop: '0' }}>
          <div className="mobile-list-view">
            {branchStats.map((location) => {
              const conversion =
                Math.round((location.attended / location.invites) * 100) || 0;
              return (
                <div key={location.id} className="location-performance-card" onClick={() => handleAction('view', location)}>
                  <div className="location-card-top">
                    <div className="location-card-identity">
                      <span className="location-card-name">{location.name}</span>
                      <span className={`status-pill ${location.status.toLowerCase()}`}>
                        {location.status}
                      </span>
                    </div>
                    <MoreHorizontal size={18} className="text-tertiary" />
                  </div>

                  <div className="location-card-stats-grid">
                    <div className="location-card-stat">
                      <span className="label">Workers</span>
                      <span className="value">{location.workers}</span>
                    </div>
                    <div className="location-card-stat">
                      <span className="label">Invites</span>
                      <span className="value">{location.invites}</span>
                    </div>
                    <div className="location-card-stat">
                      <span className="label">Attendance</span>
                      <span className="value text-success">{location.attended}</span>
                    </div>
                    <div className="location-card-stat">
                      <span className="label">Conv. Rate</span>
                      <span className="value">{conversion}%</span>
                    </div>
                  </div>

                  <div className="location-card-progress">
                    <div className="progress-track">
                      <div
                        className="progress-bar"
                        style={{ width: `${conversion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="table-responsive desktop-only">
            <table className="data-table-premium">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Active Workers</th>
                  <th>Total Invites</th>
                  <th>Attendance</th>
                  <th>Conversion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {branchStats.map((location) => {
                  const conversion =
                    Math.round((location.attended / location.invites) * 100) || 0;
                  return (
                    <tr key={location.id}>
                      <td>
                        <div className="location-info-cell">
                          <span className="location-name-text">
                            {location.name}
                          </span>
                          <span
                            className={`status-dot ${location.status.toLowerCase()}`}
                          >
                            {location.status}
                          </span>
                        </div>
                      </td>
                      <td>{location.workers}</td>
                      <td>{location.invites}</td>
                      <td className="text-success font-medium">
                        {location.attended}
                      </td>
                      <td>
                        <div className="conversion-cell">
                          <div className="mini-progress-bg">
                            <div
                              className="mini-progress-fill"
                              style={{ width: `${conversion}%` }}
                            ></div>
                          </div>
                          <span className="conversion-text">
                            {conversion}%
                          </span>
                        </div>
                      </td>
                      <td className="relative">
                        <button
                          className="btn-icon-only"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(location.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeBranchId === location.id && (
                          <div className="dropdown-panel-premium">
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction("view", location)}
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item danger">
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
