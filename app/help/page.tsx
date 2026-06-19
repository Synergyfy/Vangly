"use client";

import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { useRouter } from 'next/navigation';
import { Book, Settings, Users, CreditCard, MessageSquare, ShieldCheck } from 'lucide-react';
import '../public-pages.css';

export default function HelpCenterPage() {
  const router = useRouter();

  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>How can we help?</h1>
          <div className="help-search">
            <input type="text" placeholder="Search for articles, guides, and tutorials..." />
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="help-grid">
            <div className="help-category" onClick={() => router.push('/help/getting-started')}>
              <div className="icon-wrap"><Book size={24} /></div>
              <h3>Getting Started</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Account setup, initial configuration, and basics.</p>
            </div>
            <div className="help-category" onClick={() => router.push('/help/forms')}>
              <div className="icon-wrap"><Settings size={24} /></div>
              <h3>Managing Forms</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Creating, editing, and sharing digital forms.</p>
            </div>
            <div className="help-category" onClick={() => router.push('/help/teams')}>
              <div className="icon-wrap"><Users size={24} /></div>
              <h3>Teams & Roles</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Inviting users and managing permissions.</p>
            </div>
            <div className="help-category" onClick={() => router.push('/help/billing')}>
              <div className="icon-wrap"><CreditCard size={24} /></div>
              <h3>Billing & Credits</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Managing your SMS credits and payment methods.</p>
            </div>
            <div className="help-category" onClick={() => router.push('/help/messaging')}>
              <div className="icon-wrap"><MessageSquare size={24} /></div>
              <h3>SMS Messaging</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Setting up auto-replies and broadcast campaigns.</p>
            </div>
            <div className="help-category" onClick={() => router.push('/help/security')}>
              <div className="icon-wrap"><ShieldCheck size={24} /></div>
              <h3>Security & Privacy</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Data protection and compliance information.</p>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
