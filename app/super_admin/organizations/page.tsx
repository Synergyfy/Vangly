"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  ArrowUpCircle,
  ExternalLink,
  X,
  AlertTriangle,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../../(dashboard)/main/main.css';

export default function OrganizationsPage() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  // Modals state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isSimulatingLogin, setIsSimulatingLogin] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const [orgs, setOrgs] = useState([
    { id: 1, name: 'Global Impact Ministries', plan: 'Enterprise', locations: 42, teams: 150, responses: '125k', status: 'Active', date: 'Oct 12, 2025' },
    { id: 2, name: 'City Lights Church', plan: 'Network', locations: 14, teams: 45, responses: '42k', status: 'Active', date: 'Nov 05, 2025' },
    { id: 3, name: 'Hope Foundation NGO', plan: 'Network', locations: 8, teams: 32, responses: '18k', status: 'Active', date: 'Jan 15, 2026' },
    { id: 4, name: 'Grace Community', plan: 'Growth', locations: 5, teams: 12, responses: '8.5k', status: 'Warning', date: 'Feb 20, 2026' },
    { id: 5, name: 'New Beginnings Outreach', plan: 'Free', locations: 1, teams: 3, responses: '1.2k', status: 'Suspended', date: 'Mar 10, 2026' },
  ]);

  const selectedOrg = orgs.find(o => o.id === selectedOrgId);

  const openSuspendModal = (id: number) => {
    setSelectedOrgId(id);
    setActiveDropdown(null);
    setSuspendReason('');
    setSuspendModalOpen(true);
  };

  const openUpgradeModal = (id: number) => {
    setSelectedOrgId(id);
    setActiveDropdown(null);
    setUpgradeModalOpen(true);
  };

  const handleLoginAsOrg = () => {
    setActiveDropdown(null);
    setIsSimulatingLogin(true);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) return;
    if (selectedOrgId) {
      setOrgs(orgs.map(o => o.id === selectedOrgId ? { ...o, status: 'Suspended' } : o));
    }
    setSuspendModalOpen(false);
    setSuspendReason('');
  };

  const handleUpgrade = (newPlan: string) => {
    if (selectedOrgId) {
      setOrgs(orgs.map(o => o.id === selectedOrgId ? { ...o, plan: newPlan } : o));
    }
    setUpgradeModalOpen(false);
  };

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      
      {/* Login Simulation Overlay */}
      {isSimulatingLogin && (
        <div className="modal-overlay" style={{ zIndex: 9999, flexDirection: 'column', gap: '20px', color: 'white' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Switching Context...</h2>
          <p>Logging into Organization Dashboard</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModalOpen && selectedOrg && (
        <div className="modal-overlay">
          <div className="modal-card-premium" style={{ maxWidth: '400px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color="var(--red)" />
                </div>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Suspend Organization</h2>
              </div>
              <button onClick={() => setSuspendModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20}/></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                Are you sure you want to suspend <strong>{selectedOrg.name}</strong>? 
                They will lose access to the platform immediately, and all their active forms will be disabled.
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Reason for Suspension (Required)</label>
                <textarea 
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Explain why this account is being suspended. The organization owner will see this reason..."
                  rows={4}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', backgroundColor: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>Cancel</Button>
                <Button style={{ backgroundColor: suspendReason.trim() ? 'var(--red)' : 'var(--border)', color: suspendReason.trim() ? 'white' : 'var(--text-muted)', cursor: suspendReason.trim() ? 'pointer' : 'not-allowed' }} onClick={handleSuspend} disabled={!suspendReason.trim()}>Proceed to Suspend</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalOpen && selectedOrg && (
        <div className="modal-overlay">
          <div className="modal-card-premium" style={{ maxWidth: '400px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpCircle size={20} />
                </div>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Change Plan</h2>
              </div>
              <button onClick={() => setUpgradeModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20}/></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Select a new billing plan for <strong>{selectedOrg.name}</strong>.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Free', 'Growth', 'Network', 'Enterprise'].map(plan => (
                  <button 
                    key={plan}
                    onClick={() => handleUpgrade(plan)}
                    style={{ 
                      padding: '16px', borderRadius: '12px', border: selectedOrg.plan === plan ? '2px solid var(--primary)' : '1px solid var(--border)', 
                      background: selectedOrg.plan === plan ? 'var(--blue-subtle)' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: selectedOrg.plan === plan ? 'var(--primary)' : 'var(--text-primary)' }}>{plan} Plan</span>
                    {selectedOrg.plan === plan && <Check size={18} color="var(--primary)" />}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={28} color="var(--purple)" /> 
            Organizations
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage all organizations on the Harvite platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search orgs..." style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', width: '250px' }} />
          </div>
          <Button variant="outline"><Filter size={18} style={{ marginRight: '8px' }} /> Filters</Button>
        </div>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Plan</th>
                <th>Locations</th>
                <th>Teams</th>
                <th>Responses</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td style={{ fontWeight: 600 }}>{org.name}</td>
                  <td><span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{org.plan}</span></td>
                  <td>{org.locations}</td>
                  <td>{org.teams}</td>
                  <td>{org.responses}</td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                      backgroundColor: org.status === 'Active' ? '#dcfce7' : org.status === 'Warning' ? '#fef3c7' : '#fee2e2',
                      color: org.status === 'Active' ? '#166534' : org.status === 'Warning' ? '#92400e' : '#991b1b'
                    }}>
                      {org.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>{org.date}</td>
                  <td style={{ position: 'relative' }}>
                    <button className="btn-icon-only" onClick={() => setActiveDropdown(activeDropdown === org.id ? null : org.id)}>
                      <MoreHorizontal size={18} />
                    </button>
                    {activeDropdown === org.id && (
                      <div className="dropdown-panel-premium" style={{ position: 'absolute', right: '40px', top: '10px', zIndex: 10 }}>
                        <button className="dropdown-item" onClick={() => router.push(`/super_admin/organizations/${org.id}`)}>
                          <Eye size={14} /> View Profile
                        </button>
                        <button className="dropdown-item" onClick={handleLoginAsOrg}><ExternalLink size={14} /> Login As Org</button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={() => openUpgradeModal(org.id)}><ArrowUpCircle size={14} /> Change Plan</button>
                        <button className="dropdown-item danger" onClick={() => openSuspendModal(org.id)}><Ban size={14} /> Suspend</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
