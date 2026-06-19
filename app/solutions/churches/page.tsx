import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { UserPlus, MessageCircle, Share2, Map, QrCode } from 'lucide-react';
import '../../public-pages.css';

export default function ChurchesSolutionPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Turn first-time guests into engaged members.</h1>
          <p>Harvite provides churches with the tools to capture visitor details digitally, automate follow-ups, and track evangelism efforts without the paperwork.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>How Churches use Harvite</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <UserPlus className="icon" size={24} />
              <div>
                <h4>First Timer Follow-Up</h4>
                <p>Replace paper visitor cards. Guests scan a QR code on the screen or bulletin to fill out a welcome form, triggering an instant welcome text.</p>
              </div>
            </div>
            <div className="benefit-item">
              <MessageCircle className="icon" size={24} />
              <div>
                <h4>SMS Engagement</h4>
                <p>Send weekly devotionals, service reminders, and prayer updates directly to your congregation's phones.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Share2 className="icon" size={24} />
              <div>
                <h4>Evangelism Tracking</h4>
                <p>Arm your soul-winning teams with mobile forms to instantly log new contacts out in the field.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Map className="icon" size={24} />
              <div>
                <h4>Branch Management</h4>
                <p>Manage multiple church locations from a single admin dashboard, keeping data localized but accessible.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
