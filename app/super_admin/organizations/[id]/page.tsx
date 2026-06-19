"use client";

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  ArrowLeft, 
  MapPin, 
  Users, 
  CreditCard, 
  Activity,
  Ban,
  ArrowUpCircle,
  ExternalLink,
  ChevronRight,
  User,
  AlertTriangle,
  X,
  Check,
  FileText,
  ClipboardList,
  Eye,
  Calendar
} from 'lucide-react';
import '../../../(dashboard)/main/main.css';

// Mock Hierarchy Data with Responses Added
const orgHierarchy = [
  {
    id: 'loc1', name: 'Main Campus', address: '123 Faith Ave, NY',
    teams: [
      { 
        id: 'team1', name: 'Greeting Team', 
        forms: [
          { 
            id: 'f1', name: 'First Time Guest Form', responseCount: 145,
            responses: [
              { id: 'r1', name: 'Sarah Connor', email: 'sarah@example.com', date: '2026-06-18', status: 'Followed Up' },
              { id: 'r2', name: 'John Doe', email: 'john@example.com', date: '2026-06-17', status: 'Pending' }
            ]
          }
        ],
        contacts: [
          { id: 'c1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Volunteer', joined: 'Oct 2025' },
          { id: 'c2', name: 'Bob Smith', email: 'bob@example.com', role: 'Team Lead', joined: 'Nov 2025' }
        ]
      },
      { 
        id: 'team2', name: 'Kids Ministry',
        forms: [
          { 
            id: 'f2', name: 'Child Check-in', responseCount: 890,
            responses: [
              { id: 'r3', name: 'Michael Scott', email: 'michael@example.com', date: '2026-06-18', status: 'Checked In' }
            ]
          }
        ],
        contacts: [
          { id: 'c3', name: 'Charlie Davis', email: 'charlie@example.com', role: 'Teacher', joined: 'Jan 2026' }
        ]
      }
    ]
  },
  {
    id: 'loc2', name: 'North Branch', address: '45 Grace St, CA',
    teams: [
      { 
        id: 'team3', name: 'Worship Band',
        forms: [],
        contacts: [
          { id: 'c4', name: 'Diana Prince', email: 'diana@example.com', role: 'Vocalist', joined: 'Dec 2025' }
        ]
      }
    ]
  }
];

type ViewState = 'overview' | 'location' | 'team';

