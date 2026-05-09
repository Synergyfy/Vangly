"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
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
} from "lucide-react";
import "./hq.css";

export default function HQDashboard() {
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  
  const [branchStats, setBranchStats] = useState([
    {
      id: "1",
      name: "HQ Branch (Downtown)",
      workers: 45,
      invites: 650,
      attended: 180,
      status: "Active",
    },
    {
      id: "2",
      name: "Northside Branch",
      workers: 30,
      invites: 400,
      attended: 85,
      status: "Active",
    },
    {
      id: "3",
      name: "Westend Campus",
      workers: 25,
      invites: 250,
      attended: 40,
      status: "Warning",
    },
    {
      id: "4",
      name: "Southpark Satellite",
      workers: 25,
      invites: 150,
      attended: 15,
      status: "Inactive",
    },
  ]);

  const toggleDropdown = (id: string) => {
    setActiveBranchId(activeBranchId === id ? null : id);
  };

  const handleAction = (action: string, branch: any) => {
    setActiveBranchId(null);
    setSelectedBranch(branch);

    switch (action) {
      case "view":
        alert(`Navigating to details for ${branch.name}...`);
        break;
      case "edit":
        setIsEditModalOpen(true);
        break;
      case "open":
        window.open(`https://vangly.com/f/${branch.id}`, "_blank");
        break;
      case "remove":
        if (confirm(`Are you sure you want to remove ${branch.name}?`)) {
          setBranchStats(branchStats.filter((b) => b.id !== branch.id));
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
      label: "Total Branches",
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

  const activities = [
    {
      id: 1,
      user: "Sarah Jenkins",
      action: "sent 24 invites",
      branch: "HQ Branch",
      time: "2m ago",
    },
    {
      id: 2,
      user: "Robert Fox",
      action: "registered 5 new members",
      branch: "Northside",
      time: "15m ago",
    },
    {
      id: 3,
      user: "Eleanor Pena",
      action: "joined as a worker",
      branch: "Westend",
      time: "1h ago",
    },
  ];

  return (
    <div className="hq-dashboard">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <h1>Global Dashboard</h1>
          <p>Real-time evangelism overview across all branches</p>
        </div>
        <div className="header-actions">
          <div className="search-pill">
            <Search size={16} className="text-tertiary" />
            <input type="text" placeholder="Search branches..." />
          </div>
          <button className="btn-primary-premium">Generate Report</button>
        </div>
      </header>

      <div className="stats-grid-premium">
        {stats.map((stat, i) => (
          <Card key={i} className="stat-card-premium">
            <div className={`icon-box ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-row">
                <span className="stat-value">{stat.value}</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "2px",
                  }}
                >
                  <TrendingUp size={12} className="text-success" />
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-main-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Branch Performance</h2>
            <button className="text-link">
              View all branches <ArrowUpRight size={14} />
            </button>
          </div>

          <Card className="table-card-premium">
            {/* Desktop Table View */}
            <div className="table-responsive desktop-only">
              <table className="data-table-premium">
                <thead>
                  <tr>
                    <th>Branch Name</th>
                    <th>Active Workers</th>
                    <th>Total Invites</th>
                    <th>Attendance</th>
                    <th>Conversion</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {branchStats.map((branch) => {
                    const conversion =
                      Math.round((branch.attended / branch.invites) * 100) || 0;
                    return (
                      <tr key={branch.id}>
                        <td>
                          <div className="branch-info-cell">
                            <span className="branch-name-text">
                              {branch.name}
                            </span>
                            <span
                              className={`status-dot ${branch.status.toLowerCase()}`}
                            >
                              {branch.status}
                            </span>
                          </div>
                        </td>
                        <td>{branch.workers}</td>
                        <td>{branch.invites}</td>
                        <td className="text-success font-medium">
                          {branch.attended}
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
                            onClick={() => toggleDropdown(branch.id)}
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeBranchId === branch.id && (
                            <div className="dropdown-panel-premium">
                              <button
                                className="dropdown-item"
                                onClick={() => handleAction("view", branch)}
                              >
                                <Eye size={14} /> View Details
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => handleAction("edit", branch)}
                              >
                                <Edit2 size={14} /> Edit Branch
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => handleAction("open", branch)}
                              >
                                <ExternalLink size={14} /> Open Link
                              </button>
                              <div className="dropdown-divider"></div>
                              <button
                                className="dropdown-item danger"
                                onClick={() => handleAction("remove", branch)}
                              >
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

            {/* Mobile Card View */}
            <div className="mobile-list-view">
              {branchStats.map((branch) => {
                const conversion =
                  Math.round((branch.attended / branch.invites) * 100) || 0;
                return (
                  <div key={branch.id} className="branch-performance-card">
                    <div className="branch-card-top">
                      <div className="branch-card-identity">
                        <span className="branch-card-name">{branch.name}</span>
                        <span
                          className={`status-pill ${branch.status.toLowerCase()}`}
                        >
                          {branch.status}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          className="btn-icon-only"
                          onClick={() => toggleDropdown(branch.id)}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeBranchId === branch.id && (
                          <div className="dropdown-panel-premium">
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction("view", branch)}
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction("edit", branch)}
                            >
                              <Edit2 size={14} /> Edit Branch
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction("open", branch)}
                            >
                              <ExternalLink size={14} /> Open Link
                            </button>
                            <div className="dropdown-divider"></div>
                            <button
                              className="dropdown-item danger"
                              onClick={() => handleAction("remove", branch)}
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="branch-card-stats-grid">
                      <div className="branch-card-stat">
                        <span className="label">Workers</span>
                        <span className="value">{branch.workers}</span>
                      </div>
                      <div className="branch-card-stat">
                        <span className="label">Invites</span>
                        <span className="value">{branch.invites}</span>
                      </div>
                      <div className="branch-card-stat">
                        <span className="label">Attendance</span>
                        <span className="value text-success">
                          {branch.attended}
                        </span>
                      </div>
                      <div className="branch-card-stat">
                        <span className="label">Conversion</span>
                        <span className="value">{conversion}%</span>
                      </div>
                    </div>

                    <div className="branch-card-progress">
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
          </Card>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="text-link">View all activity</button>
          </div>
          <Card className="table-card-premium">
            {activities.map((item) => (
              <div
                key={item.id}
                className="user-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 24px",
                  gap: "16px",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div
                  className="icon-box blue"
                  style={{ width: "32px", height: "32px", borderRadius: "8px" }}
                >
                  <Clock size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="branch-name-text"
                      style={{ fontSize: "14px" }}
                    >
                      {item.user}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {item.time}
                    </span>
                  </div>
                  <p
                    style={{ fontSize: "13px", color: "var(--text-secondary)" }}
                  >
                    {item.action} at{" "}
                    <span style={{ color: "var(--blue)", fontWeight: 500 }}>
                      {item.branch}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Edit Branch Modal */}
      {selectedBranch && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Branch Settings"
        >
          <form className="compose-form" onSubmit={handleUpdateBranch}>
            <div className="form-group-premium">
              <label>Branch Name</label>
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
