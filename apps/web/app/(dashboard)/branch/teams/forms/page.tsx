"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  ArrowLeft, 
  Search,
  Layout,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import '../groups.css';

export default function TeamFormsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [mockForms] = useState([
    { id: 'f1', title: 'Member Registration', submissions: 120, status: 'Active', category: 'Growth' },
    { id: 'f2', title: 'Weekly Outreach Feedback', submissions: 45, status: 'Active', category: 'Outreach' },
    { id: 'f3', title: 'Special Event Signup', submissions: 82, status: 'Active', category: 'Events' },
  ]);

  return (
    <div className="hq-dashboard-premium teams-container-v2 animate-premium">
      <header className="dashboard-header-premium" style={{ border: 'none', background: 'transparent', padding: '24px 0' }}>
        <div className="header-left">
          <button className="back-link-premium" onClick={() => router.push('/branch/teams')}>
            <ArrowLeft size={18} /> Back to Teams
          </button>
          
          <div className="badge-premium blue">OPERATIONAL TOOLS</div>
          <h1>Team Outreach Forms</h1>
          <p>Manage and distribute forms across all your location's outreach units.</p>
        </div>

        <div className="header-actions">
           <Button className="btn-premium" onClick={() => router.push('/branch/forms')}>
              <Plus size={18} /> Create New Form
           </Button>
        </div>
      </header>

      <div className="teams-grid-view fade-in">
        <div className="section-actions" style={{ marginBottom: '32px' }}>
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search forms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="forms-grid-v2">
          {mockForms.filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
            <Card key={f.id} className="form-item-card-v2" onClick={() => router.push(`/branch/forms/${f.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="team-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <Layout size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', fontSize: '16px' }}>{f.title}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{f.category}</span>
                       <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
                       <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>{f.submissions} Submissions</span>
                    </div>
                  </div>
                </div>
                <button className="icon-action"><MoreVertical size={20} /></button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                 <Button variant="outline" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); router.push(`/branch/forms/${f.id}/results`); }}>View Results</Button>
                 <Button variant="outline" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); router.push(`/branch/forms/${f.id}/settings`); }}>Settings</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
