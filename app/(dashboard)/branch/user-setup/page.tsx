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
import { useRouter } from "next/navigation";
import "../branch.css";

export default function BranchUserSetupPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard Form State
  const [formData, setFormData] = useState({
    role: "",
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

  const [users, setUsers] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@downtown-hq.org",
      phone: "+234 801 234 5678",
      role: "Workers",
      status: "active",
    },
    {
      id: "2",
      name: "Michael Brown",
      email: "m.brown@downtown-hq.org",
      phone: "+234 801 234 5679",
      role: "Volunteers",
      status: "active",
    },
  ]);

  const customTeams = [
    "Workers",
    "Volunteers",
    "Members",
    "Evangelism Team",
    "Follow-up Team",
    "Cell Leaders",
  ];

  const resetWizard = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setWizardStep(1);
      setFormData({ role: "", name: "", phone: "", pin: "" });
    }, 300);
  };

  const handleCreateUser = () => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: `${formData.name.toLowerCase().replace(/\s+/g, ".")}@downtown-hq.org`,
      phone: formData.phone,
      role: formData.role as any,
      status: "active",
    };
    setUsers([newUser, ...users]);
    resetWizard();
  };

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Branch Operations</div>
          <h1>Staff & Team Setup</h1>
          <p>Manage access for your local branch workers and volunteers.</p>
        </div>
        <div className="header-actions">
          <Button className="btn-premium" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> <span>Add User</span>
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <Card className="stat-card glass-morphism" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-placeholder)' }} />
              <input
                type="text"
                className="input-premium"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="team-card-premium glass-morphism">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Role</th>
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
            ? "Select Team Role"
            : wizardStep === 2
              ? "Configure Permissions"
              : "User Details"
        }
      >
        <div className="wizard-container">
          {wizardStep === 1 && (
            <div className="wizard-step-content fade-in">
              <div className="custom-teams-grid">
                {customTeams.map((team) => (
                  <div
                    key={team}
                    className={`team-select-card ${formData.role === team ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, role: team })}
                  >
                    <span>{team}</span>
                    {formData.role === team && <Check size={18} />}
                  </div>
                ))}
              </div>
              <Button fullWidth onClick={() => setWizardStep(2)} disabled={!formData.role}>Continue</Button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="wizard-step-content fade-in">
              <p>Configure team-specific permissions...</p>
              <Button fullWidth onClick={() => setWizardStep(3)}>Next</Button>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="wizard-step-content fade-in">
              <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <Button fullWidth onClick={handleCreateUser}>Create User</Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
