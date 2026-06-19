import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import '../public-pages.css';

export default function ContactPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have questions about Harvite? Need help setting up your account? Our support team is here to help.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-8)' }}>
                We typically respond to all inquiries within 24 hours during standard business days.
              </p>
              
              <div className="contact-item">
                <Mail className="icon" size={24} />
                <div>
                  <strong>Email Support</strong>
                  <p>support@harvite.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <MessageCircle className="icon" size={24} />
                <div>
                  <strong>WhatsApp</strong>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Clock className="icon" size={24} />
                <div>
                  <strong>Support Hours</strong>
                  <p>Monday - Friday<br/>9:00 AM - 5:00 PM EST</p>
                </div>
              </div>
              
              <div className="contact-item">
                <MapPin className="icon" size={24} />
                <div>
                  <strong>Office</strong>
                  <p>123 Harvite Plaza<br/>Suite 100<br/>New York, NY 10001</p>
                </div>
              </div>
            </div>

            <div className="contact-form-container" style={{ backgroundColor: 'var(--card-bg)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-6)' }}>Send us a message</h3>
              <form className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" placeholder="John Doe" />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows={5} placeholder="How can we help you?"></textarea>
                </div>
                <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--spacing-2)' }}>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
