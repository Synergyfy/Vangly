"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, MessageSquare, Mail } from 'lucide-react';
import '../../main.css';

function WorkerInvitesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerName = searchParams.get('name') || 'Worker';
  const workerId = searchParams.get('id');

  // Mock invites for this specific worker
  const workerInvites = [
    { id: 'i1', name: 'James Wilson', phone: '+1 555 9001', status: 'attended', date: 'Oct 22, 2023' },
    { id: 'i2', name: 'Mary Adams', phone: '+1 555 9002', status: 'invited', date: 'Oct 21, 2023' },
    { id: 'i3', name: 'Robert Chen', phone: '+1 555 9003', status: 'attended', date: 'Oct 19, 2023' },
    { id: 'i4', name: 'Patricia Kalu', phone: '+1 555 9004', status: 'invited', date: 'Oct 18, 2023' },
    { id: 'i5', name: 'Linda Blair', phone: '+1 555 9005', status: 'invited', date: 'Oct 17, 2023' },
  ];

  const handleMessageUser = (phone: string) => {
    router.push(`/messages?recipient=${encodeURIComponent(phone)}&mode=custom`);
  };

  const handleWhatsAppChat = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={() => router.back()} style={{ padding: '0 8px', minWidth: 'unset', width: '36px', height: '36px' }}>
              <ChevronLeft size={18} />
            </Button>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 24px)', lineHeight: '1.2' }}>Invites by {workerName}</h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Detailed outreach list for this member.</p>
            </div>
          </div>
          <Button variant="primary" onClick={() => router.push(`/messages?mode=custom`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
            <Mail size={18} /> Message All
          </Button>
        </div>
      </div>

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Person Name</th>
                <th>Phone Number</th>
                <th>Date Invited</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workerInvites.map((invite) => (
                <tr key={invite.id}>
                  <td data-label="Person Name"><div className="person-name">{invite.name}</div></td>
                  <td data-label="Phone Number" className="monospace">{invite.phone}</td>
                  <td data-label="Date Invited">{invite.date}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-${invite.status}`}>
                      {invite.status === 'attended' ? 'Attended' : 'Invited'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleWhatsAppChat(invite.phone)}
                        title="Chat on WhatsApp"
                        style={{ padding: '0 8px', width: '36px' }}
                      >
                        <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMessageUser(invite.phone)}
                        title="Send Message"
                        style={{ padding: '0 8px', width: '36px' }}
                      >
                        <MessageSquare size={18} />
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
  );
}

export default function WorkerInvitesPage() {
  return (
    <Suspense fallback={<div>Loading invites...</div>}>
      <WorkerInvitesContent />
    </Suspense>
  );
}
