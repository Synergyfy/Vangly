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
import "../hq.css";

export default function InviteesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const [inviteLinks, setInviteLinks] = useState([
    {
      id: "main",
      name: "Main Church Invite",
      url: "church.com/invite",
      type: "Global",
      usage: "Social Media / Flyers",
      branch: "All Branches",
      hits: 1240,
    },
    {
      id: "branch-1",
      name: "Wuse 2 Evangelism",
      url: "church.com/invite/wuse2",
      type: "Branch",
      usage: "Local Outreach",
      branch: "Wuse 2 Branch",
      hits: 450,
    },
  ]);

  const [newLink, setNewLink] = useState({
    name: "",
    branch: "All Branches",
    usage: "",
  });

  const branches = [
    "HQ Branch",
    "Northside Branch",
    "Westend Campus",
    "Southpark Satellite",
    "Wuse 2 Branch",
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCreateLink = () => {
    const slug = newLink.name.toLowerCase().replace(/\s+/g, "-");
    const branchSlug = newLink.branch === "All Branches" ? "" : `/${newLink.branch.toLowerCase().split(" ")[0]}`;
    const generatedUrl = `church.com/invite${branchSlug}/${slug}`;

    const link = {
      id: Math.random().toString(),
      name: newLink.name,
      url: generatedUrl,
      type: newLink.branch === "All Branches" ? "Global" : "Branch",
      usage: newLink.usage || "General Outreach",
      branch: newLink.branch,
      hits: 0,
    };

    setInviteLinks([link, ...inviteLinks]);
    setNewLink({ name: "", branch: "All Branches", usage: "" });
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Evangelism Tools</div>
          <h1>Public Invite Links</h1>
          <p>Create and manage public URLs for church-wide and branch-specific outreach.</p>
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
                  placeholder="e.g. Easter Sunday 2026"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                />
              </div>
              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>Target Branch</label>
                  <select 
                    className="premium-select"
                    value={newLink.branch}
                    onChange={(e) => setNewLink({ ...newLink, branch: e.target.value })}
                  >
                    <option value="All Branches">Main Church (Global)</option>
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
                      <span>{link.branch}</span>
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
                <strong>Main Link:</strong> Use <code>church.com/invite</code> for your main website and social media bios.
              </li>
              <li>
                <strong>Branch Links:</strong> Create specific links for local neighborhood evangelism to track branch performance.
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
