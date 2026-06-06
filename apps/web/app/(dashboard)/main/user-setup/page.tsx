"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  UserPlus,
  Search,
  Shield,
  Users,
  Edit3,
  Trash2,
  Filter,
  Mail,
  Phone,
  MoreHorizontal,
  ChevronRight,
  ArrowLeft,
  Check,
  MapPin,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import "../main.css";

export default function UserSetupPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard Form State
  const [formData, setFormData] = useState({
    role: "",
    location: "",
    name: "",
    phone: "",
    pin: "",
  });

  const [customRoleInput, setCustomRoleInput] = useState("");
  const [isCustomRoleActive, setIsCustomRoleActive] = useState(false);

  // Permissions State
  const [teamPermissions, setTeamPermissions] = useState<Record<string, any>>(
    {
      Workers: {
        canInvite: true,
        canSendSMS: true,
        canBuyCredits: false,
        canCreateCustom: false,
        templateOnly: true,
        dailyLimit: 50,
      },
      Volunteers: {
        canInvite: true,
        canSendSMS: false,
        canBuyCredits: false,
        canCreateCustom: false,
        templateOnly: true,
        dailyLimit: 0,
      },
    },
  );

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);

  // Registration Links State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regLinks, setRegLinks] = useState([
    {
      id: "1",
      name: "Workers Registration",
      url: "organization.com/join/workers",
      team: "Workers",
      location: "All Branches",
    },
    {
      id: "2",
      name: "Volunteers Registration",
      url: "organization.com/join/volunteers",
      team: "Volunteers",
      location: "All Branches",
    },
  ]);

  const [newRegLink, setNewRegLink] = useState({
    name: "",
    team: "Workers",
    location: "All Branches",
  });

  const [users, setUsers] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@organization.org",
      phone: "+234 801 234 5678",
      role: "Workers",
      location: "HQ Location",
      status: "active",
    },
    {
      id: "2",
      name: "Michael Brown",
      email: "m.brown@organization.org",
      phone: "+234 801 234 5679",
      role: "Volunteers",
      location: "HQ Location",
      status: "active",
    },
    {
      id: "3",
      name: "Jane Doe",
      email: "jane.doe@organization.org",
      phone: "+234 801 234 5680",
      role: "Location Admin",
      location: "Northside Location",
      status: "active",
    },
    {
      id: "4",
      name: "David Smith",
      email: "d.smith@organization.org",
      phone: "+234 801 234 5681",
      role: "Evangelism Team",
      location: "Westend Campus",
      status: "inactive",
    },
  ]);

  const branches = [
    "HQ Location",
    "Northside Location",
    "Westend Campus",
    "Southpark Satellite",
  ];

  const customTeams = [
    "Workers",
    "Volunteers",
    "Members",
    "Evangelism Team",
    "Follow-up Team",
    "Cell Leaders",
    "Ushers",
    "Worship Team",
    "Technical Team",
    "Prayer Team",
    "Finance Team",
  ];

  const resetWizard = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setWizardStep(1);
      setFormData({ role: "", location: "", name: "", phone: "", pin: "" });
    }, 300);
  };

  const handleCreateUser = () => {
    // In a real app, this would be an API call
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: `${formData.name.toLowerCase().replace(/\s+/g, ".")}@organization.org`,
      phone: formData.phone,
      role: formData.role as any,
      location: formData.location,
      status: "active",
    };
    setUsers([newUser, ...users]);
    resetWizard();
  };

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">User Operations</div>
          <h1>Staff & Users</h1>
          <p>
            Configure access for Location Admins and Organization Workers across your
            network.
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <Button variant="ghost" onClick={() => setIsRegModalOpen(true)} className="back-btn-pill">
            <Shield size={18} /> <span>Links</span>
          </Button>
          <Button className="btn-premium" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> <span>Add User</span>
          </Button>
        </div>
      </header>

      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Public Registration Links"
      >
        <div className="registration-links-container fade-in">
          <div className="reg-link-creator card-premium">
            <h4>Create New Link</h4>
            <div className="reg-form-row">
              <Input
                placeholder="Link Name (e.g. Wuse 2 Workers)"
                value={newRegLink.name}
                onChange={(e) =>
                  setNewRegLink({ ...newRegLink, name: e.target.value })
                }
              />
              <div className="reg-select-group">
                <select
                  value={newRegLink.team}
                  onChange={(e) =>
                    setNewRegLink({ ...newRegLink, team: e.target.value })
                  }
                >
                  {customTeams.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={newRegLink.location}
                  onChange={(e) =>
                    setNewRegLink({ ...newRegLink, location: e.target.value })
                  }
                >
                  <option value="All Branches">All Branches</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                disabled={!newRegLink.name}
                onClick={() => {
                  const slug = newRegLink.name
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  setRegLinks([
                    ...regLinks,
                    {
                      id: Math.random().toString(),
                      name: newRegLink.name,
                      url: `organization.com/join/${slug}`,
                      team: newRegLink.team,
                      location: newRegLink.location,
                    },
                  ]);
                  setNewRegLink({
                    name: "",
                    team: "Workers",
                    location: "All Branches",
                  });
                }}
              >
                Generate Link
              </Button>
            </div>
          </div>

          <div className="reg-links-list">
            {regLinks.map((link) => (
              <div key={link.id} className="reg-link-item">
                <div className="reg-link-info">
                  <span className="reg-link-title">{link.name}</span>
                  <div className="reg-link-meta">
                    <span className="badge">{link.team}</span>
                    <span className="badge-ghost">{link.location}</span>
                  </div>
                  <div className="reg-link-url-container">
                    <code className="reg-link-url">{link.url}</code>
                  </div>
                </div>
                <div className="reg-link-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(link.url)}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={() =>
                      setRegLinks(regLinks.filter((l) => l.id !== link.id))
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <main className="dashboard-main-content">
        <Card className="stat-card glass-morphism" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-placeholder)' }} />
              <input
                type="text"
                className="input-premium"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" className="filter-btn" style={{ borderRadius: '12px' }}>
              <Filter size={16} />
            </Button>
          </div>
        </Card>

        <Card className="team-card-premium glass-morphism">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--blue-subtle)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="header-badge" style={{ margin: 0, background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>{user.role}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                        <MapPin size={14} /> {user.location}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <Button variant="ghost" size="sm" style={{ borderRadius: '8px' }}>
                        <MoreHorizontal size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={resetWizard}
        title={
          wizardStep === 1
            ? "Select User Role"
            : wizardStep === 2
              ? "Assign Location"
              : wizardStep === 3
                ? "Configure Permissions"
                : "User Details"
        }
      >
        <div className="wizard-container">
          <div className="wizard-steps-indicator">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`wizard-dot ${wizardStep >= i ? "active" : ""}`}
              />
            ))}
          </div>

          {wizardStep === 1 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">
                What type of account are you creating?
              </p>
              <div className="role-selection-grid">
                <div
                  className={`role-select-card ${formData.role === "branch_admin" ? "active" : ""}`}
                  onClick={() =>
                    setFormData({ ...formData, role: "branch_admin" })
                  }
                >
                  <div className="role-icon-circle">
                    <Shield size={24} />
                  </div>
                  <div className="role-text">
                    <h3>Location Admin</h3>
                    <p>Can manage workers and view location performance.</p>
                  </div>
                  {formData.role === "branch_admin" && (
                    <Check size={20} className="check-mark" />
                  )}
                </div>

                <div className="wizard-section-label">
                  <Users size={16} />
                  <span>Select Team Role</span>
                </div>

                <div className="custom-teams-grid">
                  {customTeams.map((team) => (
                    <div
                      key={team}
                      className={`team-select-card ${formData.role === team ? "active" : ""}`}
                      onClick={() => {
                        setFormData({ ...formData, role: team });
                        setIsCustomRoleActive(false);
                      }}
                    >
                      <span>{team}</span>
                      {formData.role === team && <Check size={18} />}
                    </div>
                  ))}
                  <div
                    className={`team-select-card custom-trigger ${isCustomRoleActive ? "active" : ""}`}
                    onClick={() => {
                      setIsCustomRoleActive(true);
                      setFormData({ ...formData, role: "" });
                    }}
                  >
                    <span>+ Other / Custom</span>
                  </div>
                </div>

                {isCustomRoleActive && (
                  <div className="custom-role-input-wrapper fade-in">
                    <Input
                      placeholder="Enter custom team name..."
                      value={customRoleInput}
                      onChange={(e) => {
                        setCustomRoleInput(e.target.value);
                        setFormData({ ...formData, role: e.target.value });
                      }}
                      autoFocus
                    />
                  </div>
                )}
              </div>
              <div className="wizard-actions">
                <Button
                  fullWidth
                  size="lg"
                  disabled={!formData.role}
                  onClick={() => setWizardStep(2)}
                >
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">
                Which location will this {formData.role.replace("_", " ")} belong
                to?
              </p>
              <div className="location-list-selection">
                {branches.map((location) => (
                  <div
                    key={location}
                    className={`location-option-card ${formData.location === location ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, location })}
                  >
                    <span>{location}</span>
                    {formData.location === location && <Check size={18} />}
                  </div>
                ))}
              </div>
              <div className="wizard-actions split">
                <Button variant="ghost" onClick={() => setWizardStep(1)}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button
                  disabled={!formData.location}
                  onClick={() => setWizardStep(3)}
                >
                  Next Step <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">
                Define what members of the <strong>{formData.role}</strong>{" "}
                team can do.
              </p>

              <div className="permissions-list">
                {[
                  {
                    id: "canInvite",
                    label: "Can invite people",
                    desc: "Allow members to send invites to newcomers.",
                  },
                  {
                    id: "canSendSMS",
                    label: "Can send SMS",
                    desc: "Enable SMS messaging capabilities.",
                  },
                  {
                    id: "canBuyCredits",
                    label: "Can buy SMS credits",
                    desc: "Allow purchasing more credits using organization funds.",
                  },
                  {
                    id: "canCreateCustom",
                    label: "Can create custom messages",
                    desc: "Allow writing non-template messages.",
                  },
                  {
                    id: "templateOnly",
                    label: "Template-only messaging",
                    desc: "Restrict members to using pre-approved templates.",
                  },
                ].map((perm) => (
                  <div
                    key={perm.id}
                    className="permission-item"
                    onClick={() => {
                      const current =
                        teamPermissions[formData.role] ||
                        teamPermissions.Workers;
                      setTeamPermissions({
                        ...teamPermissions,
                        [formData.role]: {
                          ...current,
                          [perm.id]: !current[perm.id],
                        },
                      });
                    }}
                  >
                    <div className="perm-info">
                      <span className="perm-label">{perm.label}</span>
                      <span className="perm-desc">{perm.desc}</span>
                    </div>
                    <div
                      className={`perm-toggle ${(teamPermissions[formData.role] || teamPermissions.Workers)[perm.id] ? "active" : ""}`}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </div>
                ))}

                <div className="permission-item no-click">
                  <div className="perm-info">
                    <span className="perm-label">Daily SMS limit</span>
                    <span className="perm-desc">
                      Max messages allowed per day per member.
                    </span>
                  </div>
                  <div className="perm-input-wrapper">
                    <input
                      type="number"
                      className="perm-number-input"
                      value={
                        (
                          teamPermissions[formData.role] ||
                          teamPermissions.Workers
                        ).dailyLimit
                      }
                      onChange={(e) => {
                        const current =
                          teamPermissions[formData.role] ||
                          teamPermissions.Workers;
                        setTeamPermissions({
                          ...teamPermissions,
                          [formData.role]: {
                            ...current,
                            dailyLimit: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="wizard-actions split"
                style={{ marginTop: "32px" }}
              >
                <Button variant="ghost" onClick={() => setWizardStep(2)}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button onClick={() => setWizardStep(4)}>
                  Next Step <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">
                Finally, enter the credentials for this user.
              </p>
              <div className="form-stack">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Phone Number"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <Input
                  label="Security PIN (6 digits)"
                  type="password"
                  placeholder="••••••"
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pin: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  maxLength={6}
                />
              </div>
              <div
                className="wizard-actions split"
                style={{ marginTop: "24px" }}
              >
                <Button variant="ghost" onClick={() => setWizardStep(3)}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button
                  disabled={
                    !formData.name || !formData.phone || formData.pin.length < 6
                  }
                  onClick={handleCreateUser}
                >
                  Create Account <Check size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`Permissions: ${editingTeam}`}
      >
        <div className="permissions-container fade-in">
          <p className="permissions-hint">
            Define what members of the <strong>{editingTeam}</strong> team can
            do.
          </p>

          <div className="permissions-list">
            {[
              {
                id: "canInvite",
                label: "Can invite people",
                desc: "Allow members to send invites to newcomers.",
              },
              {
                id: "canSendSMS",
                label: "Can send SMS",
                desc: "Enable SMS messaging capabilities.",
              },
              {
                id: "canBuyCredits",
                label: "Can buy SMS credits",
                desc: "Allow purchasing more credits using organization funds.",
              },
              {
                id: "canCreateCustom",
                label: "Can create custom messages",
                desc: "Allow writing non-template messages.",
              },
              {
                id: "templateOnly",
                label: "Template-only messaging",
                desc: "Restrict members to using pre-approved templates.",
              },
            ].map((perm) => (
              <div
                key={perm.id}
                className="permission-item"
                onClick={() => {
                  const current =
                    teamPermissions[editingTeam!] || teamPermissions.Workers;
                  setTeamPermissions({
                    ...teamPermissions,
                    [editingTeam!]: {
                      ...current,
                      [perm.id]: !current[perm.id],
                    },
                  });
                }}
              >
                <div className="perm-info">
                  <span className="perm-label">{perm.label}</span>
                  <span className="perm-desc">{perm.desc}</span>
                </div>
                <div
                  className={`perm-toggle ${(teamPermissions[editingTeam!] || teamPermissions.Workers)[perm.id] ? "active" : ""}`}
                >
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}

            <div className="permission-item no-click">
              <div className="perm-info">
                <span className="perm-label">Daily SMS limit</span>
                <span className="perm-desc">
                  Max messages allowed per day per member.
                </span>
              </div>
              <div className="perm-input-wrapper">
                <input
                  type="number"
                  className="perm-number-input"
                  value={
                    (
                      teamPermissions[editingTeam!] ||
                      teamPermissions.Workers
                    ).dailyLimit
                  }
                  onChange={(e) => {
                    const current =
                      teamPermissions[editingTeam!] ||
                      teamPermissions.Workers;
                    setTeamPermissions({
                      ...teamPermissions,
                      [editingTeam!]: {
                        ...current,
                        dailyLimit: parseInt(e.target.value) || 0,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="wizard-actions" style={{ marginTop: "32px" }}>
            <Button
              fullWidth
              variant="primary"
              onClick={() => setIsPermissionsModalOpen(false)}
            >
              Save Configuration <Check size={18} />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
