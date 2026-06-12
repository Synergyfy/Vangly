"use client";

import React from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowLeft,
  MapPin,
  Send,
  UserPlus,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/auth";
import { useWalletBalance } from "@/services/wallet";
import { useInvitesList } from "@/services/invites";
import "../worker.css";

export default function WorkerOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const walletQuery = useWalletBalance();
  const invitesQuery = useInvitesList();

  const credits = walletQuery.data?.balance ?? user?.credits ?? 0;
  const myInvites = (invitesQuery.data ?? []).filter(
    (i) => !user?.id || i.owner_user_id === user.id,
  );
  const totalUses = myInvites.reduce((sum, i) => sum + i.uses, 0);

  return (
    <div className="worker-dashboard animate-fade-in">
      <header
        className="dashboard-header-premium"
        style={{ marginBottom: "32px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="location-context-pill">
              <MapPin size={12} /> Your Location
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                marginTop: "8px",
              }}
            >
              Welcome back, {user?.name?.split(" ")[0] ?? "Worker"}!
            </h1>
            <p style={{ color: "var(--text-tertiary)", fontSize: "15px" }}>
              You are logged in as{" "}
              <span style={{ color: "var(--blue)", fontWeight: 700 }}>
                {user?.role ?? "Worker"}
              </span>
            </p>
          </div>
          <div
            className="credit-pill-premium"
            onClick={() => router.push("/worker/top-up")}
          >
            <Sparkles size={16} />
            <span>
              {walletQuery.isLoading ? (
                <Loader2
                  size={14}
                  className="spinner"
                  style={{ display: "inline", verticalAlign: "middle" }}
                />
              ) : (
                credits.toLocaleString()
              )}{" "}
              Credits
            </span>
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <Card className="stat-card-premium">
          <div
            className="stat-icon"
            style={{ background: "#3b82f610", color: "#3b82f6" }}
          >
            <UserPlus size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Invite Links</span>
            <span className="stat-value">
              {invitesQuery.isLoading ? "…" : myInvites.length}
            </span>
          </div>
        </Card>
        <Card className="stat-card-premium">
          <div
            className="stat-icon"
            style={{ background: "#10b98110", color: "#10b981" }}
          >
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Conversions</span>
            <span className="stat-value">
              {invitesQuery.isLoading ? "…" : totalUses}
            </span>
          </div>
        </Card>
        <Card className="stat-card-premium">
          <div
            className="stat-icon"
            style={{ background: "#a855f710", color: "#a855f7" }}
          >
            <Sparkles size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Credits</span>
            <span className="stat-value">
              {walletQuery.isLoading ? "…" : credits.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <Card
          className="action-card-premium"
          onClick={() => router.push("/worker/messages")}
          style={{ cursor: "pointer" }}
        >
          <Send size={28} color="var(--blue)" />
          <h3 style={{ marginTop: "12px" }}>Send Message</h3>
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Reach out to contacts with quick SMS templates.
          </p>
        </Card>
        <Card
          className="action-card-premium"
          onClick={() => router.push("/worker/add-invite")}
          style={{ cursor: "pointer" }}
        >
          <UserPlus size={28} color="#10b981" />
          <h3 style={{ marginTop: "12px" }}>Create Invite</h3>
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Generate a new invite link to share with newcomers.
          </p>
        </Card>
        <Card
          className="action-card-premium"
          onClick={() => router.push("/worker/forms")}
          style={{ cursor: "pointer" }}
        >
          <ClipboardList size={28} color="#a855f7" />
          <h3 style={{ marginTop: "12px" }}>My Forms</h3>
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            View and complete assigned forms.
          </p>
        </Card>
        <Card
          className="action-card-premium"
          onClick={() => router.push("/worker/invites")}
          style={{ cursor: "pointer" }}
        >
          <ArrowLeft
            size={28}
            color="#f59e0b"
            style={{ transform: "rotate(180deg)" }}
          />
          <h3 style={{ marginTop: "12px" }}>My Invite Links</h3>
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Manage the invite links you&apos;ve created.
          </p>
        </Card>
      </div>
    </div>
  );
}
