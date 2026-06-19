import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { Globe, Palette, QrCode, ShieldCheck } from 'lucide-react';
import '../public-pages.css';

export default function WhiteLabelPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Your Brand. Your Domain. Your Identity.</h1>
          <p>Deliver a seamless experience to your community by fully white-labeling the Harvite platform with your organization's assets.</p>
        </div>
      </section>

      <section className="pricing-section" style={{ padding: 'var(--spacing-12) 0', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', backgroundColor: 'var(--card-bg)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-card)', border: '1px solid var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary)' }}>White Label Add-On</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>Not Included In Any Plan • Available As Separate Add-On</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>One-time Setup Fee</div>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>₦50,000</div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Monthly Maintenance</div>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>₦5,000<span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }}>Request White Label Setup</button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <Globe className="icon" size={24} />
              <div>
                <h4>Custom Domains</h4>
                <p>Host your forms and landing pages on your own URLs, like <strong>connect.yourchurch.org</strong> or <strong>forms.ministry.org</strong>, to maintain trust.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Palette className="icon" size={24} />
              <div>
                <h4>Complete Branding</h4>
                <p>Replace Harvite logos with your own. Apply your exact brand colors to all buttons, links, and form elements for a native feel.</p>
              </div>
            </div>
            <div className="benefit-item">
              <QrCode className="icon" size={24} />
              <div>
                <h4>Branded QR Codes</h4>
                <p>Generate QR codes that feature your logo in the center and match your organization's color palette.</p>
              </div>
            </div>
            <div className="benefit-item">
              <ShieldCheck className="icon" size={24} />
              <div>
                <h4>Total Data Ownership</h4>
                <p>Your data belongs entirely to you. Harvite acts invisibly in the background to power your systems, without ever marketing to your contacts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
