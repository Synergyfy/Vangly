"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  Plus, 
  UserCircle, 
  Hash,
  Mail,
  Phone,
  MoreVertical,
  MapPin
} from 'lucide-react';
import '../management.css';

function BranchDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchName = searchParams.get('name') || 'Branch';
  
  const [activeForm, setActiveForm] = useState<'none' | 'admin' | 'worker'>('none');
  const [pin, setPin] = useState('');

  // Mock data
  const branchAdmins = [
    { id: 'a1', name: 'Robert Miller', email: 'robert@vangly.com', phone: '+234 801 234 5678' }
  ];
  const branchWorkers = [
    { id: 'w1', name: 'Linda Garcia', phone: '+234 802 345 6789', invites: 42 },
    { id: 'w2', name: 'Sarah Johnson', phone: '+234 804 567 8901', invites: 25 },
  ];

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={() => router.push('/hq/manage-church')} className="back-btn-header">
          <ArrowLeft size={18} /> Back to Network
        </Button>
        <div style={{ marginTop: '16px' }}>
          <h1>{branchName}</h1>
          <p>Manage staff and monitor soul-winning performance for this location.</p>
        </div>
      </div>

      <div className="branch-manage-layout">
        <section className="manage-section">
          <div className="section-header-flex">
            <h2 className="section-title"><ShieldCheck size={20} /> Branch Admins</h2>
            <Button size="sm" variant="outline" onClick={() => setActiveForm('admin')} style={{ gap: '6px' }}>
              <Plus size={16} /> Add Admin
            </Button>
          </div>

          {activeForm === 'admin' && (
            <Card className="inline-form-card">
              <div className="inline-form-header">
                <h3>New Branch Admin</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveForm('none')}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></Button>
              </div>
              <form className="inline-form">
                <div className="form-grid">
                  <Input label="Full Name" placeholder="e.g. Robert Miller" required />
                  <Input label="Email" type="email" placeholder="admin@branch.com" required />
                </div>
                <div className="form-grid">
                  <Input label="PIN (6 digits)" type="password" placeholder="••••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
                  <Input label="Confirm PIN" type="password" placeholder="••••••" maxLength={6} required />
                </div>
                <Button fullWidth size="sm">Create Admin Account</Button>
              </form>
            </Card>
          )}

          <div className="staff-list">
            {branchAdmins.map(admin => (
              <Card key={admin.id} className="staff-item-card">
                <div className="staff-main-info">
                  <div className="staff-avatar"><UserCircle size={32} /></div>
                  <div className="staff-details">
                    <h4>{admin.name}</h4>
                    <div className="staff-meta">
                      <span><Mail size={12} /> {admin.email}</span>
                      <span><Phone size={12} /> {admin.phone}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm"><MoreVertical size={18} /></Button>
              </Card>
            ))}
          </div>
        </section>

        <section className="manage-section">
          <div className="section-header-flex">
            <h2 className="section-title"><Users size={20} /> Church Workers</h2>
            <Button size="sm" variant="outline" onClick={() => setActiveForm('worker')} style={{ gap: '6px' }}>
              <Plus size={16} /> Add Worker
            </Button>
          </div>

          {activeForm === 'worker' && (
            <Card className="inline-form-card">
              <div className="inline-form-header">
                <h3>New Church Worker</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveForm('none')}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></Button>
              </div>
              <form className="inline-form">
                <div className="form-grid">
                  <Input label="Full Name" placeholder="e.g. Linda Garcia" required />
                  <Input label="Phone (WhatsApp)" placeholder="+234..." required />
                </div>
                <div className="form-grid">
                  <Input label="PIN (6 digits)" type="password" placeholder="••••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
                  <Input label="Confirm PIN" type="password" placeholder="••••••" maxLength={6} required />
                </div>
                <Button fullWidth size="sm">Create Worker Account</Button>
              </form>
            </Card>
          )}

          <div className="staff-list">
            {branchWorkers.map(worker => (
              <Card key={worker.id} className="staff-item-card">
                <div className="staff-main-info">
                  <div className="staff-avatar"><UserCircle size={32} /></div>
                  <div className="staff-details">
                    <h4>{worker.name}</h4>
                    <div className="staff-meta">
                      <span><Phone size={12} /> {worker.phone}</span>
                      <span className="text-primary">{worker.invites} total invites</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm"><MoreVertical size={18} /></Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function BranchManagementPage() {
  return (
    <Suspense fallback={<div>Loading branch details...</div>}>
      <BranchDetailsContent />
    </Suspense>
  );
}
