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
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import "../hq.css";

export default function UserSetupPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard Form State
  const [formData, setFormData] = useState({
    role: "",
    branch: "",
    name: "",
    phone: "",
    pin: "",
  });

  const [customRoleInput, setCustomRoleInput] = useState("");
  const [isCustomRoleActive, setIsCustomRoleActive] = useState(false);

  // Permissions State
  const [groupPermissions, setGroupPermissions] = useState<Record<string, any>>(
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
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  // Registration Links State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regLinks, setRegLinks] = useState([
    {
      id: "1",
      name: "Workers Registration",
      url: "church.com/join/workers",
      group: "Workers",
      branch: "All Branches",
    },
    {
      id: "2",
      name: "Volunteers Registration",
      url: "church.com/join/volunteers",
      group: "Volunteers",
      branch: "All Branches",
    },
  ]);

  const [newRegLink, setNewRegLink] = useState({
    name: "",
    group: "Workers",
    branch: "All Branches",
  });

  const [users, setUsers] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@church.org",
      phone: "+234 801 234 5678",
      role: "Workers",
      branch: "HQ Branch",
      status: "active",
    },
    {
      id: "2",
      name: "Michael Brown",
      email: "m.brown@church.org",
      phone: "+234 801 234 5679",
      role: "Volunteers",
      branch: "HQ Branch",
      status: "active",
    },
    {
      id: "3",
      name: "Jane Doe",
      email: "jane.doe@church.org",
      phone: "+234 801 234 5680",
      role: "Branch Admin",
      branch: "Northside Branch",
      status: "active",
    },
    {
      id: "4",
      name: "David Smith",
      email: "d.smith@church.org",
      phone: "+234 801 234 5681",
      role: "Evangelism Team",
      branch: "Westend Campus",
      status: "inactive",
    },
  ]);

  const branches = [
    "HQ Branch",
    "Northside Branch",
    "Westend Campus",
    "Southpark Satellite",
  ];

  const customGroups = [
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
      setFormData({ role: "", branch: "", name: "", phone: "", pin: "" });
    }, 300);
  };

  const handleCreateUser = () => {
    // In a real app, this would be an API call
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: `${formData.name.toLowerCase().replace(/\s+/g, ".")}@church.org`,
      phone: formData.phone,
      role: formData.role as any,
      branch: formData.branch,
      status: "active",
    };
    setUsers([newUser, ...users]);
    resetWizard();
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Staff Management</div>
          <h1>User Setup</h1>
          <p>
            Configure access for Branch Admins and Church Workers across your
            network.
          </p>
        </div>
        <div className="header-actions">
          <Button variant="ghost" onClick={() => setIsRegModalOpen(true)}>
            <Shield size={18} /> <span>Registration Links</span>
          </Button>
          <Button className="btn-premium" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> <span>Add New User</span>
          </Button>
        </div>
      </div>

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
                  value={newRegLink.group}
                  onChange={(e) =>
                    setNewRegLink({ ...newRegLink, group: e.target.value })
                  }
                >
                  {customGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={newRegLink.branch}
                  onChange={(e) =>
                    setNewRegLink({ ...newRegLink, branch: e.target.value })
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
                      url: `church.com/join/${slug}`,
                      group: newRegLink.group,
                      branch: newRegLink.branch,
                    },
                  ]);
                  setNewRegLink({
                    name: "",
                    group: "Workers",
                    branch: "All Branches",
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
                    <span className="badge">{link.group}</span>
                    <span className="badge-ghost">{link.branch}</span>
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

      <div className="user-setup-content">
        {/* ... (Existing Filter Card and Table remain same) ... */}
        <Card className="management-filter-card">
          <div className="search-container-premium">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-actions">
              <Button variant="ghost" className="filter-btn">
                <Filter size={16} /> <span>Filters</span>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="user-table-card-premium">
          <div className="table-responsive">
            <table className="user-data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role & Status</th>
                  <th>Assigned Branch</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td data-label="User Details">
                      <div className="user-cell-profile">
                        <div className="user-avatar-initials">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="user-meta-info">
                          <span className="user-display-name">{user.name}</span>
                          <div className="user-contact-links">
                            <span>
                              <Mail size={12} /> {user.email}
                            </span>
                            <span>
                              <Phone size={12} /> {user.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Role & Status">
                      <div className="role-status-stack">
                        <span className={`role-pill ${user.role}`}>
                          {user.role}
                        </span>
                        <span className={`status-indicator ${user.status}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td data-label="Assigned Branch">
                      <div className="branch-assignment">
                        <Users size={14} />
                        <span>{user.branch}</span>
                      </div>
                    </td>
                    <td data-label="Actions" className="text-right">
                      <div className="table-action-group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-icon-btn"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-icon-btn text-danger"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-icon-btn"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={resetWizard}
        title={
          wizardStep === 1
            ? "Select User Role"
            : wizardStep === 2
              ? "Assign Branch"
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
                    <h3>Branch Admin</h3>
                    <p>Can manage workers and view branch performance.</p>
                  </div>
                  {formData.role === "branch_admin" && (
                    <Check size={20} className="check-mark" />
                  )}
                </div>

                <div className="wizard-section-label">
                  <Users size={16} />
                  <span>Select Group Role</span>
                </div>

                <div className="custom-groups-grid">
                  {customGroups.map((group) => (
                    <div
                      key={group}
                      className={`group-select-card ${formData.role === group ? "active" : ""}`}
                      onClick={() => {
                        setFormData({ ...formData, role: group });
                        setIsCustomRoleActive(false);
                      }}
                    >
                      <span>{group}</span>
                      {formData.role === group && <Check size={18} />}
                    </div>
                  ))}
                  <div
                    className={`group-select-card custom-trigger ${isCustomRoleActive ? "active" : ""}`}
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
                      placeholder="Enter custom group name..."
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
                Which branch will this {formData.role.replace("_", " ")} belong
                to?
              </p>
              <div className="branch-list-selection">
                {branches.map((branch) => (
                  <div
                    key={branch}
                    className={`branch-option-card ${formData.branch === branch ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, branch })}
                  >
                    <span>{branch}</span>
                    {formData.branch === branch && <Check size={18} />}
                  </div>
                ))}
              </div>
              <div className="wizard-actions split">
                <Button variant="ghost" onClick={() => setWizardStep(1)}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button
                  disabled={!formData.branch}
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
                group can do.
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
                    desc: "Allow purchasing more credits using church funds.",
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
                        groupPermissions[formData.role] ||
                        groupPermissions.Workers;
                      setGroupPermissions({
                        ...groupPermissions,
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
                      className={`perm-toggle ${(groupPermissions[formData.role] || groupPermissions.Workers)[perm.id] ? "active" : ""}`}
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
                          groupPermissions[formData.role] ||
                          groupPermissions.Workers
                        ).dailyLimit
                      }
                      onChange={(e) => {
                        const current =
                          groupPermissions[formData.role] ||
                          groupPermissions.Workers;
                        setGroupPermissions({
                          ...groupPermissions,
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
        title={`Permissions: ${editingGroup}`}
      >
        <div className="permissions-container fade-in">
          <p className="permissions-hint">
            Define what members of the <strong>{editingGroup}</strong> group can
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
                desc: "Allow purchasing more credits using church funds.",
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
                    groupPermissions[editingGroup!] || groupPermissions.Workers;
                  setGroupPermissions({
                    ...groupPermissions,
                    [editingGroup!]: {
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
                  className={`perm-toggle ${(groupPermissions[editingGroup!] || groupPermissions.Workers)[perm.id] ? "active" : ""}`}
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
                      groupPermissions[editingGroup!] ||
                      groupPermissions.Workers
                    ).dailyLimit
                  }
                  onChange={(e) => {
                    const current =
                      groupPermissions[editingGroup!] ||
                      groupPermissions.Workers;
                    setGroupPermissions({
                      ...groupPermissions,
                      [editingGroup!]: {
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
