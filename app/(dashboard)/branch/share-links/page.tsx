"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Copy, 
  Download, 
  Share2, 
  UserPlus, 
  Users, 
  Check, 
  Plus, 
  ExternalLink,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import './share-links.css';

export default function ShareLinksPage() {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  const registrationLinks = [
    {
      id: 'workers',
      title: 'Location Workers',
      description: 'Registration for official location evangelism staff.',
      url: 'https://vangly.app/join/downtown-workers',
      type: 'workers',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 'volunteers',
      title: 'Location Volunteers',
      description: 'Registration for temporary or seasonal volunteers.',
      url: 'https://vangly.app/join/downtown-volunteers',
      type: 'volunteers',
      icon: UserPlus,
      color: '#8b5cf6'
    }
  ];

  const [customLinks] = useState([
    { id: '1', name: 'Saturday Outreach Event', team: 'Evangelism Team', visits: 45, url: 'https://vangly.app/join/sat-outreach' },
    { id: '2', name: 'Youth Camp 2026', team: 'Youth Workers', visits: 128, url: 'https://vangly.app/join/youth-camp' }
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
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill">
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Growth Tools</div>
            <h1>Registration Gateways</h1>
            <p>Direct links and QR codes to bring new members into your location.</p>
          </div>
        </div>
        <div className="header-actions">
           <Button className="btn-premium" size="lg" onClick={() => setIsCustomModalOpen(true)}>
             <Plus size={18} style={{ marginRight: '8px' }} /> Create Event Link
           </Button>
        </div>
      </header>

      <div className="gateways-grid-premium">
        {registrationLinks.map((link) => (
          <Card key={link.id} className="gateway-card-premium">
            <div className="gateway-card-top">
               <div className="gateway-icon-box" style={{ background: `${link.color}15`, color: link.color }}>
                  <link.icon size={24} />
               </div>
               <div className="gateway-meta">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
               </div>
            </div>
            
            <div className="gateway-qr-preview">
               <div className="qr-wrap-premium">
                  <QRCodeCanvas 
                    id={`qr-${link.id}`}
                    value={link.url} 
                    size={160} 
                    level="H"
                    includeMargin={true}
                  />
               </div>
               <div className="link-strip-premium" onClick={() => handleCopy(link.url)}>
                  <span>{link.url}</span>
                  {copiedLink === link.url ? <Check size={14} /> : <Copy size={14} />}
               </div>
            </div>

            <div className="gateway-card-footer">
               <Button variant="outline" fullWidth onClick={() => handleDownloadQR(link.id)}>
                  <Download size={16} style={{ marginRight: '8px' }} /> Save QR
               </Button>
               <Button fullWidth onClick={() => handleCopy(link.url)}>
                  {copiedLink === link.url ? 'Copied!' : 'Share Link'}
               </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="event-links-section-premium">
         <div className="section-header">
            <div>
               <h2>Active Event Gateways</h2>
               <p>Localized links for specific outreach activities.</p>
            </div>
         </div>

         <div className="event-links-list-premium">
            {customLinks.map((link) => (
              <Card key={link.id} className="event-link-item-premium">
                 <div className="eli-content">
                    <div className="eli-main">
                       <h4>{link.name}</h4>
                       <div className="eli-badges">
                          <span className="team-badge-mini">{link.team}</span>
                          <span className="visit-count">{link.visits} Visits</span>
                       </div>
                    </div>
                    <div className="eli-actions">
                       <button className="icon-action-btn" onClick={() => handleCopy(link.url)}>
                          {copiedLink === link.url ? <Check size={18} /> : <Copy size={18} />}
                       </button>
                       <button className="icon-action-btn" onClick={() => {
                          setSelectedLink(link);
                          setIsQRModalOpen(true);
                       }}>
                          <QrCode size={18} />
                       </button>
                       <a href={link.url} target="_blank" rel="noreferrer" className="icon-action-btn">
                          <ExternalLink size={18} />
                       </a>
                    </div>
                 </div>
              </Card>
            ))}
         </div>
      </div>

      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Create Event Gateway"
      >
        <div className="form-stack-premium">
          <Input label="Event Name" placeholder="e.g. Easter Special 2026" />
          <div className="select-group-premium">
            <label>Assign to Outreach Team</label>
            <select>
              <option>Evangelism Team</option>
              <option>Youth Outreach</option>
              <option>Community Care</option>
            </select>
          </div>
          <Button className="btn-premium" fullWidth size="lg">Generate Gateway</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="QR Gateway Preview"
      >
        <div className="qr-preview-stack">
          <div className="qr-preview-header">
            <h3>{selectedLink?.name}</h3>
            <span className="team-badge-mini">{selectedLink?.team}</span>
          </div>

          <div className="qr-modal-canvas-wrap">
            <QRCodeCanvas 
              id={`qr-modal-${selectedLink?.id}`}
              value={selectedLink?.url || ''} 
              size={240} 
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="qr-modal-url-box" onClick={() => handleCopy(selectedLink?.url)}>
            <code>{selectedLink?.url}</code>
            <Copy size={14} />
          </div>

          <div className="qr-modal-actions">
            <Button variant="outline" fullWidth onClick={() => handleCopy(selectedLink?.url)}>
              {copiedLink === selectedLink?.url ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button fullWidth onClick={() => handleDownloadQR(`modal-${selectedLink?.id}`)}>
              Download QR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
