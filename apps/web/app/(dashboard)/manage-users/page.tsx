"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { isE164 } from '@/lib/forms/validators';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import { toast } from 'sonner';
import {
  useCreateUser,
  useDeleteUser,
  useUsersList,
} from '@/services/users';
import { useLocationsList } from '@/services/manage-organization';
import type { AdminUserRole } from '@/types/api/users';
import { Loader2, Trash2 } from 'lucide-react';
import './manage-users.css';

const ROLE_OPTIONS: { value: AdminUserRole; label: string }[] = [
  { value: 'worker', label: 'Worker' },
  { value: 'location_admin', label: 'Location Admin' },
];

export default function ManageUsersPage() {
  const usersQuery = useUsersList();
  const locationsQuery = useLocationsList();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminUserRole>('worker');
  const [branchId, setBranchId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = createUser.isPending;

  const users = usersQuery.data ?? [];
  const locations = locationsQuery.data?.data ?? [];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();

    if (!name.trim()) {
      setError('name', 'Full name is required.');
      return;
    }
    if (!isE164(phone)) {
      setError('phone', 'Phone number must be in E.164 format (e.g. +12345678901).');
      return;
    }
    if (!branchId) {
      setError('branchId', 'Please select a location.');
      return;
    }

    try {
      await createUser.mutateAsync({
        name: name.trim(),
        phone,
        role,
        branch_id: branchId,
      });
      toast.success(`User "${name.trim()}" created.`);
      setShowSuccess(true);
      setName('');
      setPhone('');
      setRole('worker');
      setBranchId('');
      setIsAdding(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not create user.'));
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!window.confirm(`Remove ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser.mutateAsync(id);
      toast.success(`${userName} removed.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not remove user.'));
    }
  };

  return (
    <div className="manage-users-page">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Users</h1>
          <p>Add and manage workers and admins.</p>
        </div>
        <Button onClick={() => setIsAdding((v) => !v)}>
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
                error={errors.name}
                required
              />
              <Input
                label="Phone Number"
                placeholder="e.g. +12345678901"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                required
              />
            </div>
            <div className="form-row">
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="user-role">Role</label>
                <select
                  id="user-role"
                  className="input-field select-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminUserRole)}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="user-branch">Location</label>
                <select
                  id="user-branch"
                  className="input-field select-field"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={locationsQuery.isLoading}
                >
                  <option value="">
                    {locationsQuery.isLoading ? 'Loading locations…' : 'Select a location'}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <span className="input-error">{errors.branchId}</span>
                )}
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 size={16} className="spinner" />}
                {isSaving ? 'Saving…' : 'Save User'}
              </Button>
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
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 size={20} className="spinner" /> Loading users…
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--danger)' }}>
                    Could not load users.
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                    No users yet. Click &ldquo;Add New User&rdquo; to get started.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-name">{user.name}</td>
                  <td className="monospace">{user.phone}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'location_admin' ? 'Location Admin' : user.role}
                    </span>
                  </td>
                  <td>{user.branch_id ?? '—'}</td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={deleteUser.isPending}
                      aria-label={`Remove ${user.name}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="User created"
        description="The new user can now sign in with their phone number."
        primaryAction={{ label: 'Okay', onClick: () => setShowSuccess(false) }}
        icon="shield"
      />
    </div>
  );
}
