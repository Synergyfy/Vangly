"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Building2, 
  Plus, 
  MapPin, 
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import '../management.css';

export default function NewBranchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => router.push('/hq/manage-church'), 1500);
    }, 1200);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-header">
          <ArrowLeft size={18} /> Back to Network
        </Button>
        <h1 style={{ marginTop: '12px' }}>Create New Branch</h1>
        <p>Establish a new physical location for your church community.</p>
      </div>

      <div className="form-container-centered">
        {success ? (
          <Card className="success-full-card">
            <div className="success-icon-large">🎉</div>
            <h2>Branch Established!</h2>
            <p>You have successfully added a new location to your network.</p>
            <p className="redirect-hint">Taking you back to your network overview...</p>
          </Card>
        ) : (
          <Card className="management-card-large">
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-section">
                <div className="section-header">
                  <Building2 size={20} className="text-primary" />
                  <h3>Basic Information</h3>
                </div>
                <div className="form-grid">
                  <Input label="Branch Name" placeholder="e.g. Southpark Satellite" required />
                  <Input label="Location / City" placeholder="e.g. Lagos, Nigeria" icon={<MapPin size={16} />} required />
                </div>
                <div className="input-wrapper input-full" style={{ marginTop: '20px' }}>
                  <label className="input-label">Short Description</label>
                  <textarea 
                    className="input-field textarea-field" 
                    rows={3} 
                    placeholder="Briefly describe this location's community or focus..."
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <ImageIcon size={20} className="text-primary" />
                  <h3>Branch Assets (Optional)</h3>
                </div>
                <div className="upload-placeholder-zone">
                  <Upload size={24} />
                  <p>Upload a photo of the church building</p>
                  <Button type="button" variant="ghost" size="sm">Choose Image</Button>
                </div>
              </div>

              <div className="form-actions-footer">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} style={{ minWidth: '180px' }}>
                  {isSubmitting ? 'Establishing...' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
