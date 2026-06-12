"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  ChevronRight, 
  MessageSquare,
  QrCode,
  Wallet,
  Settings,
  Plus,
  FileText,
  Building2,
  PieChart,
  ArrowLeft,
  Search,
  MoreVertical,
  Activity,
  Calendar,
  Share2,
  Copy,
  Trash2,
  Power,
  Edit2,
  CheckCircle2,
  XCircle,
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
  ExternalLink,
  Info,
  Filter,
  BarChart3,
  Users2,
  Send,
  History,
  Zap,
  User,
  LayoutTemplate,
  X,
  CreditCard,
  ArrowUpRight,
  Shield,
  Eye,
  Lock,
  Mail,
  Sparkles
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/services/auth';
import { useLocation, useLocationTeams, useLocationMembers } from '@/services/manage-organization';
import { useWalletBalance, useWalletTransactions } from '@/services/wallet';
import { useQuery } from '@tanstack/react-query';
import { listForms } from '@/lib/api/endpoints/forms';
import './branch.css';

type MainTab = 'hub' | 'overview' | 'teams' | 'workers' | 'forms' | 'invitees' | 'messages' | 'wallet' | 'settings';
type TeamTab = 'members' | 'forms';
type ModalType = 'create-team' | 'create-form' | 'add-member' | 'edit-team' | 'assign-admin' | 'send-message' | 'buy-credits' | 'none';

function BranchDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>('hub');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<TeamTab>('members');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [toast, setToast] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- BANNERS ---
  const banners = [
    {
      badge: "TEAMS",
      title: "Structure for Growth",
      desc: "Organize your workforce into powerful units and track their collaborative growth.",
      btnText: "Manage Teams",
      tab: "teams" as MainTab,
      icon: Users
    },
    {
      badge: "FORMS",
      title: "Capture Every Soul",
      desc: "Build location-specific outreach forms and collect high-impact data.",
      btnText: "Create Forms",
      tab: "overview" as MainTab,
      icon: FileText
    },
    {
      badge: "MESSAGING",
      title: "Instant Outreach",
      desc: "Broadcast messages to your entire branch network with instant delivery.",
      btnText: "Send SMS",
      tab: "messages" as MainTab,
      icon: MessageSquare
    },
    {
      badge: "WORKERS",
      title: "Track Your Workforce",
      desc: "Monitor staff and volunteer performance across all your branch units.",
      btnText: "View Workers",
      tab: "workers" as MainTab,
      icon: UserPlus
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // --- API HOOKS ---
  const branchId = user?.branch_id ?? undefined;
  const locationQuery = useLocation(branchId);
  const teamsQuery = useLocationTeams(branchId, { per_page: 10 });
  const membersQuery = useLocationMembers(branchId, { per_page: 10 });
  const walletBalanceQuery = useWalletBalance();
  const transactionsQuery = useWalletTransactions({ page: 1, page_size: 20 });
  const formsQuery = useQuery({
    queryKey: ['forms', 'scope', 'location', branchId],
    queryFn: () => listForms({ scope: 'location' }),
    enabled: Boolean(branchId),
    staleTime: 30_000,
  });

  // --- COMPUTED STATE ---
  const stats = {
    branchName: locationQuery.data?.name ?? 'Branch',
    totalTeams: locationQuery.data?.stats?.teams ?? 0,
    totalMembers: locationQuery.data?.stats?.members ?? 0,
    totalForms: formsQuery.data?.meta?.total ?? 0,
    totalSubmissions: locationQuery.data?.stats?.submissions_30d ?? 0,
    smsCredits: walletBalanceQuery.data?.balance ?? user?.credits ?? 0,
    growth: '+0%',
    conversions: '0%'
  };

  const [forms, setForms] = useState<any[]>([]);

  useEffect(() => {
    if (formsQuery.data?.data) {
      setForms(formsQuery.data.data.map((f) => ({
        id: f.id,
        title: f.title,
        type: 'Outreach',
        status: f.status === 'published' ? 'Active' : 'Draft',
        responses: f.analytics_submissions ?? 0,
        lastModified: f.updated_at,
        access: f.distribution?.mode === 'public' ? 'Public' : 'Members Only',
        fields: f.fields ?? [],
        distribution: f.distribution ?? {},
      })));
    }
  }, [formsQuery.data]);

  const teamsData = (teamsQuery.data?.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    members: t.member_count,
    souls: 0,
    status: 'High' as const,
  }));

  const workers = (membersQuery.data?.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    outreach: 0,
    submissions: 0,
    status: (m.status === 'active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
    role: (m.team_admins?.length ? 'Team Admin' : 'Worker') as 'Team Admin' | 'Worker',
    attended: 0,
  }));

  const recentTransactions = (transactionsQuery.data?.data ?? []).map((tx) => ({
    id: tx.id,
    type: tx.kind === 'topup' ? 'Top-up' : tx.kind === 'purchase_sms' ? 'SMS Purchase' : 'Broadcast',
    amount: tx.delta > 0 ? `${tx.delta.toLocaleString()} Credits` : `${tx.delta} Credits`,
    cost: tx.description ?? '',
    date: tx.created_at,
    status: 'Completed',
  }));

  // --- FORM BUILDER STATE ---
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop' | null>(null);
  const [formConfig, setFormConfig] = useState({ title: '', description: '', status: 'draft' as 'draft' | 'published' });
  const [formFields, setFormFields] = useState<any[]>([]);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  const fieldTypes = [
    { id: 'text', label: 'Short Text', icon: Type, cat: 'Standard', desc: 'Single line of text.' },
    { id: 'longtext', label: 'Long Text', icon: AlignLeft, cat: 'Standard', desc: 'Multiple lines for longer answers.' },
    { id: 'number', label: 'Number', icon: Hash, cat: 'Standard', desc: 'Numeric input only.' },
    { id: 'email', label: 'Email', icon: AtSign, cat: 'Standard', desc: 'Email address validation.' },
    { id: 'phone', label: 'Phone', icon: Smartphone, cat: 'Standard', desc: 'International phone format.' },
    { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, cat: 'Choice', desc: 'Select multiple options.' },
    { id: 'radio', label: 'Radio Choice', icon: Circle, cat: 'Choice', desc: 'Select exactly one option.' },
    { id: 'dropdown', label: 'Dropdown', icon: List, cat: 'Choice', desc: 'Choose from a compact list.' },
    { id: 'date', label: 'Date', icon: Calendar, cat: 'Date & Time', desc: 'Pick a specific calendar date.' },
    { id: 'fileupload', label: 'File Upload', icon: FileUp, cat: 'Media', desc: 'Documents or generic files.' },
    { id: 'rating', label: 'Rating', icon: Star, cat: 'Advanced', desc: 'Star or scale-based feedback.' },
  ];

  // --- MESSAGING STATE ---
  const [messageView, setMessageView] = useState<'dashboard' | 'flow' | 'history'>('dashboard');
  const [msgStep, setMsgStep] = useState(1);
  const [recipientType, setRecipientType] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTitle, setMessageTitle] = useState("");

  // --- WALLET STATE ---
  const [buyAmount, setBuyAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- UTILS ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  // --- HANDLERS ---
  const handleCreateForm = () => {
    setEditingFormId(null);
    setFormConfig({ title: 'Untitled Form', description: '', status: 'draft' });
    setFormFields([]);
    setIsFormBuilderOpen(true);
  };

  const handleEditForm = (form: any) => {
    setEditingFormId(form.id);
    setFormConfig({ title: form.title, description: '', status: form.status.toLowerCase() as any });
    setFormFields(form.fields || []);
    setIsFormBuilderOpen(true);
  };

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

  const handlePublishForm = (isDraft = false) => {
    if (editingFormId) {
      setForms(forms.map(f => f.id === editingFormId ? { ...f, title: formConfig.title || 'Untitled Form', status: isDraft ? 'Draft' : 'Active', fields: formFields } : f));
    } else {
      const newForm = {
        id: Math.random().toString(36).substr(2, 9),
        title: formConfig.title || 'Untitled Form',
        type: 'Outreach',
        status: isDraft ? 'Draft' : 'Active',
        responses: 0,
        lastModified: 'Just now',
        access: 'Public',
        fields: formFields
      };
      setForms([newForm, ...forms]);
    }
    setIsFormBuilderOpen(false);
    showToast(isDraft ? "Draft saved" : "Form published!");
  };

  // --- RENDER FUNCTIONS ---

  const renderHubView = () => (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      {/* Banner V2 */}
      <section className="banner-v2-purple">
        <div className="banner-v2-content">
          <div className="banner-v2-badge">{banners[currentSlide].badge}</div>
          <h2>{banners[currentSlide].title}</h2>
          <p>{banners[currentSlide].desc}</p>
          <Button className="btn-banner-v2" onClick={() => setActiveTab(banners[currentSlide].tab)}>
            {banners[currentSlide].btnText}
          </Button>
        </div>
        <div className="banner-v2-icon">
          {React.createElement(banners[currentSlide].icon, { size: 120, className: "opacity-20", style: { color: 'white' } })}
        </div>
        <div className="slider-indicators" style={{ bottom: '24px', left: '40px', justifyContent: 'flex-start' }}>
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={`indicator ${currentSlide === i ? 'active' : ''}`}
              style={{ background: currentSlide === i ? 'white' : 'rgba(255,255,255,0.3)', width: currentSlide === i ? '24px' : '8px' }}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </section>

      <section className="hub-grid-v2">
        {[
          { label: 'Overview', icon: Layout, path: '/branch/overview', color: '#a855f7' },
          { label: 'Teams', icon: Users, path: '/branch/teams', color: '#3b82f6' },
          { label: 'Workers', icon: UserPlus, tab: 'workers', color: '#a855f7' },
          { label: 'Forms', icon: FileText, path: '/branch/forms', color: '#10b981' },
          { label: 'Messaging', icon: MessageSquare, path: '/branch/messages', color: '#0ea5e9' },
          { label: 'Invitees', icon: Sparkles, path: '/branch/invitees', color: '#f59e0b' },
          { label: 'Wallet', icon: Wallet, path: '/branch/wallet', color: '#ec4899' },
          { label: 'Settings', icon: Settings, path: '/branch/settings', color: '#8b5cf6' },
        ].map((item, i) => (
          <div key={i} className="hub-card-v2" onClick={() => {
            if (item.path) {
              router.push(item.path);
            } else {
              setActiveTab(item.tab as MainTab);
            }
          }}>
            <div className="hub-card-icon-v2">
              <item.icon size={24} style={{ color: item.color }} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </section>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium purple">PERFORMANCE</div>
        <h1>Organization Overview</h1>
        <p>Real-time outreach metrics and team performance.</p>
      </div>

      <div style={{ padding: '20px 0' }}>
        {/* Stats Grid Match */}
        <div className="stats-cards-grid">
          {[
            { label: 'Outreach Units', value: stats.totalTeams, sub: 'Active Groups', icon: Building2, color: '#a855f7' },
            { label: 'Total Members', value: stats.totalMembers, sub: stats.growth, icon: Users, color: '#3b82f6', trend: true },
            { label: 'Form Submissions', value: stats.totalSubmissions, sub: stats.conversions, icon: FileText, color: '#10b981' },
          ].map((card, i) => (
            <Card key={i} className="stat-card-premium">
              <div className="stat-icon" style={{ backgroundColor: `${card.color}10`, color: card.color }}>
                <card.icon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">{card.label}</span>
                <div className="stat-value-group">
                   <span className="stat-value">{card.value}</span>
                   <span className={`stat-sub ${card.trend ? 'up' : ''}`}>{card.sub}</span>
                </div>
              </div>
            </Card>
          ))}
          <Card className="stat-card-premium full-width">
            <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
              <Wallet size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">SMS Credits</span>
              <div className="stat-value-group">
                 <span className="stat-value">{stats.smsCredits.toLocaleString()}</span>
                 <span className="stat-sub">Available</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Outreach Teams Match */}
        <div className="top-teams-section">
           <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Top Outreach Teams</h2>
           <div className="top-teams-list">
              {teamsData.map((team, i) => (
                <div key={team.id} className="top-team-item">
                   <div className="team-rank-box">{i + 1}</div>
                   <div className="team-main-info">
                      <h4>{team.name}</h4>
                      <p>{team.members} members • {team.souls} souls</p>
                   </div>
                   <span className="team-status-tag">{team.status}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderFormsTab = () => (
    <div className="tab-content animate-fade-in" style={{ padding: '0' }}>
      <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium blue">DATA CAPTURE HUB</div>
        <h1>Forms & Surveys</h1>
        <p>Collect high-impact data with custom outreach and feedback forms.</p>
      </div>

      <Button className="btn-premium-large" fullWidth onClick={handleCreateForm}>
        <Plus size={20} /> Create New Form
      </Button>

      <div className="forms-filter-bar">
         <div className="search-wrap-premium">
            <Search size={18} />
            <input type="text" placeholder="Search forms by name or type..." />
         </div>
         <div className="filter-actions-premium">
            <button className="filter-btn-icon"><Filter size={18} /> <span>Filters</span></button>
            <button className="filter-btn-icon"><BarChart3 size={18} /> <span>Stats</span></button>
         </div>
      </div>

      <div className="forms-list-premium-v3">
        {forms.map((form) => (
          <Card key={form.id} className="form-card-premium-v3">
            <div className="form-card-top">
               <div className="form-icon-v3-box"><FileText size={24} /></div>
               <div className="form-status-badge-v3">
                  <span className="type-tag-v3">{form.type.toUpperCase()}</span>
                  <span className={`status-tag-v3 ${form.status.toLowerCase()}`}>
                    <div className="dot" /> {form.status.toUpperCase()}
                  </span>
               </div>
            </div>
            <div className="form-card-body">
               <h3>{form.title}</h3>
               <div className="form-meta-v3">
                  <div className="meta-v3-item"><Users size={14} /> <span>{form.responses} Submissions</span></div>
                  <div className="meta-v3-item"><Lock size={14} /> <span>{form.access}</span></div>
               </div>
            </div>
            <div className="form-card-footer-v3">
               <div className="footer-v3-main">
                  <Button variant="outline" size="sm" onClick={() => handleEditForm(form)}><Settings size={16} /> Manage</Button>
                  <Button variant="outline" size="sm" onClick={() => { handleEditForm(form); setPreviewMode('mobile'); }}><Eye size={16} /> Preview</Button>
               </div>
               <button className="delete-btn-minimal" onClick={() => setForms(forms.filter(f => f.id !== form.id))}><Trash2 size={18} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTeamsTab = () => {
    return (
      <div className="tab-content animate-fade-in" style={{ padding: 0 }}>
        <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
          <ArrowLeft size={18} /> Back to Hub
        </button>

        <div className="page-header-premium">
          <div className="badge-premium purple">TEAM OPERATIONS</div>
          <h1>Location Teams</h1>
          <p>Organize your outreach workers into focused, high-impact units.</p>
        </div>

        <Button className="btn-premium-large" fullWidth onClick={() => setActiveModal('create-team')}>
          <Plus size={20} /> Create New Team
        </Button>

        <div className="teams-grid-premium" style={{ marginTop: '32px' }}>
          {teamsData.map((team) => (
            <Card key={team.id} className="team-main-card" onClick={() => setSelectedTeamId(team.id)}>
              <div className="team-card-header">
                <div className="team-icon-box">
                  <Users size={24} />
                </div>
                <div className="team-title-group">
                  <h3>{team.name}</h3>
                  <p>Lead: Sarah Jenkins</p>
                </div>
                <ChevronRight size={20} className="text-tertiary" />
              </div>
              <div className="team-card-stats">
                <div className="t-stat">
                  <span className="label">Members</span>
                  <span className="value">{team.members}</span>
                </div>
                <div className="t-stat">
                  <span className="label">Souls</span>
                  <span className="value">{team.souls}</span>
                </div>
                <div className="t-stat">
                  <span className="label">Activity</span>
                  <span className={`value activity-${team.status.toLowerCase()}`}>{team.status}</span>
                </div>
              </div>
              <div className="team-card-footer">
                 <div className="admin-info">3 Forms Assigned</div>
                 <div className="footer-actions">
                    <button className="icon-action"><Settings size={14} /></button>
                    <button className="icon-action"><MessageSquare size={14} /></button>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderWorkersTab = () => (
    <div className="tab-content animate-fade-in" style={{ padding: 0 }}>
      <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium blue">WORKFORCE</div>
        <h1>Location Workers</h1>
        <p>Manage staff and track individual outreach performance.</p>
      </div>

      <div className="section-actions" style={{ marginBottom: '24px' }}>
         <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search workers by name or phone..." />
         </div>
         <Button className="btn-premium" onClick={() => setActiveModal('add-member')}>
           <Plus size={18} /> Add
         </Button>
      </div>

      <div className="member-cards-list">
        {workers.map((worker) => (
          <Card key={worker.id} className="member-card-premium">
            <div className="member-info">
              <div className="member-avatar-box">
                {worker.name[0]}
                {worker.role === 'Team Admin' && <div className="admin-star"><Star size={8} fill="currentColor" /></div>}
              </div>
              <div className="member-details">
                <div className="member-name">
                  {worker.name}
                  {worker.role === 'Team Admin' && <span className="admin-badge">Admin</span>}
                </div>
                <div className="member-phone">{worker.phone}</div>
              </div>
              <button className="icon-action"><MoreVertical size={18} /></button>
            </div>
            <div className="member-stats">
              <div className="m-stat">
                <span className="l">Outreach</span>
                <span className="v">{worker.outreach}</span>
              </div>
              <div className="m-stat">
                <span className="l">Souls</span>
                <span className="v">{worker.submissions}</span>
              </div>
              <div className="m-stat">
                <span className="l">Status</span>
                <span className={`v status-${worker.status.toLowerCase()}`}>{worker.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
               <Button variant="outline" size="sm" fullWidth>Performance</Button>
               <Button variant="outline" size="sm" fullWidth>Message</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInviteesTab = () => (
    <div className="tab-content animate-fade-in" style={{ padding: 0 }}>
      <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium orange">GROWTH TOOLS</div>
        <h1>Registration Gateways</h1>
        <p>Direct links and QR codes to bring new members into your location.</p>
      </div>

      <div className="gateways-grid-premium" style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {[
          { id: 'workers', title: 'Workers', icon: Users, color: '#3b82f6', url: 'vangly.app/join/downtown-workers' },
          { id: 'members', title: 'Members', icon: UserPlus, color: '#8b5cf6', url: 'vangly.app/join/downtown-members' }
        ].map(link => (
          <Card key={link.id} className="gateway-card-premium" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
               <div style={{ padding: '10px', borderRadius: '12px', background: `${link.color}15`, color: link.color }}>
                  <link.icon size={20} />
               </div>
               <h3 style={{ fontWeight: '800' }}>{link.title}</h3>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
               <QRCodeCanvas value={link.url} size={140} />
            </div>
            <Button variant="outline" fullWidth style={{ gap: '8px' }} onClick={() => { navigator.clipboard.writeText(link.url); showToast("Link copied!"); }}>
               <Copy size={16} /> Copy Link
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMessagesTab = () => (
    <div className="tab-content animate-fade-in" style={{ padding: 0 }}>
      <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium blue">MESSAGING</div>
        <h1>Broadcast Center</h1>
        <p>Send personalized SMS outreach to your entire branch network.</p>
      </div>

      <div className="stats-cards-grid">
         <Card className="stat-card-premium">
            <div className="stat-label">Credits Spent</div>
            <div className="stat-value">1.2k</div>
         </Card>
         <Card className="stat-card-premium">
            <div className="stat-label">Delivery Rate</div>
            <div className="stat-value">98%</div>
         </Card>
      </div>

      <Button className="btn-premium-large" fullWidth onClick={() => setMessageView('flow')}>
         <Send size={20} /> Send New Broadcast
      </Button>

      <div className="top-teams-section" style={{ marginTop: '32px' }}>
         <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Recent Broadcasts</h2>
         <div className="top-teams-list">
            {[
               { title: 'Sunday Service Reminder', recipients: '450 Workers', date: '2 hours ago', status: 'Sent' },
               { title: 'Mid-week Outreach', recipients: '120 Team Leads', date: 'Yesterday', status: 'Sent' }
            ].map((msg, i) => (
               <div key={i} className="top-team-item">
                  <div className="team-main-info">
                     <h4>{msg.title}</h4>
                     <p>{msg.recipients} • {msg.date}</p>
                  </div>
                  <span className="team-status-tag" style={{ color: 'var(--green)' }}>{msg.status}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderWalletTab = () => (
    <div className="tab-content animate-fade-in" style={{ padding: 0 }}>
       <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium orange">WALLET</div>
        <h1>Credit Balance</h1>
        <p>Manage your SMS credits for branch-wide outreach.</p>
      </div>

      <Card className="stat-card-premium full-width" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none' }}>
        <div className="stat-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
          <Wallet size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Available Credits</span>
          <div className="stat-value-group">
             <span className="stat-value" style={{ color: 'white' }}>{stats.smsCredits.toLocaleString()}</span>
          </div>
        </div>
        <Button variant="outline" style={{ marginLeft: 'auto', background: 'white', color: '#b45309', border: 'none' }} onClick={() => setActiveModal('buy-credits')}>
           Top Up
        </Button>
      </Card>

      <div className="top-teams-section" style={{ marginTop: '32px' }}>
         <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Transaction History</h2>
         <div className="top-teams-list">
            {recentTransactions.map((tx) => (
               <div key={tx.id} className="top-team-item">
                  <div className="team-main-info">
                     <h4>{tx.type}</h4>
                     <p>{tx.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontWeight: '800', color: tx.amount.startsWith('-') ? '#ef4444' : '#10b981' }}>{tx.amount}</div>
                     <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{tx.status}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="tab-content animate-fade-in" style={{ padding: 0 }}>
      <button className="back-link-premium" onClick={() => setActiveTab('hub')}>
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="page-header-premium">
        <div className="badge-premium purple">CONFIG</div>
        <h1>Branch Settings</h1>
        <p>Configure your location details and operational preferences.</p>
      </div>

      <div className="settings-group-card">
         <Card className="settings-group-card">
            {[
               { label: 'Branch Identity', desc: 'Update name, logo, and address.', icon: Building2, color: '#3b82f6' },
               { label: 'Access Control', desc: 'Manage admin roles and permissions.', icon: Shield, color: '#8b5cf6' },
               { label: 'Notification Prefs', desc: 'Configure SMS and email alerts.', icon: Zap, color: '#f59e0b' },
               { label: 'Display QR', desc: 'View and download branch QR.', icon: QrCode, color: '#10b981' }
            ].map((item, i) => (
               <div key={i} className="settings-item-premium">
                  <div className="settings-icon" style={{ background: `${item.color}15`, color: item.color }}>
                     <item.icon size={18} />
                  </div>
                  <div className="settings-info" style={{ flex: 1 }}>
                     <div style={{ fontWeight: '700' }}>{item.label}</div>
                     <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.desc}</div>
                  </div>
                  <ChevronRight size={18} className="text-tertiary" />
               </div>
            ))}
         </Card>
      </div>
      
      <div style={{ marginTop: '32px' }}>
         <Button variant="outline" fullWidth style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
            <Power size={18} style={{ marginRight: '8px' }} /> Deactivate Branch
         </Button>
      </div>
    </div>
  );

  return (
    <div className="location-dashboard-v3 hq-dashboard-premium hub-v2-container animate-premium">
      {toast && <div className="toast-premium fade-in"><CheckCircle2 size={16} /><span>{toast}</span></div>}

      {!selectedTeamId && !isFormBuilderOpen && (
        <header className="mobile-dashboard-header" style={{ border: 'none', background: 'transparent', padding: '24px 20px' }}>
          <div className="header-top">
            <div className="location-badge admin-badge-premium">Location Admin</div>
            <div className="wallet-pill" onClick={() => setActiveTab('wallet')}>
              <Wallet size={14} /><span>{stats.smsCredits.toLocaleString()}</span>
            </div>
            {activeTab !== 'hub' && (
               <Button variant="ghost" size="sm" onClick={() => setActiveTab('hub')} style={{ gap: '8px' }}>
                 <Layout size={18} /> Hub
               </Button>
             )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
             <div>
                <h1 className="location-title" style={{ fontSize: '32px', marginBottom: '4px' }}>Hello, {user?.name.split(' ')[0] || 'Demo'}</h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>Branch growth overview for {stats.branchName}</p>
             </div>
          </div>

        </header>
      )}

      <main className="dashboard-scroll-area" style={{ padding: activeTab === 'hub' ? '0 20px 100px' : '20px' }}>
        {activeTab === 'hub' && renderHubView()}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'workers' && renderWorkersTab()}
        {activeTab === 'forms' && renderFormsTab()}
        {activeTab === 'invitees' && renderInviteesTab()}
        {activeTab === 'messages' && renderMessagesTab()}
        {activeTab === 'wallet' && renderWalletTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>

      {/* FORM BUILDER OVERLAY (Image Match) */}
      <Modal
        isOpen={isFormBuilderOpen}
        onClose={() => { setIsFormBuilderOpen(false); setPreviewMode(null); }}
        title="Form Builder"
        size="full"
      >
        <div className="form-builder-premium-v4">
           <div className="builder-header-v4">
              <div className="header-top-row">
                 <div className="title-group">
                    <input 
                      type="text" 
                      className="form-title-input-v4" 
                      placeholder="Untitled Form" 
                      value={formConfig.title} 
                      onChange={e => setFormConfig({...formConfig, title: e.target.value})} 
                    />
                    <div className="draft-badge-v4"><div className="dot" /> DRAFT • AUTO-SAVED</div>
                 </div>
                 <button className="close-builder-btn" onClick={() => setIsFormBuilderOpen(false)}><X size={20} /></button>
              </div>
              <div className="header-action-row">
                 <Button variant="outline" className="btn-save-v4" onClick={() => handlePublishForm(true)}>Save</Button>
                 <Button className="btn-publish-v4" onClick={() => handlePublishForm(false)}>Publish</Button>
                 <button className="btn-preview-icon-v4" onClick={() => setPreviewMode('mobile')}><Eye size={20} /></button>
              </div>
              <input 
                type="text" 
                className="form-desc-input-v4" 
                placeholder="Add an optional description for this form..." 
                value={formConfig.description}
                onChange={e => setFormConfig({...formConfig, description: e.target.value})}
              />
           </div>

           <div className="builder-content-v4">
              {formFields.length === 0 ? (
                <div className="empty-builder-v4">
                   <div className="empty-icon-v4"><Layout size={32} color="#3b82f6" /></div>
                   <h3>Your form is empty</h3>
                   <p>Start by adding your first field below.</p>
                   <Button className="btn-add-first-field" onClick={() => setIsFieldSelectorOpen(true)}>
                      <Plus size={20} /> Add Your First Field
                   </Button>
                </div>
              ) : (
                <div className="fields-stack-v4">
                   {formFields.map((field, idx) => (
                     <Card key={field.id} className="field-card-v4">
                        <div className="field-card-header-v4">
                           <div className="field-type-v4">{field.type}</div>
                           <button className="delete-field-btn" onClick={() => setFormFields(formFields.filter(f => f.id !== field.id))}><Trash size={16} /></button>
                        </div>
                        <input 
                          type="text" 
                          className="field-title-input-v4" 
                          placeholder="Question Title" 
                          value={field.title} 
                          onChange={e => {
                            const newFields = [...formFields];
                            newFields[idx].title = e.target.value;
                            setFormFields(newFields);
                          }} 
                        />
                     </Card>
                   ))}
                   <Button variant="outline" fullWidth onClick={() => setIsFieldSelectorOpen(true)}><Plus size={16} /> Add Field</Button>
                </div>
              )}
           </div>
        </div>
      </Modal>

      {/* Field Selector */}
      <Modal isOpen={isFieldSelectorOpen} onClose={() => setIsFieldSelectorOpen(false)} title="Add Field">
         <div className="selector-grid">
            {fieldTypes.map(t => (
              <div key={t.id} className="field-type-item" onClick={() => addField(t.id)}>
                 <div className="item-icon-box"><t.icon size={20} /></div>
                 <div className="item-text"><strong>{t.label}</strong><span>{t.desc}</span></div>
              </div>
            ))}
         </div>
      </Modal>

      {/* Buy Credits Modal */}
      <Modal isOpen={activeModal === 'buy-credits'} onClose={() => setActiveModal('none')} title="Top Up Credits">
         <div className="buy-modal-content">
            <Input label="Amount (₦)" placeholder="e.g. 5000" type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} />
            <div className="buy-summary"><span>Credits to receive:</span> <strong>{(Number(buyAmount) / 10).toLocaleString()}</strong></div>
            <Button className="btn-premium" fullWidth onClick={() => { setIsProcessingPayment(true); setTimeout(() => { setIsProcessingPayment(false); showToast("Payment Successful!"); setActiveModal('none'); setBuyAmount(''); }, 1500); }}>{isProcessingPayment ? "Processing..." : `Pay ₦${Number(buyAmount).toLocaleString()} Now`}</Button>
            <div className="secure-tag"><ShieldCheck size={14} /> <span>Secure Paystack Payment</span></div>
         </div>
      </Modal>

      {/* Simple Modals */}
      <Modal isOpen={activeModal === 'create-team'} onClose={() => setActiveModal('none')} title="New Team">
         <div className="modal-form">
            <Input label="Team Name" placeholder="e.g. West Campus Group" />
            <Button className="btn-premium" fullWidth onClick={() => {showToast("Team created!"); setActiveModal('none');}}>Create Team</Button>
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'add-member'} onClose={() => setActiveModal('none')} title="Add Member">
         <div className="modal-form">
            <Input label="Full Name" placeholder="e.g. John Doe" />
            <Input label="Phone Number" placeholder="+234..." />
            <Button className="btn-premium" fullWidth onClick={() => {showToast("Member added!"); setActiveModal('none');}}>Add Member</Button>
         </div>
      </Modal>
    </div>
  );
}

export default function LocationAdminDashboard() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>}>
      <BranchDashboardContent />
    </Suspense>
  );
}
