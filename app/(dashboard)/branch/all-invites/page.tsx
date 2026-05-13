"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  MessageSquare, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Search,
  MapPin,
  Filter
} from 'lucide-react';
import '../branch.css';

export default function BranchAllInvitesPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data for branch invites
  const allInvites = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', status: 'invited', date: 'Oct 24, 2023', location: 'Downtown HQ', worker: 'Michael Brown' },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', status: 'attended', date: 'Oct 20, 2023', location: 'Downtown HQ', worker: 'Jane Doe' },
    { id: '3', name: 'David Smith', phone: '+1 555 0103', status: 'invited', date: 'Oct 18, 2023', location: 'Downtown HQ', worker: 'Emily Davis' },
    { id: '4', name: 'Emily Davis', phone: '+1 555 0104', status: 'attended', date: 'Oct 15, 2023', location: 'Downtown HQ', worker: 'David Smith' },
    { id: '5', name: 'John Wilson', phone: '+1 555 0105', status: 'invited', date: 'Oct 12, 2023', location: 'Downtown HQ', worker: 'Sarah Johnson' },
    { id: '6', name: 'Robert Miller', phone: '+1 555 0106', status: 'invited', date: 'Oct 11, 2023', location: 'Downtown HQ', worker: 'Michael Brown' },
    { id: '7', name: 'Linda Garcia', phone: '+1 555 0107', status: 'attended', date: 'Oct 10, 2023', location: 'Downtown HQ', worker: 'Emily Davis' },
    { id: '8', name: 'James Taylor', phone: '+1 555 0108', status: 'invited', date: 'Oct 09, 2023', location: 'Downtown HQ', worker: 'Jane Doe' },
  ];

  const filteredInvites = allInvites.filter(invite => {
    const matchesStatus = filterStatus === 'all' || invite.status === filterStatus;
    const matchesSearch = invite.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invite.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
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
    router.push(`/branch/messages?recipient=${encodeURIComponent(phone)}&mode=custom`);
  };

  const handleWhatsAppChat = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleBulkMessage = () => {
    router.push(`/branch/messages?mode=all_invites`);
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div className="header-main">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Branch Outreach</div>
          <h1>Location Invites</h1>
          <p>Complete list of all invitees for this location.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleBulkMessage} 
          className="btn-premium"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> <span>Bulk Message</span>
        </Button>
      </div>

      <Card className="filter-card-premium glass-morphism" style={{ marginBottom: '32px' }}>
        <div className="filter-grid-v2">
          <div className="premium-search-bar" style={{ flex: 1.5 }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="filter-controls-group">
            <div className="premium-select-box">
              <Filter size={16} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="invited">Invited</option>
                <option value="attended">Attended</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="table-card-premium">
        {/* Mobile View: Premium Expandable Cards */}
        <div className="mobile-only invites-mobile-stack-premium">
          {paginatedInvites.map((invite) => (
            <Card key={invite.id} className={`invite-mobile-card-v2 ${expandedInviteId === invite.id ? 'active' : ''}`}>
              <div className="invite-mobile-header-v2" onClick={() => toggleInvite(invite.id)}>
                <div className="invitee-avatar-v2">{invite.name[0]}</div>
                <div className="invitee-core-info">
                  <div className="name-status-row">
                    <h4>{invite.name}</h4>
                    <span className={`status-pill-v2 ${invite.status}`}>
                      {invite.status}
                    </span>
                  </div>
                  <div className="invitee-sub-meta">
                    <MapPin size={12} /> <span>{invite.location}</span>
                  </div>
                </div>
                <div className="invite-expand-icon">
                  {expandedInviteId === invite.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {expandedInviteId === invite.id && (
                <div className="invite-expanded-body-v2 fade-in">
                  <div className="info-grid-v2">
                    <div className="info-cell-v2">
                      <span className="label">Phone</span>
                      <span className="value">{invite.phone}</span>
                    </div>
                    <div className="info-cell-v2">
                      <span className="label">Date</span>
                      <span className="value">{invite.date}</span>
                    </div>
                    <div className="info-cell-v2" style={{ gridColumn: 'span 2' }}>
                      <span className="label">Invited By</span>
                      <span className="value">{invite.worker}</span>
                    </div>
                  </div>
                  <div className="invite-card-footer-v2">
                    <Button variant="outline" size="sm" fullWidth onClick={() => handleWhatsAppChat(invite.phone)} style={{ gap: '8px' }}>
                      <Image src="/whatsapp.svg" alt="WA" width={16} height={16} /> WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" fullWidth onClick={() => handleMessageUser(invite.phone)} style={{ gap: '8px' }}>
                      <MessageSquare size={16} /> Message
                    </Button>
                  </div>
                </div>
              )}
            </Card>
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
      </div>
    </div>
  );
}
