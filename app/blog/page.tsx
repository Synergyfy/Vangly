"use client";

import React, { useState } from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { useRouter } from 'next/navigation';
import '../public-pages.css';

const blogPosts = [
  {
    slug: '5-ways-to-improve-guest-retention',
    title: '5 Ways to Improve Your First-Time Guest Retention',
    excerpt: 'Discover actionable strategies to ensure that visitors return to your organization and become engaged members.',
    category: 'Leadership',
    author: 'David O.',
    date: 'May 12, 2026',
    readTime: '6 min read',
    gradient: 'linear-gradient(135deg, #066CF4 0%, #6366f1 100%)',
  },
  {
    slug: 'maximizing-sms-outreach',
    title: 'Maximizing SMS Outreach for Non-Profits',
    excerpt: 'Learn how to reach more people with fewer credits using targeted SMS campaigns and smart scheduling.',
    category: 'Guides',
    author: 'Sarah T.',
    date: 'May 05, 2026',
    readTime: '8 min read',
    gradient: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',
  },
  {
    slug: 'building-community-digitally',
    title: 'Building Community in a Digital-First World',
    excerpt: 'How forward-thinking organizations are leveraging technology to create deeper, more meaningful connections.',
    category: 'Church Growth',
    author: 'Harvite Team',
    date: 'Apr 28, 2026',
    readTime: '5 min read',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  },
  {
    slug: 'onboarding-new-members',
    title: 'The Complete Guide to Onboarding New Members',
    excerpt: 'From the moment someone walks through your door to their first month — a step-by-step onboarding blueprint.',
    category: 'Guides',
    author: 'David O.',
    date: 'Apr 20, 2026',
    readTime: '10 min read',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  },
  {
    slug: 'data-driven-ministry',
    title: 'Data-Driven Ministry: Metrics That Actually Matter',
    excerpt: 'Stop tracking vanity metrics. Here are the numbers that truly reflect the health of your organization.',
    category: 'Leadership',
    author: 'Sarah T.',
    date: 'Apr 14, 2026',
    readTime: '7 min read',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
  },
  {
    slug: 'harvite-product-update-may-2026',
    title: 'Product Update: What\'s New in Harvite — May 2026',
    excerpt: 'Multi-location management, bulk SMS improvements, and a redesigned dashboard — here\'s everything we shipped.',
    category: 'Product Updates',
    author: 'Harvite Team',
    date: 'Apr 01, 2026',
    readTime: '4 min read',
    gradient: 'linear-gradient(135deg, #066CF4 0%, #0EA5E9 100%)',
  },
];

export default function BlogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Leadership', 'Guides', 'Church Growth', 'Product Updates'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="public-page">
      <PublicNav />
      <section className="page-hero">
        <div className="container">
          <h1>The Harvite Blog</h1>
          <p>Insights, guides, and best practices for growing your organization and improving your follow-up.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '300px', height: '44px', borderRadius: '12px', border: '1px solid var(--border)', padding: '0 16px', fontSize: '14px' }} 
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: selectedCategory === cat ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedCategory === cat ? 'rgba(6, 108, 244, 0.08)' : 'var(--bg-primary)',
                    color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '18px', fontWeight: 600 }}>No articles found.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {filteredPosts.map((post) => (
                <div 
                  key={post.slug} 
                  className="blog-card" 
                  style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', overflow: 'hidden' }} 
                  onClick={() => router.push(`/blog/${post.slug}`)}
                >
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    background: post.gradient, 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    padding: '16px',
                  }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: 'white', 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      backdropFilter: 'blur(4px)',
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {post.category}
                    </span>
                  </div>
                  <div className="blog-body" style={{ padding: '20px' }}>
                    <div className="blog-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{post.author}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontSize: '17px', lineHeight: 1.4, marginBottom: '8px' }}>{post.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{post.excerpt}</p>
                    <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                      Read More →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
