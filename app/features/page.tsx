"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, QrCode, Users, MapPin, 
  MessageSquare, BarChart, CheckCircle, Smartphone, Check
} from 'lucide-react';
import './features.css';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <div className="features-page">
      <PublicNav />

      {/* Hero Section */}
      <section className="features-hero">
        <div className="container">
          <h1>Everything you need to grow</h1>
          <p>Powerful tools designed to help your organization capture every connection and follow up with precision.</p>
        </div>
      </section>

      {/* 1. Dynamic Forms */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row">
            <div className="feature-visual">
              <FileText className="visual-placeholder-icon" />
              <div>Form Editor Preview</div>
            </div>
            <div className="feature-content">
              <h2>Dynamic Forms</h2>
              <p>Create beautiful, mobile-friendly forms in seconds. Customize fields to collect exactly the information your team needs to follow up effectively.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Higher submission rates through clean, simple interfaces.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">First-time visitor cards, event registration, and prayer requests.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QR Codes */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row reverse">
            <div className="feature-visual">
              <QrCode className="visual-placeholder-icon" />
              <div>QR Code Generation Preview</div>
            </div>
            <div className="feature-content">
              <h2>Instant QR Codes</h2>
              <p>Every form automatically generates a unique, scannable QR code. Download and print them for bulletins, welcome desks, and presentations.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Remove friction. People can respond instantly from their own devices.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">Displaying on screens during announcements for immediate engagement.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Teams */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row">
            <div className="feature-visual">
              <Users className="visual-placeholder-icon" />
              <div>Team Management Preview</div>
            </div>
            <div className="feature-content">
              <h2>Organized Teams</h2>
              <p>Structure your outreach by creating dedicated teams. Assign forms, manage responses, and ensure nothing falls through the cracks.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Clear accountability and faster response times.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">Routing youth signups directly to the Youth Ministry team leaders.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Multiple Locations */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row reverse">
            <div className="feature-visual">
              <MapPin className="visual-placeholder-icon" />
              <div>Location Dashboard Preview</div>
            </div>
            <div className="feature-content">
              <h2>Multiple Locations</h2>
              <p>Managing multiple campuses or chapters? Create discrete locations under your organization umbrella to keep data localized and secure.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Scale your organization without confusing your databases.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">A multi-site church tracking visitor data separately per campus.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Messaging */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row">
            <div className="feature-visual">
              <MessageSquare className="visual-placeholder-icon" />
              <div>Messaging System Preview</div>
            </div>
            <div className="feature-content">
              <h2>Seamless Messaging</h2>
              <p>Reach out immediately. Send SMS directly from the platform to acknowledge form submissions, send updates, and nurture the relationship.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Keep your communications centralized and trackable.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">Automatically texting a \"Thank you for visiting!\" message.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Analytics */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row reverse">
            <div className="feature-visual">
              <BarChart className="visual-placeholder-icon" />
              <div>Analytics Dashboard Preview</div>
            </div>
            <div className="feature-content">
              <h2>Actionable Analytics</h2>
              <p>See the big picture. Track form submissions, response rates, and team performance over time to understand where your growth comes from.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Make data-driven decisions for your outreach strategies.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">Reviewing monthly engagement metrics across all locations.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. White Label */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row">
            <div className="feature-visual">
              <CheckCircle className="visual-placeholder-icon" />
              <div>Branding Settings Preview</div>
            </div>
            <div className="feature-content">
              <h2>White Labeling</h2>
              <p>Make it yours. Replace Harvite branding with your organization's logo and colors to ensure a seamless experience for your community.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Maintains your brand identity and builds trust.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">A large NGO keeping all public-facing assets strictly under their own branding.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Mobile App */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-row reverse">
            <div className="feature-visual">
              <Smartphone className="visual-placeholder-icon" />
              <div>PWA App Preview</div>
            </div>
            <div className="feature-content">
              <h2>Mobile First (PWA)</h2>
              <p>Install Harvite directly to your phone's home screen. Our Progressive Web App ensures you have the power of Harvite wherever your outreach takes you.</p>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Benefit</div>
                  <div className="text">Fast, app-like experience without the App Store friction.</div>
                </div>
              </div>
              
              <div className="feature-bullet">
                <Check className="icon" size={20} />
                <div>
                  <div className="label">Use Case</div>
                  <div className="text">Quickly checking responses or sending messages while walking around an event.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to transform your outreach?</h2>
          <div className="cta-actions">
            <button className="btn btn-white" onClick={() => router.push('/onboarding')}>Create Free Account</button>
            <button className="btn btn-outline-white">Watch Demo</button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
