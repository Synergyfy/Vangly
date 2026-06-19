"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PublicNav() {
  const router = useRouter();

  return (
    <header className="nav-header">
      <div className="container nav-container">
        <div className="nav-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Harvite</div>
        <nav className="nav-links">
          <a href="/features">Features</a>
          <a href="/solutions">Solutions</a>
          <a href="/pricing">Pricing</a>
          <a href="/blog">Blog</a>
        </nav>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>Start Free</button>
        </div>
      </div>
    </header>
  );
}
