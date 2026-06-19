import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../public-pages.css';

export default function PrivacyPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>Last updated: June 18, 2026</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="legal-content">
            <h2>1. Information We Collect</h2>
            <p>At Harvite, we collect information you provide directly to us when you create an account, fill out a form, or request support. This includes your name, email address, phone number, and organization details.</p>
            
            <h2>2. How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information.</li>
              <li>Send technical notices, updates, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not share your personal data with third parties for marketing purposes. Harvite operates as a data processor for the organizations using our platform; the organization remains the data controller and owns the data collected through their forms.</p>

            <h2>4. Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted in transit and at rest.</p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@harvite.com.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
