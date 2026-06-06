"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './add-invite.css';

export default function AddInvitePage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset form after a delay, or route back
      setTimeout(() => {
        router.push('/worker/invites');
      }, 1500);
    }, 800);
  };

  return (
    <div className="add-invite-page">
      <div className="page-header">
        <h1>Add New Invitee</h1>
        <p>Record the details of the person you invited today.</p>
      </div>

      <div className="form-container">
        {success ? (
          <Card className="success-card glass">
            <div className="success-icon">🎉</div>
            <h2>Successfully Added!</h2>
            <p>{name} has been added to your evangelism list.</p>
            <p className="redirect-text">Redirecting to your invites...</p>
          </Card>
        ) : (
          <Card className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-body">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. Jane Smith" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                
                <Input 
                  label="Phone Number" 
                  placeholder="e.g. +1 234 567 8900" 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <div className="input-wrapper input-full">
                  <label className="input-label" htmlFor="invite-note">Note (Optional)</label>
                  <textarea 
                    id="invite-note"
                    className="input-field textarea-field"
                    placeholder="Where did you meet them? Any prayer requests?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={!name || !phone || isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Invitee'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
