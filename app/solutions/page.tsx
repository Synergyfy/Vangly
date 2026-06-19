import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { Church, Cross, HandHeart, Users, Calendar, Megaphone } from 'lucide-react';
import '../public-pages.css';

export default function SolutionsPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Built for every kind of connection</h1>
          <p>Harvite is flexible enough to handle the unique follow-up needs of churches, ministries, NGOs, and field teams.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="solutions-grid">
            <a href="/solutions/churches" className="solution-card">
              <div className="card-icon"><Church size={24} /></div>
              <h3>Churches</h3>
              <p>Streamline first-time visitor capture, member care, and branch management from one central platform.</p>
            </a>
            <a href="/solutions/ministries" className="solution-card">
              <div className="card-icon"><Cross size={24} /></div>
              <h3>Ministries</h3>
              <p>Manage outreach campaigns, crusades, and large-scale follow-up efforts with automated SMS sequences.</p>
            </a>
            <a href="/solutions/ngos" className="solution-card">
              <div className="card-icon"><HandHeart size={24} /></div>
              <h3>NGOs</h3>
              <p>Simplify volunteer registration, donor engagement, and beneficiary tracking across all your field operations.</p>
            </a>
            <a href="/solutions/outreach-teams" className="solution-card">
              <div className="card-icon"><Users size={24} /></div>
              <h3>Outreach Teams</h3>
              <p>Equip street teams with mobile-ready QR codes and instant data capture for door-to-door evangelism.</p>
            </a>
            <a href="/solutions/events" className="solution-card">
              <div className="card-icon"><Calendar size={24} /></div>
              <h3>Events</h3>
              <p>Handle conference registrations, workshop sign-ups, and post-event feedback seamlessly.</p>
            </a>
            <div className="solution-card" style={{ opacity: 0.7, pointerEvents: 'none' }}>
              <div className="card-icon"><Megaphone size={24} /></div>
              <h3>More Coming Soon</h3>
              <p>We are constantly expanding our templates and workflows for new types of organizations.</p>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
