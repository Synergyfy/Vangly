"use client";

import React, { useState, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import '../first-timer.css';

export default function FirstTimerPage({ params }: { params: Promise<{ unique_code: string }> }) {
  const { unique_code } = use(params);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Format the worker name from the code for the UI
  const workerDisplayName = unique_code
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call to submit first-timer info
    // In a real app, we would send the unique_code (worker ID) to the backend
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1000);
  };

  if (success) {
    return (
      <div className="first-timer-container">
        <Card className="first-timer-card success-view">
          <div className="success-icon">🙌</div>
          <h2>Welcome Home!</h2>
          <p>Thank you for joining us today, {name}. We are so glad you are here.</p>
          <div className="success-footer">
            <p>You were invited by {workerDisplayName}.</p>
            <p>A member of our team will reach out to you shortly.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="first-timer-container">
      <div className="first-timer-header">
        <div className="church-logo-placeholder">⛪</div>
        <h1>Welcome!</h1>
        <p>Please take a moment to let us know you're here.</p>
      </div>

      <Card className="first-timer-card glass">
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Joining as a guest of <strong>{workerDisplayName}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe" 
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

          <div className="form-submit">
            <Button type="submit" fullWidth size="lg" disabled={!name || !phone || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Check In'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
