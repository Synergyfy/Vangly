import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../public-pages.css';

export default function SuccessStoriesPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Success Stories</h1>
          <p>See how organizations around the world use Harvite to grow their communities and streamline their outreach.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="stories-grid">
            <div className="story-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <span className="story-tag">Church Growth</span>
              <h3>Grace Community Church</h3>
              <p>How a 5,000-member church eliminated paper visitor cards and increased their first-timer retention rate by 40% using Harvite's automated SMS sequences.</p>
              <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginTop: 'var(--spacing-4)' }}>Read Case Study &rarr;</a>
            </div>
            
            <div className="story-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <span className="story-tag">Outreach Campaign</span>
              <h3>City Hope Ministries</h3>
              <p>Equipping a 200-person street evangelism team with mobile-first data capture, resulting in 1,200 new connections in a single weekend.</p>
              <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginTop: 'var(--spacing-4)' }}>Read Case Study &rarr;</a>
            </div>
            
            <div className="story-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <span className="story-tag">NGO Registration Drive</span>
              <h3>Global Relief Initiative</h3>
              <p>Streamlining volunteer onboarding across 15 different international branches using Harvite's secure, white-labeled forms and team management tools.</p>
              <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginTop: 'var(--spacing-4)' }}>Read Case Study &rarr;</a>
            </div>
            
            <div className="story-card" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <span className="story-tag">Event Registration Success</span>
              <h3>Awaken Youth Conference</h3>
              <p>Managing seamless QR-code check-ins for 3,000 attendees and distributing post-event resources entirely through automated workflows.</p>
              <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginTop: 'var(--spacing-4)' }}>Read Case Study &rarr;</a>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
