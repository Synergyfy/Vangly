"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Users, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import '../main.css';

export default function AllInvitesPage() {
  const router = useRouter();
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data for all invites
  const allInvites = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', status: 'invited', date: 'Oct 24, 2023', location: 'HQ Location', worker: 'Michael Brown' },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', status: 'attended', date: 'Oct 20, 2023', location: 'HQ Location', worker: 'Jane Doe' },
    { id: '3', name: 'David Smith', phone: '+1 555 0103', status: 'invited', date: 'Oct 18, 2023', location: 'Northside Location', worker: 'Emily Davis' },
    { id: '4', name: 'Emily Davis', phone: '+1 555 0104', status: 'attended', date: 'Oct 15, 2023', location: 'Westend Center', worker: 'David Smith' },
    { id: '5', name: 'John Wilson', phone: '+1 555 0105', status: 'invited', date: 'Oct 12, 2023', location: 'Northside Location', worker: 'Sarah Johnson' },
    { id: '6', name: 'Robert Miller', phone: '+1 555 0106', status: 'invited', date: 'Oct 11, 2023', location: 'HQ Location', worker: 'Michael Brown' },
    { id: '7', name: 'Linda Garcia', phone: '+1 555 0107', status: 'attended', date: 'Oct 10, 2023', location: 'Westend Center', worker: 'Emily Davis' },
    { id: '8', name: 'James Taylor', phone: '+1 555 0108', status: 'invited', date: 'Oct 09, 2023', location: 'Northside Location', worker: 'Jane Doe' },
  ];

  const filteredInvites = allInvites.filter(invite => {
    const matchesBranch = filterBranch === 'all' || invite.location === filterBranch;
    const matchesStatus = filterStatus === 'all' || invite.status === filterStatus;
    const matchesSearch = invite.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invite.phone.includes(searchTerm);
    return matchesBranch && matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInvites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvites = filteredInvites.slice(startIndex, startIndex + itemsPerPage);

  const [expandedInviteId, setExpandedInviteId] = useState<string | null>(null);

  const toggleInvite = (id: string) => {
    setExpandedInviteId(expandedInviteId === id ? null : id);
  };

  const handleMessageUser = (phone: string) => {
    router.push(`/main/messages?recipient=${encodeURIComponent(phone)}&mode=custom`);
  };

  const handleWhatsAppChat = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleBulkMessage = () => {
    router.push(`/main/messages?mode=all_invites`);
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div className="header-main">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Outreach Central</div>
          <h1>All Invites</h1>
          <p>Consolidated list of all invitees across all locations.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleBulkMessage} 
          className="btn-premium"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> <span>Bulk Message All</span>
        </Button>
      </div>

      <Card className="filter-card" style={{ marginBottom: '20px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <Input 
            label="Search Invitee" 
            placeholder="Name or phone..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="input-wrapper">
            <label className="input-label">Filter by Location</label>
            <select 
              className="input-field select-field"
              value={filterBranch}
              onChange={(e) => {
                setFilterBranch(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Locations</option>
              <option value="HQ Location">HQ Location</option>
              <option value="Northside Location">Northside Location</option>
              <option value="Westend Center">Westend Center</option>
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Filter by Status</label>
            <select 
              className="input-field select-field"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="invited">Invited</option>
              <option value="attended">Attended</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="table-card-premium">
        {/* Mobile View: Short Expandable Lines */}
        <div className="mobile-only invites-mobile-list">
          {paginatedInvites.map((invite) => (
            <div key={invite.id} className={`invite-mobile-row ${expandedInviteId === invite.id ? 'expanded' : ''}`}>
              <div className="invite-mobile-summary" onClick={() => toggleInvite(invite.id)}>
                <div className="summary-left">
                  <div className="person-name">{invite.name}</div>
                  <span className={`status-badge-dot ${invite.status}`}></span>
                </div>
                <div className="summary-right">
                  <span className={`status-text ${invite.status}`}>
                    {invite.status === 'attended' ? 'Attended' : 'Invited'}
                  </span>
                  <div className="expand-trigger">
                    {expandedInviteId === invite.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>
              
              {expandedInviteId === invite.id && (
                <div className="invite-mobile-details fade-in">
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value monospace">{invite.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{invite.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Worker</span>
                    <span className="detail-value">{invite.worker}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{invite.date}</span>
                  </div>
                  <div className="detail-actions">
                    <Button 
                      variant="outline" 
                      fullWidth
                      onClick={() => handleWhatsAppChat(invite.phone)}
                      style={{ gap: '8px' }}
                    >
                      <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      fullWidth
                      onClick={() => handleMessageUser(invite.phone)}
                      style={{ gap: '8px' }}
                    >
                      <MessageSquare size={18} />
                      Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {paginatedInvites.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No invitees found matching your filters.
            </div>
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="table-responsive desktop-only">
          <table className="data-table-premium">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Worker</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvites.map((invite) => (
                <tr key={invite.id}>
                  <td><div className="person-name">{invite.name}</div></td>
                  <td className="monospace">{invite.phone}</td>
                  <td>{invite.location}</td>
                  <td>{invite.worker}</td>
                  <td>{invite.date}</td>
                  <td>
                    <span className={`status-badge-v2 ${invite.status}`}>
                      {invite.status === 'attended' ? 'Attended' : 'Invited'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleWhatsAppChat(invite.phone)}
                        className="action-icon-btn"
                      >
                        <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMessageUser(invite.phone)}
                        className="action-icon-btn"
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
        
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvites.length)} of {filteredInvites.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
