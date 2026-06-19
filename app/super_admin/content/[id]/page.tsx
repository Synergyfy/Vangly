"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import '../../../(dashboard)/main/main.css';

export default function ContentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);

  // Mock content
  const content = {
    id: unwrappedParams.id,
    title: unwrappedParams.id === '1' ? 'Platform FAQs' : 'How to Set Up White Label',
    type: unwrappedParams.id === '1' ? 'Static Page' : 'Help Article',
    body: `<h1>Heading</h1>\n<p>Start writing your content here...</p>`
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/content')} style={{ borderRadius: '20px', padding: '8px 16px', border: '1px solid var(--border)' }}>
          <ArrowLeft size={16} /> Back to Content
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Edit: {content.title}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Type: {content.type}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline"><Eye size={16} style={{ marginRight: '8px' }}/> Preview</Button>
          <Button className="btn-primary"><Save size={16} style={{ marginRight: '8px' }}/> Save &amp; Publish</Button>
        </div>
      </div>

      <Card className="glass-morphism" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Page Title</label>
          <input type="text" defaultValue={content.title} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Content Body (HTML/Markdown)</label>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', gap: '8px' }}>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer' }}>B</button>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
              <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }}></div>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>Link</button>
            </div>
            <textarea rows={15} defaultValue={content.body} style={{ width: '100%', padding: '16px', border: 'none', fontSize: '15px', resize: 'vertical', outline: 'none' }} />
          </div>
        </div>
      </Card>

    </div>
  );
}
