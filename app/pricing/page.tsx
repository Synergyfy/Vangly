"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import './pricing.css';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const faqData = [
  {
    question: "Is Harvite really free?",
    answer: "Yes! Our Free plan gives you everything you need for 1 location, with unlimited teams, forms, and responses."
  },
  {
    question: "How do SMS credits work?",
    answer: "SMS credits are purchased separately from your subscription plan and operate on a pay-as-you-go basis."
  },
  {
    question: "Can I add just one more location without upgrading?",
    answer: "Yes! If you are on the Growth or Network plan, you can purchase Additional Locations for ₦2,000/month per location."
  },
  {
    question: "What does the White Label setup include?",
    answer: "For a one-time ₦50,000 setup fee and ₦5,000/month, we'll map your custom domain, set up SSL, and apply your branding to all public forms."
  },
  {
    question: "What kind of organizations use Harvite?",
    answer: "Harvite is built for churches, ministries, NGOs, volunteer organizations, outreach teams, and any group that wants to capture and follow up on connections."
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="pricing-page">
      <PublicNav />

      {/* Hero */}
      <section className="pricing-hero">
        <div className="container">
          <h1>Simple, transparent pricing</h1>
          <p>Choose the plan that works best for your organization.</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards">
        <div className="container">
          <div className="pricing-grid three-col">
            {/* Free Plan */}
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">₦0<span className="price-term">/month</span></div>
              <div className="price-sub">Perfect for starting out</div>
              <ul className="pricing-features">
                <li><Check className="check-icon" size={20} /> <strong>1 Location</strong></li>
                <li><Check className="check-icon" size={20} /> Unlimited Teams</li>
                <li><Check className="check-icon" size={20} /> Unlimited Members</li>
                <li><Check className="check-icon" size={20} /> Unlimited Forms</li>
                <li><Check className="check-icon" size={20} /> Unlimited QR Codes</li>
                <li><Check className="check-icon" size={20} /> Unlimited Responses</li>
                <li><Check className="check-icon" size={20} /> Basic Analytics</li>
              </ul>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/onboarding')}>
                Get Started
              </button>
            </div>

            {/* Growth Plan */}
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <h3>Growth</h3>
              <div className="price">₦10,000<span className="price-term">/month</span></div>
              <div className="price-sub">For growing organizations</div>
              <ul className="pricing-features">
                <li><Check className="check-icon" size={20} /> <strong>Up to 5 Locations</strong></li>
                <li><Check className="check-icon" size={20} /> Everything in Free</li>
                <li><Check className="check-icon" size={20} /> Messaging Tools</li>
                <li><Check className="check-icon" size={20} /> Data Export</li>
                <li><Check className="check-icon" size={20} /> Priority Email Support</li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => router.push('/onboarding')}>
                Start Growth Trial
              </button>
            </div>

            {/* Network Plan */}
            <div className="pricing-card">
              <h3>Network</h3>
              <div className="price">₦25,000<span className="price-term">/month</span></div>
              <div className="price-sub">For large networks</div>
              <ul className="pricing-features">
                <li><Check className="check-icon" size={20} /> <strong>Up to 15 Locations</strong></li>
                <li><Check className="check-icon" size={20} /> Everything in Growth</li>
                <li><Check className="check-icon" size={20} /> Advanced Analytics</li>
                <li><Check className="check-icon" size={20} /> Branch Comparison</li>
                <li><Check className="check-icon" size={20} /> Team Performance Reporting</li>
              </ul>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/onboarding')}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="addons-section" style={{ padding: 'var(--spacing-16) 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
            <h2>Available Add-Ons</h2>
            <p>Customize your plan to perfectly fit your needs.</p>
          </div>
          <div className="addons-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-6)' }}>
            <div className="addon-card" style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h4>Additional Locations</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', minHeight: '40px' }}>Need more than your plan allows?</p>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>₦2,000<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/mo per location</span></div>
            </div>
            
            <div className="addon-card" style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h4>SMS Credits</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', minHeight: '40px' }}>Pay as you use. Purchased separately.</p>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>Variable<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}> by country</span></div>
            </div>
            
            <div className="addon-card" style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h4>White Label</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', minHeight: '40px' }}>Custom domain, branding, and SSL.</p>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>₦5,000<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span></div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+ ₦50,000 one-time setup</div>
            </div>
            
            <div className="addon-card" style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h4>Enterprise</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', minHeight: '40px' }}>Custom integrations and national scale.</p>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>Custom Pricing</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqData.map((faq, index) => (
              <div key={index} className="faq-item">
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  {faq.question}
                  <ChevronDown className={`faq-chevron ${openFaq === index ? 'open' : ''}`} size={20} />
                </button>
                {openFaq === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Harvest More Connections?</h2>
          <div className="cta-actions">
            <button className="btn btn-white" onClick={() => router.push('/onboarding')}>Create Free Account</button>
            <button className="btn btn-outline-white">Watch Demo</button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
