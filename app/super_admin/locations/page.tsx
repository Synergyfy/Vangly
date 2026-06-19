"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Search, Filter } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function LocationsPage() {
  const locs = [
    { id: 1, name: 'HQ Downtown', org: 'Global Impact Ministries', country: 'Nigeria', state: 'Lagos', status: 'Active' },
    { id: 2, name: 'Northside Campus', org: 'City Lights Church', country: 'Nigeria', state: 'Abuja', status: 'Active' },
    { id: 3, name: 'Westend Center', org: 'Hope Foundation NGO', country: 'Ghana', state: 'Accra', status: 'Active' },
    { id: 4, name: 'Southpark Hub', org: 'Global Impact Ministries', country: 'Kenya', state: 'Nairobi', status: 'Suspended' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={28} color="var(--blue)" /> 
            Locations
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>View all locations platform-wide.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search locations..." style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', width: '250px' }} />
          </div>
          <Button variant="outline"><Filter size={18} style={{ marginRight: '8px' }} /> Filters</Button>
        </div>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Organization</th>
                <th>Country</th>
                <th>State</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {locs.map((loc) => (
                <tr key={loc.id}>
                  <td style={{ fontWeight: 600 }}>{loc.name}</td>
                  <td>{loc.org}</td>
                  <td>{loc.country}</td>
                  <td>{loc.state}</td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                      backgroundColor: loc.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color: loc.status === 'Active' ? '#166534' : '#991b1b'
                    }}>
                      {loc.status}
                    </span>
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
