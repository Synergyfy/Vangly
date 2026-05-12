"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import './landing.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="minimal-landing">
      <div className="background-slider">
        <div className="slide" style={{ backgroundImage: "url('/hero.png')" }} />
        <div className="slide" style={{ backgroundImage: "url('/Evang pic 3.png')" }} />
      </div>
      <div className="landing-overlay" />
      
      <div className="landing-content">
        <div className="landing-brand">
          <div className="brand-logo-circle">
            <img src="/vemtap.png" alt="Vemtap" className="brand-logo-img" />
          </div>
        </div>

        <h1 className="landing-headline">
          Organization Growth, <br />
          Simplified.
        </h1>
        
        <p className="landing-description">
          A streamlined platform for organizations to manage outreach, track engagement, and nurture community connections with ease.
        </p>

        <div className="landing-actions-stack">
          <Button 
            className="btn-pill btn-white" 
            onClick={() => router.push('/onboarding')}
          >
            Get started
          </Button>
          
          <Button 
            className="btn-pill btn-glass" 
            onClick={() => router.push('/login')}
          >
            I already have an account
          </Button>
        </div>

        <footer className="landing-footer">
          <p>
            By proceeding to use Vemtap, you agree to our <br />
            <a href="#">terms of use</a> and acknowledge that you have read our <br />
            <a href="#">privacy policy</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
