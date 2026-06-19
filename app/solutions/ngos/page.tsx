import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { UserCheck, HeartHandshake, FileCheck, Target } from 'lucide-react';
import '../../public-pages.css';

export default function NgoSolutionPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Manage your mission, not your spreadsheets.</h1>
          <p>Harvite empowers NGOs to register volunteers, track beneficiaries, and run community outreach programs with precision and ease.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>NGO Use Cases</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <UserCheck className="icon" size={24} />
              <div>
                <h4>Volunteer Registration</h4>
                <p>Create simple, mobile-friendly forms for volunteers to sign up for specific projects, shifts, or events in seconds.</p>
              </div>
            </div>
            <div className="benefit-item">
              <HeartHandshake className="icon" size={24} />
              <div>
                <h4>Community Outreach</h4>
                <p>Equip field workers with digital forms to securely capture community data and needs assessments on the go.</p>
              </div>
            </div>
            <div className="benefit-item">
              <FileCheck className="icon" size={24} />
              <div>
                <h4>Program Registrations</h4>
                <p>Allow beneficiaries to easily enroll in assistance programs, training sessions, or distribution events via QR codes.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Target className="icon" size={24} />
              <div>
                <h4>Beneficiary Tracking</h4>
                <p>Maintain an organized database of contacts and use SMS to send crucial updates, reminders, and resources.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
