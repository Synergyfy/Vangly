"use client";

import React from "react";
import {
  FileText,
  UserPlus,
  Clock,
  ChevronRight,
  ArrowLeft,
  ClipboardList,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import "./worker-forms.css";

const QUICK_ACTIONS = [
  {
    id: "1",
    title: "Create New Invite",
    description: "Generate a new invite link to share with newcomers.",
    icon: <UserPlus size={24} />,
    color: "var(--blue)",
    href: "/worker/add-invite",
    usage: "High",
    estimatedTime: "1 min",
  },
  {
    id: "2",
    title: "My Invite Links",
    description: "View and manage the invite links you have created.",
    icon: <ClipboardList size={24} />,
    color: "var(--purple)",
    href: "/worker/invites",
    usage: "Daily",
    estimatedTime: "2 mins",
  },
  {
    id: "3",
    title: "Browse Public Forms",
    description: "Fill out a form shared with you via a link or QR code.",
    icon: <Target size={24} />,
    color: "var(--orange)",
    href: "/f/demo",
    usage: "Medium",
    estimatedTime: "2 mins",
  },
];

export default function WorkerFormsPage() {
  const router = useRouter();

  return (
    <div className="worker-forms-page">
      <div className="dashboard-header">
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: "0.5rem", borderRadius: "50%" }}
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1>Forms & Quick Actions</h1>
            <p
              style={{
                color: "var(--text-tertiary)",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Create invites, view your links, or fill out a public form.
            </p>
          </div>
        </div>
      </div>

      <div className="forms-list">
        {QUICK_ACTIONS.map((form) => (
          <Card
            key={form.id}
            className="form-card"
            onClick={() => router.push(form.href)}
          >
            <div
              className="form-icon"
              style={{
                background: `${form.color}15`,
                color: form.color,
              }}
            >
              {form.icon}
            </div>
            <div className="form-info">
              <h3>{form.title}</h3>
              <p>{form.description}</p>
              <div className="form-meta">
                <span className="meta-pill">
                  <FileText size={12} /> {form.usage} usage
                </span>
                <span className="meta-pill">
                  <Clock size={12} /> {form.estimatedTime}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-tertiary" />
          </Card>
        ))}
      </div>
    </div>
  );
}
