"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PublicFooter() {
  const router = useRouter();

  return (
    <>
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Harvest More Connections?</h2>
          <div className="cta-actions">
            <button className="btn btn-white" onClick={() => router.push('/onboarding')}>Create Free Account</button>
            <button className="btn btn-outline-white" onClick={() => router.push('/demo')}>Watch Demo</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">Harvite</div>
              <p>Helping organizations turn every invitation into a meaningful, long-lasting connection through seamless digital follow-up.</p>
            </div>
            
            <div className="footer-nav">
              <h4>Product</h4>
              <ul>
                <li><a href="/features">Features</a></li>
                <li><a href="/solutions">Solutions</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/white-label">White Label</a></li>
              </ul>
            </div>
            
            <div className="footer-nav">
              <h4>Resources</h4>
              <ul>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/success-stories">Success Stories</a></li>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/faq">FAQ</a></li>
              </ul>
            </div>
            
            <div className="footer-nav">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/partners">Partners</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="text-muted">© 2026 Harvite. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
              <a href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
              <a href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
              <a href="/cookie-policy" style={{ color: 'var(--text-muted)' }}>Cookie Policy</a>
              <a href="/security" style={{ color: 'var(--text-muted)' }}>Security</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
