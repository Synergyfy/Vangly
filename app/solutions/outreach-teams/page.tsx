import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { MapPin, Users, Smartphone, BarChart3 } from 'lucide-react';
import '../../public-pages.css';

export default function OutreachTeamsPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Equip your teams for the field.</h1>
          <p>Harvite gives street evangelism and community campaign teams the mobile tools they need to capture data instantly without fumbling with clipboards.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>Outreach Workflows</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <Users className="icon" size={24} />
              <div>
                <h4>Street Evangelism</h4>
                <p>Capture contact details and prayer requests directly on your phone. Data instantly syncs to your central database for immediate follow-up.</p>
              </div>
            </div>
            <div className="benefit-item">
              <MapPin className="icon" size={24} />
              <div>
                <h4>Door-to-Door Outreach</h4>
                <p>Organize teams by neighborhood or zone. Use targeted forms to track the results of every conversation quickly.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Smartphone className="icon" size={24} />
              <div>
                <h4>Mobile First Design</h4>
                <p>The Harvite PWA means your field team doesn't need to download an app from the store; they just pin it to their home screen.</p>
              </div>
            </div>
            <div className="benefit-item">
              <BarChart3 className="icon" size={24} />
              <div>
                <h4>Campaign Analytics</h4>
                <p>See which teams are bringing in the most connections and analyze the effectiveness of your outreach strategies in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
