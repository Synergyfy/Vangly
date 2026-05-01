"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserPlus, Search, Shield, Users, Edit3, Trash2, Filter, Mail, Phone, MoreHorizontal, ChevronRight, ArrowLeft, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import '../hq.css';

export default function UserSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Wizard Form State
  const [formData, setFormData] = useState({
    role: '',
    branch: '',
    name: '',
    phone: '',
    pin: ''
  });

  const [users, setUsers] = useState([
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@church.org', phone: '+234 801 234 5678', role: 'worker', branch: 'HQ Branch', status: 'active' },
    { id: '2', name: 'Michael Brown', email: 'm.brown@church.org', phone: '+234 801 234 5679', role: 'worker', branch: 'HQ Branch', status: 'active' },
    { id: '3', name: 'Jane Doe', email: 'jane.doe@church.org', phone: '+234 801 234 5680', role: 'branch_admin', branch: 'Northside Branch', status: 'active' },
    { id: '4', name: 'David Smith', email: 'd.smith@church.org', phone: '+234 801 234 5681', role: 'worker', branch: 'Westend Campus', status: 'inactive' },
  ]);

  const branches = ['HQ Branch', 'Northside Branch', 'Westend Campus', 'Southpark Satellite'];

  const resetWizard = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setWizardStep(1);
      setFormData({ role: '', branch: '', name: '', phone: '', pin: '' });
    }, 300);
  };

  const handleCreateUser = () => {
    // In a real app, this would be an API call
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@church.org`,
      phone: formData.phone,
      role: formData.role as any,
      branch: formData.branch,
      status: 'active'
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
          <p>Configure access for Branch Admins and Church Workers across your network.</p>
        </div>
        <Button className="btn-premium" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} /> <span>Add New User</span>
        </Button>
      </div>

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
                {users.map(user => (
                  <tr key={user.id} className="user-row">
                    <td>
                      <div className="user-cell-profile">
                        <div className="user-avatar-initials">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="user-meta-info">
                          <span className="user-display-name">{user.name}</span>
                          <div className="user-contact-links">
                            <span><Mail size={12} /> {user.email}</span>
                            <span><Phone size={12} /> {user.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="role-status-stack">
                        <span className={`role-pill ${user.role}`}>
                          {user.role === 'branch_admin' ? 'Branch Admin' : 'Worker'}
                        </span>
                        <span className={`status-indicator ${user.status}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="branch-assignment">
                        <Users size={14} />
                        <span>{user.branch}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-action-group">
                        <Button variant="ghost" size="sm" className="action-icon-btn"><Edit3 size={16} /></Button>
                        <Button variant="ghost" size="sm" className="action-icon-btn text-danger"><Trash2 size={16} /></Button>
                        <Button variant="ghost" size="sm" className="action-icon-btn"><MoreHorizontal size={16} /></Button>
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
        title={wizardStep === 1 ? "Select User Role" : wizardStep === 2 ? "Assign Branch" : "User Details"}
      >
        <div className="wizard-container">
          <div className="wizard-steps-indicator">
            {[1, 2, 3].map(i => (
              <div key={i} className={`wizard-dot ${wizardStep >= i ? 'active' : ''}`} />
            ))}
          </div>

          {wizardStep === 1 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">What type of account are you creating?</p>
              <div className="role-selection-grid">
                <div 
                  className={`role-select-card ${formData.role === 'branch_admin' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'branch_admin' })}
                >
                  <div className="role-icon-circle"><Shield size={24} /></div>
                  <div className="role-text">
                    <h3>Branch Admin</h3>
                    <p>Can manage workers and view branch performance.</p>
                  </div>
                  {formData.role === 'branch_admin' && <Check size={20} className="check-mark" />}
                </div>

                <div 
                  className={`role-select-card ${formData.role === 'worker' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'worker' })}
                >
                  <div className="role-icon-circle"><Users size={24} /></div>
                  <div className="role-text">
                    <h3>Church Worker</h3>
                    <p>Can share links, capture invites, and send messages.</p>
                  </div>
                  {formData.role === 'worker' && <Check size={20} className="check-mark" />}
                </div>
              </div>
              <div className="wizard-actions">
                <Button fullWidth size="lg" disabled={!formData.role} onClick={() => setWizardStep(2)}>
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">Which branch will this {formData.role.replace('_', ' ')} belong to?</p>
              <div className="branch-list-selection">
                {branches.map(branch => (
                  <div 
                    key={branch}
                    className={`branch-option-card ${formData.branch === branch ? 'active' : ''}`}
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
                <Button disabled={!formData.branch} onClick={() => setWizardStep(3)}>
                  Next Step <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="wizard-step-content fade-in">
              <p className="wizard-hint">Finally, enter the credentials for this user.</p>
              <div className="form-stack">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input 
                  label="Phone Number" 
                  placeholder="+234..." 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input 
                  label="Security PIN (6 digits)" 
                  type="password"
                  placeholder="••••••" 
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                />
              </div>
              <div className="wizard-actions split" style={{ marginTop: '24px' }}>
                <Button variant="ghost" onClick={() => setWizardStep(2)}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button 
                  disabled={!formData.name || !formData.phone || formData.pin.length < 6}
                  onClick={handleCreateUser}
                >
                  Create Account <Check size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
