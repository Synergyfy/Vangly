"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Check, 
  X,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import './groups.css';

export default function ManageGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Mock Groups Data
  const [groups, setGroups] = useState([
    { 
      id: '1', 
      name: 'Evangelism Team', 
      type: 'hq', 
      members: [
        { id: '1', name: 'Sarah Johnson', phone: '+234 801 234 5678', joined: '2026-01-15' },
        { id: '2', name: 'Michael Brown', phone: '+234 801 234 5679', joined: '2026-02-01' },
        { id: '3', name: 'David Smith', phone: '+234 801 234 5680', joined: '2026-02-10' },
      ], 
      permissions: { invite: true, sms: true, buyCredits: false, customMsg: true } 
    },
    { 
      id: '2', 
      name: 'Follow-up Team', 
      type: 'hq', 
      members: [
        { id: '4', name: 'Emily Davis', phone: '+234 801 234 5681', joined: '2026-03-05' },
        { id: '5', name: 'James Wilson', phone: '+234 801 234 5682', joined: '2026-03-12' },
      ], 
      permissions: { invite: true, sms: false, buyCredits: false, customMsg: false } 
    },
    { 
      id: '3', 
      name: 'Downtown Outreach', 
      type: 'local', 
      members: [
        { id: '6', name: 'Robert Fox', phone: '+234 801 234 5683', joined: '2026-04-01' },
      ], 
      permissions: { invite: true, sms: true, buyCredits: true, customMsg: true } 
    },
    { 
      id: '4', 
      name: 'Youth Workers', 
      type: 'local', 
      members: [], 
      permissions: { invite: true, sms: false, buyCredits: false, customMsg: true } 
    }
  ]);

  const [newGroup, setNewGroup] = useState({
    name: '',
    permissions: { invite: true, sms: false, buyCredits: false, customMsg: false }
  });

  const handleCreateGroup = () => {
    const group = {
      id: Math.random().toString(36).substr(2, 9),
      name: newGroup.name,
      type: 'local' as const,
      members: [],
      permissions: { ...newGroup.permissions }
    };
    setGroups([...groups, group]);
    setIsCreateModalOpen(false);
    setNewGroup({
      name: '',
      permissions: { invite: true, sms: false, buyCredits: false, customMsg: false }
    });
  };

  const togglePermission = (groupId: string, perm: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          permissions: {
            ...g.permissions,
            [perm]: !((g.permissions as any)[perm])
          }
        };
      }
      return g;
    }));
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this local group? Members will be moved to 'Unassigned'.")) {
      setGroups(groups.filter(g => g.id !== groupId));
      setActiveDropdown(null);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="groups-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Manage Groups</h1>
          <p>Organize your workers into branch-specific or global HQ groups.</p>
        </div>
        <Button className="btn-premium" onClick={() => setIsCreateModalOpen(true)} style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          Create Local Group
        </Button>
      </div>

      <Card className="management-filter-card" style={{ marginTop: '2rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search groups by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem 0.75rem 3rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)',
              outline: 'none'
            }}
          />
        </div>
      </Card>

      <div className="groups-grid">
        {filteredGroups.map(group => (
          <div key={group.id} className="group-card">
            <div className="group-card-header">
              <div>
                <span className={`group-badge ${group.type}`}>
                  {group.type === 'hq' ? 'HQ Group' : 'Branch Group'}
                </span>
                <h3 className="group-title">{group.name}</h3>
              </div>
              <div className="action-menu-wrapper" style={{ position: 'relative' }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === group.id ? null : group.id);
                  }}
                >
                  <MoreHorizontal size={18} />
                </Button>
                {activeDropdown === group.id && (
                  <div className="action-dropdown fade-in">
                    <button className="dropdown-item" onClick={() => {
                      setEditingGroup(group);
                      setIsPermissionsModalOpen(true);
                      setActiveDropdown(null);
                    }}>
                      <Shield size={14} /> Edit Permissions
                    </button>
                    <button className="dropdown-item" onClick={() => {
                      setEditingGroup(group);
                      setIsMembersModalOpen(true);
                      setActiveDropdown(null);
                    }}>
                      <Users size={14} /> View Members
                    </button>
                    {group.type === 'local' && (
                      <button className="dropdown-item text-danger" onClick={() => handleDeleteGroup(group.id)}>
                        <X size={14} /> Delete Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="group-stats">
              <div className="group-stat-item">
                <Users size={14} />
                <span>{group.members.length} Members</span>
              </div>
              <div className="group-stat-item">
                <ShieldCheck size={14} />
                <span>{Object.values(group.permissions).filter(Boolean).length} Permissions</span>
              </div>
            </div>

            <div className="group-permissions-preview">
              <span className={`permission-chip ${group.permissions.invite ? 'active' : ''}`}>Invite</span>
              <span className={`permission-chip ${group.permissions.sms ? 'active' : ''}`}>SMS</span>
              <span className={`permission-chip ${group.permissions.buyCredits ? 'active' : ''}`}>Credits</span>
              <span className={`permission-chip ${group.permissions.customMsg ? 'active' : ''}`}>Custom</span>
            </div>

            <div className="group-card-footer">
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth 
                onClick={() => {
                  setEditingGroup(group);
                  setIsPermissionsModalOpen(true);
                }}
              >
                Edit Permissions
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Local Group"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input 
            label="Group Name"
            placeholder="e.g. Saturday Outreach Team"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          />
          
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
              Initial Permissions
            </label>
            <div className="permissions-wizard">
              {[
                { id: 'invite', label: 'Can Invite People', desc: 'Allows members to send registration links.' },
                { id: 'sms', label: 'Can Send SMS', desc: 'Enables messaging capabilities for members.' },
                { id: 'buyCredits', label: 'Can Buy Credits', desc: 'Allows group leads to purchase SMS credits.' },
                { id: 'customMsg', label: 'Can Create Custom Messages', desc: 'Allow writing non-template messages.' }
              ].map(perm => (
                <div 
                  key={perm.id} 
                  className="perm-toggle-row"
                  onClick={() => setNewGroup({
                    ...newGroup,
                    permissions: {
                      ...newGroup.permissions,
                      [perm.id]: !(newGroup.permissions as any)[perm.id]
                    }
                  })}
                >
                  <div className="perm-label-group">
                    <h4>{perm.label}</h4>
                    <p>{perm.desc}</p>
                  </div>
                  <div className={`toggle-switch ${(newGroup.permissions as any)[perm.id] ? 'active' : ''}`} />
                </div>
              ))}
            </div>
          </div>

          <Button 
            fullWidth 
            size="lg" 
            disabled={!newGroup.name}
            onClick={handleCreateGroup}
          >
            Create Group
          </Button>
        </div>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`Permissions: ${editingGroup?.name}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {editingGroup?.type === 'hq' && (
            <div style={{ padding: '0.75rem', background: 'var(--blue-light)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Info size={18} style={{ color: 'var(--blue)', marginTop: '2px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 500 }}>
                This is an HQ Group. Some base permissions might be locked by the super admin.
              </p>
            </div>
          )}

          <div className="permissions-wizard">
            {[
              { id: 'invite', label: 'Can Invite People', desc: 'Allows members to send registration links.' },
              { id: 'sms', label: 'Can Send SMS', desc: 'Enables messaging capabilities for members.' },
              { id: 'buyCredits', label: 'Can Buy Credits', desc: 'Allows group leads to purchase SMS credits.' },
              { id: 'customMsg', label: 'Can Create Custom Messages', desc: 'Allow writing non-template messages.' }
            ].map(perm => (
              <div 
                key={perm.id} 
                className="perm-toggle-row"
                onClick={() => togglePermission(editingGroup.id, perm.id)}
              >
                <div className="perm-label-group">
                  <h4>{perm.label}</h4>
                  <p>{perm.desc}</p>
                </div>
                <div className={`toggle-switch ${editingGroup ? (groups.find(g => g.id === editingGroup.id)?.permissions as any)[perm.id] ? 'active' : '' : ''}`} />
              </div>
            ))}
          </div>

          <Button fullWidth size="lg" onClick={() => setIsPermissionsModalOpen(false)}>
            Save Changes
          </Button>
        </div>
      </Modal>
      {/* View Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title={`Members: ${editingGroup?.name}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Filter members..." 
              style={{ 
                width: '100%', 
                padding: '0.6rem 1rem 0.6rem 2.5rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div className="members-list" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {editingGroup?.members.length > 0 ? (
              editingGroup.members.map((member: any) => (
                <div key={member.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'var(--blue-light)', 
                      color: 'var(--blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{member.phone}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                    Joined<br/>{member.joined}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>No members in this group yet.</p>
              </div>
            )}
          </div>

          <Button fullWidth onClick={() => setIsMembersModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
