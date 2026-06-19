import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../public-pages.css';

export default function TermsPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p>Last updated: June 18, 2026</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="legal-content">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Harvite ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
            
            <h2>2. Description of Service</h2>
            <p>Harvite provides a platform for organizations to create digital forms, generate QR codes, and manage contacts via SMS follow-ups. You understand that the Service may include certain communications from Harvite, such as service announcements and administrative messages.</p>

            <h2>3. Account Registration</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.</p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You are solely responsible for the content you collect and distribute through Harvite.</p>

            <h2>5. SMS Compliance</h2>
            <p>When using Harvite to send SMS messages, you agree to comply with all applicable laws and regulations (such as the TCPA in the United States). You must obtain proper consent before sending messages to any individual.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
