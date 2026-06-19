"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import '../../public-pages.css';

const allPosts: Record<string, {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  gradient: string;
  excerpt: string;
  body: string;
}> = {
  '5-ways-to-improve-guest-retention': {
    title: '5 Ways to Improve Your First-Time Guest Retention',
    category: 'Leadership',
    author: 'David O.',
    date: 'May 12, 2026',
    readTime: '6 min read',
    gradient: 'linear-gradient(135deg, #066CF4 0%, #6366f1 100%)',
    excerpt: 'Discover actionable strategies to ensure that visitors return to your organization and become engaged members.',
    body: `<p>When a guest walks through your doors for the first time, you have a brief window to make an impression. How you follow up determines whether they return or slip through the cracks.</p>

<h2>1. Ditch the Paper Cards</h2>
<p>Paper visitor cards get lost, they are hard to read, and manually entering data into a database takes too long. By the time the data is entered, the best window for follow-up has passed. Use digital forms instead — tools like Harvite let guests check in via a simple QR code on their phone.</p>

<h2>2. Respond Within 5 Minutes</h2>
<p>When a guest fills out a digital form via a QR code, an automated welcome SMS should trigger immediately. This instant acknowledgment makes them feel seen and valued while they are still in the building. Studies show that the chances of conversion drop drastically after just 5 minutes.</p>

<h2>3. Personalize the Journey</h2>
<p>Not every visitor is the same. A young family has different needs than a college student. Segment your follow-ups based on the data collected in your forms to provide relevant next steps — a parenting group for the family, a young adults mixer for the student.</p>

<h2>4. Assign a Follow-Up Owner</h2>
<p>Without clear ownership, follow-ups fall through the cracks. Assign each new guest to a specific team member or volunteer who is responsible for the personal outreach. Harvite's assignment system makes this automatic.</p>

<h2>5. Track and Iterate</h2>
<p>Measure your guest retention rate monthly. How many first-time visitors returned within 30 days? If that number isn't growing, revisit your welcome process. The data doesn't lie — let it guide your strategy.</p>

<h2>Final Thoughts</h2>
<p>Guest retention isn't about gimmicks or programs. It's about making people feel genuinely welcome and following through on that promise. With the right tools and intentional processes, you can turn every first visit into the beginning of a lasting relationship.</p>`,
  },
  'maximizing-sms-outreach': {
    title: 'Maximizing SMS Outreach for Non-Profits',
    category: 'Guides',
    author: 'Sarah T.',
    date: 'May 05, 2026',
    readTime: '8 min read',
    gradient: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',
    excerpt: 'Learn how to reach more people with fewer credits using targeted SMS campaigns and smart scheduling.',
    body: `<p>SMS remains the most effective digital communication channel, with a 98% open rate compared to email's 20%. For non-profits operating on tight budgets, every credit counts. Here's how to make each one work harder.</p>

<h2>Know Your Audience Segments</h2>
<p>Don't blast the same message to everyone. Segment your contacts by engagement level, location, and interests. A targeted message to 50 people will outperform a generic one sent to 500.</p>

<h2>Timing Is Everything</h2>
<p>Send messages when your audience is most likely to read them. Mid-morning (10-11 AM) and early evening (5-7 PM) tend to see the highest engagement rates. Avoid late nights and early mornings.</p>

<h2>Keep It Short and Actionable</h2>
<p>Every SMS should have one clear call to action. Whether it's "Reply YES to confirm" or "Click here to register," make the next step obvious and effortless.</p>

<h2>Use Merge Tags for Personalization</h2>
<p>A message that says "Hi Sarah, we missed you last Sunday!" is far more impactful than "Dear Member." Use first-name merge tags to add that personal touch at scale.</p>

<h2>Track Your Results</h2>
<p>Monitor delivery rates, response rates, and opt-out rates. If opt-outs spike after a campaign, you may be messaging too frequently or sending irrelevant content.</p>`,
  },
  'building-community-digitally': {
    title: 'Building Community in a Digital-First World',
    category: 'Church Growth',
    author: 'Harvite Team',
    date: 'Apr 28, 2026',
    readTime: '5 min read',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    excerpt: 'How forward-thinking organizations are leveraging technology to create deeper, more meaningful connections.',
    body: `<p>The pandemic accelerated a shift that was already underway: community is no longer defined solely by physical proximity. Today, the most vibrant organizations are those that blend in-person warmth with digital convenience.</p>

<h2>Start with a Digital Front Door</h2>
<p>Your website and social media are often the first touchpoint for potential members. Make sure your digital presence reflects the warmth and authenticity of your physical community. A clean, modern web presence sets the tone.</p>

<h2>Hybrid Is the New Normal</h2>
<p>Offer multiple ways to engage — in-person services, online streams, WhatsApp groups, SMS updates. Meet people where they are, not where you wish they were.</p>

<h2>Data-Informed Connection</h2>
<p>Use tools like Harvite to understand your community better. Who hasn't checked in for three weeks? Who just visited for the first time? Data helps you be intentional about outreach without being intrusive.</p>`,
  },
  'onboarding-new-members': {
    title: 'The Complete Guide to Onboarding New Members',
    category: 'Guides',
    author: 'David O.',
    date: 'Apr 20, 2026',
    readTime: '10 min read',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    excerpt: 'From the moment someone walks through your door to their first month — a step-by-step onboarding blueprint.',
    body: `<p>Onboarding isn't a one-time event — it's a journey. The first 90 days of someone's experience with your organization will determine whether they become a committed member or quietly disappear.</p>

<h2>Week 1: The Welcome</h2>
<p>Send an immediate welcome SMS after their first visit. Follow up with a personal call from a team leader within 48 hours. This simple two-step process can increase return rates by 40%.</p>

<h2>Week 2-4: The Integration</h2>
<p>Invite them to a newcomer's gathering — a small, informal setting where they can meet other new faces and ask questions. Assign them a "buddy" who can help them navigate the community.</p>

<h2>Month 2-3: The Deepening</h2>
<p>Present pathways for deeper involvement — small groups, volunteer teams, skill-based classes. The key is offering options, not pressure. Let them choose their own adventure.</p>`,
  },
  'data-driven-ministry': {
    title: 'Data-Driven Ministry: Metrics That Actually Matter',
    category: 'Leadership',
    author: 'Sarah T.',
    date: 'Apr 14, 2026',
    readTime: '7 min read',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
    excerpt: 'Stop tracking vanity metrics. Here are the numbers that truly reflect the health of your organization.',
    body: `<p>It's tempting to focus on attendance numbers. But a packed room doesn't necessarily mean a healthy community. Here are the metrics that actually reveal organizational health.</p>

<h2>Return Rate</h2>
<p>What percentage of first-time guests return within 30 days? This metric reveals whether your welcome experience is actually working. Aim for 25-40%.</p>

<h2>Engagement Depth</h2>
<p>Beyond just showing up, are people joining groups, volunteering, and connecting with others? Track how many members are engaged in at least one activity beyond the main gathering.</p>

<h2>Follow-Up Response Rate</h2>
<p>When you send an SMS or message, what percentage of people respond? Low response rates may indicate messaging fatigue or irrelevant content.</p>`,
  },
  'harvite-product-update-may-2026': {
    title: "Product Update: What's New in Harvite — May 2026",
    category: 'Product Updates',
    author: 'Harvite Team',
    date: 'Apr 01, 2026',
    readTime: '4 min read',
    gradient: 'linear-gradient(135deg, #066CF4 0%, #0EA5E9 100%)',
    excerpt: "Multi-location management, bulk SMS improvements, and a redesigned dashboard — here's everything we shipped.",
    body: `<p>We've been busy! Here's a roundup of everything the Harvite team shipped this month to help your organization grow smarter and faster.</p>

<h2>Multi-Location Management</h2>
<p>You can now manage multiple locations from a single dashboard. Each location has its own check-in forms, staff, and analytics — while HQ maintains a bird's-eye view of everything.</p>

<h2>Bulk SMS Improvements</h2>
<p>We've optimized our SMS delivery pipeline for faster sending and better deliverability. Plus, you can now schedule messages up to 30 days in advance.</p>

<h2>Redesigned Dashboard</h2>
<p>The main dashboard has been completely rebuilt with a focus on clarity and speed. Key metrics are front and center, with quick-action buttons for common tasks.</p>`,
  },
};

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const post = allPosts[unwrappedParams.slug];

  if (!post) {
    return (
      <div className="public-page">
        <PublicNav />
        <div style={{ textAlign: 'center', padding: '120px 20px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Article Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The blog post you are looking for doesn't exist.</p>
          <button onClick={() => router.push('/blog')} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            Back to Blog
          </button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="public-page">
      <PublicNav />

      {/* Hero Banner */}
      <div style={{
        width: '100%',
        background: post.gradient,
        padding: '60px 20px 48px',
        position: 'relative',
      }}>
        <div className="container" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button 
            onClick={() => router.push('/blog')}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', 
              backdropFilter: 'blur(4px)', border: 'none', color: 'white', padding: '8px 16px', 
              borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '24px',
            }}
          >
            <ArrowLeft size={14} /> All Articles
          </button>
          <div style={{ 
            display: 'inline-block', padding: '4px 14px', borderRadius: '20px', 
            backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
            color: 'white', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', 
            letterSpacing: '0.5px', marginBottom: '16px',
          }}>
            {post.category}
          </div>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 800, lineHeight: 1.25, marginBottom: '20px', maxWidth: '650px' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {post.author}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {post.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px 80px' }}>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px', borderLeft: '3px solid var(--primary)', paddingLeft: '20px' }}>
          {post.excerpt}
        </p>
        <div 
          className="article-body" 
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />

        {/* Back to Blog CTA */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>Enjoyed this article?</p>
          <button 
            onClick={() => router.push('/blog')}
            style={{ 
              padding: '12px 32px', borderRadius: '12px', border: 'none', 
              background: 'var(--primary)', color: 'white', fontWeight: 600, 
              cursor: 'pointer', fontSize: '15px',
            }}
          >
            ← Browse More Articles
          </button>
        </div>
      </article>

      <PublicFooter />
    </div>
  );
}
