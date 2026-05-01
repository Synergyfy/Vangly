"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  QrCode as QrCodeIcon, 
  Download, 
  Copy, 
  ExternalLink, 
  Building2, 
  Search,
  Check,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import '../hq.css';

export default function BranchQRPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const branches = [
    { id: 'b1', name: 'HQ Branch (Downtown)', location: 'Lagos, Nigeria', url: 'https://grace.vangly.com/f/hq-main' },
    { id: 'b2', name: 'Northside Branch', location: 'Abuja, Nigeria', url: 'https://grace.vangly.com/f/northside' },
    { id: 'b3', name: 'Westend Campus', location: 'Port Harcourt, Nigeria', url: 'https://grace.vangly.com/f/westend' },
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = (id: string, name: string) => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${name.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Branch Access</div>
          <h1>Branch QR Codes</h1>
          <p>Download and share guest check-in QR codes for each branch location.</p>
        </div>
      </div>

      <div className="qr-management-content">
        <Card className="management-filter-card">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search branches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        <div className="qr-grid">
          {branches.map((branch) => (
            <Card key={branch.id} className="branch-qr-card">
              <div className="qr-card-header">
                <div className="branch-info-mini">
                  <Building2 size={16} />
                  <span>{branch.name}</span>
                </div>
                <div className="qr-status-dot">Live</div>
              </div>

              <div className="qr-visual-section">
                <div className="qr-box-outer">
                  <div className="qr-placeholder" style={{ padding: '0', background: 'transparent' }}>
                    <QRCodeSVG
                      id={`qr-${branch.id}`}
                      value={branch.url}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="qr-brand-overlay">V</div>
                  </div>
                </div>
                <p className="qr-hint">Scan to open Guest Form</p>
              </div>

              <div className="qr-card-actions">
                <div className="url-copy-box">
                  <div className="url-text">{branch.url}</div>
                  <button 
                    className={`copy-btn ${copiedId === branch.id ? 'copied' : ''}`}
                    onClick={() => handleCopy(branch.url, branch.id)}
                  >
                    {copiedId === branch.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="qr-action-buttons-row">
                  <Button variant="outline" className="action-btn-iconic" onClick={() => downloadQR(branch.id, branch.name)}>
                    <Download size={16} /> <span>PNG</span>
                  </Button>
                  <Button variant="outline" className="action-btn-iconic">
                    <Share2 size={16} /> <span>Share</span>
                  </Button>
                  <Button variant="primary" className="action-btn-iconic" onClick={() => window.open(branch.url, '_blank')}>
                    <ExternalLink size={16} /> <span>Open</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
