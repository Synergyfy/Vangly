"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import './management.css';

export default function ChurchManagementPage() {
  const router = useRouter();

  // Mock data for branches
  const branches = [
    { id: 'b1', name: 'HQ Branch (Downtown)', location: 'Lagos, Nigeria', admins: 1, workers: 45, invites: 1250 },
    { id: 'b2', name: 'Northside Branch', location: 'Abuja, Nigeria', admins: 1, workers: 30, invites: 840 },
    { id: 'b3', name: 'Westend Campus', location: 'Port Harcourt, Nigeria', admins: 2, workers: 25, invites: 620 },
    { id: 'b4', name: 'Southpark Satellite', location: 'Lagos, Nigeria', admins: 1, workers: 12, invites: 310 },
  ];

  const handleBranchClick = (branch: any) => {
    router.push(`/hq/manage-church/branch?id=${branch.id}&name=${encodeURIComponent(branch.name)}`);
  };

  return (
    <div className="hq-dashboard">
      <div className="custom-management-header">
        <div className="header-text">
          <h1>Church Network</h1>
          <p>Manage all your locations and their respective staff.</p>
        </div>
        <Button onClick={() => router.push('/hq/manage-church/new')} style={{ gap: '8px' }}>
          <Plus size={18} /> New Branch
        </Button>
      </div>

      <div className="branches-grid">
        {branches.map((branch) => (
          <Card 
            key={branch.id} 
            className="branch-main-card clickable"
            onClick={() => handleBranchClick(branch)}
          >
            <div className="branch-card-inner">
              <div className="branch-card-header">
                <div className="branch-icon-box">
                  <Building2 size={24} />
                </div>
                <ArrowUpRight size={18} className="hover-arrow" />
              </div>
              
              <div className="branch-card-body">
                <h3>{branch.name}</h3>
                <p className="branch-location">
                  <MapPin size={14} /> {branch.location}
                </p>
              </div>

              <div className="branch-card-footer">
                <div className="branch-stat">
                  <ShieldCheck size={14} />
                  <span>{branch.admins} Admin</span>
                </div>
                <div className="branch-stat">
                  <Users size={14} />
                  <span>{branch.workers} Workers</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
