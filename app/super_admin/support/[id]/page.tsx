"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import '../../../(dashboard)/main/main.css';

export default function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);

  // Mock ticket
  const ticket = {
    id: unwrappedParams.id,
    org: unwrappedParams.id === 'TKT-001' ? 'Grace Community' : 'Organization',
    issue: unwrappedParams.id === 'TKT-001' ? 'Cannot upgrade to Network Plan' : 'Support Issue',
    status: 'Open',
    priority: 'High',
    messages: [
      { sender: 'Organization', role: 'Client', text: 'Hi, we are trying to upgrade our plan from Growth to Network, but the card keeps declining with a generic error. Can you help?', time: 'Oct 12, 10:00 AM' }
    ]
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/support')} style={{ borderRadius: '20px', padding: '8px 16px', border: '1px solid var(--border)' }}>
          <ArrowLeft size={16} /> Back to Tickets
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{ticket.issue}</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Ticket {ticket.id}</span>
            <span>•</span>
            <span>{ticket.org}</span>
            <span>•</span>
            <span style={{ color: '#92400e', fontWeight: 600, backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '12px' }}>{ticket.priority}</span>
            <span>•</span>
            <span style={{ color: '#3730a3', fontWeight: 600, backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '12px' }}>{ticket.status}</span>
          </div>
        </div>
        <Button variant="outline"><CheckCircle2 size={16} style={{ marginRight: '8px' }}/> Close Ticket</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {ticket.messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', backgroundColor: msg.role === 'Client' ? 'var(--bg-secondary)' : '#e0e7ff', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: msg.role === 'Client' ? 'var(--border)' : 'var(--primary)', color: msg.role === 'Client' ? 'var(--text-secondary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
              {msg.sender.substring(0, 1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{msg.sender} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({msg.role})</span></span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{msg.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="glass-morphism" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Reply to {ticket.org}</h3>
        <textarea rows={4} placeholder="Type your reply here..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical', marginBottom: '12px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button className="btn-primary"><Send size={16} style={{ marginRight: '8px' }}/> Send Reply</Button>
        </div>
      </Card>

    </div>
  );
}
