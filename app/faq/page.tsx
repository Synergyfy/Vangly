"use client";

import React, { useState } from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { ChevronDown } from 'lucide-react';
import '../public-pages.css';

const faqData = [
  {
    question: "Is Harvite really free?",
    answer: "Yes! The platform itself is completely free. You get unlimited locations, teams, forms, QR codes, and analytics at no cost. You only pay for SMS credits when you choose to send text messages."
  },
  {
    question: "How do SMS credits work?",
    answer: "SMS credits are pay-as-you-go. You purchase credit bundles and use them to send messages. Pricing varies by country. No monthly commitments, no hidden fees."
  },
  {
    question: "Can I use my own custom domain?",
    answer: "Yes, you can configure your own custom domain (e.g., connect.yourchurch.org) so all public-facing forms reflect your branding perfectly."
  },
  {
    question: "Can I have multiple locations?",
    answer: "Absolutely. Harvite supports multi-site organizations seamlessly. You can create discrete locations under your main umbrella to keep data localized while maintaining high-level oversight."
  },
  {
    question: "Can members create forms?",
    answer: "Yes, you can assign roles to your team members. Administrators have full access, while Managers or Editors can create and edit forms for specific teams or locations."
  },
  {
    question: "How do QR codes work?",
    answer: "Every time you publish a form, Harvite automatically generates a unique QR code. You can download it and place it on screens, bulletins, or posters. When people scan it with their phone camera, it opens your mobile-friendly form instantly."
  }
];

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Find quick answers to common questions about Harvite, features, and pricing.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
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
      <PublicFooter />
    </div>
  );
}
