"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Users } from 'lucide-react';
import '../hq.css';

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
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', status: 'invited', date: 'Oct 24, 2023', branch: 'HQ Branch', worker: 'Michael Brown' },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', status: 'attended', date: 'Oct 20, 2023', branch: 'HQ Branch', worker: 'Jane Doe' },
    { id: '3', name: 'David Smith', phone: '+1 555 0103', status: 'invited', date: 'Oct 18, 2023', branch: 'Northside Branch', worker: 'Emily Davis' },
    { id: '4', name: 'Emily Davis', phone: '+1 555 0104', status: 'attended', date: 'Oct 15, 2023', branch: 'Westend Campus', worker: 'David Smith' },
    { id: '5', name: 'John Wilson', phone: '+1 555 0105', status: 'invited', date: 'Oct 12, 2023', branch: 'Northside Branch', worker: 'Sarah Johnson' },
    { id: '6', name: 'Robert Miller', phone: '+1 555 0106', status: 'invited', date: 'Oct 11, 2023', branch: 'HQ Branch', worker: 'Michael Brown' },
    { id: '7', name: 'Linda Garcia', phone: '+1 555 0107', status: 'attended', date: 'Oct 10, 2023', branch: 'Westend Campus', worker: 'Emily Davis' },
    { id: '8', name: 'James Taylor', phone: '+1 555 0108', status: 'invited', date: 'Oct 09, 2023', branch: 'Northside Branch', worker: 'Jane Doe' },
  ];

  const filteredInvites = allInvites.filter(invite => {
    const matchesBranch = filterBranch === 'all' || invite.branch === filterBranch;
    const matchesStatus = filterStatus === 'all' || invite.status === filterStatus;
    const matchesSearch = invite.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invite.phone.includes(searchTerm);
    return matchesBranch && matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInvites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvites = filteredInvites.slice(startIndex, startIndex + itemsPerPage);

  const handleMessageUser = (phone: string) => {
    router.push(`/messages?recipient=${encodeURIComponent(phone)}&mode=custom`);
  };

  const handleWhatsAppChat = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleBulkMessage = () => {
    router.push(`/messages?mode=all_invites`);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div>
          <h1>All Invites</h1>
          <p>Consolidated list of all invitees across all locations.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleBulkMessage} 
          className="btn-bulk-message"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> <span>Bulk Message All</span>
        </Button>
      </div>

      <Card className="filter-card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
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
            <label className="input-label">Filter by Branch</label>
            <select 
              className="input-field select-field"
              value={filterBranch}
              onChange={(e) => {
                setFilterBranch(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Branches</option>
              <option value="HQ Branch">HQ Branch</option>
              <option value="Northside Branch">Northside Branch</option>
              <option value="Westend Campus">Westend Campus</option>
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

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Worker</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvites.map((invite) => (
                <tr key={invite.id}>
                  <td data-label="Name"><div className="person-name">{invite.name}</div></td>
                  <td data-label="Phone" className="monospace">{invite.phone}</td>
                  <td data-label="Branch">{invite.branch}</td>
                  <td data-label="Worker">{invite.worker}</td>
                  <td data-label="Date">{invite.date}</td>
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
