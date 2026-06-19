"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Users, 
  FileText, 
  MessageSquare,
  Wallet,
  Globe,
  LifeBuoy,
  Activity,
  FileEdit,
  Bell,
  History,
  ShieldAlert,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ClipboardList,
  CreditCard
} from 'lucide-react';
import '../(dashboard)/main/main.css';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/super_admin', icon: LayoutDashboard },
    { label: 'Organizations', path: '/super_admin/organizations', icon: Building2 },
    { label: 'Messaging', path: '/super_admin/messaging', icon: MessageSquare },
    { label: 'Subscriptions & Pricing', path: '/super_admin/subscriptions', icon: CreditCard },
    { label: 'Wallet & Revenue', path: '/super_admin/wallet', icon: Wallet },
    { label: 'White Label', path: '/super_admin/white-label', icon: Globe },
    { label: 'Support', path: '/super_admin/support', icon: LifeBuoy },
    { label: 'System Monitoring', path: '/super_admin/monitoring', icon: Activity },
    { label: 'Content Management', path: '/super_admin/content', icon: FileEdit },
    { label: 'Notifications', path: '/super_admin/notifications', icon: Bell },
    { label: 'Audit Logs', path: '/super_admin/audit-logs', icon: History },
    { label: 'Admin Management', path: '/super_admin/admins', icon: ShieldAlert },
    { label: 'Settings', path: '/super_admin/settings', icon: Settings },
  ];

  const handleNavigation = (path: string) => {
    setIsMobileOpen(false);
    router.push(path);
  };

  return (
    <div className="hq-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Mobile Header overlay for triggering menu */}
      <div className="mobile-header desktop-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--purple)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>H</div>
          <span style={{ fontWeight: 800, fontSize: '18px' }}>Super Admin</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`hq-sidebar glass-morphism ${isMobileOpen ? 'open' : ''}`} style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--card-bg)', transition: 'transform 0.3s ease' }}>
        
        {isMobileOpen && (
          <button onClick={() => setIsMobileOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-primary)' }} className="desktop-hide">
            <X size={24} />
          </button>
        )}

        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--purple)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '20px' }}>H</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px' }}>Harvite</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>SUPER ADMIN</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <button 
                key={idx}
                onClick={() => handleNavigation(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--purple)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={() => router.push('/login')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '0', paddingTop: '64px', WebkitOverflowScrolling: 'touch' }} className="super-admin-content-area">
        <style>{`
          @media (min-width: 1024px) {
            .desktop-hide {
              display: none !important;
            }
            .super-admin-content-area {
              padding-top: 0 !important;
            }
            .hq-sidebar {
              position: relative !important;
              z-index: 100 !important;
              transform: none !important;
            }
          }
          @media (max-width: 1023px) {
            .hq-layout {
              flex-direction: column;
            }
            .hq-sidebar {
              position: fixed !important;
              top: 0;
              bottom: 0;
              left: 0;
              transform: translateX(-100%);
              z-index: 1000 !important;
            }
            .hq-sidebar.open {
              transform: translateX(0) !important;
            }
            .mobile-header {
              z-index: 900 !important;
            }
          }
        `}</style>
        {children}
      </main>

    </div>
  );
}
