"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, MessageSquare } from 'lucide-react';
import './invites.css';

export default function InvitesListPage() {
  // Mock data for invites
  const invites = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', status: 'invited', date: 'Oct 24, 2023', note: 'Met at the grocery store.' },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', status: 'attended', date: 'Oct 20, 2023', note: 'Neighbor.' },
    { id: '3', name: 'David Smith', phone: '+1 555 0103', status: 'invited', date: 'Oct 18, 2023', note: '' },
    { id: '4', name: 'Emily Davis', phone: '+1 555 0104', status: 'attended', date: 'Oct 15, 2023', note: 'Coworker, seemed interested in youth group for kids.' },
  ];

  const handleWhatsAppChat = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="invites-page">
      <div className="page-header flex-between">
        <div>
          <h1>My Invites</h1>
          <p>Everyone you've reached out to.</p>
        </div>
        <Link href="/worker/add-invite">
          <Button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New
          </Button>
        </Link>
      </div>

      <Card className="table-card">
        <div className="table-responsive">
          <table className="invites-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Date Invited</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td data-label="Name">
                    <div className="person-name">{invite.name}</div>
                    {invite.note && <div className="person-note">{invite.note}</div>}
                  </td>
                  <td data-label="Phone Number" className="monospace">{invite.phone}</td>
                  <td data-label="Date Invited">{invite.date}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-${invite.status}`}>
                      {invite.status === 'attended' ? 'Attended Church' : 'Invited'}
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
