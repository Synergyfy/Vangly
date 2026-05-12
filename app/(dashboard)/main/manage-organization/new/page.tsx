"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Building2,
  Plus,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  HelpCircle,
  X,
} from "lucide-react";
import "../management.css";

const Tooltip = ({ content }: { content: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="tooltip-container">
      <button
        type="button"
        className="tooltip-trigger"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="tooltip-popup">
          <div className="tooltip-content">{content}</div>
          <button className="tooltip-close" onClick={() => setShow(false)}>
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default function NewLocationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => router.push("/main/manage-organization"), 1500);
    }, 1200);
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="back-btn-header"
        >
          <ArrowLeft size={18} /> Back to Network
        </Button>
        <h1 className="mobile-title">Create New Location</h1>
        <p className="mobile-subtitle">
          Establish a new physical location for your organization community.
        </p>
      </div>

      <div className="form-container-premium">
        {success ? (
          <Card className="success-full-card">
            <div className="success-icon-large">🎉</div>
            <h2>Location Established!</h2>
            <p>You have successfully added a new location to your network.</p>
            <p className="redirect-hint">
              Taking you back to your network overview...
            </p>
          </Card>
        ) : (
          <Card className="management-card-premium">
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-section">
                <div className="section-header">
                  <div className="header-title-row">
                    <Building2 size={20} className="text-primary" />
                    <h3>Basic Information</h3>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="input-group-premium">
                    <div className="label-row">
                      <label>Location Name</label>
                      <Tooltip content="Choose a name that clearly identifies this site (e.g. Southpark Office)." />
                    </div>
                    <Input placeholder="e.g. Southpark Satellite" required />
                  </div>
                  <div className="input-group-premium">
                    <div className="label-row">
                      <label>Location / City</label>
                      <Tooltip content="The city or district where this location is physically located." />
                    </div>
                    <Input
                      placeholder="e.g. Lagos, Nigeria"
                      icon={<MapPin size={16} />}
                      required
                    />
                  </div>
                </div>
                <div
                  className="input-group-premium input-full"
                  style={{ marginTop: "20px" }}
                >
                  <div className="label-row">
                    <label>Short Description</label>
                    <Tooltip content="A 2-3 sentence overview of this location's focus or purpose." />
                  </div>
                  <textarea
                    className="input-field textarea-field"
                    rows={3}
                    placeholder="Briefly describe this location's community or focus..."
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <div className="header-title-row">
                    <ImageIcon size={20} className="text-primary" />
                    <h3>Location Assets</h3>
                    <Tooltip content="Upload a high-quality photo to help members identify the site." />
                  </div>
                </div>
                <div className="upload-placeholder-zone-premium">
                  <div className="upload-icon-box">
                    <Upload size={24} />
                  </div>
                  <div className="upload-text">
                    <p className="main-text">Upload location photo</p>
                    <p className="sub-text">PNG, JPG up to 10MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="btn-upload-trigger"
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="form-actions-footer-premium">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="btn-cancel-mobile"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit-mobile"
                >
                  {isSubmitting ? "Establishing..." : "Create Location"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
