"use client";

import React, { useState } from 'react';
import { 
  Monitor, 
  FileText, 
  Maximize2, 
  Download, 
  X,
  Smartphone,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import './display-qr.css';

export default function DisplayQRPage() {
  const [isPresenting, setIsPresenting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('screen');
  const [baseUrl, setBaseUrl] = useState('');

  const branchData = {
    name: 'Downtown HQ',
    slug: 'downtown-hq'
  };

  React.useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const inviteUrl = `${baseUrl}/f/${branchData.slug}`;

  const templates = [
    { id: 'screen', title: 'Organization Screen', desc: 'Optimized for high-contrast projectors and TVs.', icon: Monitor },
    { id: 'poster', title: 'A4 Poster', desc: 'Perfect for printing and placing on bulletin boards.', icon: FileText },
    { id: 'banner', title: 'Welcome Banner', desc: 'Wide format for entrance halls and events.', icon: Sparkles }
  ];

  const handleDownload = () => {
    const canvas = document.getElementById('main-qr-display') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `vangly-qr-${selectedTemplate}.png`;
      link.href = url;
      link.click();
    }
  };

  if (isPresenting) {
    return (
      <div className="presentation-mode fade-in">
        <button className="close-presentation" onClick={() => setIsPresenting(false)}>
          <X size={24} />
        </button>
        
        <div className="presentation-qr">
          <QRCodeCanvas 
            value={inviteUrl} 
            size={400} 
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="presentation-footer">
          <h1>{branchData.name}</h1>
          <p>Scan to register and join our community</p>
          <div style={{ marginTop: '3rem', fontSize: '1.5rem', color: 'var(--blue)', fontWeight: 600 }}>
            {inviteUrl.replace('http://', '').replace('https://', '')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
           <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <div className="admin-badge-premium">QR Gateway</div>
            <h1>Display QR Code</h1>
            <p style={{ color: 'var(--text-tertiary)' }}>Ready-to-use display formats for your organization screens and posters.</p>
          </div>
        </div>
        <div className="header-actions">
          <Button className="btn-premium" style={{ gap: '0.5rem' }} onClick={() => setIsPresenting(true)}>
            <Maximize2 size={18} />
            Enter Presentation Mode
          </Button>
        </div>
      </header>

      <div className="qr-display-container">
        <div className="main-preview-card">
          <div className="qr-frame">
            <QRCodeCanvas 
              id="main-qr-display"
              value={inviteUrl} 
              size={selectedTemplate === 'banner' ? 220 : 280} 
              level="H"
              includeMargin={true}
            />
          </div>
          <h2 className="preview-location-name">{branchData.name}</h2>
          <p className="preview-tagline">Scan this code to enter your details and connect with our location today.</p>
          
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
            <Button variant="outline" style={{ gap: '0.5rem' }} onClick={handleDownload}>
              <Download size={18} />
              Download as PNG
            </Button>
            <Button 
              style={{ gap: '0.5rem' }} 
              onClick={() => window.open(inviteUrl, '_blank')}
            >
              <Smartphone size={18} />
              Test Link
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        <div className="display-options-panel">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Display Templates</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
            Select a template to optimize the QR code for its intended use case.
          </p>

          {templates.map(template => (
            <div 
              key={template.id} 
              className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-md)', 
                  background: selectedTemplate === template.id ? 'var(--blue)' : 'var(--bg)', 
                  color: selectedTemplate === template.id ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <template.icon size={24} />
                </div>
                <div className="template-info">
                  <h4>{template.title}</h4>
                  <p>{template.desc}</p>
                </div>
              </div>
            </div>
          ))}

          <Card style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--surface-secondary)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--orange)' }} />
              Pro Tip
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use <strong>Presentation Mode</strong> on your organization screen during service to allow new members to join seamlessly from their seats.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
