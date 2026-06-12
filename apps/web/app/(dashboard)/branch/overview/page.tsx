"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  MessageSquare,
  Wallet,
  Settings,
  FileText,
  Building2,
  Layout,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/services/auth";
import {
  useLocation,
  useLocationDashboard,
  useLocationTeams,
} from "@/services/manage-organization";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import "../branch.css";

export default function BranchOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const branchId = user?.branch_id ?? undefined;

  const locationQuery = useLocation(branchId);
  const dashboardQuery = useLocationDashboard(branchId, {
    tab: "performance",
  });
  const teamsQuery = useLocationTeams(branchId, { per_page: 5 });

  const smsCredits = user?.credits ?? 0;

  const banners = [
    {
      badge: "TEAMS",
      title: "Structure for Growth",
      desc: "Organize your workforce into powerful units and track their collaborative growth.",
      btnText: "Manage Teams",
      path: "/branch/teams",
      icon: Users,
    },
    {
      badge: "FORMS",
      title: "Capture Every Soul",
      desc: "Build location-specific outreach forms and collect high-impact data.",
      btnText: "Create Forms",
      path: "/branch/forms",
      icon: FileText,
    },
    {
      badge: "MESSAGING",
      title: "Instant Outreach",
      desc: "Broadcast messages to your entire branch network with instant delivery.",
      btnText: "Send SMS",
      path: "/branch/messages",
      icon: MessageSquare,
    },
    {
      badge: "WORKERS",
      title: "Track Your Workforce",
      desc: "Monitor staff and volunteer performance across all your branch units.",
      btnText: "View Workers",
      path: "/branch/workers",
      icon: UserPlus,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const branchName = locationQuery.data?.name ?? "Your Branch";
  const perfData =
    dashboardQuery.data?.tab === "performance"
      ? (dashboardQuery.data.data as import("@/types/api/locations").PerformanceTabData)
      : null;
  const statsList = perfData?.stats ?? [];
  const teams = (teamsQuery.data?.data ?? [])
    .slice()
    .sort((a, b) => b.member_count - a.member_count);

  const top3Teams = teams.slice(0, 3);

  return (
    <div className="location-dashboard-v3 hq-dashboard-premium hub-v2-container animate-fade-in">
      <header
        className="mobile-dashboard-header"
        style={{
          border: "none",
          background: "transparent",
          padding: "24px 20px",
        }}
      >
        <div className="header-top">
          <div className="location-badge admin-badge-premium">
            Location Admin
          </div>
          <div
            className="wallet-pill"
            onClick={() => router.push("/branch/wallet")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push("/branch/wallet");
              }
            }}
          >
            <Wallet size={14} />
            <span>{smsCredits.toLocaleString()}</span>
          </div>
        </div>
        <h1
          className="location-title"
          style={{ fontSize: "32px", marginBottom: "4px" }}
        >
          Hello, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "15px" }}>
          Branch growth overview for {branchName}
        </p>
      </header>

      <main
        className="dashboard-scroll-area"
        style={{ padding: "0 20px 100px" }}
      >
        <div style={{ padding: "24px 0 0" }}>
          {dashboardQuery.isError ? (
            <Card
              className="stat-card-premium"
              style={{
                marginBottom: "32px",
                color: "var(--danger)",
                padding: "16px",
              }}
            >
              {extractErrorMessage(
                dashboardQuery.error,
                "Could not load branch performance.",
              )}
            </Card>
          ) : null}

          <div
            className="stats-cards-grid"
            style={{ marginBottom: "32px" }}
          >
            {dashboardQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="stat-card-premium">
                    <div
                      className="stat-info"
                      style={{
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Loader2
                        size={16}
                        className="spinner"
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />{" "}
                      Loading…
                    </div>
                  </Card>
                ))
              : statsList.slice(0, 3).map((stat, i) => (
                  <Card key={i} className="stat-card-premium">
                    <div
                      className="stat-icon"
                      style={{
                        backgroundColor: "#a855f710",
                        color: "#a855f7",
                      }}
                    >
                      <Building2 size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">{stat.label}</span>
                      <div className="stat-value-group">
                        <span className="stat-value">{stat.value}</span>
                        {stat.change_pct !== undefined ? (
                          <span
                            className={`stat-sub ${stat.is_up ? "up" : ""}`}
                          >
                            {stat.is_up ? "+" : ""}
                            {stat.change_pct}%
                          </span>
                        ) : stat.meta ? (
                          <span className="stat-sub">{stat.meta}</span>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                ))}
            <Card
              className="stat-card-premium full-width"
              style={{ marginBottom: "32px" }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: "#fff7ed", color: "#f59e0b" }}
              >
                <Wallet size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">SMS Credits</span>
                <div className="stat-value-group">
                  <span className="stat-value">
                    {smsCredits.toLocaleString()}
                  </span>
                  <span className="stat-sub">Available</span>
                </div>
              </div>
            </Card>
          </div>

          <div
            className="top-teams-section"
            style={{ marginBottom: "40px" }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 900,
                marginBottom: "24px",
              }}
            >
              Top Outreach Teams
            </h2>
            <div className="top-teams-list">
              {teamsQuery.isLoading && (
                <div
                  style={{
                    color: "var(--text-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Loader2
                    size={16}
                    className="spinner"
                    style={{ display: "inline", verticalAlign: "middle" }}
                  />{" "}
                  Loading teams…
                </div>
              )}
              {!teamsQuery.isLoading && top3Teams.length === 0 && (
                <div style={{ color: "var(--text-tertiary)" }}>
                  No teams yet. Create your first team on the{" "}
                  <button
                    onClick={() => router.push("/branch/teams")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--blue)",
                      cursor: "pointer",
                      padding: 0,
                      font: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    Teams page
                  </button>
                  .
                </div>
              )}
              {top3Teams.map((team, i) => (
                <div
                  key={team.id}
                  className="top-team-item"
                  onClick={() => router.push(`/branch/teams/${team.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="team-rank-box">{i + 1}</div>
                  <div className="team-main-info">
                    <h4>{team.name}</h4>
                    <p>
                      {team.member_count} members &bull; {team.form_count} forms
                    </p>
                  </div>
                  <span className="team-status-tag">
                    {team.is_public_joinable ? "Public" : "Private"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="banner-v2-purple">
          <div className="banner-v2-content">
            <div className="banner-v2-badge">
              {banners[currentSlide].badge}
            </div>
            <h2>{banners[currentSlide].title}</h2>
            <p>{banners[currentSlide].desc}</p>
            <Button
              className="btn-banner-v2"
              onClick={() => router.push(banners[currentSlide].path)}
            >
              {banners[currentSlide].btnText}
            </Button>
          </div>
          <div className="banner-v2-icon">
            {React.createElement(banners[currentSlide].icon, {
              size: 120,
              className: "opacity-20",
              style: { color: "white" },
            })}
          </div>
          <div
            className="slider-indicators"
            style={{
              bottom: "24px",
              left: "40px",
              justifyContent: "flex-start",
            }}
          >
            {banners.map((_, i) => (
              <div
                key={i}
                className={`indicator ${currentSlide === i ? "active" : ""}`}
                style={{
                  background:
                    currentSlide === i
                      ? "white"
                      : "rgba(255,255,255,0.3)",
                  width: currentSlide === i ? "24px" : "8px",
                }}
                onClick={() => setCurrentSlide(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setCurrentSlide(i);
                  }
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="hub-grid-v2">
          {[
            {
              label: "Overview",
              icon: Layout,
              path: "/branch/overview",
              color: "#a855f7",
            },
            {
              label: "Teams",
              icon: Users,
              path: "/branch/teams",
              color: "#3b82f6",
            },
            {
              label: "Workers",
              icon: UserPlus,
              path: "/branch/workers",
              color: "#a855f7",
            },
            {
              label: "Forms",
              icon: FileText,
              path: "/branch/forms",
              color: "#10b981",
            },
            {
              label: "Messaging",
              icon: MessageSquare,
              path: "/branch/messages",
              color: "#0ea5e9",
            },
            {
              label: "Invitees",
              icon: Sparkles,
              path: "/branch/invitees",
              color: "#f59e0b",
            },
            {
              label: "Wallet",
              icon: Wallet,
              path: "/branch/wallet",
              color: "#ec4899",
            },
            {
              label: "Settings",
              icon: Settings,
              path: "/branch/settings",
              color: "#8b5cf6",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="hub-card-v2"
              onClick={() => router.push(item.path)}
            >
              <div className="hub-card-icon-v2">
                <item.icon size={24} style={{ color: item.color }} />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
