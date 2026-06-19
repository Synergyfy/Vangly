"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, FileText, QrCode, 
  MessageSquare, BarChart, CheckCircle, ArrowRight
} from 'lucide-react';
import './homepage.css';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = ['/hero.png', '/Evang pic 3.png'];

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      <PublicNav />

      {/* --- Hero Section --- */}
      <section className="hero-section">
        <div className="hero-slider animate-slide-up">
          {images.map((src, index) => (
            <img 
              key={src}
              src={src} 
              alt={`Harvite feature ${index + 1}`} 
              className={`slider-image ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
          <div className="slider-indicators">
            {images.map((_, index) => (
              <div 
                key={index} 
                className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-headline">Capture More Connections.<br/>Follow Up Better.</h1>
            <p className="hero-subheadline">
              Harvite helps churches and organizations track invitations, capture contacts, manage outreach, and grow engagement from one simple platform.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>
                Start Free <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline-white">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Why Harvite Section --- */}
      <section className="why-section">
        <div className="container">
          <div className="why-title">Why Harvite?</div>
          <div className="harvite-huge">HARVITE</div>
          <div className="harvite-meaning">HARvest your inVITE</div>
          <p className="why-support">
            Every invitation is an opportunity. Harvite helps organizations capture, track, and nurture the people they invite.
          </p>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p className="text-secondary">From invitation to lasting connection</p>
          </div>
          
          <div className="how-grid">
            <div className="how-step">
              <div className="step-icon"><Building2 size={24} /></div>
              <div className="step-content">
                <h4>Organization</h4>
              </div>
            </div>
            <div className="how-step">
              <div className="step-icon"><Users size={24} /></div>
              <div className="step-content">
                <h4>Team</h4>
              </div>
            </div>
            <div className="how-step">
              <div className="step-icon"><FileText size={24} /></div>
              <div className="step-content">
                <h4>Form</h4>
              </div>
            </div>
            <div className="how-step">
              <div className="step-icon"><MessageSquare size={24} /></div>
              <div className="step-content">
                <h4>Follow-Up</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Preview --- */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need</h2>
          </div>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="icon-wrapper"><FileText size={32} /></div>
              <h4>Forms</h4>
              <p className="text-secondary text-small">Capture details effortlessly.</p>
            </div>
            <div className="card feature-card">
              <div className="icon-wrapper"><QrCode size={32} /></div>
              <h4>QR Codes</h4>
              <p className="text-secondary text-small">Scan to connect instantly.</p>
            </div>
            <div className="card feature-card">
              <div className="icon-wrapper"><Users size={32} /></div>
              <h4>Teams</h4>
              <p className="text-secondary text-small">Organize your outreach.</p>
            </div>
            <div className="card feature-card">
              <div className="icon-wrapper"><MessageSquare size={32} /></div>
              <h4>Messaging</h4>
              <p className="text-secondary text-small">Automate follow-ups.</p>
            </div>
            <div className="card feature-card">
              <div className="icon-wrapper"><BarChart size={32} /></div>
              <h4>Analytics</h4>
              <p className="text-secondary text-small">Track your growth.</p>
            </div>
            <div className="card feature-card">
              <div className="icon-wrapper"><CheckCircle size={32} /></div>
              <h4>White Label</h4>
              <p className="text-secondary text-small">Your brand, front and center.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Use Cases --- */}
      <section className="use-cases-section">
        <div className="container">
          <div className="section-header">
            <h2>Built for your mission</h2>
          </div>
          <div className="use-cases-grid">
            <div className="card use-case-card">
              <h4>Churches</h4>
            </div>
            <div className="card use-case-card">
              <h4>Ministries</h4>
            </div>
            <div className="card use-case-card">
              <h4>NGOs</h4>
            </div>
            <div className="card use-case-card">
              <h4>Outreach Teams</h4>
            </div>
            <div className="card use-case-card">
              <h4>Volunteer Organizations</h4>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Harvest More Connections?</h2>
          <div className="cta-actions">
            <button className="btn btn-white" onClick={() => router.push('/onboarding')}>
              Create Free Account
            </button>
            <button className="btn btn-outline-white">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
