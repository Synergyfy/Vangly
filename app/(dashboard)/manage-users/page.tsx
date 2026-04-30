"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './manage-users.css';

export default function ManageUsersPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('worker');

  // Mock users list
  const users = [
    { id: '1', name: 'Sarah Johnson', phone: '+1 555 0101', role: 'worker', branch: 'HQ Branch' },
    { id: '2', name: 'Michael Brown', phone: '+1 555 0102', role: 'worker', branch: 'HQ Branch' },
    { id: '3', name: 'Jane Doe', phone: '+1 555 0105', role: 'branch_admin', branch: 'HQ Branch' },
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    setIsAdding(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="manage-users-page">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Users</h1>
          <p>Add and manage workers and admins.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add New User'}
        </Button>
      </div>

      {isAdding && (
        <Card className="add-user-card glass">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser} className="add-user-form">
            <div className="form-row">
              <Input 
                label="Full Name" 
                placeholder="e.g. John Smith" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input 
                label="Phone Number" 
                placeholder="e.g. +1 234 567 8900" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="input-wrapper input-full">
              <label className="input-label" htmlFor="user-role">Role</label>
              <select 
                id="user-role"
                className="input-field select-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="worker">Worker</option>
                <option value="branch_admin">Branch Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={!name || !phone}>Save User</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-name">{user.name}</td>
                  <td className="monospace">{user.phone}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'branch_admin' ? 'Branch Admin' : 'Worker'}
                    </span>
                  </td>
                  <td>{user.branch}</td>
                  <td>
                    <Button variant="outline" size="sm">Edit</Button>
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
