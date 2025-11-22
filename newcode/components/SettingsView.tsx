
import React, { useState } from 'react';
import { Project, ProjectType, PricingConfig, Agent, SecurityConfig, EmailTemplate, IntegrationConfig, RoleConfig, Permission, ModuleName, DataScope, Lead, AutomationTrigger, DLTTemplate, WABATemplate, FormField, LedgerMapping } from '../types';
import { DEFAULT_ROLES, MODULE_LIST, MOCK_TRIGGERS, MOCK_DLT_TEMPLATES, MOCK_WABA_TEMPLATES, MOCK_LEDGERS } from '../constants';
import { Plus, Trash2, MapPin, AlertCircle, ExternalLink, LayoutGrid, Users, Building, CreditCard, List, Zap, Save, ChevronRight, UserCheck, X, Key, Smartphone, Link, Globe, Mail, Code, FileSpreadsheet, ArrowRight, Copy, Database, Import, Shield, ShieldAlert, Lock, CheckSquare, Square, Eye, Edit3, Upload, ShieldCheck, Network, LogOut, UserMinus, MessageSquare, Bot, ToggleLeft, ToggleRight, AlertTriangle, RefreshCw, Info, FileText, Activity } from 'lucide-react';
import Tooltip from './Tooltip';

interface SettingsViewProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  campaigns: string[];
  setCampaigns: React.Dispatch<React.SetStateAction<string[]>>;
  pricingConfig: PricingConfig;
  setPricingConfig: React.Dispatch<React.SetStateAction<PricingConfig>>;
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  leadSources: string[];
  setLeadSources: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenImportWizard: () => void;
  
  // New Props for Security/Integration
  securityConfig: SecurityConfig;
  setSecurityConfig: React.Dispatch<React.SetStateAction<SecurityConfig>>;
  emailTemplates: EmailTemplate[];
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  integrationConfig: IntegrationConfig;
  setIntegrationConfig: React.Dispatch<React.SetStateAction<IntegrationConfig>>;
  
  // Props for User Management Logic
  leads?: Lead[];
  onBulkTransfer?: (fromAgentId: string, toAgentId: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    projects, setProjects, campaigns, setCampaigns, pricingConfig, setPricingConfig, agents, setAgents, leadSources, setLeadSources, onOpenImportWizard,
    securityConfig, setSecurityConfig, emailTemplates, setEmailTemplates, integrationConfig, setIntegrationConfig, leads = [], onBulkTransfer
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'masters' | 'financials' | 'security' | 'integrations' | 'migration' | 'rbac' | 'automation' | 'forms'>('users');
  const [userSubTab, setUserSubTab] = useState<'directory' | 'orgchart'>('directory');
  const [automationSubTab, setAutomationSubTab] = useState<'triggers' | 'dlt' | 'whatsapp'>('triggers');
  
  // Integration Config States
  const [integrationSubTab, setIntegrationSubTab] = useState<'meta' | 'portals' | 'email-config' | 'templates' | 'tally'>('meta');
  
  // Form Builder State
  const [formFields, setFormFields] = useState<FormField[]>([
      { id: 'f1', label: 'Passport Number', type: 'Text', mandatory: false },
      { id: 'f2', label: 'Funding Source', type: 'Dropdown', mandatory: true, options: ['Self', 'Loan', 'Family'] }
  ]);
  const [newField, setNewField] = useState<Partial<FormField>>({ type: 'Text', mandatory: false });

  // Tally State
  const [tallyLedgers, setTallyLedgers] = useState<LedgerMapping[]>(MOCK_LEDGERS);

  // Local state for forms
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLoc, setNewProjectLoc] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>(ProjectType.RESIDENTIAL);
  
  const [newCampaign, setNewCampaign] = useState('');
  const [newSource, setNewSource] = useState('');

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateBody, setNewTemplateBody] = useState('');

  // RBAC State
  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(DEFAULT_ROLES[0]);

  // User Management State
  const [showUserWizard, setShowUserWizard] = useState(false);
  const [wizardData, setWizardData] = useState<Partial<Agent>>({ active: true, status: 'Offline' });
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [deactivatingAgent, setDeactivatingAgent] = useState<Agent | null>(null);
  const [successorId, setSuccessorId] = useState<string>('');

  // Automation State
  const [triggers, setTriggers] = useState<AutomationTrigger[]>(MOCK_TRIGGERS);
  const [dltTemplates, setDltTemplates] = useState<DLTTemplate[]>(MOCK_DLT_TEMPLATES);
  const [wabaTemplates, setWabaTemplates] = useState<WABATemplate[]>(MOCK_WABA_TEMPLATES);
  
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [newTriggerName, setNewTriggerName] = useState('');
  const [newTriggerEvent, setNewTriggerEvent] = useState<AutomationTrigger['event']>('New Lead');

  // --- HANDLERS ---

  // Project Handlers
  const handleAddProject = () => {
    if (newProjectName && newProjectLoc) {
      const newProj: Project = {
        id: `p${Date.now()}`,
        name: newProjectName,
        location: newProjectLoc,
        type: newProjectType,
        campaigns: [],
        towers: [],
        unitTypes: []
      };
      setProjects([...projects, newProj]);
      setNewProjectName('');
      setNewProjectLoc('');
      setNewProjectType(ProjectType.RESIDENTIAL);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Delete this project? Leads associated with it might lose their reference.')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  // Campaign Handlers
  const handleAddCampaign = () => {
    if (newCampaign && !campaigns.includes(newCampaign)) {
      setCampaigns([...campaigns, newCampaign]);
      setNewCampaign('');
    }
  };

  const handleDeleteCampaign = (camp: string) => {
    setCampaigns(campaigns.filter(c => c !== camp));
  };

  // Source Handlers
  const handleAddSource = () => {
      if (newSource && !leadSources.includes(newSource)) {
          setLeadSources([...leadSources, newSource]);
          setNewSource('');
      }
  };

  const handleDeleteSource = (src: string) => {
      setLeadSources(leadSources.filter(s => s !== src));
  };

  // Form Builder Handlers
  const handleAddField = () => {
      if (!newField.label) return;
      const field: FormField = {
          id: `f-${Date.now()}`,
          label: newField.label,
          type: newField.type || 'Text',
          mandatory: newField.mandatory || false,
          options: newField.type === 'Dropdown' ? (newField.options as unknown as string || '').split(',') : undefined
      };
      setFormFields([...formFields, field]);
      setNewField({ type: 'Text', mandatory: false });
  };

  const handleDeleteField = (id: string) => {
      setFormFields(formFields.filter(f => f.id !== id));
  };

  // --- USER MANAGEMENT HANDLERS ---

  const handleCreateUser = () => {
      if (!wizardData.name || !wizardData.role) {
          alert("Name and Role are mandatory.");
          return;
      }
      
      const newUser: Agent = {
          id: `u-${Date.now()}`,
          name: wizardData.name,
          role: wizardData.role,
          email: wizardData.email,
          mobile: wizardData.mobile,
          department: wizardData.department || 'Sales',
          reportingManagerId: wizardData.reportingManagerId,
          active: true,
          status: 'Offline',
          lastLeadAssignedAt: 0,
          sessions: [],
          joinedAt: new Date().toISOString().split('T')[0],
          ipRestriction: wizardData.ipRestriction
      };
      
      setAgents([...agents, newUser]);
      setShowUserWizard(false);
      setWizardData({ active: true, status: 'Offline' });
      alert(`User ${newUser.name} created successfully! Welcome email sent.`);
  };

  const initiateDeactivation = (agent: Agent) => {
      // Check if user has active leads
      const activeLeads = leads.filter(l => l.agentId === agent.id);
      
      if (activeLeads.length > 0) {
          setDeactivatingAgent(agent);
          setShowHandoverModal(true);
      } else {
          // No leads, direct deactivate
          if(confirm(`Deactivate ${agent.name}? They have 0 active leads.`)) {
              setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, active: false } : a));
          }
      }
  };

  const confirmHandoverAndDeactivate = () => {
      if (!deactivatingAgent || !successorId || !onBulkTransfer) return;
      
      // 1. Transfer Leads
      onBulkTransfer(deactivatingAgent.id, successorId);
      
      // 2. Deactivate User
      setAgents(prev => prev.map(a => a.id === deactivatingAgent.id ? { ...a, active: false } : a));
      
      // 3. Reset UI
      setShowHandoverModal(false);
      setDeactivatingAgent(null);
      setSuccessorId('');
      
      alert("Handover Complete & User Deactivated.");
  };

  const handleReactivate = (id: string) => {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, active: true } : a));
  };

  const handleForceLogout = (id: string) => {
      if(confirm("Force logout this user from all devices?")) {
          alert("Session token revoked. User logged out.");
      }
  };

  const handleResetPassword = (id: string) => {
      const newPass = prompt("Enter temporary password for user:");
      if(newPass) alert("Password updated. User will be prompted to change on next login.");
  };

  const handleSaveConfig = () => {
      alert("Configuration Saved Globally! Changes reflected in Sales & Reception apps instantly.");
  };

  const handleSaveTemplate = () => {
      if (!newTemplateName || !newTemplateBody) return;
      const newTmpl: EmailTemplate = {
          id: `et-${Date.now()}`,
          name: newTemplateName,
          subject: newTemplateSubject,
          body: newTemplateBody
      };
      setEmailTemplates([...emailTemplates, newTmpl]);
      setNewTemplateName('');
      setNewTemplateSubject('');
      setNewTemplateBody('');
      alert("Template Saved!");
  };

  // RBAC Handlers
  const updatePermission = (roleId: string, module: ModuleName, field: keyof Permission, value: any) => {
      setRoles(prev => prev.map(r => {
          if (r.id !== roleId) return r;
          return {
              ...r,
              permissions: r.permissions.map(p => p.module === module ? { ...p, [field]: value } : p)
          };
      }));
      // Update selected role view
      if(selectedRole?.id === roleId) {
          setSelectedRole(prev => {
              if(!prev) return null;
              return {
                  ...prev,
                  permissions: prev.permissions.map(p => p.module === module ? { ...p, [field]: value } : p)
              }
          });
      }
  };

  const handleCreateRole = () => {
      const name = prompt("Enter Role Name (e.g., 'Senior Manager')");
      if(name) {
          const newRole: RoleConfig = {
              id: `role_${Date.now()}`,
              roleName: name,
              description: 'Custom Role',
              permissions: MODULE_LIST.map(m => ({ module: m, canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, scope: 'Own' }))
          };
          setRoles([...roles, newRole]);
          setSelectedRole(newRole);
      }
  };

  // Org Chart Renderer (Recursive)
  const renderOrgTree = (managerId: string | undefined, depth: number = 0) => {
      const reports = agents.filter(a => a.reportingManagerId === managerId && a.active);
      if (reports.length === 0) return null;

      return (
          <div className={`flex ${depth > 0 ? 'mt-8 gap-8 justify-center' : 'flex-col items-center'}`}>
              {reports.map(agent => (
                  <div key={agent.id} className="flex flex-col items-center relative">
                      {/* Connector Line */}
                      {depth > 0 && <div className="absolute -top-8 left-1/2 h-8 w-px bg-slate-300"></div>}
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-48 text-center relative z-10">
                          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mb-2">
                              {agent.name.charAt(0)}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{agent.name}</h4>
                          <p className="text-xs text-blue-600 font-bold uppercase">{agent.role}</p>
                      </div>
                      
                      {/* Children */}
                      {renderOrgTree(agent.id, depth + 1)}
                  </div>
              ))}
          </div>
      );
  };

  // Automation Handlers
  const toggleTrigger = (id: string) => {
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  const handleCreateTrigger = () => {
      if (!newTriggerName) return;
      const newTrigger: AutomationTrigger = {
          id: `at-${Date.now()}`,
          name: newTriggerName,
          event: newTriggerEvent,
          isActive: true,
          actions: []
      };
      setTriggers([...triggers, newTrigger]);
      setNewTriggerName('');
      setShowTriggerModal(false);
  };

  const handleSyncMeta = () => {
      alert("Syncing with Facebook Graph API...\n\n3 New templates fetched from WABA Manager.");
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
          <div>
              <h2 className="text-2xl font-bold text-slate-800">Super Admin Console</h2>
              <p className="text-slate-500 text-sm">System Configuration & Master Data Management</p>
          </div>
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-2">
              <Zap className="w-3 h-3" /> GOD MODE ACTIVE
          </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto bg-white rounded-t-xl shadow-sm">
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'users' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <Users className="w-4 h-4" /> User Management
        </button>
        <button onClick={() => setActiveTab('rbac')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'rbac' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <ShieldCheck className="w-4 h-4" /> Roles & Permissions
        </button>
        <button onClick={() => setActiveTab('forms')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'forms' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <FileText className="w-4 h-4" /> Form Builder
        </button>
        <button onClick={() => setActiveTab('automation')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'automation' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <Bot className="w-4 h-4" /> Automation & Triggers
        </button>
        <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'projects' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <Building className="w-4 h-4" /> Project Master
        </button>
        <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'financials' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <CreditCard className="w-4 h-4" /> Financial Config
        </button>
        <button onClick={() => setActiveTab('masters')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'masters' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <List className="w-4 h-4" /> CRM Masters
        </button>
        <button onClick={() => setActiveTab('security')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <Shield className="w-4 h-4" /> Security Vault
        </button>
        <button onClick={() => setActiveTab('integrations')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'integrations' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <LayoutGrid className="w-4 h-4" /> Integrations
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        
        {/* TAB: FORM BUILDER (MODULE 18) */}
        {activeTab === 'forms' && (
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Dynamic Form Builder</h3>
                        <p className="text-slate-500 text-sm">Add custom fields to Lead Forms without coding.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Panel */}
                    <div className="lg:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-4">Add New Field</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Field Label</label>
                                <input 
                                    type="text" 
                                    value={newField.label || ''}
                                    onChange={(e) => setNewField({...newField, label: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded bg-white"
                                    placeholder="e.g. Passport No"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Type</label>
                                <select 
                                    value={newField.type}
                                    onChange={(e) => setNewField({...newField, type: e.target.value as any})}
                                    className="w-full p-2 border border-slate-300 rounded bg-white"
                                >
                                    <option value="Text">Text Input</option>
                                    <option value="Number">Number</option>
                                    <option value="Dropdown">Dropdown Select</option>
                                    <option value="Date">Date Picker</option>
                                    <option value="Checkbox">Checkbox</option>
                                </select>
                            </div>
                            
                            {newField.type === 'Dropdown' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Options (Comma Separated)</label>
                                    <input 
                                        type="text" 
                                        value={Array.isArray(newField.options) ? newField.options.join(',') : ''}
                                        onChange={(e) => setNewField({...newField, options: e.target.value.split(',')})}
                                        className="w-full p-2 border border-slate-300 rounded bg-white"
                                        placeholder="Option 1, Option 2"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={newField.mandatory}
                                    onChange={(e) => setNewField({...newField, mandatory: e.target.checked})}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-sm text-slate-600">Mark as Mandatory</label>
                            </div>

                            <button onClick={handleAddField} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add to Layout
                            </button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Live Preview: Lead Form</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Static Fields */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-400 text-sm">Name *</div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-400 text-sm">Mobile *</div>
                                
                                {/* Dynamic Fields */}
                                {formFields.map(field => (
                                    <div key={field.id} className="relative group">
                                        <div className="p-3 bg-white border border-blue-200 rounded text-blue-800 text-sm font-medium flex justify-between items-center shadow-sm">
                                            <span>{field.label} {field.mandatory && '*'}</span>
                                            <span className="text-xs bg-blue-100 px-2 py-0.5 rounded uppercase">{field.type}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteField(field.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {formFields.length === 0 && <p className="text-slate-400 italic text-center py-8">No custom fields added yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: USERS */}
        {activeTab === 'users' && (
            <div className="flex flex-col h-full min-h-[600px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex gap-4">
                        <button onClick={() => setUserSubTab('directory')} className={`px-4 py-2 rounded-lg text-sm font-bold ${userSubTab === 'directory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}>Employee Directory</button>
                        <button onClick={() => setUserSubTab('orgchart')} className={`px-4 py-2 rounded-lg text-sm font-bold ${userSubTab === 'orgchart' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}>Org Chart</button>
                    </div>
                    <button onClick={() => setShowUserWizard(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md">
                        <Users className="w-4 h-4" /> Add Employee
                    </button>
                </div>

                {userSubTab === 'directory' && (
                    <div className="p-6 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Name & ID</th>
                                    <th className="px-6 py-4">Role / Dept</th>
                                    <th className="px-6 py-4">Reporting To</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Security Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {agents.map(agent => (
                                    <tr key={agent.id} className={`hover:bg-slate-50 ${!agent.active ? 'opacity-60 bg-slate-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {agent.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{agent.name}</div>
                                                    <div className="text-xs text-slate-500">{agent.email || 'No Email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{agent.role}</span>
                                            <div className="text-xs text-slate-500 mt-1">{agent.department || 'General'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {agent.reportingManagerId ? agents.find(a => a.id === agent.reportingManagerId)?.name : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => agent.active ? initiateDeactivation(agent) : handleReactivate(agent.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${agent.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'}`}
                                            >
                                                {agent.active ? <span className="w-2 h-2 rounded-full bg-green-600"></span> : <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                                                {agent.active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleResetPassword(agent.id)} className="p-2 text-slate-500 hover:bg-slate-100 rounded" title="Reset Password">
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleForceLogout(agent.id)} className="p-2 text-orange-500 hover:bg-orange-50 rounded" title="Force Logout">
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {userSubTab === 'orgchart' && (
                    <div className="flex-1 p-8 bg-slate-50 overflow-auto flex justify-center">
                        {/* Find Top Level (No manager or SuperAdmin) */}
                        <div className="space-y-8">
                            {agents.filter(a => !a.reportingManagerId && a.active).map(root => (
                                <div key={root.id} className="flex flex-col items-center">
                                    {/* Root Node */}
                                    <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-md w-48 text-center mb-8 relative z-10">
                                        <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                                            {root.name.charAt(0)}
                                        </div>
                                        <h3 className="font-bold text-slate-800">{root.name}</h3>
                                        <p className="text-xs text-blue-600 font-bold uppercase">{root.role}</p>
                                    </div>
                                    {/* Children */}
                                    {renderOrgTree(root.id)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* TAB: AUTOMATION */}
        {activeTab === 'automation' && (
            <div className="flex h-full min-h-[600px]">
                {/* Sidebar Navigation */}
                <div className="w-64 border-r border-slate-200 bg-slate-50 p-4 flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Workflow Engine</h3>
                    <button 
                        onClick={() => setAutomationSubTab('triggers')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${automationSubTab === 'triggers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Zap className="w-4 h-4" /> Automation Rules
                    </button>
                    <button 
                        onClick={() => setAutomationSubTab('dlt')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${automationSubTab === 'dlt' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> DLT (SMS)
                    </button>
                    <button 
                        onClick={() => setAutomationSubTab('whatsapp')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${automationSubTab === 'whatsapp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> WhatsApp (WABA)
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    
                    {/* TRIGGER BUILDER */}
                    {automationSubTab === 'triggers' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Active Automations</h3>
                                    <p className="text-slate-500 text-sm">Event-based communication rules.</p>
                                </div>
                                <button onClick={() => setShowTriggerModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md">
                                    <Plus className="w-4 h-4" /> Create Rule
                                </button>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Rule Name</th>
                                            <th className="px-6 py-4">Event Trigger</th>
                                            <th className="px-6 py-4">Actions</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {triggers.map(trigger => (
                                            <tr key={trigger.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-bold text-slate-800">{trigger.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{trigger.event}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {trigger.actions.map((act, idx) => (
                                                            <span key={idx} className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${act.type === 'WhatsApp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {act.type === 'WhatsApp' ? <MessageSquare className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                                                {act.type}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => toggleTrigger(trigger.id)} className={`text-2xl transition ${trigger.isActive ? 'text-green-500' : 'text-slate-300'}`}>
                                                        {trigger.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* DLT MANAGER */}
                    {automationSubTab === 'dlt' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">DLT Templates (SMS)</h3>
                                    <p className="text-slate-500 text-sm">Manage TRAI approved SMS templates.</p>
                                </div>
                                <button className="border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm">Add Template</button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {dltTemplates.map(tmpl => (
                                    <div key={tmpl.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800">{tmpl.name}</h4>
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{tmpl.senderId}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-2 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                                            DLT TE ID: {tmpl.dltTeId}
                                        </div>
                                        <p className="text-sm text-slate-600 font-mono bg-yellow-50 p-3 rounded border border-yellow-100">
                                            {tmpl.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* WHATSAPP MANAGER */}
                    {automationSubTab === 'whatsapp' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">WhatsApp Templates (Meta)</h3>
                                    <p className="text-slate-500 text-sm">Synced from WhatsApp Business Manager.</p>
                                </div>
                                <button onClick={handleSyncMeta} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md">
                                    <RefreshCw className="w-4 h-4" /> Sync from Meta
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {wabaTemplates.map(tmpl => (
                                    <div key={tmpl.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${tmpl.status === 'Approved' ? 'bg-green-500' : tmpl.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <h4 className="font-bold text-slate-800">{tmpl.name}</h4>
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${tmpl.status === 'Approved' ? 'bg-green-100 text-green-700' : tmpl.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {tmpl.status}
                                            </span>
                                        </div>
                                        <div className="pl-2">
                                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 italic">
                                                "{tmpl.content}"
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2 text-right">Language: {tmpl.language}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        )}

        {/* TAB: INTEGRATIONS & EMAIL (UPDATED WITH TALLY) */}
        {activeTab === 'integrations' && (
             <div className="flex h-full min-h-[600px]">
                 {/* Integration Sidebar */}
                 <div className="w-64 border-r border-slate-200 bg-slate-50 p-4 flex flex-col gap-2">
                     <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Modules</h3>
                     <button 
                        onClick={() => setIntegrationSubTab('meta')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${integrationSubTab === 'meta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                         <LayoutGrid className="w-4 h-4" /> Ad Platforms
                     </button>
                     <button 
                        onClick={() => setIntegrationSubTab('email-config')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${integrationSubTab === 'email-config' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                         <Mail className="w-4 h-4" /> Email Service (SMTP)
                     </button>
                     <button 
                        onClick={() => setIntegrationSubTab('templates')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${integrationSubTab === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                         <FileSpreadsheet className="w-4 h-4" /> Email Templates
                     </button>
                     <button 
                        onClick={() => setIntegrationSubTab('tally')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition ${integrationSubTab === 'tally' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                         <Activity className="w-4 h-4" /> Finance / Tally
                     </button>
                 </div>

                 {/* Integration Content */}
                 <div className="flex-1 p-8 overflow-y-auto">
                    
                    {/* META Integration */}
                    {integrationSubTab === 'meta' && (
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Meta & Google Sync</h3>
                                    <p className="text-slate-500 text-sm">Manage ad account connections</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
                                    <span className="text-sm font-medium">Facebook Ads Linked</span>
                                </div>
                                <button className="text-blue-600 hover:underline text-sm">Re-authorize Connection</button>
                            </div>
                        </div>
                    )}

                    {/* EMAIL CONFIG Integration */}
                    {integrationSubTab === 'email-config' && (
                         <div className="max-w-2xl space-y-6">
                             <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Email Gateway Configuration</h3>
                                <p className="text-slate-500 text-sm">Connect SendGrid or MailChimp for high deliverability.</p>
                             </div>

                             {/* SendGrid */}
                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-6">
                                 <div className="w-12 h-12 bg-blue-500 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">SG</div>
                                 <div className="flex-1 space-y-4">
                                     <div className="flex justify-between">
                                         <h4 className="font-bold text-slate-800">SendGrid (Transactional)</h4>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                                         <input 
                                            type="password" 
                                            value={integrationConfig.sendgridKey || ''}
                                            onChange={(e) => setIntegrationConfig({...integrationConfig, sendgridKey: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded text-sm" 
                                            placeholder="SG.xxxxxxxx" 
                                         />
                                     </div>
                                 </div>
                             </div>

                             {/* MailChimp */}
                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-6">
                                 <div className="w-12 h-12 bg-yellow-400 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">MC</div>
                                 <div className="flex-1 space-y-4">
                                     <div className="flex justify-between">
                                         <h4 className="font-bold text-slate-800">MailChimp (Marketing)</h4>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                                         <input 
                                            type="password" 
                                            value={integrationConfig.mailchimpKey || ''}
                                            onChange={(e) => setIntegrationConfig({...integrationConfig, mailchimpKey: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded text-sm" 
                                            placeholder="xxxx-us1" 
                                         />
                                     </div>
                                     <button className="text-xs bg-slate-100 px-3 py-2 rounded hover:bg-slate-200 font-bold">Sync Lists Now</button>
                                 </div>
                             </div>
                         </div>
                    )}

                    {/* TEMPLATE EDITOR */}
                    {integrationSubTab === 'templates' && (
                         <div className="max-w-3xl">
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Email Templates</h3>
                                    <p className="text-slate-500 text-sm">Standardize communication for your team.</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                 <div className="bg-white border border-slate-200 rounded-xl p-4">
                                     <h4 className="font-bold text-slate-700 mb-3">Create New Template</h4>
                                     <div className="space-y-3">
                                         <input 
                                            type="text" 
                                            placeholder="Template Name (e.g. Welcome Email)" 
                                            value={newTemplateName}
                                            onChange={(e) => setNewTemplateName(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                         />
                                         <input 
                                            type="text" 
                                            placeholder="Subject Line" 
                                            value={newTemplateSubject}
                                            onChange={(e) => setNewTemplateSubject(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                         />
                                         <textarea 
                                            placeholder="Body (HTML Supported). Use {name} for dynamic name." 
                                            rows={5}
                                            value={newTemplateBody}
                                            onChange={(e) => setNewTemplateBody(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded text-sm font-mono text-xs"
                                         />
                                         <button onClick={handleSaveTemplate} className="w-full bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700">Save Template</button>
                                     </div>
                                 </div>

                                 <div className="space-y-3">
                                     {emailTemplates.map(t => (
                                         <div key={t.id} className="bg-slate-50 p-3 rounded border border-slate-200">
                                             <div className="font-bold text-slate-700 text-sm">{t.name}</div>
                                             <div className="text-xs text-slate-500 truncate">{t.subject}</div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    )}

                    {/* TALLY INTEGRATION (MODULE 20) */}
                    {integrationSubTab === 'tally' && (
                        <div className="max-w-3xl">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Activity className="w-6 h-6 text-green-600" /> Accounts Bridge (Tally/ERP)
                                    </h3>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" /> Connected
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-6">
                                    Sync vouchers automatically. When a receipt is generated in CRM, a voucher is pushed to Tally via TDL Connector.
                                </p>
                                
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Ledger Mapping</h4>
                                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="p-3">CRM Ledger</th>
                                                <th className="p-3">Tally Ledger Name</th>
                                                <th className="p-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tallyLedgers.map((ledger, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0">
                                                    <td className="p-3 font-medium text-slate-700">{ledger.crmLedger}</td>
                                                    <td className="p-3 font-mono text-slate-600">{ledger.tallyLedger || '-'}</td>
                                                    <td className="p-3 text-right">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ledger.status === 'Mapped' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {ledger.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="mt-4 text-blue-600 text-sm font-bold hover:underline">+ Map New Ledger</button>
                            </div>
                        </div>
                    )}

                 </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default SettingsView;
