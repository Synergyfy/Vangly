"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileEdit, Plus, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../../(dashboard)/main/main.css';

export default function ContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('static');
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileEdit size={28} color="var(--purple)" /> 
            Content Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage public pages, FAQs, and Blog posts.</p>
        </div>
        {activeTab === 'static' ? (
          <Button className="btn-primary"><Plus size={18} style={{ marginRight: '8px' }}/> Create Page</Button>
        ) : (
          <Button className="btn-primary" onClick={() => router.push('/super_admin/content/blog/new')}><Plus size={18} style={{ marginRight: '8px' }}/> Create Blog Post</Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('static')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'static' ? '2px solid var(--purple)' : '2px solid transparent', color: activeTab === 'static' ? 'var(--purple)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Static Pages & FAQs
        </button>
        <button 
          onClick={() => setActiveTab('blog')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'blog' ? '2px solid var(--purple)' : '2px solid transparent', color: activeTab === 'blog' ? 'var(--purple)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Blog Posts
        </button>
      </div>

      {activeTab === 'static' && (
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Published Content</h2>
        <table className="data-table-premium" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Last Edited</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Platform FAQs</td>
              <td>Static Page</td>
              <td>Today</td>
              <td>Published</td>
              <td><Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/content/1')}>Edit</Button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>How to Set Up White Label</td>
              <td>Help Article</td>
              <td>Yesterday</td>
              <td>Published</td>
              <td><Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/content/2')}>Edit</Button></td>
            </tr>
          </tbody>
        </table>
      </Card>
      )}

      {activeTab === 'blog' && (
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Blog Posts</h2>
          <table className="data-table-premium" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Publish Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>5 Ways to Improve Your First-Time Guest Retention</td>
                <td>Leadership</td>
                <td>David O.</td>
                <td>May 12, 2026</td>
                <td><span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534' }}>Published</span></td>
                <td><Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/content/blog/1')}>Edit</Button></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Maximizing SMS Outreach for Non-Profits</td>
                <td>Guides</td>
                <td>Sarah T.</td>
                <td>May 05, 2026</td>
                <td><span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e' }}>Draft</span></td>
                <td><Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/content/blog/2')}>Edit</Button></td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
