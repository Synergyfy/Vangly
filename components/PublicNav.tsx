"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function PublicNav() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="nav-header">
      <div className="container nav-container">
        <div className="nav-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/Harvite%20Full%20Logo%20Edit.png" 
            alt="Harvite Logo" 
            style={{ height: '40px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} 
          />
        </div>
        
        {/* Desktop Nav */}
        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="/features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a href="/solutions" onClick={() => setIsMobileMenuOpen(false)}>Solutions</a>
          <a href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
          <a href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>
          
          {/* Mobile Actions inside Menu */}
          <div className="mobile-nav-actions">
            <button className="btn btn-ghost" onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}>Login</button>
            <button className="btn btn-primary" onClick={() => { setIsMobileMenuOpen(false); router.push('/onboarding'); }}>Get Started</button>
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="nav-actions desktop-only">
          <button className="btn btn-ghost" onClick={() => router.push('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>Get Started</button>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
