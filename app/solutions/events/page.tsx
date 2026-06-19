import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { CalendarCheck, QrCode, MessageSquare, ClipboardList } from 'lucide-react';
import '../../public-pages.css';

export default function EventsSolutionPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Flawless event registration & tracking.</h1>
          <p>From large conferences to intimate workshops, Harvite makes it simple to manage attendees, capture feedback, and keep everyone informed.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>Event Capabilities</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <CalendarCheck className="icon" size={24} />
              <div>
                <h4>Conferences & Seminars</h4>
                <p>Create dynamic registration forms that collect the exact attendee data you need, including session preferences and dietary requirements.</p>
              </div>
            </div>
            <div className="benefit-item">
              <QrCode className="icon" size={24} />
              <div>
                <h4>Contactless Check-In</h4>
                <p>Display QR codes at the entrance for lightning-fast, self-serve registration and check-ins that prevent bottlenecks.</p>
              </div>
            </div>
            <div className="benefit-item">
              <MessageSquare className="icon" size={24} />
              <div>
                <h4>Instant Notifications</h4>
                <p>Use the integrated SMS platform to broadcast room changes, schedule updates, or post-event thank you messages to all attendees.</p>
              </div>
            </div>
            <div className="benefit-item">
              <ClipboardList className="icon" size={24} />
              <div>
                <h4>Feedback & Surveys</h4>
                <p>Automatically text attendees a link to a feedback form as they leave, ensuring high response rates while the experience is fresh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
