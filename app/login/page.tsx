"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Users, User, ArrowLeft, Lock, Phone, ChevronDown, ShieldCheck } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showDemos, setShowDemos] = useState(false);
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
        name: selectedRole ? `Demo ${selectedRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'User',
        role: selectedRole || 'worker',
        organization_id: 'org_123',
        branch_id: selectedRole !== 'super_admin' ? 'branch_456' : undefined,
        credits: 500
      });

      // Route based on role
      if (selectedRole === 'platform_super_admin') {
        router.push('/super_admin');
      } else if (selectedRole === 'super_admin') {
        router.push('/main');
      } else if (selectedRole === 'branch_admin') {
        router.push('/branch');
      } else {
        router.push('/worker');
      }
    }, 1200);
  };

  const demoRoles = [
    { id: 'platform_super_admin', label: 'Global Super Admin', icon: ShieldCheck, color: 'var(--red)', desc: 'Manage the entire SaaS platform' },
    { id: 'super_admin', label: 'Org HQ Admin', icon: Building2, color: 'var(--blue)', desc: 'Manage organization-wide operations' },
    { id: 'branch_admin', label: 'Branch Admin', icon: Users, color: 'var(--green)', desc: 'Oversee specific branch activities' },
    { id: 'worker', label: 'Worker', icon: User, color: 'var(--purple)', desc: 'Track outreach and send invites' },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId as UserRole);
    // Pre-fill demo credentials
    setPhoneNumber('08012345678');
    setPassword('123456');
    // Auto-login for demo
    setTimeout(() => {
       document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
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
          <h1>Harvite</h1>
          <p>Organization management platform</p>
        </div>

        <div className="login-container-premium fade-in">
          <div className="credentials-view">
            <h2 className="login-title">Sign in to your account</h2>
            <p className="login-subtitle">Enter your details to access your dashboard</p>

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
                label="Pin" 
                type="password" 
                placeholder="••••••" 
                icon={<Lock size={16} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="login-submit" style={{ marginTop: '24px' }}>
                <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </div>
            </form>

            <p className="login-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
              New here? <a href="/onboarding" style={{ color: 'var(--blue)', fontWeight: '700' }}>Create an account</a>
            </p>

            <div className="demo-dropdown-section" style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
              <button 
                className="demo-toggle-btn" 
                onClick={() => setShowDemos(!showDemos)}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Explore Demo Dashboards
                <ChevronDown size={18} style={{ transform: showDemos ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showDemos && (
                <div className="demo-roles-grid fade-in" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {demoRoles.map((role) => (
                    <div 
                      key={role.id} 
                      className="role-demo-card-compact"
                      onClick={() => handleRoleSelect(role.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <div className="role-icon-box" style={{ background: `${role.color}10`, color: role.color, padding: '8px', borderRadius: '8px' }}>
                        <role.icon size={18} />
                      </div>
                      <div className="role-text">
                        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{role.label}</h3>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
