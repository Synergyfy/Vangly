import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { Tent, Users, CalendarDays, Activity } from 'lucide-react';
import '../../public-pages.css';

export default function MinistriesSolutionPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Scale your ministry outreach effortlessly.</h1>
          <p>Whether you are running city-wide crusades or targeted conferences, Harvite helps ministries capture thousands of connections and follow up effectively.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>Ministry Use Cases</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <Tent className="icon" size={24} />
              <div>
                <h4>Crusades & Open Air</h4>
                <p>Deploy QR codes on large screens and printed materials to capture decisions and prayer requests from massive crowds instantly.</p>
              </div>
            </div>
            <div className="benefit-item">
              <CalendarDays className="icon" size={24} />
              <div>
                <h4>Conferences</h4>
                <p>Manage attendee registrations, session sign-ups, and post-conference resource distribution via automated SMS.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Users className="icon" size={24} />
              <div>
                <h4>Outreach Campaigns</h4>
                <p>Organize temporary teams for specific seasonal campaigns and track their engagement metrics in real-time.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Activity className="icon" size={24} />
              <div>
                <h4>Follow-up Management</h4>
                <p>Ensure no new believer or contact falls through the cracks by assigning them to specific follow-up teams and tracking their progress.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
