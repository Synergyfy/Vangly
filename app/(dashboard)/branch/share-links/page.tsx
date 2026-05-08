"use client";

import React, { useState } from 'react';
import { 
  Copy, 
  Download, 
  Share2, 
  UserPlus, 
  Users, 
  Check, 
  Plus, 
  ExternalLink,
  QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import './share-links.css';

export default function ShareLinksPage() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  const registrationLinks = [
    {
      id: 'workers',
      title: 'Branch Workers',
      description: 'Registration for official branch evangelism staff.',
      url: 'https://vangly.app/join/downtown-workers',
      type: 'workers',
      icon: Users
    },
    {
      id: 'volunteers',
      title: 'Branch Volunteers',
      description: 'Registration for temporary or seasonal volunteers.',
      url: 'https://vangly.app/join/downtown-volunteers',
      type: 'volunteers',
      icon: UserPlus
    }
  ];

  const [customLinks, setCustomLinks] = useState([
    { id: '1', name: 'Saturday Outreach Event', group: 'Evangelism Team', visits: 45, url: 'https://vangly.app/join/sat-outreach' },
    { id: '2', name: 'Youth Camp 2026', group: 'Youth Workers', visits: 128, url: 'https://vangly.app/join/youth-camp' }
  ]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDownloadQR = (id: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-code-${id}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="share-links-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Registration Gateways</h1>
            <p>Direct links and QR codes to bring new members into your branch.</p>
          </div>
          <Button className="btn-premium" onClick={() => setIsCustomModalOpen(true)} style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            Create Event Link
          </Button>
        </div>
      </div>

      <div className="links-grid">
        {registrationLinks.map((link) => (
          <div key={link.id} className="link-card-premium">
            <div className={`link-card-header ${link.type}`}>
              <link.icon size={32} style={{ marginBottom: '1rem' }} />
              <h3>{link.title}</h3>
              <p>{link.description}</p>
            </div>
            
            <div className="qr-section">
              <div className="qr-container">
                <QRCodeCanvas 
                  id={`qr-${link.id}`}
                  value={link.url} 
                  size={160} 
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico", // Placeholder for brand logo
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
              
              <div className="link-url-display" onClick={() => handleCopy(link.url)}>
                {link.url}
              </div>
            </div>

            <div className="link-card-actions">
              <button className="action-btn-pill copy-btn" onClick={() => handleCopy(link.url)}>
                {copiedLink === link.url ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink === link.url ? 'Copied!' : 'Copy Link'}
              </button>
              <button className="download-btn action-btn-pill" onClick={() => handleDownloadQR(link.id)}>
                <Download size={16} />
                Save QR
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="custom-link-section">
        <div className="custom-link-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Event Links</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Localized links for specific outreach activities.</p>
          </div>
        </div>

        <Card style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '1rem' }}>Event Name</th>
                <th style={{ padding: '1rem' }}>Target Group</th>
                <th style={{ padding: '1rem' }}>Visits</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customLinks.map((link) => (
                <tr key={link.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{link.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'var(--blue-subtle)', color: 'var(--blue)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {link.group}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{link.visits}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(link.url)}>
                        <Copy size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedLink(link);
                        setIsQRModalOpen(true);
                      }}>
                        <QrCode size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" as="a" href={link.url} target="_blank">
                        <ExternalLink size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Modal for Custom Link creation placeholder */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Create Event Link"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input label="Event Name" placeholder="e.g. Easter Special" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Assign to Group</label>
            <select style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}>
              <option>Evangelism Team</option>
              <option>Youth Workers</option>
              <option>Volunteers</option>
            </select>
          </div>
          <Button fullWidth onClick={() => setIsCustomModalOpen(false)}>Generate Gateway</Button>
        </div>
      </Modal>

      {/* QR Code Preview Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="QR Code Gateway"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selectedLink?.name}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{selectedLink?.group}</p>
          </div>

          <div className="qr-container" style={{ padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
            <QRCodeCanvas 
              id={`qr-modal-${selectedLink?.id}`}
              value={selectedLink?.url || ''} 
              size={240} 
              level="H"
              includeMargin={true}
            />
          </div>

          <div style={{ width: '100%', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <code style={{ fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedLink?.url}</code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
            <Button variant="outline" onClick={() => handleCopy(selectedLink?.url)}>
              {copiedLink === selectedLink?.url ? <Check size={18} /> : <Copy size={18} />}
              <span style={{ marginLeft: '0.5rem' }}>{copiedLink === selectedLink?.url ? 'Copied' : 'Copy'}</span>
            </Button>
            <Button onClick={() => handleDownloadQR(`modal-${selectedLink?.id}`)}>
              <Download size={18} />
              <span style={{ marginLeft: '0.5rem' }}>Download</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
