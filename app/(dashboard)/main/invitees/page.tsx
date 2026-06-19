"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Link as LinkIcon,
  Plus,
  Copy,
  Trash2,
  Globe,
  MapPin,
  Share2,
  ExternalLink,
  Search,
  Check,
} from "lucide-react";
import "../main.css";

export default function InviteesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const [inviteLinks, setInviteLinks] = useState([
    {
      id: "main",
      name: "Main Organization Invite",
      url: "harvite.com/invite",
      type: "Global",
      usage: "Social Media / Flyers",
      location: "All Locations",
      hits: 1240,
    },
    {
      id: "location-1",
      name: "Downtown Outreach",
      url: "harvite.com/invite/downtown",
      type: "Location",
      usage: "Local Outreach",
      location: "HQ Location",
      hits: 450,
    },
  ]);

  const [newLink, setNewLink] = useState({
    name: "",
    location: "All Locations",
    usage: "",
  });

  const branches = [
    "HQ Location",
    "Northside Location",
    "Westend Center",
    "Southpark Office",
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCreateLink = () => {
    const slug = newLink.name.toLowerCase().replace(/\s+/g, "-");
    const branchSlug = newLink.location === "All Locations" ? "" : `/${newLink.location.toLowerCase().split(" ")[0]}`;
    const generatedUrl = `harvite.com/invite${branchSlug}/${slug}`;

    const link = {
      id: Math.random().toString(),
      name: newLink.name,
      url: generatedUrl,
      type: newLink.location === "All Locations" ? "Global" : "Location",
      usage: newLink.usage || "General Outreach",
      location: newLink.location,
      hits: 0,
    };

    setInviteLinks([link, ...inviteLinks]);
    setNewLink({ name: "", location: "All Locations", usage: "" });
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Outreach Tools</div>
          <h1>Public Invite Links</h1>
          <p>Create and manage public URLs for organization-wide and location-specific outreach.</p>
        </div>
        <div className="header-actions">
           <div className="link-count-pill">
              <LinkIcon size={14} />
              <span>{inviteLinks.length} Active Links</span>
           </div>
        </div>
      </div>

      <div className="invitees-content-grid">
        <div className="invitees-main-col">
          <Card className="link-generator-card-premium">
            <div className="card-header-premium">
              <div className="icon-box-small blue">
                <Plus size={18} />
              </div>
              <h3>Generate New Invite Link</h3>
            </div>
            <div className="generator-form">
              <div className="form-group-premium">
                <label>Campaign / Link Name</label>
                <Input 
                  placeholder="e.g. Easter Special 2026"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                />
              </div>
              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>Target Location</label>
                  <select 
                    className="premium-select"
                    value={newLink.location}
                    onChange={(e) => setNewLink({ ...newLink, location: e.target.value })}
                  >
                    <option value="All Locations">Main Organization (Global)</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group-premium">
                  <label>Intended Usage</label>
                  <Input 
                    placeholder="e.g. WhatsApp / Instagram"
                    value={newLink.usage}
                    onChange={(e) => setNewLink({ ...newLink, usage: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="btn-premium full-width"
                disabled={!newLink.name}
                onClick={handleCreateLink}
              >
                <Share2 size={18} /> Generate & Activate Link
              </Button>
            </div>
          </Card>

          <div className="links-search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search invite links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="links-display-grid">
            {inviteLinks
              .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((link) => (
              <Card key={link.id} className="invite-link-card">
                <div className="link-card-body">
                  <div className="link-type-icon">
                    {link.type === "Global" ? <Globe size={24} /> : <MapPin size={24} />}
                  </div>
                  <div className="link-details">
                    <div className="link-header-row">
                      <h4>{link.name}</h4>
                      <span className={`type-tag ${link.type.toLowerCase()}`}>{link.type}</span>
                    </div>
                    <code className="link-url-display">{link.url}</code>
                    <div className="link-meta-row">
                      <span>{link.location}</span>
                      <span className="dot">•</span>
                      <span>{link.usage}</span>
                    </div>
                  </div>
                </div>
                <div className="link-card-footer">
                  <div className="link-stats">
                    <strong>{link.hits.toLocaleString()}</strong>
                    <span>Visits</span>
                  </div>
                  <div className="link-actions">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={isCopied === link.id ? "btn-success" : ""}
                      onClick={() => handleCopy(link.url, link.id)}
                    >
                      {isCopied === link.id ? <Check size={16} /> : <Copy size={16} />}
                      <span>{isCopied === link.id ? "Copied" : "Copy"}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-danger" onClick={() => setInviteLinks(inviteLinks.filter(l => l.id !== link.id))}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="invitees-side-col">
          <Card className="outreach-tips-card">
            <h3>Outreach Tips</h3>
            <ul className="tips-list">
              <li>
                <strong>Main Link:</strong> Use <code>harvite.com/invite</code> for your main website and social media bios.
              </li>
              <li>
                <strong>Location Links:</strong> Create specific links for local neighborhood outreach to track location performance.
              </li>
              <li>
                <strong>QR Codes:</strong> You can download QR codes for these links to print on flyers and posters.
              </li>
            </ul>
            <Button variant="outline" className="full-width">
              <ExternalLink size={16} /> Download Marketing Kit
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
