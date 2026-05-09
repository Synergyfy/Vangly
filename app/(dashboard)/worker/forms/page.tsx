"use client";

import React from 'react';
import { 
  FileText, 
  Users, 
  UserPlus, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  ClipboardList,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import './worker-forms.css';

export default function WorkerFormsPage() {
  const router = useRouter();

  const forms = [
    {
      href: '/worker/add-invite',
      usage: 'High',
      estimatedTime: '2 mins'
    },
    {
      id: '2',
      title: 'Follow-up Report',
      description: 'Record the outcome of a phone call or visit to a contact.',
      icon: <ClipboardList size={24} />,
      color: 'var(--purple)',
      href: '/worker/invites',
      usage: 'Daily',
      estimatedTime: '3 mins'
    },
    {
      id: '3',
      title: 'Event Interest Form',
      description: 'Track people interested in upcoming church programs.',
      icon: <Target size={24} />,
      color: 'var(--orange)',
      href: '/worker/add-invite', // Defaulting to add-invite for now
      usage: 'Medium',
      estimatedTime: '1 min'
    }
  ];

  return (
    <div className="worker-forms-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1>Available Forms</h1>
            <p>Select a tool to begin collecting data and recording impact.</p>
          </div>
        </div>
      </div>

      <div className="forms-grid">
        {forms.map(form => (
          <Card key={form.id} className="form-tool-card" onClick={() => router.push(form.href)}>
            <div className="form-tool-icon" style={{ backgroundColor: `${form.color}15`, color: form.color }}>
              {form.icon}
            </div>
            <div className="form-tool-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{form.title}</h3>
                <div className="form-usage-pill">{form.usage} Usage</div>
              </div>
              <p>{form.description}</p>
              
              <div className="form-tool-footer">
                <div className="footer-item">
                  <Clock size={14} />
                  <span>{form.estimatedTime}</span>
                </div>
                <div className="footer-item" style={{ marginLeft: 'auto' }}>
                  <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Launch Form</span>
                  <ChevronRight size={16} style={{ color: 'var(--blue)' }} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="forms-info-section">
        <Card className="impact-tip-card">
          <div className="tip-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h4>Pro Tip: Real-time Entry</h4>
            <p>Filling out forms while talking to guests ensures higher accuracy and faster follow-up response times.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
