"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Plus } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function AdminsPage() {
  const admins = [
    { id: 1, name: 'David O.', email: 'david@harvite.com', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'Sarah T.', email: 'sarah@harvite.com', role: 'Admin (Support)', status: 'Active' },
    { id: 3, name: 'Mike J.', email: 'mike@harvite.com', role: 'Admin (Billing)', status: 'Active' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={28} color="var(--orange)" /> 
            Admin Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage platform administrators and roles.</p>
        </div>
        <Button className="btn-primary"><Plus size={18} style={{ marginRight: '8px' }}/> Add Admin</Button>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.role}</td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                      backgroundColor: '#dcfce7', color: '#166534'
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm">Edit</Button>
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
