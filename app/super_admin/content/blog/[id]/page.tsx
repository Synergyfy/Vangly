"use client";

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Eye, Image as ImageIcon, Plus, X, Tag, UserPlus } from 'lucide-react';
import '../../../../(dashboard)/main/main.css';

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const isNew = unwrappedParams.id === 'new';

  // Categories & Authors state (manageable inline)
  const [categories, setCategories] = useState(['Leadership', 'Guides', 'Product Updates', 'Success Stories', 'Church Growth']);
  const [authors, setAuthors] = useState(['David O.', 'Sarah T.', 'Harvite Team']);

  // New item creation
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');

  // Post state
  const [selectedCategory, setSelectedCategory] = useState(isNew ? '' : 'Leadership');
  const [selectedAuthor, setSelectedAuthor] = useState(isNew ? '' : 'David O.');

  const post = isNew ? {
    title: '',
    excerpt: '',
    body: '',
    status: 'Draft'
  } : {
    title: '5 Ways to Improve Your First-Time Guest Retention',
    excerpt: 'Discover actionable strategies to ensure that visitors return to your organization and become engaged members.',
    body: `<h1>Why Guest Retention Matters</h1>\n<p>Start writing your content here...</p>`,
    status: 'Published'
  };

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setSelectedCategory(trimmed);
    }
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const addAuthor = () => {
    const trimmed = newAuthorName.trim();
    if (trimmed && !authors.includes(trimmed)) {
      setAuthors([...authors, trimmed]);
      setSelectedAuthor(trimmed);
    }
    setNewAuthorName('');
    setShowNewAuthor(false);
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
    if (selectedCategory === cat) setSelectedCategory('');
  };

  const removeAuthor = (author: string) => {
    setAuthors(authors.filter(a => a !== author));
    if (selectedAuthor === author) setSelectedAuthor('');
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', backgroundColor: 'var(--bg-primary)', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    border: active ? '1.5px solid var(--blue)' : '1px solid var(--border)',
    background: active ? 'var(--blue-subtle)' : 'var(--bg-primary)',
    color: active ? 'var(--blue)' : 'var(--text-secondary)',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/super_admin/content')} style={{ borderRadius: '20px', padding: '8px 16px', border: '1px solid var(--border)' }}>
          <ArrowLeft size={16} /> Back to Content
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{isNew ? 'Create New Blog Post' : 'Edit Blog Post'}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status: {post.status}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline"><Eye size={16} style={{ marginRight: '8px' }}/> Preview</Button>
          <Button className="btn-primary"><Save size={16} style={{ marginRight: '8px' }}/> Save &amp; Publish</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Post Title */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Post Title</label>
            <input type="text" defaultValue={post.title} placeholder="Enter a catchy title..." style={{ ...inputStyle, fontSize: '16px' }} />
          </div>

          <div>
            <label style={labelStyle}>Short Excerpt (SEO Description)</label>
            <textarea rows={3} defaultValue={post.excerpt} placeholder="A brief summary of the post..." style={{ ...inputStyle, resize: 'vertical', fontSize: '14px' }} />
          </div>
        </Card>

        {/* Category Selection */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="var(--blue)" /> Category
            </label>
            <button
              onClick={() => setShowNewCategory(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: '1px dashed var(--blue)', background: 'none', color: 'var(--blue)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={14} /> Add Category
            </button>
          </div>

          {showNewCategory && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="New category name..."
                autoFocus
                style={{ ...inputStyle, flex: 1, padding: '10px 14px' }}
              />
              <Button className="btn-primary" size="sm" onClick={addCategory} disabled={!newCategoryName.trim()}>Add</Button>
              <button onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <div key={cat} style={chipStyle(selectedCategory === cat)} onClick={() => setSelectedCategory(cat)}>
                {cat}
                <button
                  onClick={(e) => { e.stopPropagation(); removeCategory(cat); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                  title="Remove category"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {!selectedCategory && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '8px' }}>Please select a category.</p>}
        </Card>

        {/* Author Selection */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={16} color="var(--purple)" /> Author
            </label>
            <button
              onClick={() => setShowNewAuthor(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', border: '1px dashed var(--purple)', background: 'none', color: 'var(--purple)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={14} /> Add Author
            </button>
          </div>

          {showNewAuthor && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <input
                type="text"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAuthor()}
                placeholder="Author full name..."
                autoFocus
                style={{ ...inputStyle, flex: 1, padding: '10px 14px' }}
              />
              <Button className="btn-primary" size="sm" onClick={addAuthor} disabled={!newAuthorName.trim()}>Add</Button>
              <button onClick={() => { setShowNewAuthor(false); setNewAuthorName(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {authors.map(author => (
              <div key={author} style={chipStyle(selectedAuthor === author)} onClick={() => setSelectedAuthor(author)}>
                {author}
                <button
                  onClick={(e) => { e.stopPropagation(); removeAuthor(author); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                  title="Remove author"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {!selectedAuthor && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '8px' }}>Please select an author.</p>}
        </Card>

        {/* Cover Image */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <label style={labelStyle}>Cover Image</label>
          <div style={{ height: '200px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-tertiary)', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)' }}>
            <ImageIcon size={32} />
            <div style={{ fontWeight: 600 }}>Click to upload an image</div>
            <div style={{ fontSize: '12px' }}>Recommended size: 1200 x 630px</div>
          </div>
        </Card>

        {/* Body Content */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <label style={labelStyle}>Content Body</label>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer' }}>B</button>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
              <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }}></div>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><ImageIcon size={14} /> Image</button>
              <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>Link</button>
            </div>
            <textarea rows={20} defaultValue={post.body} placeholder="Start writing the blog post..." style={{ width: '100%', padding: '16px', border: 'none', fontSize: '16px', resize: 'vertical', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit' }} />
          </div>
        </Card>
      </div>

    </div>
  );
}
