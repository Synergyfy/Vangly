"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Download, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBrand } from '@/contexts/BrandContext';
import './share.css';

export default function ShareInvitePage() {
  const { user } = useAuth();
  const { settings } = useBrand();
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://harvite.app');
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);
  
  const uniqueCode = user?.name?.toLowerCase().replace(/\s+/g, '-') || 'invite';
  const inviteLink = `${baseUrl}/f/${uniqueCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join us at ${settings.organizationName}!`,
          text: `Hi! I'd love to see you at organization. You can check in here:`,
          url: inviteLink,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopy();
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('invite-qr');
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
        downloadLink.download = `${settings.organizationName.toLowerCase().replace(/\s+/g, '-')}-invite-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="share-page">
      <div className="page-header">
        <h1>Share Your Invite Link</h1>
        <p>Give this link to first-timers so they can check in under your name.</p>
      </div>

      <div className="share-content">
        <Card className="qr-card">
          <div className="qr-container">
            <QRCodeSVG 
              id="invite-qr"
              value={inviteLink} 
              size={220}
              level="H"
              includeMargin={false}
              className="qr-code"
              imageSettings={settings.logoUrl ? {
                src: settings.logoUrl,
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              } : undefined}
            />
          </div>
          <div className="qr-actions">
            <Button variant="outline" fullWidth onClick={downloadQR} style={{ gap: '8px' }}>
              <Download size={18} /> Download QR Code
            </Button>
          </div>
        </Card>

        <Card className="link-card">
          <div className="link-info">
            <label className="input-label">Your Personal Invite Link</label>
            <div className="link-display">
              <span className="link-text">{inviteLink}</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="copy-btn">
                {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
              </Button>
            </div>
          </div>

          <div className="action-grid">
            <Button variant="primary" fullWidth onClick={handleShare} style={{ gap: '8px' }}>
              <Share2 size={18} /> Share with Friends
            </Button>
            <Button variant="outline" fullWidth onClick={() => window.open(inviteLink, '_blank')} style={{ gap: '8px' }}>
              <ExternalLink size={18} /> Preview Page
            </Button>
          </div>

          <div className="share-tips">
            <h3>Quick Tips:</h3>
            <ul>
              <li>The QR code includes the <strong>{settings.organizationName}</strong> branding.</li>
              <li>Show the QR code on your phone for a quick scan.</li>
              <li>Post your link on your social media bio.</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
