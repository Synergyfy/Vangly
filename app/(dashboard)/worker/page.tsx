"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { UserPlus, Church, TrendingUp, Users, Target } from "lucide-react";
import "./worker.css";

export default function WorkerDashboard() {
  const stats = {
    totalInvites: 42,
    attended: 12,
  };

  const conversionRate =
    Math.round((stats.attended / stats.totalInvites) * 100) || 0;

  return (
    <div className="worker-dashboard">
      <header className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Monitor your outreach progress and impact</p>
      </header>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-title">
            <UserPlus size={16} /> Total Invited
          </div>
          <p className="stat-value text-primary">{stats.totalInvites}</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-title">
            <Church size={16} /> Attended Church
          </div>
          <p className="stat-value text-success">{stats.attended}</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-title">
            <TrendingUp size={16} /> Conversion Rate
          </div>
          <p className="stat-value text-accent">{conversionRate}%</p>
        </Card>
      </div>

      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <Card>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <UserPlus size={20} className="text-primary" />
              </div>
              <div className="activity-details">
                <p className="activity-text">
                  You invited <strong>Sarah Johnson</strong>
                </p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Church size={20} className="text-success" />
              </div>
              <div className="activity-details">
                <p className="activity-text">
                  <strong>Michael Brown</strong> attended church!
                </p>
                <span className="activity-time">Sunday at 9:00 AM</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <UserPlus size={20} className="text-primary" />
              </div>
              <div className="activity-details">
                <p className="activity-text">
                  You invited <strong>David Smith</strong>
                </p>
                <span className="activity-time">Last Friday</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
