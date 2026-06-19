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
import '../branch.css';

export default function BranchFormsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock data for assignment
  const mockTeams = [
    { id: 'team1', name: 'Media Team' },
    { id: 'team2', name: 'Hospitality' },
    { id: 'team3', name: 'Security' },
    { id: 'team4', name: 'Logistics' },
  ];

  // Mock data for forms
  const [forms, setForms] = useState<any[]>([
    { id: '1', title: 'Location Member Registration', type: 'Outreach', status: 'Active', responses: 45, lastModified: '1 day ago', access: 'Public', fields: [], distribution: { memberAccess: { mode: 'all' }, publicAccess: { mode: 'public' }, teams: ['team1', 'team2'] } },
    { id: '2', title: 'Local Staff Feedback', type: 'Internal', status: 'Active', responses: 12, lastModified: '3 days ago', access: 'Members Only', fields: [], distribution: { memberAccess: { mode: 'all' }, publicAccess: { mode: 'registered' }, teams: ['team3'] } },
    { id: '3', title: 'Service Signups', type: 'Outreach', status: 'Draft', responses: 0, lastModified: '1 week ago', access: 'Public', fields: [], distribution: { memberAccess: { mode: 'all' }, publicAccess: { mode: 'public' }, teams: [] } },
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

  const toggleTeam = (id: string) => {
      setFormDistribution(prev => ({
          ...prev,
          teams: prev.teams.includes(id) 
            ? prev.teams.filter(t => t !== id)
            : [...prev.teams, id]
      }));
  };

  return (
    <div className="hq-dashboard-premium animate-premium" style={{ paddingBottom: '100px' }}>
      <header className="dashboard-header-premium" style={{ border: 'none', background: 'transparent', padding: '24px 0' }}>
        <div className="header-left">
          <button className="back-link-premium" onClick={() => router.push('/branch')}>
            <ArrowLeft size={18} /> Back to Hub
          </button>
          
          <div className="badge-premium blue">OPERATIONAL TOOLS</div>
          <h1>Location Forms</h1>
          <p>Create and manage outreach forms for this branch.</p>
        </div>

        <div className="header-actions">
           <Button className="btn-premium" onClick={handleCreateNew}>
              <Plus size={18} /> New Form
           </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="section-actions" style={{ marginBottom: '24px' }}>
           <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search local forms..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="forms-display-grid-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {forms.filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase())).map((form) => (
            <Card key={form.id} className="team-main-card" style={{ padding: '24px' }}>
                <div className="form-card-main-info" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                   <div className="team-icon-box" style={{ background: '#eff6ff', color: '#3b82f6', width: '48px', height: '48px' }}>
                       <FileText size={24} />
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <span className="admin-badge-mini blue" style={{ fontSize: '10px' }}>{form.type.toUpperCase()}</span>
                         <span className={`status-pill ${form.status.toLowerCase()}`} style={{ fontSize: '10px' }}>{form.status}</span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{form.title}</h3>
                   </div>
                </div>

                <div className="team-card-stats" style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', display: 'flex', gap: '12px' }}>
                  <div className="t-stat">
                    <span className="label">Responses</span>
                    <span className="value" style={{ fontSize: '14px' }}>{form.responses}</span>
                  </div>
                  <div className="t-stat">
                    <span className="label">Access</span>
                    <span className="value" style={{ fontSize: '14px' }}>{form.access}</span>
                  </div>
                </div>

                <div className="form-card-v2-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
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
                </div>
            </Card>
            ))}
        </div>
      </main>

      {/* FORM BUILDER MODAL */}
      <Modal
        isOpen={isFormBuilderOpen}
        onClose={() => {
            setIsFormBuilderOpen(false);
            setPreviewMode(null);
        }}
        title={previewMode ? `Preview: ${formConfig.title}` : `Local Form Builder`}
        size="full"
      >
        <div className="form-builder-container-premium">
          {!previewMode ? (
            <div className="builder-interface fade-in">
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
                  </div>
                  <div className="header-actions">
                    <Button variant="outline" size="sm" onClick={() => handleSaveDraft()}>Save</Button>
                    <Button className="btn-premium" size="sm" onClick={() => setIsDistributionModalOpen(true)}>Publish</Button>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewMode('mobile')}><Eye size={18} /></Button>
                  </div>
                </div>
              </div>
              <div className="builder-body-scrollable">
                <div className="fields-stack">
                  {formFields.length === 0 ? (
                    <div className="empty-builder-state">
                      <Button className="btn-premium" onClick={() => setIsFieldSelectorOpen(true)}>Add Field</Button>
                    </div>
                  ) : (
                    formFields.map((field, idx) => (
                      <div key={field.id} className="field-card-premium">
                        <Input 
                          placeholder="Question Title"
                          value={field.title}
                          onChange={(e) => {
                            const newFields = [...formFields];
                            newFields[idx].title = e.target.value;
                            setFormFields(newFields);
                          }}
                        />
                        <Button variant="ghost" size="sm" onClick={() => setFormFields(formFields.filter(f => f.id !== field.id))}><Trash size={16} /></Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-form-frame">
                <h1>{formConfig.title}</h1>
                <Button onClick={() => setPreviewMode(null)}>Back to Editor</Button>
            </div>
          )}
        </div>
      </Modal>

      {/* DISTRIBUTION MODAL */}
      <Modal
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        title="Form Assignment"
      >
        <div className="dist-content">
          <h4>Assign to Outreach Teams</h4>
          <div className="teams-grid">
            {mockTeams.map(team => (
              <Button key={team.id} variant={formDistribution.teams.includes(team.id) ? "primary" : "outline"} onClick={() => toggleTeam(team.id)}>
                {team.name}
              </Button>
            ))}
          </div>
          <Button className="btn-premium full-width" onClick={() => handlePublishForm(false)}>Finish & Publish</Button>
        </div>
      </Modal>
    </div>
  );
}
