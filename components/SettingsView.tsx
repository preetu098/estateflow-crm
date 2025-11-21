
import React, { useState } from 'react';
import { Project, ProjectType, PricingConfig, Agent } from '../types';
import { Plus, Trash2, MapPin, AlertCircle, ExternalLink, LayoutGrid, Users, Building, CreditCard, List, Zap, Save, ChevronRight, UserCheck, X } from 'lucide-react';
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
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    projects, setProjects, campaigns, setCampaigns, pricingConfig, setPricingConfig, agents, setAgents, leadSources, setLeadSources
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'masters' | 'financials' | 'automation' | 'integrations'>('users');
  
  // Local state for forms
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLoc, setNewProjectLoc] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>(ProjectType.RESIDENTIAL);
  
  const [newCampaign, setNewCampaign] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<Agent['role']>('Presales');

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

  // User Handlers
  const handleAddAgent = () => {
      if (!newAgentName) return;
      const newAgent: Agent = {
          id: `u${Date.now()}`,
          name: newAgentName,
          role: newAgentRole,
          active: true,
          status: 'Offline',
          lastLeadAssignedAt: 0,
          sessions: []
      };
      setAgents([...agents, newAgent]);
      setNewAgentName('');
  };

  const toggleAgentStatus = (id: string) => {
      setAgents(agents.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleSaveConfig = () => {
      alert("Configuration Saved Globally! Changes reflected in Sales & Reception apps instantly.");
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
        <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'projects' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <Building className="w-4 h-4" /> Project Master
        </button>
        <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'financials' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <CreditCard className="w-4 h-4" /> Financial Config
        </button>
        <button onClick={() => setActiveTab('masters')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'masters' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <List className="w-4 h-4" /> CRM Masters
        </button>
        <button onClick={() => setActiveTab('automation')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'automation' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <Zap className="w-4 h-4" /> Automation
        </button>
        <button onClick={() => setActiveTab('integrations')} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'integrations' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
          <LayoutGrid className="w-4 h-4" /> Integrations
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        
        {/* TAB: USER MANAGEMENT */}
        {activeTab === 'users' && (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Role Based Access Control (RBAC)</h3>
                </div>

                {/* Add User Form */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="w-full p-2 border border-slate-300 rounded" placeholder="e.g. New Employee" />
                    </div>
                    <div className="flex-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                         <select value={newAgentRole} onChange={(e) => setNewAgentRole(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded bg-white">
                             <option value="Presales">Presales Executive</option>
                             <option value="SalesHead">Sales Head</option>
                             <option value="TeamLeader">Team Leader</option>
                             <option value="Reception">Reception / GRE</option>
                             <option value="SuperAdmin">Super Admin</option>
                         </select>
                    </div>
                    <button onClick={handleAddAgent} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Create User</button>
                </div>

                {/* User List */}
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3">User Name</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Account Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {agents.map(agent => (
                            <tr key={agent.id} className="hover:bg-slate-50">
                                <td className="p-3 font-medium">{agent.name}</td>
                                <td className="p-3"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{agent.role}</span></td>
                                <td className="p-3">
                                    <button onClick={() => toggleAgentStatus(agent.id)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${agent.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {agent.active ? <UserCheck className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        {agent.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="p-3 text-right text-blue-600 hover:underline cursor-pointer">Edit Perms</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* TAB: FINANCIAL CONFIG */}
        {activeTab === 'financials' && (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Dynamic Pricing Engine</h3>
                    <button onClick={handleSaveConfig} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Base Rates */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b border-slate-200 pb-2">Base Pricing Rules</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700">
                                    Base Rate (per sqft)
                                    <Tooltip text="Starting price per square foot before floor rise." />
                                </label>
                                <input type="number" value={pricingConfig.baseRate} onChange={(e) => setPricingConfig({...pricingConfig, baseRate: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded" />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700">
                                    Floor Rise (per floor)
                                    <Tooltip text="Incremental cost added for each higher floor." />
                                </label>
                                <input type="number" value={pricingConfig.floorRise} onChange={(e) => setPricingConfig({...pricingConfig, floorRise: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Taxes */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b border-slate-200 pb-2">Govt Taxes</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700">
                                    GST %
                                    <Tooltip text="Goods and Services Tax applicable on under-construction properties." />
                                </label>
                                <input type="number" step="0.01" value={pricingConfig.gst} onChange={(e) => setPricingConfig({...pricingConfig, gst: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded" />
                                <span className="text-xs text-slate-400">Enter as decimal (0.05 for 5%)</span>
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700">
                                    Stamp Duty %
                                    <Tooltip text="State government tax on property documents." />
                                </label>
                                <input type="number" step="0.01" value={pricingConfig.stampDuty} onChange={(e) => setPricingConfig({...pricingConfig, stampDuty: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b border-slate-200 pb-2">Additional Charges</h4>
                        <div className="space-y-4">
                             <div>
                                <label className="flex items-center text-sm font-medium text-slate-700">
                                    Amenities (Club/Infra)
                                    <Tooltip text="One-time charge for clubhouse, gym, and swimming pool access." />
                                </label>
                                <input type="number" value={pricingConfig.amenities} onChange={(e) => setPricingConfig({...pricingConfig, amenities: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Parking Charges</label>
                                <input type="number" value={pricingConfig.parking} onChange={(e) => setPricingConfig({...pricingConfig, parking: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: PROJECT MASTER */}
        {activeTab === 'projects' && (
             <div className="p-6">
                <div className="mb-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Add New Project</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Project Name</label>
                        <input 
                            type="text" 
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Sunset Heights"
                        />
                        </div>
                        <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                        <input 
                            type="text" 
                            value={newProjectLoc}
                            onChange={(e) => setNewProjectLoc(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. South City"
                        />
                        </div>
                        <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                        <select 
                            value={newProjectType}
                            onChange={(e) => setNewProjectType(e.target.value as ProjectType)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        </div>
                        <button 
                        onClick={handleAddProject}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                        >
                        <Plus className="w-4 h-4" /> Add Project
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {projects.map(project => (
                        <div key={project.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                             <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{project.name}</h4>
                                        <p className="text-xs text-slate-500">{project.location} • {project.type}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <button className="text-xs font-bold text-blue-600 hover:underline">+ Add Tower</button>
                                     <div className="h-4 w-px bg-slate-300"></div>
                                     <button onClick={() => handleDeleteProject(project.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             </div>
                             <div className="p-4 grid grid-cols-2 gap-4">
                                 <div>
                                     <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Towers</h5>
                                     <div className="flex flex-wrap gap-2">
                                         {project.towers?.map(t => <span key={t.name} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-medium text-slate-600">{t.name} ({t.floors} Flrs)</span>)}
                                         {(!project.towers || project.towers.length === 0) && <span className="text-xs text-slate-400 italic">No towers configured</span>}
                                     </div>
                                 </div>
                                 <div>
                                     <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Unit Typology</h5>
                                     <div className="flex flex-wrap gap-2">
                                         {project.unitTypes?.map(ut => <span key={ut.id} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-medium text-slate-600">{ut.name} ({ut.carpetArea} sqft)</span>)}
                                         {(!project.unitTypes || project.unitTypes.length === 0) && <span className="text-xs text-slate-400 italic">No typologies defined</span>}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* TAB: CRM MASTERS */}
        {activeTab === 'masters' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Lead Source Master */}
                 <div className="bg-white rounded-xl border border-slate-200 p-6">
                     <h3 className="font-bold text-slate-800 mb-4">Lead Source Master</h3>
                     <div className="flex gap-2 mb-4">
                         <input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded text-sm" placeholder="Add new source (e.g. LinkedIn)..." />
                         <button onClick={handleAddSource} className="bg-blue-600 text-white px-4 rounded font-bold hover:bg-blue-700">+</button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {leadSources.map(s => (
                             <span key={s} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                 {s} <button onClick={() => handleDeleteSource(s)} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                             </span>
                         ))}
                     </div>
                     <p className="text-xs text-slate-500 mt-3 italic">Adding a source here instantly updates the Reception & Sales App dropdowns.</p>
                 </div>

                 <div className="bg-white rounded-xl border border-slate-200 p-6">
                     <h3 className="font-bold text-slate-800 mb-4">Marketing Campaigns</h3>
                     <div className="flex gap-2 mb-4">
                         <input type="text" value={newCampaign} onChange={(e) => setNewCampaign(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded text-sm" placeholder="Add new campaign..." />
                         <button onClick={handleAddCampaign} className="bg-blue-600 text-white px-4 rounded font-bold hover:bg-blue-700">+</button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {campaigns.map(c => (
                             <span key={c} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                 {c} <button onClick={() => handleDeleteCampaign(c)} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                             </span>
                         ))}
                     </div>
                 </div>
            </div>
        )}

         {/* TAB: AUTOMATION */}
         {activeTab === 'automation' && (
             <div className="p-6">
                 <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-6">
                     <h3 className="font-bold text-yellow-800 mb-2">Lead Assignment Rules</h3>
                     <div className="flex items-center gap-4 bg-white p-4 rounded border border-yellow-100">
                         <div className="flex-1">
                             <p className="font-bold text-slate-700 text-sm">Round Robin Assignment</p>
                             <p className="text-xs text-slate-500">Auto-distribute new leads equally among 'Active' agents.</p>
                         </div>
                         <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                             <span className="absolute left-0 inline-block w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform translate-x-6 transition-transform"></span>
                         </div>
                     </div>
                 </div>

                 <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
                     <h3 className="font-bold text-slate-800 mb-4">Escalation Matrix</h3>
                     <div className="space-y-4">
                         <div className="flex items-center gap-4">
                             <span className="text-sm font-medium text-slate-600 w-64">If lead status 'New' not updated in</span>
                             <input type="number" value={4} className="w-16 p-1 border border-slate-300 rounded text-center" />
                             <span className="text-sm font-medium text-slate-600">hours, notify Team Leader.</span>
                         </div>
                         <div className="flex items-center gap-4">
                             <span className="text-sm font-medium text-slate-600 w-64">If 'Site Visit' not checked-in within</span>
                             <input type="number" value={24} className="w-16 p-1 border border-slate-300 rounded text-center" />
                             <span className="text-sm font-medium text-slate-600">hours, notify Sales Head.</span>
                         </div>
                     </div>
                 </div>
             </div>
         )}

        {/* TAB: INTEGRATIONS */}
        {activeTab === 'integrations' && (
             <div className="p-6 text-center py-12">
                 <h3 className="text-slate-400 font-bold text-lg mb-2">API Integrations</h3>
                 <p className="text-slate-500">Manage WhatsApp (Meta), Facebook Ads, and SMS Gateway keys here.</p>
                 <div className="mt-4 bg-slate-100 p-4 rounded text-xs text-slate-600 inline-block text-left">
                     <p className="font-bold">API Key Security:</p>
                     <p>WARNING: Do not share these keys. Grants full access to data.</p>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default SettingsView;
