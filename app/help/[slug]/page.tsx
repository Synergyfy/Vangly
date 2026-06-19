import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../../public-pages.css';

export default function HelpArticlePage() {
  return (
    <div className="public-page">
      <PublicNav />
      <article className="article-layout">
        <div style={{ marginBottom: 'var(--spacing-4)', color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>
          Help Center / Getting Started / How to create your first form
        </div>
        <h1>How to create your first form</h1>
        
        <div className="article-body">
          <p>Forms are the core of Harvite. They are how you capture information from your visitors, event attendees, or congregation. Here is how to set up your first form.</p>
          
          <h2>1. Navigate to the Forms Dashboard</h2>
          <p>Once you are logged into your Harvite account, click on the <strong>Forms</strong> tab in the left-hand navigation menu. Click the blue <strong>Create Form</strong> button in the top right corner.</p>
          
          <h2>2. Choose a Template or Start from Scratch</h2>
          <p>We provide several pre-built templates for common use cases (e.g., First Time Visitor, Event Registration, Prayer Request). Select one to save time, or click <strong>Blank Form</strong> to build your own.</p>
          
          <h2>3. Add Your Fields</h2>
          <p>Drag and drop fields from the left panel onto your form canvas. We recommend keeping forms as short as possible to increase submission rates. First Name, Last Name, and Phone Number are usually sufficient for an initial connection.</p>
          
          <h2>4. Save and Generate QR Code</h2>
          <p>Once your form is complete, click <strong>Publish</strong>. Harvite will automatically generate a unique URL and a scannable QR code for this form. You can download the QR code to print on your bulletins or display on screens.</p>
        </div>

        <div style={{ marginTop: 'var(--spacing-12)', padding: 'var(--spacing-6)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
          <h4 style={{ marginBottom: 'var(--spacing-4)' }}>Was this article helpful?</h4>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center' }}>
            <button className="btn btn-white">Yes, helpful</button>
            <button className="btn btn-white">No, I need help</button>
          </div>
        </div>
      </article>
      <PublicFooter />
    </div>
  );
}
