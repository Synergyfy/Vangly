import React from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import '../public-pages.css';

export default function CookiePolicyPage() {
  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>Cookie Policy</h1>
          <p>Last updated: June 18, 2026</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="legal-content">
            <h2>1. What are cookies?</h2>
            <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.</p>
            
            <h2>2. How we use cookies</h2>
            <p>Harvite uses cookies primarily to authenticate your session when you log into the platform. We use essential cookies to:</p>
            <ul>
              <li>Keep you signed in to your account.</li>
              <li>Remember your preferences and settings.</li>
              <li>Ensure the security of our platform.</li>
            </ul>

            <h2>3. Analytics Cookies</h2>
            <p>We use minimal analytics cookies to understand how visitors interact with our public pages so we can improve the experience. We do not use third-party tracking cookies on the forms you create for your audience.</p>

            <h2>4. Managing Cookies</h2>
            <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may not be able to log into the Harvite platform.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
