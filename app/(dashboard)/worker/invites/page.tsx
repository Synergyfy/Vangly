"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, MessageSquare, Search, UserCheck } from 'lucide-react';
import './invites.css';

export default function InvitesListPage() {
  const invites = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', status: 'invited', date: 'Oct 24, 2023', note: 'Met at the grocery store.' },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', status: 'attended', date: 'Oct 20, 2023', note: 'Neighbor.' },
    { id: '3', name: 'David Smith', phone: '+1 555 0103', status: 'invited', date: 'Oct 18, 2023', note: '' },
    { id: '4', name: 'Emily Davis', phone: '+1 555 0104', status: 'attended', date: 'Oct 15, 2023', note: 'Coworker, interested in youth group.' },
  ];

  const handleWhatsAppChat = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Outreach Tracking</div>
          <h1>My Invites</h1>
          <p>View and manage everyone you've reached out to.</p>
        </div>
        <Link href="/worker/add-invite">
          <Button className="btn-premium">
            <Plus size={18} /> Add New Invite
          </Button>
        </Link>
      </div>

      <Card className="management-filter-card">
        <div className="search-container-premium">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search by name or phone..." />
          </div>
        </div>
      </Card>

      <Card className="user-table-card-premium">
        <div className="table-responsive">
          <table className="user-data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Contact</th>
                <th>Date Invited</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id} className="user-row">
                  <td>
                    <div className="user-cell-profile">
                      <div className="user-avatar-initials">{invite.name.charAt(0)}</div>
                      <div className="user-meta-info">
                        <span className="user-display-name">{invite.name}</span>
                        {invite.note && <span className="person-note">{invite.note}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="monospace">{invite.phone}</span>
                  </td>
                  <td>{invite.date}</td>
                  <td>
                    <span className={`status-indicator ${invite.status === 'attended' ? 'active' : ''}`}>
                      {invite.status === 'attended' ? <UserCheck size={14} /> : <div />}
                      {invite.status === 'attended' ? 'Attended' : 'Invited'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="table-action-group">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleWhatsAppChat(invite.phone)}
                        className="action-icon-btn"
                        title="WhatsApp"
                      >
                        <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="action-icon-btn"
                        title="Message"
                      >
                        <MessageSquare size={16} />
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
