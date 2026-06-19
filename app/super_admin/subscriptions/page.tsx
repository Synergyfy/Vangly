"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Plus, Check, Trash2, Inbox, Phone, MapPin, Building2, Clock, Eye, FileText } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function PricingConfigurationPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [showToast, setShowToast] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);

  // Sales Requests (mock data)
  const [salesRequests] = useState([
    { id: 1, plan: 'Enterprise Plan', name: 'John Doe', phone: '+2348012345678', address: '15 Marina St, Lagos', orgSize: '201-500', needs: 'We need dedicated support and API access for 300+ members.', orgName: 'Synergyfy Global', date: '2026-06-18', status: 'Pending' },
    { id: 2, plan: 'White-Label Plan', name: 'Jane Smith', phone: '+2349087654321', address: '42 Broad St, Abuja', orgSize: '500+', needs: 'Custom mobile app with our branding, white-label everything.', orgName: 'Faith Assembly Intl', date: '2026-06-17', status: 'Pending' },
  ]);

  // Plans State
  const [plans, setPlans] = useState([
    { id: 1, name: 'Free Plan', color: 'var(--text-tertiary)', price: 0, disabled: true, features: "1 Location\nUnlimited Teams\nUnlimited Forms\nUnlimited Responses" },
    { id: 2, name: 'Growth Plan', color: 'var(--primary)', price: 10000, disabled: false, features: "Up to 5 Locations\nUnlimited Teams\nUnlimited Forms\nData Export" },
    { id: 3, name: 'Network Plan', color: 'var(--purple)', price: 25000, disabled: false, features: "Up to 15 Locations\nCustom Workflows\nAdvanced Analytics\nAPI Access" },
  ]);

  // Addons State
  const [addons, setAddons] = useState([
    { id: 1, name: 'Additional Location', desc: 'Per single additional location.', price: 2000 },
    { id: 2, name: 'SMS Credit Base Rate', desc: 'Default per-message cost.', price: 10 },
    { id: 3, name: 'White Label Setup Fee', desc: 'One-time configuration fee.', price: 50000 },
    { id: 4, name: 'White Label Maintenance', desc: 'Monthly domain hosting cost.', price: 5000 },
  ]);

  // Global Fees State
  const [globalFees, setGlobalFees] = useState([
    { id: 1, name: 'Free Plan Authentication Fee', desc: 'To authenticate your account and verify you as the subscriber, a 1-time authentication fee of ₦1,000 applies.', price: 1000 }
  ]);

  // Thank You Page Content
  const [thankYouTitle, setThankYouTitle] = useState('Thank You!');
  const [thankYouMessage, setThankYouMessage] = useState('Your request has been received successfully. Our sales team will review your requirements and get back to you within 24 hours.');
  const [thankYouNote, setThankYouNote] = useState('In the meantime, you can continue setting up your organization on the Free Plan. Once your request is approved, we\'ll seamlessly upgrade your account.');

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreatePlan = () => {
    const newId = plans.length > 0 ? Math.max(...plans.map(p => p.id)) + 1 : 1;
    setPlans([...plans, {
      id: newId,
      name: 'New Custom Plan',
      color: 'var(--green)',
      price: 0,
      disabled: false,
      features: "Add features here..."
    }]);
  };

  const handleDeletePlan = (id: number) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const handleCreateAddon = () => {
    const newId = addons.length > 0 ? Math.max(...addons.map(a => a.id)) + 1 : 1;
    setAddons([...addons, {
      id: newId,
      name: 'New Add-on',
      desc: 'Description...',
      price: 0
    }]);
  };

  const handleDeleteAddon = (id: number) => {
    setAddons(addons.filter(a => a.id !== id));
  };

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--green)', padding: '16px 24px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000,
          boxShadow: 'var(--shadow-lg)', animation: 'modalSlideUp 0.3s var(--ease)'
        }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={14} color="var(--green)" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Configuration Saved Successfully</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={28} color="var(--primary)" /> 
            Pricing Configuration
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Adjust subscription plan costs, add-on rates, and feature bullet points.</p>
        </div>
        {activeTab === 'plans' ? (
          <Button className="btn-primary" size="lg" onClick={handleCreatePlan}><Plus size={18} style={{ marginRight: '8px' }}/> Create New Plan</Button>
        ) : activeTab === 'addons' ? (
          <Button className="btn-primary" size="lg" onClick={handleCreateAddon}><Plus size={18} style={{ marginRight: '8px' }}/> Create New Add-on</Button>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('plans')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'plans' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'plans' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Subscription Plans
        </button>
        <button 
          onClick={() => setActiveTab('addons')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'addons' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'addons' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Add-ons & Extras
        </button>
        <button 
          onClick={() => setActiveTab('fees')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'fees' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'fees' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Global Fees
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'requests' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Inbox size={16} /> Sales Requests
          {salesRequests.filter(r => r.status === 'Pending').length > 0 && (
            <span style={{ backgroundColor: 'var(--red)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', lineHeight: 1 }}>
              {salesRequests.filter(r => r.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => (
            <Card key={plan.id} className="glass-morphism" style={{ padding: '24px', borderTop: `4px solid ${plan.color}`, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  defaultValue={plan.name}
                  style={{ fontSize: '18px', fontWeight: 700, color: plan.color, border: 'none', background: 'transparent', outline: 'none', width: '70%' }}
                />
                {!plan.disabled && (
                  <button onClick={() => handleDeletePlan(plan.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Monthly Price (₦)</label>
                <input type="number" defaultValue={plan.price} disabled={plan.disabled} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: plan.disabled ? 'var(--bg-secondary)' : 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Features (One per line)</label>
                <textarea rows={6} defaultValue={plan.features} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical' }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'addons' && (
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card className="glass-morphism" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Add-On Pricing Rates</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {addons.map((addon) => (
                <div key={addon.id} style={{ position: 'relative', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <input type="text" defaultValue={addon.name} style={{ fontSize: '13px', fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', width: '80%' }} />
                    <button onClick={() => handleDeleteAddon(addon.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>₦</span>
                    <input type="number" defaultValue={addon.price} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }} />
                  </div>
                  <input type="text" defaultValue={addon.desc} style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px', border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button className="btn-primary" size="lg" onClick={handleSave}><Save size={18} style={{ marginRight: '8px' }}/> Save Pricing Configuration</Button>
      </div>

      {/* Global Fees Tab */}
      {activeTab === 'fees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {globalFees.map(fee => (
            <Card key={fee.id} style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Fee Name</label>
                    <input 
                      type="text" 
                      value={fee.name} 
                      onChange={(e) => setGlobalFees(globalFees.map(f => f.id === fee.id ? { ...f, name: e.target.value } : f))}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: 'var(--bg-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Price (₦)</label>
                    <input 
                      type="number" 
                      value={fee.price} 
                      onChange={(e) => setGlobalFees(globalFees.map(f => f.id === fee.id ? { ...f, price: Number(e.target.value) } : f))}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: 'var(--bg-primary)' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Description</label>
                  <input 
                    type="text" 
                    value={fee.desc} 
                    onChange={(e) => setGlobalFees(globalFees.map(f => f.id === fee.id ? { ...f, desc: e.target.value } : f))}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: 'var(--bg-primary)' }}
                  />
                </div>
              </div>
            </Card>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button className="btn-primary" size="lg" onClick={handleSave}><Save size={18} style={{ marginRight: '8px' }}/> Save Configurations</Button>
          </div>

          {/* Thank You Page Editor */}
          <Card style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #f093fb, #f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Thank You Page Content</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>Shown after an Enterprise / White-Label request is submitted.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Title</label>
                <input 
                  type="text" 
                  value={thankYouTitle}
                  onChange={(e) => setThankYouTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: 'var(--bg-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Main Message</label>
                <textarea 
                  rows={3}
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: 'var(--bg-primary)', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Additional Note</label>
                <textarea 
                  rows={2}
                  value={thankYouNote}
                  onChange={(e) => setThankYouNote(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: 'var(--bg-primary)', resize: 'vertical' }}
                />
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.5px', marginBottom: '12px' }}>Live Preview</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{thankYouTitle}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>{thankYouMessage}</p>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{thankYouNote}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button className="btn-primary" size="lg" onClick={handleSave}><Save size={18} style={{ marginRight: '8px' }}/> Save Content</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sales Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {salesRequests.length === 0 ? (
            <Card style={{ padding: '48px', textAlign: 'center' }}>
              <Inbox size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No Sales Requests Yet</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>When organizations request Enterprise or White-Label plans, they will appear here.</p>
            </Card>
          ) : (
            salesRequests.map(req => (
              <Card key={req.id} style={{ padding: '0', overflow: 'hidden', border: req.status === 'Pending' ? '1px solid var(--orange)' : '1px solid var(--border)' }}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: selectedRequest === req.id ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: req.plan.includes('Enterprise') ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #f093fb, #f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{req.orgName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {req.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: req.plan.includes('Enterprise') ? 'rgba(102, 126, 234, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                      color: req.plan.includes('Enterprise') ? '#667eea' : '#f5576c'
                    }}>{req.plan.replace(' Plan', '')}</span>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: req.status === 'Pending' ? 'var(--orange-light)' : 'var(--green-light)',
                      color: req.status === 'Pending' ? 'var(--orange)' : 'var(--green)'
                    }}>{req.status}</span>
                    <button onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '13px' }}>
                      <Eye size={16} /> {selectedRequest === req.id ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>
                {selectedRequest === req.id && (
                  <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', backgroundColor: 'var(--bg-secondary)' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>Contact Name</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{req.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>Phone</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="var(--primary)" /> {req.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>Address</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--primary)" /> {req.address}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>Org Size</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{req.orgSize} members</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>Requirements</div>
                      <div style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>{req.needs}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                      <Button variant="outline" size="sm">Mark Contacted</Button>
                      <Button className="btn-primary" size="sm"><Phone size={14} style={{ marginRight: '6px' }} /> Call Now</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

    </div>
  );
}
