"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Users, User, ArrowLeft, Lock, Phone } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loginMode, setLoginMode] = useState<'select-role' | 'input-credentials'>('select-role');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);

    // Mock API call
    setTimeout(() => {
      login({
        id: Math.random().toString(36).substring(7),
        name: `Demo ${selectedRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        role: selectedRole,
        organization_id: 'org_123',
        branch_id: selectedRole !== 'super_admin' ? 'branch_456' : undefined,
        credits: 500
      });

      // Route based on role
      if (selectedRole === 'super_admin') {
        router.push('/main');
      } else if (selectedRole === 'branch_admin') {
        router.push('/branch');
      } else {
        router.push('/worker');
      }
    }, 1200);
  };

  const demoRoles = [
    { id: 'super_admin', label: 'HQ Admin', icon: Building2, color: 'var(--blue)', desc: 'Manage organization-wide operations' },
    { id: 'branch_admin', label: 'Branch Admin', icon: Users, color: 'var(--green)', desc: 'Oversee specific branch activities' },
    { id: 'worker', label: 'Worker', icon: User, color: 'var(--purple)', desc: 'Track outreach and send invites' },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId as UserRole);
    setLoginMode('input-credentials');
    // Pre-fill demo credentials
    setPhoneNumber('08012345678');
    setPassword('123456');
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
          <p>Organization management platform</p>
        </div>

        <div className="login-container-premium fade-in">
          {loginMode === 'select-role' ? (
            <div className="role-selection-view">
              <h2 className="login-title">Explore Demo Dashboards</h2>
              <p className="login-subtitle">Choose a role to experience the platform</p>
              
              <div className="demo-roles-grid">
                {demoRoles.map((role) => (
                  <Card 
                    key={role.id} 
                    className="role-demo-card"
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <div className="role-icon-box" style={{ background: `${role.color}10`, color: role.color }}>
                      <role.icon size={24} />
                    </div>
                    <div className="role-text">
                      <h3>{role.label}</h3>
                      <p>{role.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="main-login-divider">
                <span>OR</span>
              </div>
              
              <Button 
                variant="ghost" 
                fullWidth 
                className="btn-main-login"
                onClick={() => setLoginMode('input-credentials')}
              >
                Sign in to your account
              </Button>
            </div>
          ) : (
            <div className="credentials-view fade-in">
              <div className="view-header">
                <Button variant="ghost" size="sm" onClick={() => setLoginMode('select-role')}>
                  <ArrowLeft size={18} />
                </Button>
                <div>
                  <h2 className="login-title">Sign In</h2>
                  <p className="login-subtitle">
                    {selectedRole ? `Logging in as ${demoRoles.find(r => r.id === selectedRole)?.label}` : 'Access your dashboard'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="login-form">
                <Input 
                  label="Phone Number" 
                  placeholder="080..." 
                  icon={<Phone size={16} />}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••" 
                  icon={<Lock size={16} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="demo-hint-box">
                  <p>Demo Credentials:</p>
                  <code>Phone: 08012345678</code>
                  <code>Password: 123456</code>
                </div>

                <div className="login-submit">
                  <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                    {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="login-footer">
          New here? <a href="/onboarding">Create an account</a>
        </p>
      </div>
    </div>
  );
}
