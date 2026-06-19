import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../public-pages.css';

export default function AboutPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <div className="about-mission">
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 'var(--spacing-4)' }}>Why Harvite?</div>
            <h1 className="harvite-huge">HARVITE</h1>
            <div className="harvite-meaning">HARvest your inVITE</div>
            <p style={{ fontSize: '20px', lineHeight: 1.6 }}>
              Harvite was created to help organizations turn invitations into meaningful relationships. Every invitation matters. Every connection matters. Every follow-up matters.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="legal-content" style={{ paddingTop: '0' }}>
            <h2>Our Mission</h2>
            <p>Our mission is to eliminate the friction between a first-time encounter and a long-term relationship. We build technology that gets out of the way, allowing churches, NGOs, and outreach teams to focus on people rather than paperwork.</p>
            
            <h2>Who We Serve</h2>
            <p>We serve organizations that are driven by purpose. From local church plants managing a handful of weekend visitors to international NGOs coordinating massive volunteer efforts, Harvite provides the scalable infrastructure needed to grow communities.</p>

            <h2>Why We Built Harvite</h2>
            <p>We saw too many paper connection cards sitting in stacks on desks, unentered and forgotten. We saw organizations struggling to manually text dozens of visitors. We built Harvite because we believe that when someone takes the brave step to fill out a card and connect, they deserve a prompt, personal, and organized response.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
