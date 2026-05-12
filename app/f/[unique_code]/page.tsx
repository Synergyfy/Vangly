"use client";

import React, { useState, use } from 'react';
import { 
  Heart, 
  MapPin, 
  Phone, 
  User, 
  Sparkles, 
  CheckCircle2,
  Users,
  MessageCircle,
  PartyPopper
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import '../first-timer.css';

export default function FirstTimerPage({ params }: { params: Promise<{ unique_code: string }> }) {
  const { unique_code } = use(params);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="first-timer-container">
        <Card className="first-timer-card success-view fade-in">
          <div className="success-icon-wrapper">
            <PartyPopper size={48} />
          </div>
          <h2>Welcome Home!</h2>
          <p>
            It's such a joy to have you with us, <strong>{name.split(' ')[0]}</strong>. 
            Your journey with our family starts today, and we couldn't be more excited.
          </p>
          
          <div className="success-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Heart size={18} style={{ color: 'var(--red)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>We'll be in touch soon!</span>
            </div>
            <p style={{ opacity: 0.7 }}>A host from {workerDisplayName}'s team will reach out to welcome you personally.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="first-timer-container">
      <div className="first-timer-header">
        <div className="organization-logo-wrapper">
          <Sparkles size={40} style={{ color: 'var(--blue)' }} />
        </div>
        <h1>Welcome Home</h1>
        <p>We're so glad you're here with us today.</p>
      </div>

      <Card className="first-timer-card glass">
        <div className="guest-info-pill">
          <Users size={18} style={{ color: 'var(--blue)' }} />
          <span>Joining as a guest of {workerDisplayName}</span>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', right: '1rem', top: '42px', color: 'var(--text-tertiary)', zIndex: 2 }} />
            <Input 
              label="What's your name?" 
              placeholder="e.g. John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', right: '1rem', top: '42px', color: 'var(--text-tertiary)', zIndex: 2 }} />
            <Input 
              label="Phone Number" 
              placeholder="+234..." 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <MessageCircle size={18} style={{ position: 'absolute', right: '1rem', top: '42px', color: 'var(--text-tertiary)', zIndex: 2 }} />
            <Input 
              label="Email (Optional)" 
              placeholder="john@example.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-submit">
            <Button 
              type="submit" 
              fullWidth 
              className="btn-welcome"
              disabled={!name || !phone || isSubmitting}
            >
              {isSubmitting ? 'Preparing your welcome...' : 'Check In'}
            </Button>
          </div>
          
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            By checking in, you agree to receive a warm welcome message from our team.
          </p>
        </form>
      </Card>
    </div>
  );
}
