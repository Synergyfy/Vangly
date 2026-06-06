"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Shield, 
  MessageCircle, 
  Smartphone,
  ChevronRight,
  Plus,
  ArrowLeft,
  Building2,
  Users2
} from 'lucide-react';
import '../main.css';
import './teams.css';

export default function TeamsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');

  // Mock data for teams and members
  const teams = ['Workers Team', 'Leaders', 'Technical', 'Worship', 'Logistics', 'Youth'];
  const locations = ['HQ Downtown', 'Northside Campus', 'Westend Center'];

  const allMembers = [
    { id: '1', name: 'John Admin', teams: ['Admin', 'Leaders'], location: 'HQ Downtown', phone: '+234 801 000 1111', status: 'Active', isAdmin: true },
    { id: '2', name: 'Sarah Worker', teams: ['Workers Team', 'Technical'], location: 'HQ Downtown', phone: '+234 801 000 2222', status: 'Active', isAdmin: false },
    { id: '3', name: 'Michael Smith', teams: ['Workers Team', 'Logistics'], location: 'Northside Campus', phone: '+234 801 000 3333', status: 'Active', isAdmin: false },
    { id: '4', name: 'Jane Doe', teams: ['Leaders', 'Worship'], location: 'Westend Center', phone: '+234 801 000 4444', status: 'Active', isAdmin: true },
    { id: '5', name: 'David Wilson', teams: ['Workers Team'], location: 'HQ Downtown', phone: '+234 801 000 5555', status: 'Active', isAdmin: false },
    { id: '6', name: 'Emily Davis', teams: ['Youth', 'Technical'], location: 'Northside Campus', phone: '+234 801 000 6666', status: 'Active', isAdmin: false },
  ];

  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.phone.includes(searchTerm);
    const matchesLocation = filterLocation === 'all' || member.location === filterLocation;
    const matchesTeam = filterTeam === 'all' || member.teams.includes(filterTeam);
    return matchesSearch && matchesLocation && matchesTeam;
  });

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div className="header-main">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Workforce Management</div>
          <h1>Organizational Teams</h1>
          <p>Manage all members across your teams and locations.</p>
        </div>
        <Button className="btn-premium" onClick={() => router.push('/main/manage-organization')}>
          <Plus size={18} /> <span>Create New Team</span>
        </Button>
      </div>

      <Card className="filter-card">
        <div className="filter-grid-premium">
          <div className="premium-search-bar" style={{ flex: 2 }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search members by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select-group">
            <div className="select-wrapper-premium">
              <Building2 size={16} className="select-icon" />
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                <option value="all">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <div className="select-arrow-premium">
                 <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
            <div className="select-wrapper-premium">
              <Users2 size={16} className="select-icon" />
              <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
                <option value="all">All Teams</option>
                {teams.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
              <div className="select-arrow-premium">
                 <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="members-list-container">
        <div className="desktop-only">
          <Card className="table-card-premium">
            <table className="data-table-premium">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Teams</th>
                  <th>Location</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar-tiny">{member.name[0]}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700' }}>{member.name}</span>
                          {member.isAdmin && <Shield size={14} className="text-primary" fill="var(--blue-subtle)" />}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="team-tags-row">
                        {member.teams.map(team => (
                          <span key={team} className="team-pill-mini">{team}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} />
                        {member.location}
                      </div>
                    </td>
                    <td className="monospace">{member.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" className="action-icon-btn whatsapp">
                          <MessageCircle size={18} />
                        </Button>
                        <Button variant="ghost" size="sm" className="action-icon-btn sms">
                          <Smartphone size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="mobile-only teams-mobile-stack">
          {filteredMembers.map(member => (
            <Card key={member.id} className="member-mobile-card-premium fade-in">
              <div className="member-card-main">
                <div className="member-avatar-box">
                  {member.name[0]}
                </div>
                <div className="member-info-box">
                  <div className="name-row">
                    <h4>{member.name}</h4>
                    {member.isAdmin && <Shield size={14} className="text-primary" />}
                  </div>
                  <div className="phone-row">{member.phone}</div>
                  <div className="location-row">
                    <MapPin size={12} /> {member.location}
                  </div>
                  <div className="teams-row">
                    {member.teams.map(team => (
                      <span key={team} className="team-badge-v3">{team}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="member-card-actions">
                <Button variant="outline" size="sm" fullWidth style={{ gap: '8px' }}>
                  <MessageCircle size={16} /> WhatsApp
                </Button>
                <Button variant="outline" size="sm" fullWidth style={{ gap: '8px' }}>
                  <Smartphone size={16} /> SMS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
