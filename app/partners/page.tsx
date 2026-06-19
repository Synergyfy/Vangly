import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { Network, Smartphone, Cloud, Code } from 'lucide-react';
import '../public-pages.css';

export default function PartnersPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Partner Ecosystem</h1>
          <p>Harvite integrates with industry-leading providers to deliver a robust, reliable platform for your organization.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="partners-grid">
            <div className="partner-card">
              <div className="icon-wrap"><Smartphone size={32} /></div>
              <h4>SMS Providers</h4>
              <p className="text-small text-muted" style={{ marginTop: 'var(--spacing-2)' }}>Global telecom routing for instant message delivery.</p>
            </div>
            
            <div className="partner-card">
              <div className="icon-wrap"><Cloud size={32} /></div>
              <h4>Cloud Hosting</h4>
              <p className="text-small text-muted" style={{ marginTop: 'var(--spacing-2)' }}>Enterprise-grade infrastructure ensuring 99.9% uptime.</p>
            </div>
            
            <div className="partner-card">
              <div className="icon-wrap"><Network size={32} /></div>
              <h4>Integrations</h4>
              <p className="text-small text-muted" style={{ marginTop: 'var(--spacing-2)' }}>Webhooks and API access to connect with your existing ChMS or CRM.</p>
            </div>
            
            <div className="partner-card">
              <div className="icon-wrap"><Code size={32} /></div>
              <h4>Technology</h4>
              <p className="text-small text-muted" style={{ marginTop: 'var(--spacing-2)' }}>Built on modern, secure frameworks for speed and reliability.</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-16)' }}>
            <h3>Become a Partner</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-6)' }}>Interested in integrating your service with Harvite?</p>
            <button className="btn btn-primary">Contact Partnerships</button>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
