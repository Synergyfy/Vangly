"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Settings, 
  Trash2, 
  Eye, 
  Users, 
  Lock,
  ArrowLeft,
  Layout,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  AtSign,
  Smartphone,
  CheckSquare,
  Circle,
  List,
  CheckCircle,
  Calendar,
  Clock,
  FileUp,
  Image as ImageIcon,
  PenTool,
  Star,
  Link as LinkIcon,
  ToggleLeft,
  MapPin,
  Minus,
  Layers,
  Trash,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Share,
  LogIn,
  Check as CheckIcon,
  Smartphone as PhoneIcon,
  Monitor,
  QrCode,
  Copy,
  ExternalLink,
  Info,
  Filter,
  BarChart3,
  Building2,
  Users2
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import '../main.css';
import '../management.css';

export default function FormsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock data for assignment
  const mockLocations = [
    { id: 'loc1', name: 'HQ Location' },
    { id: 'loc2', name: 'Northside' },
    { id: 'loc3', name: 'Westend Center' },
  ];

  const mockTeams = [
    { id: 'team1', name: 'Media Team' },
    { id: 'team2', name: 'Hospitality' },
    { id: 'team3', name: 'Security' },
    { id: 'team4', name: 'Logistics' },
  ];

  // Mock data for forms
  const [forms, setForms] = useState<any[]>([
    { id: '1', title: 'Member Registration', type: 'Outreach', status: 'Active', responses: 124, lastModified: '2 days ago', access: 'Public', fields: [], distribution: { memberAccess: { mode: 'all' }, publicAccess: { mode: 'public' }, locations: ['loc1'], teams: ['team1', 'team2'] } },
    { id: '2', title: 'Weekly Feedback', type: 'Internal', status: 'Active', responses: 45, lastModified: '5 days ago', access: 'Members Only', fields: [], distribution: { memberAccess: { mode: 'all' }, publicAccess: { mode: 'registered' }, locations: ['loc2'], teams: ['team3'] } },
    { id: '3', title: 'Event Signup', type: 'Outreach', status: 'Draft', responses: 0, lastModified: '1 week ago', access: 'Public', fields: [], distribution: { memberAccess: { mode: 'all' }, publicAccess: { mode: 'public' }, locations: [], teams: [] } },
  ]);

  // Form Builder State
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop' | null>(null);
  const [formConfig, setFormConfig] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [formFields, setFormFields] = useState<any[]>([]);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [isPublishSuccessOpen, setIsPublishSuccessOpen] = useState(false);
  const [publishedFormUrl, setPublishedFormUrl] = useState('');

  const [formDistribution, setFormDistribution] = useState({
    memberAccess: { mode: 'all' as 'all' | 'selected', userIds: [] as string[] },
    publicAccess: { mode: 'public' as 'public' | 'registered' },
    locations: [] as string[],
    teams: [] as string[]
  });

  const fieldTypes = [
    { id: 'text', label: 'Short Text', icon: Type, cat: 'Standard', desc: 'Single line of text.' },
    { id: 'longtext', label: 'Long Text', icon: AlignLeft, cat: 'Standard', desc: 'Multiple lines for longer answers.' },
    { id: 'number', label: 'Number', icon: Hash, cat: 'Standard', desc: 'Numeric input only.' },
    { id: 'email', label: 'Email', icon: AtSign, cat: 'Standard', desc: 'Email address validation.' },
    { id: 'phone', label: 'Phone', icon: Smartphone, cat: 'Standard', desc: 'International phone format.' },
    { id: 'url', label: 'Website URL', icon: LinkIcon, cat: 'Standard', desc: 'Valid URL address.' },
    { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, cat: 'Choice', desc: 'Select multiple options.' },
    { id: 'radio', label: 'Radio Choice', icon: Circle, cat: 'Choice', desc: 'Select exactly one option.' },
    { id: 'dropdown', label: 'Dropdown', icon: List, cat: 'Choice', desc: 'Choose from a compact list.' },
    { id: 'multiselect', label: 'Multi-Select', icon: List, cat: 'Choice', desc: 'Select multiple items from a list.' },
    { id: 'yesno', label: 'Yes/No', icon: ToggleLeft, cat: 'Choice', desc: 'Simple boolean selection.' },
    { id: 'date', label: 'Date', icon: Calendar, cat: 'Date & Time', desc: 'Pick a specific calendar date.' },
    { id: 'time', label: 'Time', icon: Clock, cat: 'Date & Time', desc: 'Select a specific time.' },
    { id: 'monthday', label: 'Month & Day', icon: Calendar, cat: 'Date & Time', desc: 'Recurring yearly date.' },
    { id: 'fileupload', label: 'File Upload', icon: FileUp, cat: 'Media', desc: 'Documents or generic files.' },
    { id: 'image', label: 'Image', icon: ImageIcon, cat: 'Media', desc: 'Photos or visual assets.' },
    { id: 'signature', label: 'Signature', icon: PenTool, cat: 'Advanced', desc: 'Digital signature capture.' },
    { id: 'rating', label: 'Rating', icon: Star, cat: 'Advanced', desc: 'Star or scale-based feedback.' },
    { id: 'address', label: 'Address', icon: MapPin, cat: 'Advanced', desc: 'Location or postal details.' },
    { id: 'paragraph', label: 'Paragraph Text', icon: Type, cat: 'Layout', desc: 'Display-only informational text.' },
    { id: 'divider', label: 'Divider', icon: Minus, cat: 'Layout', desc: 'Visual separation between fields.' },
  ];

  const addField = (type: string) => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: '',
      description: '',
      required: false,
      showDescription: false,
      options: ['Option 1', 'Option 2'],
    };
    setFormFields([...formFields, newField]);
    setIsFieldSelectorOpen(false);
  };

  const handleCreateNew = () => {
    setEditingFormId(null);
    setFormConfig({ title: '', description: '', status: 'draft' });
    setFormFields([]);
    setFormDistribution({
        memberAccess: { mode: 'all', userIds: [] },
        publicAccess: { mode: 'public' },
        locations: [],
        teams: []
    });
    setIsFormBuilderOpen(true);
  };

  const handleEditClick = (form: any) => {
    setEditingFormId(form.id);
    setFormConfig({ title: form.title, description: '', status: form.status.toLowerCase() as any });
    setFormFields(form.fields || []);
    setFormDistribution(form.distribution || {
        memberAccess: { mode: 'all', userIds: [] },
        publicAccess: { mode: 'public' },
        locations: [],
        teams: []
    });
    setIsFormBuilderOpen(true);
  };

  const handlePublishForm = (isDraft = false) => {
    const finalUrl = `https://harvite.app/f/${Math.random().toString(36).substr(2, 6)}`;
    if (editingFormId) {
      setForms(forms.map(f => f.id === editingFormId ? { 
          ...f, 
          title: formConfig.title || 'Untitled Form', 
          status: isDraft ? 'Draft' : 'Active', 
          fields: formFields,
          distribution: formDistribution,
          lastModified: 'Just now'
        } : f));
    } else {
      const newForm = {
        id: Math.random().toString(36).substr(2, 9),
        title: formConfig.title || 'Untitled Form',
        type: 'Outreach',
        status: isDraft ? 'Draft' : 'Active',
        responses: 0,
        lastModified: 'Just now',
        access: formDistribution.publicAccess.mode === 'public' ? 'Public' : 'Members Only',
        fields: formFields,
        distribution: formDistribution
      };
      setForms([newForm, ...forms]);
    }
    setPublishedFormUrl(finalUrl);
    setIsDistributionModalOpen(false);
    setIsFormBuilderOpen(false);
    if (!isDraft) {
      setIsPublishSuccessOpen(true);
    }
  };

  const handleSaveDraft = () => {
    handlePublishForm(true);
  };


  const toggleLocation = (id: string) => {
      setFormDistribution(prev => ({
          ...prev,
          locations: prev.locations.includes(id) 
            ? prev.locations.filter(l => l !== id)
            : [...prev.locations, id]
      }));
  };

  const toggleTeam = (id: string) => {
      setFormDistribution(prev => ({
          ...prev,
          teams: prev.teams.includes(id) 
            ? prev.teams.filter(t => t !== id)
            : [...prev.teams, id]
      }));
  };

  return (
    <div className="hq-dashboard-premium hub-v2-container animate-premium">
      <div className="page-header flex-between responsive-header">
        <div className="header-main">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Data Capture Hub</div>
          <h1>Forms & Surveys</h1>
          <p>Collect high-impact data with custom outreach and feedback forms.</p>
        </div>
        <Button className="btn-premium" onClick={handleCreateNew}>
          <Plus size={18} /> <span>Create New Form</span>
        </Button>
      </div>

      <main className="dashboard-main-content">
        <Card className="filter-card-premium glass-morphism responsive-card">
            <div className="filter-grid-v2">
                <div className="premium-search-bar" style={{ flex: 1 }}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search forms by name or type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions-v2">
                    <Button 
                        variant={showFilters ? "primary" : "outline"} 
                        className="filter-btn-v2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} /> <span>Filters</span>
                    </Button>
                    <Button 
                        variant={showStats ? "primary" : "outline"} 
                        className="filter-btn-v2"
                        onClick={() => setShowStats(!showStats)}
                    >
                        <BarChart3 size={16} /> <span>Stats</span>
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="filter-expand-panel fade-in" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block' }}>FORM TYPE</label>
                            <select className="premium-select-box" style={{ width: '100%', border: '1px solid var(--border-light)' }}>
                                <option>All Types</option>
                                <option>Outreach</option>
                                <option>Internal</option>
                                <option>Feedback</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'block' }}>STATUS</label>
                            <select className="premium-select-box" style={{ width: '100%', border: '1px solid var(--border-light)' }}>
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Draft</option>
                                <option>Archived</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {showStats && (
                <div className="stats-expand-panel fade-in" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {[
                            { label: 'Total Forms', val: forms.length, color: 'blue' },
                            { label: 'Total Responses', val: '1,284', color: 'green' },
                            { label: 'Avg. Completion', val: '84%', color: 'orange' },
                            { label: 'Active Shares', val: '12', color: 'purple' }
                        ].map((s, i) => (
                            <div key={i} className="stat-mini-card">
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>{s.label}</span>
                                <h4 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{s.val}</h4>
                                <div className={`stat-trend up`}>+12% this week</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>

        <div className="forms-display-grid-premium">
            {forms.filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase())).map((form) => (
            <Card key={form.id} className="form-manage-card-v2 animate-slide-up">
                <div className="form-card-main-info">
                <div className="form-icon-v2">
                    <FileText size={24} />
                </div>
                <div className="form-text-details">
                    <div className="form-top-row">
                    <span className="form-type-pill">{form.type}</span>
                    <span className={`form-status-dot-pill ${form.status.toLowerCase()}`}>
                        <div className={`status-dot ${form.status.toLowerCase()}`} /> {form.status}
                    </span>
                    </div>
                    <h3>{form.title}</h3>
                    <div className="form-meta-grid">
                    <div className="meta-item">
                        <Users size={14} /> <span>{form.responses} Submissions</span>
                    </div>
                    <div className="meta-item">
                        <Lock size={14} /> <span>{form.access}</span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="form-card-v2-actions">
                <Button variant="outline" size="sm" fullWidth onClick={() => handleEditClick(form)}>
                    <Settings size={16} /> Manage
                </Button>
                <Button variant="outline" size="sm" fullWidth onClick={() => {
                    setEditingFormId(form.id);
                    setFormConfig({ title: form.title, description: '', status: 'published' });
                    setFormFields(form.fields);
                    setPreviewMode('mobile');
                    setIsFormBuilderOpen(true);
                }}>
                    <Eye size={16} /> Preview
                </Button>
                <button className="delete-btn-v2">
                    <Trash2 size={16} />
                </button>
                </div>
            </Card>
            ))}
        </div>
      </main>

      {/* OVERHAULED FORM BUILDER MODAL */}
      <Modal
        isOpen={isFormBuilderOpen}
        onClose={() => {
            setIsFormBuilderOpen(false);
            setPreviewMode(null);
        }}
        title={previewMode ? `Preview: ${formConfig.title || 'Untitled Form'}` : `Form Builder`}
        size="full"
      >
        <div className="form-builder-container-premium">
          {!previewMode ? (
            <div className="builder-interface fade-in">
              {/* Builder Header */}
              <div className="builder-header-sticky">
                <div className="header-main-info">
                  <div className="title-area">
                    <input 
                      type="text" 
                      className="form-title-input-ghost"
                      placeholder="Untitled Form"
                      value={formConfig.title}
                      onChange={(e) => setFormConfig({...formConfig, title: e.target.value})}
                    />
                    <div className="save-status">
                      <div className="status-dot"></div>
                      <span>{formConfig.status === 'draft' ? 'Draft' : 'Published'} • Auto-saved</span>
                    </div>
                  </div>
                  <div className="header-actions">
                    <Button variant="outline" size="sm" onClick={() => handleSaveDraft()}>
                       Save
                     </Button>
                    <Button 
                      className="btn-premium" 
                      size="sm" 
                      onClick={() => setIsDistributionModalOpen(true)}
                      style={{ opacity: formFields.length === 0 ? 0.5 : 1, pointerEvents: formFields.length === 0 ? 'none' : 'auto' }}
                    >
                      Publish
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewMode('mobile')} title="Preview Form">
                      <Eye size={18} />
                    </Button>
                  </div>
                </div>
                <div className="description-area">
                  <textarea 
                    className="form-desc-input-ghost"
                    placeholder="Add an optional description for this form..."
                    value={formConfig.description}
                    onChange={(e) => setFormConfig({...formConfig, description: e.target.value})}
                  />
                  {formFields.length > 0 && (
                    <div style={{ display: 'flex', marginTop: '8px' }}>
                      <Button 
                        className="btn-premium btn-add-field-premium" 
                        onClick={() => setIsFieldSelectorOpen(true)}
                        style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
                      >
                        <Plus size={16} /> Add Field
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Builder Content */}
              <div className="builder-body-scrollable">
                <div className="fields-stack">
                  {formFields.length === 0 ? (
                    <div className="empty-builder-state fade-in">
                      <div className="empty-icon" style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--blue)' }}>
                        <Layout size={40} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Your form is empty</h3>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', maxWidth: '280px', margin: '0 auto 16px' }}>
                        Start by adding your first field below.
                      </p>
                      <Button 
                        className="btn-premium btn-add-field-premium first-field" 
                        onClick={() => setIsFieldSelectorOpen(true)}
                        style={{ gap: '8px', padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}
                      >
                        <Plus size={18} /> Add Your First Field
                      </Button>
                    </div>
                  ) : (
                    formFields.map((field, idx) => (
                      <div key={field.id} className="field-card-premium animate-slide-up">
                        <div className="field-card-drag-handle"><GripVertical size={16} /></div>
                        
                        <div className="field-card-header">
                          <div className="field-type-badge">
                            {fieldTypes.find(t => t.id === field.type)?.icon && React.createElement(fieldTypes.find(t => t.id === field.type)!.icon, { size: 14 })}
                            <span>{fieldTypes.find(t => t.id === field.type)?.label}</span>
                          </div>
                          <div className="field-actions-top">
                            <Button variant="ghost" size="sm" onClick={() => {
                              const newField = {...field, id: Math.random().toString(36).substr(2, 9)};
                              setFormFields([...formFields.slice(0, idx + 1), newField, ...formFields.slice(idx + 1)]);
                            }} title="Duplicate Field">
                              <Layers size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red" onClick={() => setFormFields(formFields.filter(f => f.id !== field.id))} title="Delete Field">
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="field-card-main">
                          <Input 
                            placeholder="Question Title"
                            value={field.title}
                            onChange={(e) => {
                              const newFields = [...formFields];
                              newFields[idx].title = e.target.value;
                              setFormFields(newFields);
                            }}
                            className="field-title-input"
                          />
                          
                          {field.showDescription && (
                            <textarea 
                              className="field-desc-input animate-slide-down"
                              placeholder="Add instructions or helper text..."
                              value={field.description}
                              onChange={(e) => {
                                const newFields = [...formFields];
                                newFields[idx].description = e.target.value;
                                setFormFields(newFields);
                              }}
                            />
                          )}

                          {/* Dynamic Content based on type */}
                          {['radio', 'checkbox', 'dropdown', 'multiselect', 'yesno'].includes(field.type) && (
                            <div className="options-editor">
                              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Configure Options</span>
                                <span>{field.options.length} {field.options.length === 1 ? 'Option' : 'Options'}</span>
                              </div>
                              {field.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="option-row animate-slide-right">
                                  <div className="option-marker">
                                    {['radio', 'yesno'].includes(field.type) ? <Circle size={14} /> : <CheckSquare size={14} />}
                                  </div>
                                  <input 
                                    type="text" 
                                    className="option-input-premium"
                                    value={opt}
                                    placeholder={`Option ${oIdx + 1}`}
                                    onChange={(e) => {
                                      const newFields = [...formFields];
                                      newFields[idx].options[oIdx] = e.target.value;
                                      setFormFields(newFields);
                                    }}
                                  />
                                  <button 
                                    className="option-delete-btn"
                                    onClick={() => {
                                      const newFields = [...formFields];
                                      newFields[idx].options = newFields[idx].options.filter((_: any, i: number) => i !== oIdx);
                                      setFormFields(newFields);
                                    }}
                                  >
                                    <Trash size={14} />
                                  </button>
                                </div>
                              ))}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  const newFields = [...formFields];
                                  newFields[idx].options = [...newFields[idx].options, `Option ${newFields[idx].options.length + 1}`];
                                  setFormFields(newFields);
                                }}
                                style={{ marginTop: '8px', fontSize: '12px', gap: '6px' }}
                              >
                                <Plus size={14} /> Add Option
                              </Button>

                              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                 <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>LIVE PREVIEW</span>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {field.options.map((o: string, i: number) => (
                                      <div key={i} style={{ padding: '6px 12px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                         {field.type === 'radio' || field.type === 'yesno' ? <Circle size={10} color="var(--border)" /> : <CheckSquare size={10} color="var(--border)" />}
                                         {o || `Option ${i+1}`}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            </div>
                          )}

                          {field.type === 'rating' && (
                            <div className="rating-preview-box">
                               <div style={{ display: 'flex', gap: '8px' }}>
                                 {[1,2,3,4,5].map(n => <Star key={n} size={24} style={{ color: 'var(--border-light)' }} />)}
                               </div>
                            </div>
                          )}

                          {field.type === 'divider' && <div className="divider-preview" style={{ borderTop: '2px solid var(--border-light)', margin: '16px 0' }} />}
                        </div>

                        <div className="field-card-footer">
                           <div className="footer-left">
                              <label className="toggle-label-premium">
                                 <input 
                                   type="checkbox" 
                                   checked={field.showDescription}
                                   onChange={(e) => {
                                     const newFields = [...formFields];
                                     newFields[idx].showDescription = e.target.checked;
                                     setFormFields(newFields);
                                   }}
                                 />
                                 <span>Description</span>
                              </label>
                              <label className="toggle-label-premium">
                                 <input 
                                   type="checkbox" 
                                   checked={field.required}
                                   onChange={(e) => {
                                     const newFields = [...formFields];
                                     newFields[idx].required = e.target.checked;
                                     setFormFields(newFields);
                                   }}
                                 />
                                 <span>Required</span>
                              </label>
                           </div>
                           <div className="footer-right">
                              <Button variant="ghost" size="sm" title="Advanced Settings">
                                <Filter size={16} />
                              </Button>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Preview Mode - HIGH QUALITY FRAME */
            <div className={`form-preview-overlay fade-in mode-${previewMode}`}>
               <div className="preview-toolbar">
                  <div className="preview-devices">
                    <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}><PhoneIcon size={18} /></button>
                    <button className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}><Monitor size={18} /></button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewMode(null)}>Exit Preview</Button>
               </div>
               <div className="preview-frame-container">
                  <div className="preview-frame">
                    <div className="preview-content-scroller">
                      <div className="preview-form-header">
                        <h1>{formConfig.title || 'Untitled Form'}</h1>
                        <p>{formConfig.description}</p>
                      </div>
                      <div className="preview-fields">
                        {formFields.map(f => (
                          <div key={f.id} className="preview-field-item">
                            <label>{f.title} {f.required && <span className="text-red">*</span>}</label>
                            {f.showDescription && <p className="field-desc">{f.description}</p>}
                            <div className="preview-input-container">
                               {['text', 'email', 'phone', 'url', 'number'].includes(f.type) && <Input placeholder={`Enter your ${f.type}...`} readOnly />}
                               {f.type === 'longtext' && <textarea placeholder="Describe in detail..." readOnly className="preview-textarea" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-light)', minHeight: '100px', padding: '12px', fontSize: '14px', outline: 'none' }} />}
                               {['radio', 'checkbox', 'yesno'].includes(f.type) && (
                                 <div className="preview-options">
                                   {f.options.map((o: string) => (
                                     <label key={o} className="preview-option-pill" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', marginBottom: '10px', padding: '10px', background: 'var(--bg)', borderRadius: '10px', cursor: 'pointer' }}>
                                       <input type={f.type === 'yesno' ? 'radio' : f.type} disabled style={{ accentColor: 'var(--blue)' }} /> {o}
                                     </label>
                                   ))}
                                 </div>
                               )}
                               {f.type === 'dropdown' && (
                                 <select disabled className="preview-select" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg)', fontSize: '14px' }}>
                                   <option>Select an option...</option>
                                   {f.options.map((o: string) => <option key={o}>{o}</option>)}
                                 </select>
                               )}
                               {f.type === 'multiselect' && (
                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                                   <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Select multiple...</span>
                                 </div>
                               )}
                               {['date', 'time', 'monthday'].includes(f.type) && (
                                 <div className="preview-date-time-box" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg)', color: 'var(--text-tertiary)' }}>
                                   <Calendar size={18} /> <span>Pick a {f.type === 'monthday' ? 'date' : f.type}...</span>
                                 </div>
                               )}
                               {['fileupload', 'image'].includes(f.type) && (
                                 <div className="preview-upload-box" style={{ padding: '32px', border: '2px dashed var(--border-light)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    <FileUp size={24} style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontSize: '13px' }}>Click or drag {f.type === 'image' ? 'image' : 'file'} to upload</p>
                                 </div>
                               )}
                               {f.type === 'signature' && (
                                 <div className="preview-signature-pad" style={{ width: '100%', height: '120px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                   Draw your signature here...
                                 </div>
                               )}
                               {f.type === 'address' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                   <Input placeholder="Street Address" readOnly />
                                   <div style={{ display: 'flex', gap: '8px' }}>
                                      <Input placeholder="City" readOnly />
                                      <Input placeholder="Zip Code" readOnly />
                                   </div>
                                 </div>
                               )}
                               {f.type === 'paragraph' && (
                                 <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{f.description || 'Paragraph informational text will appear here.'}</p>
                               )}
                               {f.type === 'rating' && (
                                 <div className="preview-rating" style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '10px' }}>
                                   {[1,2,3,4,5].map(n => <Star key={n} size={32} style={{ color: 'var(--border-light)', cursor: 'pointer' }} />)}
                                 </div>
                               )}
                               {f.type === 'divider' && <hr className="preview-divider" style={{ border: 'none', borderTop: '2px solid var(--bg)', margin: '12px 0' }} />}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="preview-footer" style={{ marginTop: '40px' }}>
                        <Button className="btn-premium" fullWidth>Submit Form</Button>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DISTRIBUTION MODAL (Settings) */}
      <Modal
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        title="Form Settings & Distribution"
      >
        <div className="distribution-modal-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
          
          <section className="dist-section">
            <div className="dist-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Building2 size={18} className="text-blue" />
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Assign to Locations</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Which locations should have this form available?</p>
            <div className="selector-pill-grid">
                {mockLocations.map(loc => (
                    <div 
                        key={loc.id} 
                        className={`selector-pill ${formDistribution.locations.includes(loc.id) ? 'active' : ''}`}
                        onClick={() => toggleLocation(loc.id)}
                    >
                        <Building2 size={14} />
                        <span>{loc.name}</span>
                    </div>
                ))}
            </div>
          </section>

          <section className="dist-section">
            <div className="dist-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Users2 size={18} className="text-purple" />
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Assign to Teams</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Select specific teams that need to use this form.</p>
            <div className="selector-pill-grid">
                {mockTeams.map(team => (
                    <div 
                        key={team.id} 
                        className={`selector-pill ${formDistribution.teams.includes(team.id) ? 'active' : ''}`}
                        onClick={() => toggleTeam(team.id)}
                    >
                        <Users2 size={14} />
                        <span>{team.name}</span>
                    </div>
                ))}
            </div>
          </section>

          <section className="dist-section">
            <div className="dist-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck size={18} className="text-green" />
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Public Privacy</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Control who can access this form via public link or QR code.</p>
            <div className="privacy-options-stack">
                <div 
                    className={`privacy-option ${formDistribution.publicAccess.mode === 'public' ? 'active' : ''}`}
                    onClick={() => setFormDistribution({...formDistribution, publicAccess: { mode: 'public' }})}
                >
                    <Share size={20} />
                    <div className="opt-text">
                        <strong>General Public (Open)</strong>
                        <span>Anyone with the link can fill this form.</span>
                    </div>
                </div>
                <div 
                    className={`privacy-option ${formDistribution.publicAccess.mode === 'registered' ? 'active' : ''}`}
                    onClick={() => setFormDistribution({...formDistribution, publicAccess: { mode: 'registered' }})}
                >
                    <LogIn size={20} />
                    <div className="opt-text">
                        <strong>Registered Members Only</strong>
                        <span>Users must be logged into their Harvite account.</span>
                    </div>
                </div>
            </div>
          </section>

          <div className="modal-footer-actions" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <Button variant="ghost" fullWidth onClick={() => setIsDistributionModalOpen(false)}>Cancel</Button>
            <Button className="btn-premium" fullWidth onClick={() => handlePublishForm(false)}>
              {editingFormId ? 'Save & Update' : 'Publish & Go Live'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* FIELD SELECTOR MODAL */}
      <Modal
        isOpen={isFieldSelectorOpen}
        onClose={() => setIsFieldSelectorOpen(false)}
        title="Add New Field"
        size="xl"
      >
        <div className="field-selector-container fade-in">
           <div className="selector-search-box">
             <Search size={18} />
             <input type="text" placeholder="Search field types..." />
           </div>
           
           <div className="selector-categories">
             {['Standard', 'Choice', 'Date & Time', 'Media', 'Advanced', 'Layout'].map(cat => (
               <div key={cat} className="selector-cat-group">
                 <h4 className="cat-title">{cat}</h4>
                 <div className="selector-grid">
                   {fieldTypes.filter(t => t.cat === cat).map(type => (
                     <button key={type.id} className="field-type-item" onClick={() => addField(type.id)}>
                       <div className="item-icon-box">{React.createElement(type.icon, { size: 20 })}</div>
                       <div className="item-text">
                         <strong>{type.label}</strong>
                         <span>{type.desc}</span>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </Modal>

      {/* PUBLISH SUCCESS MODAL (With QR/Link) */}
      <Modal
        isOpen={isPublishSuccessOpen}
        onClose={() => setIsPublishSuccessOpen(false)}
        title="Form Published Successfully!"
      >
        <div className="publish-success-content fade-in">
          <div className="success-visual">
             <div className="success-check-circle">
                <CheckIcon size={48} />
             </div>
             <h3>Your form is live!</h3>
             <p>The form has been successfully created and is now accepting submissions.</p>
          </div>

          <div className="distribution-tools">
             <div className="qr-box-premium">
                <div className="qr-placeholder">
                   <QrCode size={120} />
                </div>
                <Button variant="outline" size="sm" className="btn-qr-download">
                   <FileUp size={14} /> Download QR Code
                </Button>
             </div>

             <div className="link-share-box">
                <div className="link-label">Form URL</div>
                <div className="url-copy-box">
                   <code>{publishedFormUrl}</code>
                   <button onClick={() => {
                       navigator.clipboard.writeText(publishedFormUrl);
                       alert('Link copied to clipboard!');
                   }}>
                       <Copy size={18} />
                   </button>
                </div>
                <div className="link-actions">
                   <Button variant="ghost" size="sm" onClick={() => window.open(publishedFormUrl, '_blank')}>
                      <ExternalLink size={14} /> Open in New Tab
                   </Button>
                </div>
             </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Button className="btn-premium" fullWidth onClick={() => setIsPublishSuccessOpen(false)}>
                Back to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
