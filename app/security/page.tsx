import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { Lock, Server, ShieldCheck, Database } from 'lucide-react';
import '../public-pages.css';

export default function SecurityPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Data & Security</h1>
          <p>We treat your organization's data with the highest level of security and respect. Your trust is our foundation.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="security-grid">
            <div className="security-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <div className="icon-wrap"><Database size={24} /></div>
              <h3>Data Ownership</h3>
              <p>You own your data. Period. Harvite acts strictly as a data processor. We do not sell, rent, or market to the contacts you collect through our platform. If you leave, you can export all your data instantly.</p>
            </div>
            
            <div className="security-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <div className="icon-wrap"><Lock size={24} /></div>
              <h3>Encryption</h3>
              <p>All data transmitted between your browser and our servers is encrypted using industry-standard TLS. Data at rest in our databases is encrypted using AES-256 encryption.</p>
            </div>
            
            <div className="security-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <div className="icon-wrap"><Server size={24} /></div>
              <h3>Infrastructure</h3>
              <p>Harvite is hosted on enterprise-grade cloud infrastructure with redundant backups and multi-region failover. We maintain 99.9% uptime to ensure your forms are always available when you need them.</p>
            </div>
            
            <div className="security-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <div className="icon-wrap"><ShieldCheck size={24} /></div>
              <h3>White Label Data Protection</h3>
              <p>When you use our White Label features, we remain completely invisible. Our platform operates entirely under your brand and domain, ensuring your community's trust in your organization remains unbroken.</p>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
