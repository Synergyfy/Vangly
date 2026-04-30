"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './login.css';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call
    setTimeout(() => {
      login({
        id: Math.random().toString(36).substring(7),
        name: 'Demo User',
        role: selectedRole,
        church_id: 'church_123',
        branch_id: selectedRole !== 'super_admin' ? 'branch_456' : undefined,
      });

      // Route based on role
      if (selectedRole === 'super_admin') {
        router.push('/hq');
      } else if (selectedRole === 'branch_admin') {
        router.push('/branch');
      } else {
        router.push('/worker');
      }
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>Vangly</h1>
          <p>Church evangelism management</p>
        </div>

        <div className="login-form-card">
          <form onSubmit={handleLogin} className="login-form">
            <Input 
              label="Phone number" 
              placeholder="+234 800 000 0000" 
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <div className="input-wrapper input-full">
              <label className="input-label">Role</label>
              <select 
                className="input-field select-field"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                <option value="super_admin">HQ Admin</option>
                <option value="branch_admin">Branch Admin</option>
                <option value="worker">Worker</option>
              </select>
            </div>

            <div className="login-submit">
              <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>

        <p className="login-footer">
          New here? <a href="/onboarding">Create an account</a>
        </p>
      </div>
    </div>
  );
}
