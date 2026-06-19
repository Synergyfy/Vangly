import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../public-pages.css';

export default function DemoPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>See Harvite in Action</h1>
          <p>Watch how easy it is to capture connections, manage teams, and automate follow-ups.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="demo-video">
            [ Demo Video Placeholder ]
          </div>
          
          <div style={{ maxWidth: '600px', margin: 'var(--spacing-12) auto 0' }}>
            <h3 style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>Request a Live Demo</h3>
            <form className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <input type="text" className="form-control" placeholder="Your Name" />
              <input type="email" className="form-control" placeholder="Work Email" />
              <input type="text" className="form-control" placeholder="Organization Name" />
              <button type="button" className="btn btn-primary">Schedule Demo</button>
            </form>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
