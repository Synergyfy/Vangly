"use client";

import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { useRouter } from 'next/navigation';
import './public-pages.css';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="public-page">
      <PublicNav />
      <div className="container">
        <div className="not-found">
          <div className="big-404">404</div>
          <h2>Page Not Found</h2>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Go Home
          </button>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