export default function OrganizationProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  
  // Modals state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isSimulatingLogin, setIsSimulatingLogin] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  
  // Drill-down State
  const [view, setView] = useState<ViewState>('overview');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  // Team View Tabs & Nested State
  const [teamTab, setTeamTab] = useState<'contacts' | 'forms'>('contacts');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null); // For viewing form responses
  const [selectedResponse, setSelectedResponse] = useState<any>(null); // For viewing individual response details

  // Mock data for the specific organization
  const [org, setOrg] = useState({
    id: unwrappedParams.id,
    name: unwrappedParams.id === '1' ? 'Global Impact Ministries' : 'Organization ' + unwrappedParams.id,
    plan: 'Enterprise',
    status: 'Active',
    created: 'Oct 12, 2025',
    locations: 42,
    teams: 150,
    responses: '125k',
    mrr: 150000,
    ownerName: 'David O.',
    ownerEmail: 'david@globalimpact.org',
    ownerPhone: '+234 800 123 4567'
  });

  const handleLoginAsOrg = () => {
    setIsSimulatingLogin(true);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) return;
    setOrg({ ...org, status: 'Suspended' });
    setSuspendModalOpen(false);
    setSuspendReason('');
  };

  const handleUpgrade = (newPlan: string) => {
    setOrg({ ...org, plan: newPlan });
    setUpgradeModalOpen(false);
  };

  const selectedLocation = orgHierarchy.find(loc => loc.id === selectedLocationId);
  const selectedTeam = selectedLocation?.teams.find(t => t.id === selectedTeamId);
  const selectedForm = selectedTeam?.forms.find(f => f.id === selectedFormId);

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
      {suspendModalOpen && (
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
                Are you sure you want to suspend <strong>{org.name}</strong>? 
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
      {upgradeModalOpen && (
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
                Select a new billing plan for <strong>{org.name}</strong>.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Free', 'Growth', 'Network', 'Enterprise'].map(plan => (
                  <button 
                    key={plan}
                    onClick={() => handleUpgrade(plan)}
                    style={{ 
                      padding: '16px', borderRadius: '12px', border: org.plan === plan ? '2px solid var(--primary)' : '1px solid var(--border)', 
                      background: org.plan === plan ? 'var(--blue-subtle)' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: org.plan === plan ? 'var(--primary)' : 'var(--text-primary)' }}>{plan} Plan</span>
                    {org.plan === plan && <Check size={18} color="var(--primary)" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Details Modal */}
      {selectedResponse && (
        <div className="modal-overlay">
          <div className="modal-card-premium" style={{ maxWidth: '500px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--blue)" />
                </div>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Response Details</h2>
              </div>
              <button onClick={() => setSelectedResponse(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20}/></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Respondent Name</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedResponse.name}</div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Email Address</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedResponse.email}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Date Submitted</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedResponse.date}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Status</div>
                    <span style={{ 
                      fontSize: '13px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, display: 'inline-block',
                      backgroundColor: selectedResponse.status === 'Followed Up' ? '#dcfce7' : '#fef3c7',
                      color: selectedResponse.status === 'Followed Up' ? '#166534' : '#92400e'
                    }}>
                      {selectedResponse.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Submitted Data Payload</div>
                  <pre style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', margin: 0 }}>
{JSON.stringify({
  "Message": "I would like to learn more about volunteering opportunities.",
  "Phone": "+1234567890",
  "Interests": ["Greeting", "Coffee Setup"]
}, null, 2)}
                  </pre>
                </div>

              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <Button className="btn-primary" onClick={() => setSelectedResponse(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        {view === 'overview' && (
          <Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/organizations')} style={{ borderRadius: '20px', padding: '8px 16px', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} /> Back to Organizations
          </Button>
        )}
        {view === 'location' && (
          <Button variant="ghost" size="sm" onClick={() => setView('overview')} style={{ borderRadius: '20px', padding: '8px 16px', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} /> Back to {org.name} Overview
          </Button>
        )}
        {view === 'team' && (
          <Button variant="ghost" size="sm" onClick={() => {
            if (selectedFormId) {
              setSelectedFormId(null);
            } else {
              setView('location');
            }
          }} style={{ borderRadius: '20px', padding: '8px 16px', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} /> {selectedFormId ? `Back to ${selectedTeam?.name}` : `Back to ${selectedLocation?.name}`}
          </Button>
        )}
      </div>

      {view === 'overview' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
              {org.name.substring(0, 1)}
            </div>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{org.name}</h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>ID: {org.id}</span>
                <span>•</span>
                <span>Created: {org.created}</span>
                <span>•</span>
                <span style={{ 
                  fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                  backgroundColor: org.status === 'Active' ? '#dcfce7' : '#fee2e2',
                  color: org.status === 'Active' ? '#166534' : '#991b1b'
                }}>
                  {org.status}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={handleLoginAsOrg}><ExternalLink size={16} style={{ marginRight: '8px' }}/> Login As Org</Button>
            <Button variant="outline" onClick={() => setUpgradeModalOpen(true)}><ArrowUpCircle size={16} style={{ marginRight: '8px' }}/> Change Plan</Button>
            <Button variant="outline" style={{ color: 'var(--red)', borderColor: '#fca5a5' }} onClick={() => setSuspendModalOpen(true)}><Ban size={16} style={{ marginRight: '8px' }}/> Suspend</Button>
          </div>
        </div>
      )}

      {/* Overview Level */}
      {view === 'overview' && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <Card className="glass-morphism" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-tertiary)' }}>Primary Owner</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Name</div><div style={{ fontWeight: 600 }}>{org.ownerName}</div></div>
                <div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Email</div><div style={{ fontWeight: 600 }}>{org.ownerEmail}</div></div>
                <div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Phone</div><div style={{ fontWeight: 600 }}>{org.ownerPhone}</div></div>
              </div>
            </Card>

            <Card className="glass-morphism" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CreditCard size={18} color="var(--purple)" />
                <h3 style={{ fontSize: '16px', margin: 0 }}>Subscription</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Current Plan</span><span style={{ fontWeight: 700 }}>{org.plan}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Monthly Value</span><span style={{ fontWeight: 700 }}>₦{org.mrr.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Billing Status</span><span style={{ fontWeight: 700, color: 'var(--green)' }}>Paid</span></div>
              </div>
            </Card>

            <Card className="glass-morphism" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Activity size={18} color="var(--blue)" />
                <h3 style={{ fontSize: '16px', margin: 0 }}>Platform Usage</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Locations</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{org.locations}</div></div>
                <div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Teams</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{org.teams}</div></div>
                <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Total Responses</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{org.responses}</div></div>
              </div>
            </Card>
          </div>

          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={24} color="var(--primary)" /> 
            Locations ({orgHierarchy.length})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {orgHierarchy.map(location => (
              <Card 
                key={location.id} 
                className="hover-card"
                onClick={() => { setSelectedLocationId(location.id); setView('location'); }}
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={24} color="var(--blue)" />
                  </div>
                  <ChevronRight size={20} color="var(--text-tertiary)" />
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{location.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{location.address}</p>
                
                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    {location.teams.length} Teams
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Location Level */}
      {view === 'location' && selectedLocation && (
        <div className="animation-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={28} color="var(--blue)" />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{selectedLocation.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{selectedLocation.address} • Part of {org.name}</p>
            </div>
          </div>

          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} color="var(--purple)" /> 
            Teams & Dashboards ({selectedLocation.teams.length})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {selectedLocation.teams.map(team => (
              <Card 
                key={team.id} 
                className="hover-card"
                onClick={() => { setSelectedTeamId(team.id); setTeamTab('contacts'); setSelectedFormId(null); setView('team'); }}
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="var(--purple)" />
                  </div>
                  <ChevronRight size={20} color="var(--text-tertiary)" />
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{team.name}</h3>
                
                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    {team.contacts.length} Contacts
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    {team.forms.length} Forms
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team Level */}
      {view === 'team' && selectedTeam && selectedLocation && (
        <div className="animation-fade-in">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} color="var(--purple)" />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{selectedTeam.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Under {selectedLocation.name} • Part of {org.name}</p>
            </div>
          </div>

          {!selectedFormId ? (
            <Card style={{ padding: '0', overflow: 'hidden' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
                <button 
                  onClick={() => setTeamTab('contacts')}
                  style={{ 
                    padding: '16px 24px', border: 'none', background: 'none', 
                    borderBottom: teamTab === 'contacts' ? '2px solid var(--primary)' : '2px solid transparent', 
                    color: teamTab === 'contacts' ? 'var(--primary)' : 'var(--text-secondary)', 
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <User size={18} /> Contacts & Members ({selectedTeam.contacts.length})
                </button>
                <button 
                  onClick={() => setTeamTab('forms')}
                  style={{ 
                    padding: '16px 24px', border: 'none', background: 'none', 
                    borderBottom: teamTab === 'forms' ? '2px solid var(--primary)' : '2px solid transparent', 
                    color: teamTab === 'forms' ? 'var(--primary)' : 'var(--text-secondary)', 
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <FileText size={18} /> Forms & Responses ({selectedTeam.forms.length})
                </button>
              </div>

              {/* Tab Content */}
              <div style={{ padding: '24px' }}>
                
                {teamTab === 'contacts' && (
                  <div className="animation-fade-in">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedTeam.contacts.length > 0 ? selectedTeam.contacts.map(contact => (
                        <div key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                            {contact.name.substring(0, 1)}
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{contact.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{contact.email}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Joined {contact.joined}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue)', backgroundColor: 'var(--blue-subtle)', padding: '4px 10px', borderRadius: '12px' }}>
                              {contact.role}
                            </span>
                          </div>
                        </div>
                      )) : <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px' }}>No contacts found for this team.</div>}
                    </div>
                  </div>
                )}

                {teamTab === 'forms' && (
                  <div className="animation-fade-in">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedTeam.forms.length > 0 ? selectedTeam.forms.map(form => (
                        <div 
                          key={form.id} 
                          onClick={() => setSelectedFormId(form.id)}
                          className="hover-card"
                          style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ClipboardList size={20} color="var(--blue)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{form.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>ID: {form.id}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '18px', fontWeight: 700 }}>{form.responseCount}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Responses</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                              View Data <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      )) : <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px' }}>No forms found for this team.</div>}
                    </div>
                  </div>
                )}

              </div>
            </Card>
          ) : (
            /* Form Responses Drill-down */
            <Card style={{ padding: '0', overflow: 'hidden' }} className="animation-fade-in">
              {selectedForm && (
                <>
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '18px', margin: 0 }}>{selectedForm.name}</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Showing specific responses</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                      Total: {selectedForm.responseCount}
                    </div>
                  </div>
                  
                  <div className="table-responsive">
                    <table className="data-table-premium" style={{ width: '100%', minWidth: '600px' }}>
                      <thead>
                        <tr>
                          <th>Respondent Name</th>
                          <th>Email</th>
                          <th>Date Submitted</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedForm.responses.map(resp => (
                          <tr key={resp.id}>
                            <td style={{ fontWeight: 600 }}>{resp.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{resp.email}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                <Calendar size={14} /> {resp.date}
                              </div>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                                backgroundColor: resp.status === 'Followed Up' ? '#dcfce7' : '#fef3c7',
                                color: resp.status === 'Followed Up' ? '#166534' : '#92400e'
                              }}>
                                {resp.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Button variant="ghost" size="sm" style={{ color: 'var(--primary)' }} onClick={() => setSelectedResponse(resp)}>
                                <Eye size={16}/>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card>
          )}

        </div>
      )}

      <style>{`
        .animation-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-card:hover {
          border-color: var(--blue) !important;
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
