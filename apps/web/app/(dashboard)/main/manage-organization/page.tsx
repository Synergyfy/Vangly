"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Plus,
  MapPin,
  Users,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  useLocationsList,
} from "@/services/manage-organization";
import { ApiError } from "@/lib/api/client";
import type { Location, LocationStatus } from "@/types/api/locations";
import "./management.css";

const STATUS_LABEL: Record<LocationStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

function StatusBadge({ status }: { status: LocationStatus }) {
  const cls =
    status === "active"
      ? "positive"
      : status === "paused"
        ? "warning"
        : "negative";
  return <span className={`header-badge ${cls}`}>{STATUS_LABEL[status]}</span>;
}

function ActivityBadge({ level }: { level: Location["activity"] }) {
  const cls = level === "High" ? "positive" : level === "Medium" ? "warning" : "";
  return (
    <span className={`header-badge ${cls}`}>{level} Activity</span>
  );
}

function LocationCardSkeleton() {
  return (
    <Card className="team-card-premium glass-morphism" aria-hidden>
      <div className="team-card-header">
        <div className="stat-icon-box blue">
          <Building2 size={20} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              height: 18,
              width: "60%",
              background: "var(--bg)",
              borderRadius: 8,
            }}
          />
          <div
            style={{
              height: 12,
              width: "40%",
              background: "var(--bg)",
              borderRadius: 8,
              marginTop: 8,
            }}
          />
        </div>
      </div>
      <div className="team-card-content">
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: 0 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="loc-stat-item">
              <span className="stat-label">—</span>
              <span className="stat-value" style={{ fontSize: 15 }}>—</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function LocationManagementPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const debounced = React.useDeferredValue(search);

  const { data, isLoading, isError, error, refetch, isFetching } = useLocationsList({
    per_page: 100,
  });

  const locations = React.useMemo(() => {
    const list = data?.data ?? [];
    if (!debounced.trim()) return list;
    const needle = debounced.toLowerCase();
    return list.filter(
      (l) =>
        l.name.toLowerCase().includes(needle) ||
        l.city.toLowerCase().includes(needle),
    );
  }, [data?.data, debounced]);

  const handleLocationClick = (location: Location) => {
    router.push(
      `/main/manage-organization/location?id=${location.id}&name=${encodeURIComponent(location.name)}`,
    );
  };

  const apiError = error instanceof ApiError ? error : null;
  const errorMessage =
    apiError?.body?.message ?? (isError ? "Could not load locations." : null);

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/main")}
            className="back-btn-pill"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: "12px" }}>
            <div className="header-badge">Organization Ops</div>
            <h1>Locations</h1>
            <p>Select a location to manage performance and teams.</p>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="premium-search-bar" style={{ minWidth: 220 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => router.push("/main/manage-organization/new")}
            style={{ gap: "8px" }}
            className="btn-premium"
          >
            <Plus size={18} /> Create Location
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        {errorMessage ? (
          <Card
            className="glass-morphism"
            style={{ padding: 24, display: "flex", gap: 12, alignItems: "flex-start" }}
          >
            <AlertCircle size={20} color="var(--red, #ef4444)" />
            <div>
              <strong>Couldn’t load locations</strong>
              <p style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 4 }}>
                {errorMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                style={{ marginTop: 12 }}
              >
                Try again
              </Button>
            </div>
          </Card>
        ) : null}

        <div
          className="team-grid-premium"
          aria-busy={isLoading || isFetching}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <LocationCardSkeleton key={i} />)
            : locations.length === 0 && !errorMessage
              ? (
                <Card
                  className="glass-morphism"
                  style={{
                    gridColumn: "1 / -1",
                    padding: 48,
                    textAlign: "center",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <Building2 size={32} style={{ opacity: 0.5 }} />
                  <h3 style={{ fontWeight: 800, marginTop: 12 }}>No locations yet</h3>
                  <p style={{ fontSize: 13, marginTop: 4 }}>
                    Create your first location to get started.
                  </p>
                  <Button
                    className="btn-premium"
                    onClick={() => router.push("/main/manage-organization/new")}
                    style={{ marginTop: 16 }}
                  >
                    <Plus size={16} /> Create Location
                  </Button>
                </Card>
              )
              : locations.map((location) => (
                <Card
                  key={location.id}
                  className="team-card-premium glass-morphism"
                  onClick={() => handleLocationClick(location)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleLocationClick(location);
                    }
                  }}
                >
                  <div className="team-card-header">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div className="stat-icon-box blue">
                        <Building2 size={20} />
                      </div>
                      <ActivityBadge level={location.activity} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                        {location.name}
                        {location.is_hq ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              marginLeft: 8,
                              color: "var(--blue)",
                              background: "var(--blue-subtle)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              verticalAlign: "middle",
                            }}
                          >
                            HQ
                          </span>
                        ) : null}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-tertiary)",
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MapPin size={12} /> {location.city}
                        {location.state ? `, ${location.state}` : ""}
                        {location.country ? ` · ${location.country}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="team-card-content">
                    <div
                      className="stats-grid"
                      style={{
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                        margin: 0,
                      }}
                    >
                      <div className="loc-stat-item">
                        <span className="stat-label">Teams</span>
                        <span className="stat-value" style={{ fontSize: 15 }}>
                          {location.stats.teams}
                        </span>
                      </div>
                      <div className="loc-stat-item">
                        <span className="stat-label">Members</span>
                        <span className="stat-value" style={{ fontSize: 15 }}>
                          {location.stats.members}
                        </span>
                      </div>
                      <div className="loc-stat-item">
                        <span className="stat-label">Submissions</span>
                        <span className="stat-value" style={{ fontSize: 15 }}>
                          {location.stats.submissions_30d}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <Users size={14} />
                        <StatusBadge status={location.status} />
                      </div>
                      <div
                        style={{ display: "flex", gap: 8 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Send SMS to location"
                          onClick={() =>
                            router.push(
                              `/main/messages?target=location&name=${encodeURIComponent(location.name)}`,
                            )
                          }
                          style={{ borderRadius: 10 }}
                        >
                          <MessageSquare size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Open location"
                          onClick={() => handleLocationClick(location)}
                          style={{ borderRadius: 10 }}
                        >
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      </main>
    </div>
  );
}
