"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Target,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Shield,
  Download,
  Copy,
  Check,
  ExternalLink,
  Plus,
  FileUp,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Trash2,
  MessageCircle,
  MessageSquare,
  Share,
  LogIn,
  DownloadCloud,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  CalendarRange,
  Clock,
  Trash,
  Info,
  ShieldCheck,
  Hash,
  AtSign,
  Smartphone,
  List,
  CheckCircle,
  Image as ImageIcon,
  PenTool,
  Star,
  Link,
  ToggleLeft,
  MapPin,
  Eye,
  Undo,
  Redo,
  Layout,
  Layers,
  Settings,
  GripVertical,
  Minus,
  Edit2,
  FileText,
  Type as ParagraphIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import '../../management.css';

const networkLocations = [
  { id: 'loc-1', name: 'Lagos Headquarters', groups: ['Admin', 'Security', 'Sales', 'Logistics'], forms: ['Attendance', 'Incident Report', 'Staff Evaluation'] },
  { id: 'loc-2', name: 'Abuja Branch', groups: ['Operations', 'Support', 'Drivers', 'Customer Care'], forms: ['Customer Feedback', 'Trip Log', 'Equipment Check'] },
  { id: 'loc-3', name: 'Port Harcourt Hub', groups: ['Logistics', 'Warehouse', 'Shipping', 'Inventory'], forms: ['Inventory Check', 'Delivery Receipt', 'Safety Audit'] },
];

function LocationPerformanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationName = searchParams.get('name') || 'Location';

  const [activeTab, setActiveTab] = React.useState<'performance' | 'users' | 'settings'>('performance');

  // Mock Users for this location
  const [locationUsers, setLocationUsers] = React.useState([
    { id: '1', name: 'John Admin', role: 'Admin', status: 'Active', phone: '+234 801 000 1111', email: 'admin@hq.com' },
    { id: '2', name: 'Sarah Worker', role: 'Worker', status: 'Active', phone: '+234 801 000 2222', email: 'sarah@hq.com' },
    { id: '3', name: 'Volunteer Mike', role: 'Volunteer', status: 'Active', phone: '+234 801 000 3333', email: 'mike@hq.com' },
    { id: '4', name: 'Member Jane', role: 'Member', status: 'Inactive', phone: '+234 801 000 4444', email: 'jane@hq.com' },
  ]);

  // Mock Performance Data
  const stats = [
    { label: 'Total Invites', value: '1,284', change: '+12.5%', isUp: true, icon: Users, color: 'blue' },
    { label: 'Total Attended', value: '842', change: '+8.2%', isUp: true, icon: UserCheck, color: 'green' },
    { label: 'Conversion Rate', value: '65.5%', change: '-2.1%', isUp: false, icon: Target, color: 'purple' },
    { label: 'Avg. Weekly Growth', value: '18%', change: '+4.3%', isUp: true, icon: TrendingUp, color: 'orange' },
  ];

  const [copied, setCopied] = React.useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [isUserActionModalOpen, setIsUserActionModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({ Admin: true });
  const [selectedGroupForQR, setSelectedGroupForQR] = React.useState<string | null>(null);
  const [groupViewState, setGroupViewState] = React.useState<'grid' | 'details'>('grid');
  const [selectedGroupName, setSelectedGroupName] = React.useState<string | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false);
  const [isGroupSettingsModalOpen, setIsGroupSettingsModalOpen] = React.useState(false);
  const [selectedGroupSettings, setSelectedGroupSettings] = React.useState<string | null>(null);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = React.useState(false);
  const [selectedRoleForForm, setSelectedRoleForForm] = React.useState<string | null>(null);
  const [formConfig, setFormConfig] = React.useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
    lastSaved: null as Date | null
  });
  const [formFields, setFormFields] = React.useState<any[]>([]);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState<'mobile' | 'tablet' | 'desktop' | null>(null);
  const [groupForms, setGroupForms] = React.useState<Record<string, any[]>>({});
  const [formDistribution, setFormDistribution] = React.useState({
    memberAccess: { mode: 'all' as 'all' | 'selected', userIds: [] as string[] },
    publicAccess: { mode: 'public' as 'registered' | 'public' },
    addLogoToQR: true
  });
  const [activeGroupTab, setActiveGroupTab] = React.useState<'members' | 'forms'>('members');
  const [groupSubView, setGroupSubView] = React.useState<'home' | 'members' | 'forms'>('home');
  const [isDistributionModalOpen, setIsDistributionModalOpen] = React.useState(false);
  const [selectedFormForDist, setSelectedFormForDist] = React.useState<any>(null);

  const [editingFormId, setEditingFormId] = React.useState<string | null>(null);
  const [newUserForms, setNewUserForms] = React.useState<string[]>([]);
  const [formSearchQuery, setFormSearchQuery] = React.useState('');
  const [shouldAssignForms, setShouldAssignForms] = React.useState(false);
  const [isImportNetworkModalOpen, setIsImportNetworkModalOpen] = React.useState(false);
  const [importType, setImportType] = React.useState<'group' | 'form'>('group');
  const [sourceLocation, setSourceLocation] = React.useState('');
  const [selectedNetworkItems, setSelectedNetworkItems] = React.useState<string[]>([]);
  const [networkSearchQuery, setNetworkSearchQuery] = React.useState('');
  const [isPublishSuccessOpen, setIsPublishSuccessOpen] = React.useState(false);
  const [publishedFormUrl, setPublishedFormUrl] = React.useState('');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = React.useState(false);
  const [isResponsesModalOpen, setIsResponsesModalOpen] = React.useState(false);
  const [selectedFormForResponses, setSelectedFormForResponses] = React.useState<any>(null);
  const [selectedFullResponse, setSelectedFullResponse] = React.useState<any>(null);
  const [editingFormTitleId, setEditingFormTitleId] = React.useState<string | null>(null);
  const [tempFormTitle, setTempFormTitle] = React.useState('');

  const handlePublishForm = (isDraft = false, showSuccess = true) => {
    if (formFields.length === 0) return;
    
    // Auto-fix options for Yes/No if they are empty
    const sanitizedFields = formFields.map(f => {
      if (f.type === 'yesno' && (!f.options || f.options.length < 2)) {
        return { ...f, options: ['Yes', 'No'] };
      }
      return f;
    });

    const group = selectedRoleForForm || 'General';
    const finalUrl = editingFormId ? `https://vangly.app/f/${editingFormId}` : `https://vangly.app/f/${Math.random().toString(36).substr(2, 6)}`;
    
    setGroupForms(prev => {
      const currentForms = [...(prev[group] || [])];
      
      if (editingFormId) {
        // Update existing
        const idx = currentForms.findIndex(f => f.id === editingFormId);
        if (idx !== -1) {
          currentForms[idx] = {
            ...currentForms[idx],
            ...formConfig,
            status: isDraft ? 'draft' : 'published',
            fields: sanitizedFields,
            distribution: formDistribution,
            lastSaved: new Date()
          };
        }
      } else {
        // Create new
        const newForm = {
          id: finalUrl.split('/').pop(),
          ...formConfig,
          status: isDraft ? 'draft' : 'published',
          fields: sanitizedFields,
          distribution: formDistribution,
          createdAt: new Date(),
          responses: [],
          analytics: { scans: Math.floor(Math.random() * 50), submissions: 0 }
        };
        currentForms.push(newForm);
      }
      
      return { ...prev, [group]: currentForms };
    });

    setIsFormBuilderOpen(false);
    setIsDistributionModalOpen(false);
    setFormFields([]);
    setEditingFormId(null);
    setPublishedFormUrl(finalUrl);
    setFormConfig({ title: '', description: '', status: 'draft', lastSaved: null });
    
    if (!isDraft && showSuccess) {
      setIsPublishSuccessOpen(true);
    }
  };

  const handleQuickTitleSave = (id: string) => {
    setGroupForms(prev => {
      const newGroups = { ...prev };
      for (const group in newGroups) {
        const idx = newGroups[group].findIndex(f => f.id === id);
        if (idx !== -1) {
          newGroups[group][idx] = { ...newGroups[group][idx], title: tempFormTitle };
          break;
        }
      }
      return newGroups;
    });
    setEditingFormTitleId(null);
  };

  const handleSaveDraft = () => {
    handlePublishForm(true);
  };

  const fieldTypes = [
    { id: 'text', label: 'Short Text', icon: Type, cat: 'Standard', desc: 'Single line of text.' },
    { id: 'longtext', label: 'Long Text', icon: AlignLeft, cat: 'Standard', desc: 'Multiple lines for longer answers.' },
    { id: 'number', label: 'Number', icon: Hash, cat: 'Standard', desc: 'Numeric input only.' },
    { id: 'email', label: 'Email', icon: AtSign, cat: 'Standard', desc: 'Email address validation.' },
    { id: 'phone', label: 'Phone', icon: Smartphone, cat: 'Standard', desc: 'International phone format.' },
    { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, cat: 'Choice', desc: 'Select multiple options.' },
    { id: 'radio', label: 'Radio Choice', icon: Circle, cat: 'Choice', desc: 'Select exactly one option.' },
    { id: 'dropdown', label: 'Dropdown', icon: List, cat: 'Choice', desc: 'Choose from a compact list.' },
    { id: 'multiselect', label: 'Multi Select', icon: CheckCircle, cat: 'Choice', desc: 'Tag-style multiple selection.' },
    { id: 'date', label: 'Date', icon: Calendar, cat: 'Date & Time', desc: 'Pick a specific calendar date.' },
    { id: 'time', label: 'Time', icon: Clock, cat: 'Date & Time', desc: 'Select a specific time.' },
    { id: 'monthday', label: 'Month & Day', icon: CalendarRange, cat: 'Date & Time', desc: 'Birthdays or annual events.' },
    { id: 'fileupload', label: 'File Upload', icon: FileUp, cat: 'Media', desc: 'Documents or generic files.' },
    { id: 'image', label: 'Image', icon: ImageIcon, cat: 'Media', desc: 'Photos or visual assets.' },
    { id: 'signature', label: 'Signature', icon: PenTool, cat: 'Advanced', desc: 'Digital signature capture.' },
    { id: 'rating', label: 'Rating', icon: Star, cat: 'Advanced', desc: 'Star or scale-based feedback.' },
    { id: 'url', label: 'Website URL', icon: Link, cat: 'Standard', desc: 'Secure web link input.' },
    { id: 'yesno', label: 'Yes/No', icon: ToggleLeft, cat: 'Choice', desc: 'Simple boolean selection.' },
    { id: 'address', label: 'Address', icon: MapPin, cat: 'Advanced', desc: 'Location or postal details.' },
    { id: 'divider', label: 'Divider', icon: Minus, cat: 'Layout', desc: 'Visual separation between fields.' },
    { id: 'paragraph', label: 'Paragraph', icon: ParagraphIcon, cat: 'Layout', desc: 'Informational text block.' },
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
      settings: {}
    };
    setFormFields([...formFields, newField]);
    setIsFieldSelectorOpen(false);
  };
  const [editingUser, setEditingUser] = React.useState<any>(null);
  const [userType, setUserType] = React.useState<'admin' | 'others'>('others');
  const [groupConfigs, setGroupConfigs] = React.useState<Record<string, any>>({
    Admin: { allowJoin: false, allowPin: true, smsOtp: false },
    Member: { allowJoin: true, allowPin: true, smsOtp: false },
    Staff: { allowJoin: true, allowPin: true, smsOtp: false },
    Volunteer: { allowJoin: true, allowPin: true, smsOtp: false },
  });
  const [newUser, setNewUser] = React.useState({ 
    name: '', 
    role: '', 
    phone: '', 
    email: '', 
    pin: '',
    isAdmin: false,
    isGroupAdmin: false
  });

  const [groups, setGroups] = React.useState(['Admin', 'Staff', 'Member', 'Volunteer']);
  const [groupDescriptions, setGroupDescriptions] = React.useState<Record<string, string>>({
    Admin: 'Full system access and management.',
    Staff: 'Regular employees with operational access.',
    Member: 'Community members or customers.',
    Volunteer: 'Occasional contributors and helpers.'
  });
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = React.useState(false);
  const [newGroup, setNewGroup] = React.useState({ name: '', description: '', allowJoin: true, allowPin: true });

  const handleCreateGroup = () => {
    if (!newGroup.name) return;
    setGroups([...groups, newGroup.name]);
    setGroupDescriptions({ ...groupDescriptions, [newGroup.name]: newGroup.description });
    setGroupConfigs({ 
      ...groupConfigs, 
      [newGroup.name]: { allowJoin: newGroup.allowJoin, allowPin: newGroup.allowPin, smsOtp: false } 
    });
    setIsCreateGroupModalOpen(false);
    setNewGroup({ name: '', description: '', allowJoin: true, allowPin: true });
  };

  const handleAddUser = () => {
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      role: selectedGroupName || (userType === 'admin' ? 'Admin' : 'Member'),
      phone: newUser.phone,
      email: newUser.email,
      status: 'Active',
      pin: newUser.pin
    };
    setLocationUsers([...locationUsers, user]);
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', role: '', phone: '', email: '', pin: '', isAdmin: false, isGroupAdmin: false });
    setNewUserForms([]);
    setShouldAssignForms(false);
    setFormSearchQuery('');
  };

  const locationUrl = `https://vangly.com/f/${locationName.toLowerCase().replace(/\s+/g, '-')}`;


  const handleUpdateUser = () => {
    if (!editingUser) return;
    setLocationUsers(locationUsers.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const handleImportNetworkItems = () => {
    if (selectedNetworkItems.length === 0) return;
    
    if (importType === 'group') {
      // Simulate cloning groups
      alert(`Successfully imported ${selectedNetworkItems.length} groups from ${sourceLocation} to this location.`);
    } else {
      // Simulate cloning forms
      alert(`Successfully imported ${selectedNetworkItems.length} forms into the ${selectedGroupName} group.`);
    }
    
    setIsImportNetworkModalOpen(false);
    setSelectedNetworkItems([]);
    setSourceLocation('');
  };

  const groupedUsers = groups.reduce((acc, groupName) => {
    acc[groupName] = locationUsers.filter(u => u.role === groupName);
    return acc;
  }, {} as Record<string, typeof locationUsers>);


  const exportContacts = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Role,Phone,Email", ...locationUsers.map(u => `${u.name},${u.role},${u.phone},${u.email || ''}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${locationName.toLowerCase()}_contacts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(locationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('location-qr');
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
        downloadLink.download = `${locationName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const [timeframe, setTimeframe] = React.useState('week');

  const attendanceData: Record<string, Array<{ label: string, value: number }>> = {
    week: [
      { label: 'Mon', value: 45 },
      { label: 'Tue', value: 52 },
      { label: 'Wed', value: 48 },
      { label: 'Thu', value: 61 },
      { label: 'Fri', value: 55 },
      { label: 'Sat', value: 89 },
      { label: 'Sun', value: 142 },
    ],
    month: [
      { label: 'Week 1', value: 320 },
      { label: 'Week 2', value: 380 },
      { label: 'Week 3', value: 410 },
      { label: 'Week 4', value: 445 },
    ],
    year: [
      { label: 'Jan', value: 1200 },
      { label: 'Feb', value: 1350 },
      { label: 'Mar', value: 1580 },
      { label: 'Apr', value: 1420 },
      { label: 'May', value: 1650 },
      { label: 'Jun', value: 1890 },
    ]
  };

  const currentData = attendanceData[timeframe] || attendanceData.week;
  const maxValue = Math.max(...currentData.map(d => d.value));

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const getGroupInviteUrl = (groupName: string) => {
    return `${locationUrl}/join?role=${encodeURIComponent(groupName)}`;
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={() => router.push('/main/manage-organization')} className="back-btn-header">
          <ArrowLeft size={18} /> Back to Network
        </Button>
        <div className="header-content-wrapper">
          <div className="location-badge-section">
            <div className="location-badge">Active Location</div>
            <h1>{locationName}</h1>
            <p>Direct management of this location's operations and intelligence.</p>
          </div>
        </div>

        <div className="location-management-hub">
          <Card 
            className={`hub-card-premium ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
            style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease', border: activeTab === 'performance' ? '2px solid var(--blue)' : '1px solid var(--border-light)', background: activeTab === 'performance' ? 'var(--blue-subtle)' : 'white' }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="hub-card-icon-box" style={{ width: '40px', height: '40px', borderRadius: '12px', background: activeTab === 'performance' ? 'var(--blue)' : 'var(--bg)', color: activeTab === 'performance' ? 'white' : 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Performance</strong>
                <span className="hub-card-desc" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Analytics and growth tracking</span>
              </div>
            </div>
          </Card>

          <Card 
            className={`hub-card-premium ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease', border: activeTab === 'users' ? '2px solid var(--blue)' : '1px solid var(--border-light)', background: activeTab === 'users' ? 'var(--blue-subtle)' : 'white' }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="hub-card-icon-box" style={{ width: '40px', height: '40px', borderRadius: '12px', background: activeTab === 'users' ? 'var(--blue)' : 'var(--bg)', color: activeTab === 'users' ? 'white' : 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Users & Groups</strong>
                <span className="hub-card-desc" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Manage members and team assets</span>
              </div>
            </div>
          </Card>

          <Card 
            className={`hub-card-premium ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease', border: activeTab === 'settings' ? '2px solid var(--blue)' : '1px solid var(--border-light)', background: activeTab === 'settings' ? 'var(--blue-subtle)' : 'white' }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="hub-card-icon-box" style={{ width: '40px', height: '40px', borderRadius: '12px', background: activeTab === 'settings' ? 'var(--blue)' : 'var(--bg)', color: activeTab === 'settings' ? 'white' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Settings</strong>
                <span className="hub-card-desc" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Location config and security</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mobile-hub-description animate-fade-in" style={{ textAlign: 'center', padding: '16px 20px', marginTop: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
            {activeTab === 'performance' && "Analytics and growth tracking"}
            {activeTab === 'users' && "Manage members and team assets"}
            {activeTab === 'settings' && "Location config and security"}
          </p>
        </div>
      </div>

      <div className="location-content-area" style={{ marginTop: (activeTab === 'users' && groupViewState === 'details') ? '8px' : '24px' }}>
        {activeTab === 'performance' && (
        <div className="fade-in">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <Card key={i} className="stat-card">
                <div className={`stat-icon-box ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">{stat.label}</p>
                  <h2 className="stat-value">{stat.value}</h2>
                  <div className={`stat-change ${stat.isUp ? 'positive' : 'negative'}`}>
                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{stat.change} this month</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* ... existing chart layout below ... */}

      <div className="performance-layout-grid">
        <Card className="chart-placeholder-card main-chart">
          <div className="card-header">
            <h3>Attendance Overview</h3>
            <div className="chart-filters">
              <span 
                className={timeframe === 'week' ? 'active' : ''} 
                onClick={() => setTimeframe('week')}
              >Week</span>
              <span 
                className={timeframe === 'month' ? 'active' : ''} 
                onClick={() => setTimeframe('month')}
              >Month</span>
              <span 
                className={timeframe === 'year' ? 'active' : ''} 
                onClick={() => setTimeframe('year')}
              >Year</span>
            </div>
          </div>
          <div className="attendance-chart-container">
            <div className="chart-y-axis">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.66)}</span>
              <span>{Math.round(maxValue * 0.33)}</span>
              <span>0</span>
            </div>
            <div className="chart-main-area">
              <div className="chart-grid-lines">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
              </div>
              <div className="chart-bars">
                {currentData.map((d, i) => (
                  <div key={i} className="chart-bar-wrapper">
                    <div className="bar-tooltip">{d.value}</div>
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${(d.value / maxValue) * 100}%` }}
                    ></div>
                    <span className="bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="performance-breakdown-card">
          <div className="card-header">
            <h3>Recent Milestones</h3>
          </div>
          <div className="milestone-list">
            {[
              { label: 'Highest Attendance', value: '245 people', date: 'Last Sunday', icon: Calendar },
              { label: 'Most Invites Sent', value: '182 invites', date: '2 days ago', icon: Users },
              { label: 'New Record Conversion', value: '78%', date: 'March 2026', icon: Target },
            ].map((m, i) => (
              <div key={i} className="milestone-item">
                <div className="m-icon"><m.icon size={18} /></div>
                <div className="m-info">
                  <p className="m-label">{m.label}</p>
                  <p className="m-value">{m.value}</p>
                </div>
                <span className="m-date">{m.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )}

  {activeTab === 'users' && (
        <div className="fade-in">
          <div className="users-management-header">
            <div className="search-and-filter">
              {groupViewState === 'grid' && (
                <div className="premium-search-bar">
                  <Search size={18} />
                  <input type="text" placeholder="Search groups..." />
                </div>
              )}
            </div>
            <div className="user-actions">
              {groupViewState === 'grid' && (
                <>
                  <Button variant="outline" style={{ gap: '8px' }} onClick={exportContacts}>
                    <DownloadCloud size={18} /> Export All
                  </Button>
                  <Button variant="ghost" style={{ gap: '8px' }} className="btn-network-pill" onClick={() => { setImportType('group'); setIsImportNetworkModalOpen(true); }}>
                    <Layers size={18} /> <span>Import Network</span>
                  </Button>
                  <Button className="btn-premium" style={{ gap: '8px' }} onClick={() => setIsCreateGroupModalOpen(true)}>
                    <Plus size={18} /> Create Group
                  </Button>
                </>
              )}
            </div>
          </div>

          {groupViewState === 'grid' ? (
            <div className="groups-premium-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {Object.entries(groupedUsers).map(([groupName, members]) => (
                <Card 
                  key={groupName} 
                  className="group-card-premium fade-in"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid var(--border-light)' }}
                  onClick={() => { 
                    setSelectedGroupName(groupName); 
                    setGroupViewState('details');
                    setGroupSubView('home');
                  }}
                >
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div className="group-info-main">
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{groupName}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>{groupDescriptions[groupName] || 'No description available.'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ width: '36px', height: '36px', padding: '0', borderRadius: '10px', color: 'var(--blue)', background: 'var(--blue-subtle)' }}
                            onClick={() => router.push(`/main/messages?target=group&name=${groupName}&location=${locationName}`)}
                          >
                            <Smartphone size={16} />
                          </Button>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--blue)', textTransform: 'uppercase' }}>SMS</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ width: '36px', height: '36px', padding: '0', borderRadius: '10px', background: 'var(--bg)' }}
                            onClick={() => {
                              setSelectedRoleForForm(groupName);
                              setFormFields([]);
                              setEditingFormId(null);
                              setFormConfig({ title: '', description: '', status: 'draft', lastSaved: null });
                              setIsFormBuilderOpen(true);
                            }}
                          >
                            <Plus size={16} />
                          </Button>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Form</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ width: '36px', height: '36px', padding: '0', borderRadius: '10px', background: 'var(--bg)' }}
                            onClick={() => {
                              setSelectedGroupSettings(groupName);
                              setIsGroupSettingsModalOpen(true);
                            }}
                          >
                            <BarChart3 size={16} />
                          </Button>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Setup</span>
                        </div>

                        {groupName !== 'Admin' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              style={{ width: '36px', height: '36px', padding: '0', borderRadius: '10px', background: 'var(--bg)' }}
                              onClick={() => setSelectedGroupForQR(groupName)}
                            >
                              <QrCode size={16} />
                            </Button>
                            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>QR</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                       <div className="avatar-group" style={{ display: 'flex' }}>
                          {members.slice(0, 3).map((m, idx) => (
                            <div 
                              key={m.id} 
                              style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                background: 'var(--blue-subtle)', 
                                border: '2px solid white', 
                                marginLeft: idx === 0 ? 0 : '-10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '700',
                                color: 'var(--blue)'
                              }}
                            >
                              {m.name[0]}
                            </div>
                          ))}
                          {members.length > 3 && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid white', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)' }}>
                              +{members.length - 3}
                            </div>
                          )}
                          {members.length === 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No members yet</div>
                          )}
                       </div>
                       <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         {members.length} {members.length === 1 ? 'Member' : 'Members'} <ChevronRight size={14} />
                       </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="group-detail-view fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (groupSubView === 'home') {
                        setGroupViewState('grid');
                      } else {
                        setGroupSubView('home');
                      }
                    }} style={{ padding: '0', width: '32px', height: '32px', background: 'var(--bg)', borderRadius: '10px' }}>
                      <ArrowLeft size={18} />
                    </Button>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.04em' }}>{selectedGroupName}</h2>
                  </div>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>
                    {groupSubView === 'home' && `Overview of assets and management for the ${selectedGroupName} group.`}
                    {groupSubView === 'members' && `Managing member roster and permissions for ${selectedGroupName}.`}
                    {groupSubView === 'forms' && `Advanced form builder and response tracking for ${selectedGroupName}.`}
                  </p>
                </div>
             </div>

             {groupSubView === 'home' && (
               <div className="group-home-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  <Card 
                    className="action-card-premium" 
                    style={{ padding: '32px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--border-light)' }}
                    onClick={() => setGroupSubView('members')}
                  >
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--blue-subtle)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <Users size={32} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Members</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: '1.6', marginBottom: '20px' }}>
                      Add members, bulk import users, and manage group administrative permissions.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)' }}>{groupedUsers[selectedGroupName || '']?.length || 0} Members</span>
                      <ChevronRight size={18} color="var(--blue)" />
                    </div>
                  </Card>

                  <Card 
                    className="action-card-premium" 
                    style={{ padding: '32px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--border-light)' }}
                    onClick={() => setGroupSubView('forms')}
                  >
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--purple-subtle)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <FileText size={32} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Forms</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: '1.6', marginBottom: '20px' }}>
                      Create advanced forms, manage data collection, and analyze group responses.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--purple)' }}>{groupForms[selectedGroupName || '']?.length || 0} Forms</span>
                      <ChevronRight size={18} color="var(--purple)" />
                    </div>
                  </Card>
               </div>
             )}

              {groupSubView === 'members' && (
                <>
                  <div className="members-view-header animate-fade-in">
                    <div className="header-title-search">
                      <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Group Members</h3>
                      <div className="premium-search-bar">
                        <Search size={16} />
                        <input type="text" placeholder={`Search in ${selectedGroupName}...`} />
                      </div>
                    </div>
                    <div className="action-buttons-group">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="btn-sms-group"
                        style={{ gap: '8px', color: 'var(--blue)', borderColor: 'var(--blue)', background: 'var(--blue-subtle)' }} 
                        onClick={() => router.push(`/main/messages?target=group&name=${selectedGroupName}&location=${locationName}`)}
                      >
                        <MessageSquare size={16} /> <span className="btn-text">Send SMS</span>
                      </Button>
                      <Button variant="outline" size="sm" className="btn-import-pill" onClick={() => setIsImportModalOpen(true)}>
                        <FileUp size={16} /> <span className="btn-text">Import</span>
                      </Button>
                      <Button className="btn-premium" size="sm" onClick={() => {
                        setUserType(selectedGroupName === 'Admin' ? 'admin' : 'others');
                        setIsAddUserModalOpen(true);
                      }}>
                        <Plus size={16} /> <span className="btn-text">Add Member</span>
                      </Button>
                    </div>
                  </div>
                  <Card className="user-list-card-premium">
                    <table className="location-users-table">
                      <thead>
                        <tr>
                          <th>Member Details</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedUsers[selectedGroupName || '']?.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="user-avatar-tiny">{u.name[0]}</div>
                                <div>
                                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{u.name}</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge-mini ${u.status.toLowerCase()}`}>{u.status}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <a 
                                  href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="whatsapp-btn-tiny"
                                  title="WhatsApp Chat"
                                >
                                  <MessageCircle size={16} />
                                </a>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  style={{ width: '32px', height: '32px', padding: '0', borderRadius: '8px', background: 'var(--blue-subtle)', color: 'var(--blue)' }}
                                  onClick={() => router.push(`/main/messages?target=individual&phone=${u.phone}&name=${u.name}`)}
                                  title="Send SMS"
                                >
                                  <Smartphone size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(u); setIsUserActionModalOpen(true); }}><MoreHorizontal size={16} /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </>
              )}

             {groupSubView === 'forms' && (
               <div className="group-forms-view fade-in">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Created Forms</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="btn-import-pill"
                        onClick={() => {
                          setImportType('form');
                          setIsImportNetworkModalOpen(true);
                        }}
                      >
                        <Layers size={16} /> Import from Network
                      </Button>
                      <Button 
                        className="btn-premium" 
                        size="sm" 
                        style={{ gap: '8px' }}
                        onClick={() => {
                          setSelectedRoleForForm(selectedGroupName);
                          setFormFields([]);
                          setEditingFormId(null);
                          setFormConfig({ title: '', description: '', status: 'draft', lastSaved: null });
                          setIsFormBuilderOpen(true);
                        }}
                      >
                        <Plus size={16} /> Create New Form
                      </Button>
                    </div>
                 </div>
                 
                 <div className="forms-grid-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {(groupForms[selectedGroupName || ''] || []).length === 0 ? (
                      <div className="empty-forms-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'var(--bg)', borderRadius: '24px', border: '1px dashed var(--border-light)' }}>
                         <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-tertiary)', boxShadow: 'var(--shadow-sm)' }}>
                            <FileText size={32} />
                         </div>
                         <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>No forms created yet</h4>
                         <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '280px', margin: '0 auto' }}>
                           Create your first form to start collecting data from {selectedGroupName} members.
                         </p>
                      </div>
                    ) : (
                      groupForms[selectedGroupName || ''].map(form => (
                        <Card key={form.id} className="form-item-card-premium" style={{ padding: '20px', border: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                             <div>
                               {editingFormTitleId === form.id ? (
                                 <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                   <input 
                                     autoFocus
                                     value={tempFormTitle} 
                                     onChange={(e) => setTempFormTitle(e.target.value)}
                                     onBlur={() => handleQuickTitleSave(form.id)}
                                     onKeyDown={(e) => e.key === 'Enter' && handleQuickTitleSave(form.id)}
                                     style={{ fontSize: '14px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--blue)' }}
                                   />
                                 </div>
                               ) : (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                   <h4 style={{ fontWeight: '800', fontSize: '16px', margin: 0 }}>{form.title || 'Untitled Form'}</h4>
                                   <Button variant="ghost" size="sm" style={{ padding: '4px', height: 'auto' }} onClick={() => { setEditingFormTitleId(form.id); setTempFormTitle(form.title || ''); }}>
                                     <Edit2 size={12} />
                                   </Button>
                                 </div>
                               )}
                               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                 <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{form.fields.length} Fields</p>
                                 <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }} />
                                 <p style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: '700' }}>
                                   <QrCode size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                   {form.analytics?.scans || 0} Scans
                                 </p>
                               </div>
                             </div>
                             <span style={{ 
                               padding: '4px 8px', 
                               borderRadius: '6px', 
                               fontSize: '10px', 
                               fontWeight: '800', 
                               background: form.status === 'published' ? 'var(--green-subtle)' : 'var(--bg)',
                               color: form.status === 'published' ? 'var(--green)' : 'var(--text-tertiary)',
                               textTransform: 'uppercase'
                             }}>
                               {form.status}
                             </span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                             <Button variant="outline" size="sm" fullWidth style={{ fontSize: '12px' }} onClick={() => {
                               setSelectedFormForResponses(form);
                               setIsResponsesModalOpen(true);
                             }}>
                               <BarChart3 size={14} style={{ marginRight: '6px' }} /> Responses
                             </Button>
                             <Button variant="outline" size="sm" fullWidth style={{ fontSize: '12px' }} onClick={() => {
                               setSelectedRoleForForm(selectedGroupName);
                               setFormConfig(form);
                               setFormFields(form.fields);
                               setEditingFormId(form.id);
                               setIsFormBuilderOpen(true);
                             }}>
                               <Edit2 size={14} style={{ marginRight: '6px' }} /> Edit
                             </Button>
                             <Button variant="outline" size="sm" style={{ minWidth: '40px', padding: '0' }} onClick={() => {
                                setPublishedFormUrl(`https://vangly.app/f/${form.id}`);
                                setIsPublishSuccessOpen(true);
                             }}>
                                <Link size={14} />
                             </Button>
                             <Button variant="outline" size="sm" style={{ minWidth: '40px', padding: '0' }} onClick={() => {
                                setSelectedFormForDist(form);
                                setEditingFormId(form.id);
                                setIsDistributionModalOpen(true);
                              }}>
                                <Users size={14} />
                              </Button>
                          </div>
                        </Card>
                      ))
                    )}
                 </div>
               </div>
             )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="fade-in">
          <div className="performance-layout-grid">
            <Card className="performance-breakdown-card">
              <div className="card-header">
                <h3>General Configuration</h3>
              </div>
              <div className="config-list-premium">
                 <div className="config-item-row">
                    <div className="config-label">Location Status</div>
                    <div className="config-value" style={{ color: 'var(--green)', fontWeight: '700' }}>Active</div>
                 </div>
                 <div className="config-item-row">
                    <div className="config-label">Primary Admin</div>
                    <div className="config-value">John Admin</div>
                 </div>
                 <div className="config-item-row">
                    <div className="config-label">Security Protocol</div>
                    <div className="config-value">6-Digit PIN</div>
                 </div>
              </div>
              <Button fullWidth variant="outline" style={{ marginTop: '20px' }}>Edit Basic Info</Button>
            </Card>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      <Modal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)}
        title={`Add to ${selectedGroupName}`}
      >
        <div className="add-user-flow-premium fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="modal-intro-section" style={{ marginBottom: '8px' }}>
               <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                 Registering a new member to the <strong>{selectedGroupName}</strong> group.
               </p>
            </div>

            <Input 
              label="Full Name" 
              placeholder="e.g. John Doe" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
            
            <div className="form-row-premium">
              <div className="form-col-premium">
                <Input 
                  label="Phone Number" 
                  placeholder="+234..." 
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              <div className="form-col-premium">
                <Input 
                  label="Email Address" 
                  placeholder="email@example.com" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
            </div>

            <div className="group-admin-setup" style={{ padding: '20px', background: 'var(--blue-subtle)', borderRadius: '16px', border: '1px solid var(--blue-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue)', fontWeight: '800' }}>
                  <Shield size={16} /> Make Group Admin
                </h4>
                <input 
                  type="checkbox" 
                  checked={newUser.isGroupAdmin}
                  onChange={(e) => setNewUser({...newUser, isGroupAdmin: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
                A <strong>Group Admin</strong> has the authority to manage other members specifically within this group. They can add, edit, or remove members from the {selectedGroupName} team.
              </p>
            </div>

            {/* Form Assignment Section */}
            {(groupForms[selectedGroupName || ''] || []).length > 0 && (
              <div className="form-assignment-setup" style={{ padding: '20px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>Add to Existing Forms</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Automatically assign this user to group forms.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={shouldAssignForms}
                    onChange={(e) => setShouldAssignForms(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                {shouldAssignForms && (
                  <div className="form-selection-flow animate-fade-in">
                    <div className="premium-search-bar" style={{ margin: '0 0 12px 0', padding: '8px 12px' }}>
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Search forms..." 
                        style={{ fontSize: '12px' }} 
                        value={formSearchQuery}
                        onChange={(e) => setFormSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                       <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Select Forms</span>
                       <button 
                        style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          const allIds = groupForms[selectedGroupName || ''].map(f => f.id);
                          setNewUserForms(newUserForms.length === allIds.length ? [] : allIds);
                        }}
                       >
                         {newUserForms.length === groupForms[selectedGroupName || '']?.length ? 'Deselect All' : 'Select All'}
                       </button>
                    </div>

                    <div className="form-options-list" style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(groupForms[selectedGroupName || ''] || [])
                        .filter(f => f.title.toLowerCase().includes(formSearchQuery.toLowerCase()))
                        .map(form => (
                        <label key={form.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'white', borderRadius: '10px', border: '1px solid var(--border-light)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={newUserForms.includes(form.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked 
                                ? [...newUserForms, form.id]
                                : newUserForms.filter(id => id !== form.id);
                              setNewUserForms(newIds);
                            }}
                          />
                          <div>
                            <span style={{ display: 'block', fontSize: '13px', fontWeight: '700' }}>{form.title}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{form.fields.length} Fields</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
              <Button className="btn-premium" onClick={handleAddUser} disabled={!newUser.name || !newUser.phone}>
                Complete Registration
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Import Contacts Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={groupViewState === 'details' ? `Import to ${selectedGroupName}s` : "Bulk Import Contacts"}
      >
        <div className="import-modal-content fade-in">
          <div className="upload-placeholder-zone-premium" style={{ marginBottom: '24px' }}>
            <div className="upload-icon-box">
              <FileUp size={24} />
            </div>
            <div className="upload-text">
              <p className="main-text">Click to upload or drag & drop</p>
              <p className="sub-text">Support CSV, Excel files (Max 10MB)</p>
            </div>
          </div>

          {groupViewState === 'grid' && (
            <div className="target-group-selector" style={{ marginBottom: '24px' }}>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Target Group</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.keys(groupedUsers).map(group => (
                  <Button 
                    key={group} 
                    variant={selectedGroupName === group ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGroupName(group)}
                    style={{ fontSize: '12px' }}
                  >
                    {group}s
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="import-guide" style={{ background: 'var(--bg)', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Import Instructions</h4>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
              <li>File should contain <strong>Name</strong> and <strong>Phone</strong>.</li>
              <li>Contacts will be imported directly into the <strong>{groupViewState === 'details' ? selectedGroupName : (selectedGroupName || 'selected')}</strong> group.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
             <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>Close</Button>
             <Button className="btn-premium" disabled={groupViewState === 'grid' && !selectedGroupName}>Process Import</Button>
          </div>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Users"
      >
        <div className="filter-modal-content fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="filter-group">
              <label className="input-label" style={{ display: 'block', marginBottom: '12px' }}>By Category / Role</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['All', 'Admin', 'Worker', 'Staff', 'Volunteer', 'Member'].map(cat => (
                  <span key={cat} className="suggestion-tag" onClick={() => setIsFilterModalOpen(false)}>{cat}</span>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="input-label" style={{ display: 'block', marginBottom: '12px' }}>By Status</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(false)}>Active Only</Button>
                <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(false)}>Inactive</Button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
               <Button variant="ghost" onClick={() => setIsFilterModalOpen(false)}>Clear Filters</Button>
               <Button className="btn-premium" onClick={() => setIsFilterModalOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* User Actions Modal */}
      <Modal
        isOpen={isUserActionModalOpen}
        onClose={() => setIsUserActionModalOpen(false)}
        title={selectedUser ? `Manage ${selectedUser.name}` : 'User Actions'}
      >
        <div className="user-actions-modal-content fade-in">
          {selectedUser && (
            <div className="selected-user-preview" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
               <div className="user-avatar-tiny" style={{ width: '48px', height: '48px', fontSize: '18px' }}>{selectedUser.name[0]}</div>
               <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedUser.name}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{selectedUser.role} • {selectedUser.status}</p>
               </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <Button 
              variant="outline" 
              fullWidth 
              style={{ gap: '8px', color: 'var(--blue)', background: 'var(--blue-subtle)', border: '1px solid var(--blue)', height: '48px', fontWeight: '700' }}
              onClick={() => router.push(`/main/messages?target=individual&phone=${selectedUser?.phone}&name=${selectedUser?.name}`)}
            >
              <Smartphone size={18} /> SMS
            </Button>
            <a 
              href={`https://wa.me/${selectedUser?.phone?.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ flex: 1 }}
            >
              <Button 
                variant="outline" 
                fullWidth 
                style={{ gap: '8px', color: '#128C7E', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #128C7E', height: '48px', fontWeight: '700' }}
              >
                <MessageCircle size={18} /> WhatsApp
              </Button>
            </a>
          </div>
          
          <div className="action-buttons-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start', gap: '12px', color: 'var(--blue)' }} onClick={() => {
                setEditingUser(selectedUser);
                setIsEditUserModalOpen(true);
                setIsUserActionModalOpen(false);
             }}>
                <Search size={18} /> Edit User Details
             </Button>
             <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start', gap: '12px' }} onClick={() => setIsUserActionModalOpen(false)}>
                <Mail size={18} /> Send Individual Message
             </Button>
             <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start', gap: '12px' }} onClick={() => setIsUserActionModalOpen(false)}>
                <Share size={18} /> Transfer to Another Location
             </Button>
             <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start', gap: '12px', color: 'var(--orange)' }} onClick={() => setIsUserActionModalOpen(false)}>
                <Shield size={18} /> Reset Dashboard Password
             </Button>
             <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 0' }}></div>
             <Button variant="ghost" fullWidth style={{ justifyContent: 'flex-start', gap: '12px', color: 'var(--red)' }} onClick={() => {
                setLocationUsers(locationUsers.filter(u => u.id !== selectedUser?.id));
                setIsUserActionModalOpen(false);
             }}>
                <Trash2 size={18} /> Remove User from Location
             </Button>
          </div>
        </div>
      </Modal>

      {/* Group QR Modal */}
      <Modal
        isOpen={!!selectedGroupForQR}
        onClose={() => setSelectedGroupForQR(null)}
        title={`${selectedGroupForQR} Group Invite`}
      >
        <div className="group-qr-modal-content fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '12px 0' }}>
          <div className="qr-container-premium" style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <QRCodeSVG
              id="group-invite-qr"
              value={selectedGroupForQR ? getGroupInviteUrl(selectedGroupForQR) : ''}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Organization Logo Placeholder
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Join {selectedGroupForQR}s</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '280px' }}>
              People can scan this code to automatically register and join the {selectedGroupForQR} group for this location.
            </p>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '12px', marginTop: '12px' }}>
             <Button variant="outline" fullWidth onClick={() => {
                const svg = document.getElementById('group-invite-qr');
                if (svg) {
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
                       downloadLink.download = `${selectedGroupForQR}-group-qr.png`;
                       downloadLink.href = pngFile;
                       downloadLink.click();
                     }
                   };
                   img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                }
             }}>
                <Download size={18} /> Download QR
             </Button>
             <Button className="btn-premium" fullWidth onClick={() => {
                navigator.clipboard.writeText(getGroupInviteUrl(selectedGroupForQR || ''));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
             }}>
                <Copy size={18} /> {copied ? 'Copied!' : 'Copy Link'}
             </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title="Edit User Profile"
      >
        <div className="edit-user-modal-content fade-in">
          {editingUser && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input 
                label="Full Name" 
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
              />
              <div className="form-row-premium">
                <div className="form-col-premium">
                  <Input 
                    label="Phone Number" 
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  />
                </div>
                <div className="form-col-premium">
                  <Input 
                    label="Email Address" 
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
              </div>
              <Input 
                label="6-Digit Access PIN" 
                placeholder="000000"
                maxLength={6}
                value={editingUser.pin || ''}
                onChange={(e) => setEditingUser({...editingUser, pin: e.target.value.replace(/[^0-9]/g, '')})}
              />
              <Input 
                label="Assigned Role / Group Name" 
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <Button variant="ghost" onClick={() => setIsEditUserModalOpen(false)}>Cancel</Button>
                <Button className="btn-premium" onClick={handleUpdateUser}>Save Changes</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Group Settings Modal */}
      <Modal
        isOpen={isGroupSettingsModalOpen}
        onClose={() => setIsGroupSettingsModalOpen(false)}
        title={`${selectedGroupSettings} Group Settings`}
      >
        <div className="group-settings-modal-content fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedGroupSettings !== 'Admin' ? (
              <div className="setting-toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>Enable Joining</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Allow people to join this group via Link/QR</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={groupConfigs[selectedGroupSettings || '']?.allowJoin}
                  onChange={(e) => setGroupConfigs({...groupConfigs, [selectedGroupSettings || '']: {...groupConfigs[selectedGroupSettings || ''], allowJoin: e.target.checked}})}
                />
              </div>
            ) : (
              <div className="admin-notice-premium" style={{ padding: '16px', background: 'var(--blue-subtle)', borderRadius: '12px', border: '1px solid var(--blue-light)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--blue)' }}>
                   <Shield size={20} />
                   <div>
                     <strong style={{ fontSize: '14px', display: 'block' }}>Protected Admin Group</strong>
                     <p style={{ fontSize: '12px', opacity: 0.8 }}>Admin roles cannot be joined via public links. They must be manually created by a Super Admin.</p>
                   </div>
                </div>
              </div>
            )}

            <div className="setting-toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Member PIN Setup</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Allow members to set up their own 6-digit PIN</span>
              </div>
              <input 
                type="checkbox" 
                checked={groupConfigs[selectedGroupSettings || '']?.allowPin}
                onChange={(e) => setGroupConfigs({...groupConfigs, [selectedGroupSettings || '']: {...groupConfigs[selectedGroupSettings || ''], allowPin: e.target.checked}})}
              />
            </div>

            <div className="setting-toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '12px', opacity: 0.6 }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>SMS OTP Verification</strong>
                <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: '600' }}>Coming Soon • Premium</span>
              </div>
              <div style={{ padding: '4px 10px', background: 'var(--blue-subtle)', borderRadius: '6px', fontSize: '10px', color: 'var(--blue)', fontWeight: '800' }}>LOCKED</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Button className="btn-premium" fullWidth onClick={() => setIsGroupSettingsModalOpen(false)}>Save Group Settings</Button>
            </div>
          </div>
        </div>
      </Modal>      {/* Form Builder Modal - Overhauled */}
      <Modal
        isOpen={isFormBuilderOpen}
        onClose={() => setIsFormBuilderOpen(false)}
        title={previewMode ? `Preview: ${formConfig.title || 'Untitled Form'}` : `Form Builder: ${selectedRoleForForm}`}
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
                    <Button variant="ghost" size="sm" onClick={() => setPreviewMode('mobile')} title="Preview Form">
                      <Eye size={18} /> <span className="hide-mobile">Preview</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSaveDraft()}>
                       Save Draft
                     </Button>
                    <Button 
                      className="btn-premium" 
                      size="sm" 
                      onClick={() => setIsDistributionModalOpen(true)}
                      style={{ opacity: formFields.length === 0 ? 0.5 : 1, pointerEvents: formFields.length === 0 ? 'none' : 'auto' }}
                    >
                      Publish Form
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
                    <div style={{ display: 'flex', marginTop: '16px' }}>
                      <Button 
                        className="btn-premium" 
                        onClick={() => setIsFieldSelectorOpen(true)}
                        style={{ gap: '10px', padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                      >
                        <Plus size={20} /> Add New Field
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Builder Content */}
              <div className="builder-body-scrollable">
                <div className="fields-stack">
                  {formFields.length === 0 ? (
                    <div className="empty-builder-state fade-in" style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '32px', border: '2px dashed var(--border-light)' }}>
                      <div className="empty-icon" style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--blue)' }}>
                        <Layout size={40} />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Your form is empty</h3>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', maxWidth: '300px', margin: '0 auto 24px' }}>
                        Start by adding your first field below to begin building your custom form.
                      </p>
                      <Button 
                        className="btn-premium" 
                        onClick={() => setIsFieldSelectorOpen(true)}
                        style={{ gap: '10px', padding: '14px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}
                      >
                        <Plus size={22} /> Add Your First Field
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

                          {field.type === 'divider' && <div className="divider-preview" />}
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
            /* Preview Mode */
            <div className={`form-preview-overlay fade-in mode-${previewMode}`}>
               <div className="preview-toolbar">
                  <div className="preview-devices">
                    <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}><Smartphone size={18} /></button>
                    <button className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}><Layout size={18} /></button>
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
                               {f.type === 'longtext' && <textarea placeholder="Describe in detail..." readOnly style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-light)', minHeight: '100px', padding: '12px', fontSize: '14px', outline: 'none' }} />}
                               {['radio', 'checkbox', 'yesno'].includes(f.type) && (
                                 <div className="preview-options">
                                   {f.options.map((o: string) => (
                                     <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', marginBottom: '10px', padding: '10px', background: 'var(--bg)', borderRadius: '10px', cursor: 'pointer' }}>
                                       <input type={f.type === 'yesno' ? 'radio' : f.type} disabled style={{ accentColor: 'var(--blue)' }} /> {o}
                                     </label>
                                   ))}
                                 </div>
                               )}
                               {f.type === 'dropdown' && (
                                 <select disabled style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg)', fontSize: '14px' }}>
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
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg)', color: 'var(--text-tertiary)' }}>
                                   <Calendar size={18} /> <span>Pick a {f.type === 'monthday' ? 'date' : f.type}...</span>
                                 </div>
                               )}
                               {['fileupload', 'image'].includes(f.type) && (
                                 <div style={{ padding: '32px', border: '2px dashed var(--border-light)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    <FileUp size={24} style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontSize: '13px' }}>Click or drag {f.type === 'image' ? 'image' : 'file'} to upload</p>
                                 </div>
                               )}
                               {f.type === 'signature' && (
                                 <div style={{ width: '100%', height: '120px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
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
                                 <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '10px' }}>
                                   {[1,2,3,4,5].map(n => <Star key={n} size={32} style={{ color: 'var(--border-light)', cursor: 'pointer' }} />)}
                                 </div>
                               )}
                               {f.type === 'divider' && <hr style={{ border: 'none', borderTop: '2px solid var(--bg)', margin: '12px 0' }} />}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '40px' }}>
                        <Button className="btn-premium" fullWidth>Submit Form</Button>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Form Distribution Modal */}
      <Modal
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        title={editingFormId ? `Update Access: ${selectedFormForDist?.title || 'Form'}` : `Publish Settings: ${formConfig.title || 'Untitled Form'}`}
      >
        <div className="distribution-modal-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: Member Dashboard Visibility */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--blue-subtle)', color: 'var(--blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Member Dashboard Access</h4>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
              Select which members should see this form listed in their private dashboard.
            </p>

            <div className="dist-options" style={{ display: 'flex', gap: '12px' }}>
              {[
                { id: 'all', label: 'All Members', icon: Users },
                { id: 'selected', label: 'Specific Members', icon: CheckCircle },
              ].map(mode => (
                <div 
                  key={mode.id} 
                  className={`dist-mode-card-mini ${formDistribution.memberAccess.mode === mode.id ? 'active' : ''}`}
                  style={{ 
                    flex: 1,
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: '2px solid',
                    borderColor: formDistribution.memberAccess.mode === mode.id ? 'var(--blue)' : 'var(--border-light)',
                    background: formDistribution.memberAccess.mode === mode.id ? 'var(--blue-subtle)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setFormDistribution({...formDistribution, memberAccess: {...formDistribution.memberAccess, mode: mode.id as any}})}
                >
                  <mode.icon size={24} />
                  <strong style={{ fontSize: '13px' }}>{mode.label}</strong>
                </div>
              ))}
            </div>

            {formDistribution.memberAccess.mode === 'selected' && (
              <div className="member-selection-list animate-slide-down" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '16px', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-light)' }}>
                {groupedUsers[selectedGroupName || '']?.map(user => (
                  <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formDistribution.memberAccess.userIds.includes(user.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked 
                          ? [...formDistribution.memberAccess.userIds, user.id]
                          : formDistribution.memberAccess.userIds.filter(id => id !== user.id);
                        setFormDistribution({...formDistribution, memberAccess: {...formDistribution.memberAccess, userIds: newIds}});
                      }}
                    />
                    <span style={{ fontSize: '14px' }}>{user.name}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Public Submission Permissions - Only show if not selecting specific members */}
          {formDistribution.memberAccess.mode !== 'selected' && (
            <section className="animate-slide-down">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--green-subtle)', color: 'var(--green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Form Privacy Settings</h4>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                Control who is allowed to fill and submit this form.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'public', label: 'General Public (Open)', desc: 'Anyone with the link can fill this form.', icon: Share },
                  { id: 'registered', label: 'Registered Members Only', desc: 'Users must be logged into their Vangly account.', icon: LogIn },
                ].map(mode => (
                  <div 
                    key={mode.id}
                    style={{ 
                      padding: '16px', 
                      borderRadius: '16px', 
                      border: '2px solid',
                      borderColor: formDistribution.publicAccess.mode === mode.id ? 'var(--green)' : 'var(--border-light)',
                      background: formDistribution.publicAccess.mode === mode.id ? 'var(--green-subtle)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center'
                    }}
                    onClick={() => setFormDistribution({...formDistribution, publicAccess: { mode: mode.id as any }})}
                  >
                    <div style={{ color: formDistribution.publicAccess.mode === mode.id ? 'var(--green)' : 'var(--text-tertiary)' }}>
                      <mode.icon size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px' }}>{mode.label}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{mode.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

            </section>
          )}

          <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <Button variant="ghost" fullWidth onClick={() => setIsDistributionModalOpen(false)}>Cancel</Button>
            <Button className="btn-premium" fullWidth onClick={() => {
              if (editingFormId) {
                // Just saving settings for existing form
                setGroupForms(prev => {
                  const group = selectedGroupName || 'General';
                  const forms = [...(prev[group] || [])];
                  const idx = forms.findIndex(f => f.id === editingFormId);
                  if (idx !== -1) {
                    forms[idx] = { ...forms[idx], distribution: formDistribution };
                  }
                  return { ...prev, [group]: forms };
                });
                setIsDistributionModalOpen(false);
                setIsFormBuilderOpen(false);
                // DON'T show success modal here as per request
              } else {
                // Actually publish the new form
                handlePublishForm();
              }
            }}>
              {editingFormId ? 'Save Settings' : 'Publish & Distribute'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Field Type Selector (Bottom Sheet Style) */}
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
      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        title="New Organizational Group"
      >
        <div className="create-group-premium-flow fade-in">
          <div className="modal-intro-section" style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
             <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: '1.6' }}>
               Create a dedicated space for your team. Groups allow you to manage members, forms, and security settings in one place.
             </p>
          </div>

          <div className="form-sections-stack" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Identity Section */}
            <section className="form-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--blue-subtle)', color: 'var(--blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Type size={18} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Group Identity</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group-premium">
                  <Input 
                    label="What is the name of this group?" 
                    placeholder="e.g. Media Team, Hospitality, Security..." 
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  />
                  <div className="suggestions-cloud" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Technical', 'Communications', 'Logistics', 'Youth', 'Education', 'Worship'].map(s => (
                      <button 
                        key={s} 
                        className={`suggestion-pill ${newGroup.name === s ? 'active' : ''}`}
                        onClick={() => setNewGroup({...newGroup, name: s})}
                        style={{ 
                          padding: '6px 14px', 
                          background: newGroup.name === s ? 'var(--blue)' : 'var(--bg)', 
                          color: newGroup.name === s ? 'white' : 'var(--text-primary)',
                          border: '1px solid ' + (newGroup.name === s ? 'var(--blue)' : 'var(--border-light)'), 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="textarea-group-premium">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Group Purpose <span title="Briefly describe what this group does for your organization."><Info size={14} style={{ opacity: 0.5 }} /></span>
                  </label>
                  <textarea 
                    placeholder="Describe the responsibilities or goals of this group..." 
                    style={{ width: '100%', minHeight: '100px', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '16px', fontSize: '14px', background: 'var(--bg)', resize: 'vertical', transition: 'border-color 0.2s' }}
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Security & Access Section */}
            <section className="form-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--orange-subtle)', color: 'var(--orange)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Security & Access Control</h4>
              </div>

              <div className="settings-grid-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div 
                  className="setting-card-interactive" 
                  style={{ padding: '16px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => setNewGroup({...newGroup, allowJoin: !newGroup.allowJoin})}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                      <Share size={12} />
                    </div>
                    <input type="checkbox" checked={newGroup.allowJoin} readOnly />
                  </div>
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Public Access</strong>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Allow people to join via Link or QR code.</p>
                </div>

                <div 
                  className="setting-card-interactive" 
                  style={{ padding: '16px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => setNewGroup({...newGroup, allowPin: !newGroup.allowPin})}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                      <LogIn size={12} />
                    </div>
                    <input type="checkbox" checked={newGroup.allowPin} readOnly />
                  </div>
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>PIN Security</strong>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Require a 6-digit PIN for dashboard access.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <Button variant="ghost" onClick={() => setIsCreateGroupModalOpen(false)} style={{ fontWeight: '600' }}>Cancel</Button>
            <Button 
              className="btn-premium" 
              onClick={handleCreateGroup} 
              disabled={!newGroup.name}
              style={{ padding: '0 32px', height: '48px', fontSize: '14px' }}
            >
              Initialize Group
            </Button>
          </div>
        </div>
      </Modal>

      {/* Network Import Modal */}
      <Modal isOpen={isImportNetworkModalOpen} onClose={() => setIsImportNetworkModalOpen(false)} title="Network Import">
        <div className="network-import-container" style={{ padding: '32px', maxWidth: '500px' }}>
          <div className="modal-header-premium" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--blue-subtle)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                <Layers size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.02em' }}>Network Import</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Replicate configurations across your organization</p>
              </div>
            </div>
          </div>

          {!sourceLocation ? (
            <div className="location-selector animate-fade-in">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Select Source Location</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {networkLocations.map(loc => (
                  <Card 
                    key={loc.id} 
                    className="location-select-card"
                    style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid var(--border-light)' }}
                    onClick={() => setSourceLocation(loc.name)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '15px' }}>{loc.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {importType === 'group' ? `${loc.groups.length} Groups available` : `${loc.forms.length} Forms available`}
                        </span>
                      </div>
                      <ChevronRight size={18} color="var(--text-tertiary)" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="item-selector animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Button variant="ghost" size="sm" onClick={() => { setSourceLocation(''); setSelectedNetworkItems([]); }} style={{ gap: '6px', padding: 0 }}>
                  <ArrowLeft size={16} /> Back to Locations
                </Button>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)' }}>{sourceLocation}</span>
              </div>

              <div className="premium-search-bar" style={{ marginBottom: '20px' }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder={`Search ${importType}s...`} 
                  value={networkSearchQuery}
                  onChange={(e) => setNetworkSearchQuery(e.target.value)}
                />
              </div>

              <div className="selection-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                {(importType === 'group' 
                  ? networkLocations.find(l => l.name === sourceLocation)?.groups 
                  : networkLocations.find(l => l.name === sourceLocation)?.forms
                )?.filter(item => item.toLowerCase().includes(networkSearchQuery.toLowerCase()))
                .map(item => (
                  <div 
                    key={item}
                    onClick={() => {
                      if (selectedNetworkItems.includes(item)) {
                        setSelectedNetworkItems(selectedNetworkItems.filter(i => i !== item));
                      } else {
                        setSelectedNetworkItems([...selectedNetworkItems, item]);
                      }
                    }}
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid',
                      borderColor: selectedNetworkItems.includes(item) ? 'var(--blue)' : 'var(--border-light)',
                      background: selectedNetworkItems.includes(item) ? 'var(--blue-subtle)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item}</span>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '6px', 
                      border: '2px solid',
                      borderColor: selectedNetworkItems.includes(item) ? 'var(--blue)' : 'var(--border-light)',
                      background: selectedNetworkItems.includes(item) ? 'var(--blue)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedNetworkItems.includes(item) && <Check size={14} color="white" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer-premium" style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{selectedNetworkItems.length} selected</span>
                <Button 
                  className="btn-premium" 
                  disabled={selectedNetworkItems.length === 0}
                  onClick={handleImportNetworkItems}
                  style={{ padding: '0 24px' }}
                >
                  Import {importType === 'group' ? 'Groups' : 'Forms'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Form Publication Success Modal */}
      <Modal
        isOpen={isPublishSuccessOpen}
        onClose={() => setIsPublishSuccessOpen(false)}
        title="Publication Successful!"
      >
        <div className="publish-success-content fade-in" style={{ textAlign: 'center', padding: '12px 0' }}>
          <div className="success-check-premium animate-bounce-slow" style={{ width: '80px', height: '80px', background: 'var(--green-subtle)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShieldCheck size={48} />
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Form is Live!</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', marginBottom: '32px' }}>
            Your form has been published and is now ready for distribution.
          </p>

          {/* Form Link Section */}
          <div className="link-copy-container" style={{ background: 'var(--bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Public Form Link</span>
              <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '800' }}>ONLINE</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                readOnly 
                value={publishedFormUrl}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', outline: 'none' }}
              />
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(publishedFormUrl); alert("Link copied!"); }}>
                <Copy size={16} />
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="qr-preview-section" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={18} color="var(--blue)" />
                  <span style={{ fontSize: '14px', fontWeight: '800' }}>QR Configuration</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '700' }}>Add Logo</span>
                  <div 
                    onClick={() => setFormDistribution({...formDistribution, addLogoToQR: !formDistribution.addLogoToQR})}
                    style={{ 
                      width: '36px', 
                      height: '20px', 
                      background: formDistribution.addLogoToQR ? 'var(--blue)' : 'var(--border)', 
                      borderRadius: '10px', 
                      padding: '2px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', transform: `translateX(${formDistribution.addLogoToQR ? '16px' : '0'})`, transition: 'all 0.2s' }} />
                  </div>
               </div>
            </div>

            <div className="qr-container-premium" style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
              <QRCodeSVG
                id="published-qr-svg"
                value={publishedFormUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={formDistribution.addLogoToQR ? {
                  src: "https://vangly.app/logo-circle.png", // This would be Org Logo, defaults to system logo
                  height: 48,
                  width: 48,
                  excavate: true,
                } : undefined}
              />
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Button className="btn-premium" onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} style={{ gap: '10px' }}>
                  <Download size={18} /> Download QR
                </Button>
                
                {isDownloadMenuOpen && (
                  <div className="download-dropdown animate-slide-up" style={{ position: 'absolute', bottom: '100%', left: '0', width: '100%', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 -8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '8px', zIndex: 10 }}>
                    {['PNG', 'JPG', 'SVG', 'PDF'].map(format => (
                      <div 
                        key={format} 
                        className="download-option" 
                        style={{ padding: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--bg)' }}
                        onClick={() => {
                          setIsDownloadMenuOpen(false);
                          alert(`Downloading as ${format}...`); // Simple mock for format logic
                        }}
                      >
                        Download as {format}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => window.open(publishedFormUrl, '_blank')} style={{ gap: '10px' }}>
                <ExternalLink size={18} /> Preview
              </Button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
            <Button variant="ghost" fullWidth onClick={() => setIsPublishSuccessOpen(false)} style={{ fontSize: '15px', fontWeight: '800' }}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Form Responses Modal */}
      <Modal
        isOpen={isResponsesModalOpen}
        onClose={() => setIsResponsesModalOpen(false)}
        title={`Responses: ${selectedFormForResponses?.title || 'Form'}`}
        size="full"
      >
        <div className="responses-view fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div>
                <h3 style={{ fontSize: '20px', fontWeight: '900' }}>Submission Data</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Analyze responses collected for this form.</p>
             </div>
             <Button variant="outline" style={{ gap: '8px' }}>
                <Download size={18} /> Export CSV
             </Button>
          </div>

          <Card style={{ overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="location-users-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    {selectedFormForResponses?.fields.filter((f: any) => f.type !== 'divider' && f.type !== 'paragraph').map((f: any) => (
                      <th key={f.id}>{f.title || 'Untitled Field'}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i}>
                      <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>2026-05-12 10:2{i} AM</td>
                      {selectedFormForResponses?.fields.filter((f: any) => f.type !== 'divider' && f.type !== 'paragraph').map((f: any) => (
                        <td key={f.id}>
                          <div style={{ maxWidth: '200px' }}>
                            <span style={{ fontSize: '13px' }}>
                              {f.type === 'longtext' ? (
                                <>
                                  {"Sample long response text that needs to be truncated for better table layout...".substring(0, 30)}...
                                  <button 
                                    onClick={() => setSelectedFullResponse({ field: f.title, value: "Sample long response text that needs to be truncated for better table layout in this specific view." })}
                                    style={{ color: 'var(--blue)', fontWeight: '700', fontSize: '11px', background: 'none', border: 'none', marginLeft: '4px', cursor: 'pointer' }}
                                  >
                                    View More
                                  </button>
                                </>
                              ) : "Sample Data"}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Modal>

      {/* Full Response Detail Modal */}
      <Modal
        isOpen={!!selectedFullResponse}
        onClose={() => setSelectedFullResponse(null)}
        title={selectedFullResponse?.field || "Response Detail"}
      >
        <div style={{ padding: '12px' }}>
           <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)', lineHeight: '1.6', fontSize: '15px' }}>
              {selectedFullResponse?.value}
           </div>
           <Button variant="ghost" fullWidth onClick={() => setSelectedFullResponse(null)} style={{ marginTop: '24px', fontWeight: '700' }}>Close</Button>
        </div>
      </Modal>

      </div>
    </div>
  );
}

export default function LocationPerformancePage() {
  return (
    <Suspense fallback={<div>Loading location performance...</div>}>
      <LocationPerformanceContent />
    </Suspense>
  );
}
