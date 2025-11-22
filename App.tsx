
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadsTable from './components/LeadsTable';
import LeadModal from './components/LeadModal';
import SettingsView from './components/SettingsView';
import NurtureMode from './components/NurtureMode';
import TeamManagement from './components/TeamManagement';
import BookingModule from './components/BookingModule';
import SalesModule from './components/SalesModule';
import ReceptionModule from './components/ReceptionModule';
import HelpPanel from './components/HelpPanel';
import Walkthrough from './components/Walkthrough';
import ChannelPartnerModule from './components/ChannelPartnerModule';
import MarketingModule from './components/MarketingModule';
import ConstructionModule from './components/ConstructionModule';
import IncentiveModule from './components/IncentiveModule';
import CockpitModule from './components/CockpitModule';
import { MOCK_LEADS, INITIAL_PROJECTS, INITIAL_CAMPAIGNS, INITIAL_AGENTS, MOCK_BOOKINGS, generateInventory, DEFAULT_PRICING_CONFIG, MOCK_CHANNEL_PARTNERS, MOCK_INVOICES, MOCK_CAMPAIGNS } from './constants';
import { Lead, Project, Agent, Booking, Unit, SiteVisit, PricingConfig, LeadSource, ChannelPartner, CommissionInvoice, MarketingCampaign, LeadStage } from './types';
import { Plus, Menu, MonitorSmartphone, HardHat, HelpCircle, UserCircle, ChevronDown } from 'lucide-react';

// Fallback agent in case constants fail to load or array is empty
const FALLBACK_AGENT: Agent = { 
  id: 'fallback', 
  name: 'System Admin', 
  role: 'SuperAdmin', 
  active: true, 
  status: 'Online', 
  lastLeadAssignedAt: 0, 
  sessions: [] 
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception' | 'marketing' | 'construction' | 'incentives' | 'cockpit'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [campaigns, setCampaigns] = useState<string[]>(INITIAL_CAMPAIGNS);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(MOCK_CAMPAIGNS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inventory, setInventory] = useState<Unit[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [channelPartners, setChannelPartners] = useState<ChannelPartner[]>(MOCK_CHANNEL_PARTNERS);
  const [invoices, setInvoices] = useState<CommissionInvoice[]>(MOCK_INVOICES);
  
  // Dynamic Lead Sources (initialized from Enum, but editable)
  const [leadSources, setLeadSources] = useState<string[]>(Object.values(LeadSource));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Help & Tour State
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // --- GLOBAL USER / ROLE STATE ---
  // Safe initialization to prevent crash if INITIAL_AGENTS is undefined
  const [currentUser, setCurrentUser] = useState<Agent>(INITIAL_AGENTS?.[0] || FALLBACK_AGENT);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Load initial data with ROBUST SANITIZATION
  useEffect(() => {
    try {
        const storedLeads = localStorage.getItem('estateflow_leads');
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          // Robust mapping to ensure no undefined values crash the UI
          const sanitized = Array.isArray(parsed) ? parsed.map((l: any) => ({
              ...l,
              id: String(l.id || `L-${Math.random()}`),
              name: String(l.name || 'Unknown'),
              mobile: String(l.mobile || ''), // Ensure string for .includes()
              project: String(l.project || ''),
              remarksHistory: Array.isArray(l.remarksHistory) ? l.remarksHistory : [],
              stage: l.stage || LeadStage.NEW,
              callCount: Number(l.callCount || 0),
              followUpDate: String(l.followUpDate || ''),
              // Ensure objects are present
              metaData: l.metaData || undefined,
          })) : MOCK_LEADS;
          setLeads(sanitized);
        } else {
          setLeads(MOCK_LEADS);
        }
    } catch (e) {
        console.error("Lead hydration failed", e);
        setLeads(MOCK_LEADS);
    }
    
    try {
        const storedProjects = localStorage.getItem('estateflow_projects');
        if (storedProjects) {
            const parsed = JSON.parse(storedProjects);
            setProjects(Array.isArray(parsed) ? parsed : INITIAL_PROJECTS);
        }
    } catch (e) { console.error("Projects load failed", e); }

    try {
        const storedCampaigns = localStorage.getItem('estateflow_campaigns');
        if (storedCampaigns) {
            const parsed = JSON.parse(storedCampaigns);
            setCampaigns(Array.isArray(parsed) ? parsed : INITIAL_CAMPAIGNS);
        }
    } catch (e) { console.error("Campaigns load failed", e); }

    try {
        const storedAgents = localStorage.getItem('estateflow_agents');
        if (storedAgents) {
            const parsedAgents = JSON.parse(storedAgents);
            // Ensure roles are valid and sessions array exists
            const sanitizedAgents = Array.isArray(parsedAgents) ? parsedAgents.map((a: any) => ({
                ...a,
                id: String(a.id),
                name: String(a.name),
                role: a.role || 'Presales',
                active: Boolean(a.active),
                status: a.status || 'Offline',
                lastLeadAssignedAt: Number(a.lastLeadAssignedAt || 0),
                sessions: Array.isArray(a.sessions) ? a.sessions : []
            })) : INITIAL_AGENTS;
            setAgents(sanitizedAgents);
        }
    } catch (e) { console.error("Agents load failed", e); }

    try {
        const storedBookings = localStorage.getItem('estateflow_bookings');
        if (storedBookings) {
            const parsed = JSON.parse(storedBookings);
            setBookings(Array.isArray(parsed) ? parsed : MOCK_BOOKINGS);
        } else {
            setBookings(MOCK_BOOKINGS);
        }
    } catch (e) { console.error("Bookings load failed", e); }

    try {
        const storedVisits = localStorage.getItem('estateflow_sitevisits');
        if (storedVisits) {
            const parsed = JSON.parse(storedVisits);
            setSiteVisits(Array.isArray(parsed) ? parsed : []);
        }
    } catch (e) { console.error("Visits load failed", e); }

    try {
        const storedPricing = localStorage.getItem('estateflow_pricing');
        if (storedPricing) {
          const parsed = JSON.parse(storedPricing);
          // Ensure it's an object before spreading
          if (parsed && typeof parsed === 'object') {
              setPricingConfig({ ...DEFAULT_PRICING_CONFIG, ...parsed });
          }
        }
    } catch (e) { console.error("Pricing load failed", e); }
    
    try {
        const storedSources = localStorage.getItem('estateflow_sources');
        if (storedSources) {
            const parsed = JSON.parse(storedSources);
            if (Array.isArray(parsed)) setLeadSources(parsed);
        }
    } catch (e) { console.error("Sources load failed", e); }
    
    try {
        const storedCPs = localStorage.getItem('estateflow_cps');
        if(storedCPs) {
            const parsed = JSON.parse(storedCPs);
            setChannelPartners(Array.isArray(parsed) ? parsed : MOCK_CHANNEL_PARTNERS);
        }
    } catch (e) { console.error("CP load failed", e); }

    try {
        const storedInvoices = localStorage.getItem('estateflow_invoices');
        if(storedInvoices) {
            const parsed = JSON.parse(storedInvoices);
            setInvoices(Array.isArray(parsed) ? parsed : MOCK_INVOICES);
        }
    } catch (e) { console.error("Invoices load failed", e); }

    const tourDone = localStorage.getItem('estateflow_tour_done');
    if (!tourDone) {
        setShowWalkthrough(true);
    }
  }, []);

  // Generate Inventory on first load or when projects change
  useEffect(() => {
      try {
          const storedInv = localStorage.getItem('estateflow_inventory');
          if (storedInv) {
              const parsed = JSON.parse(storedInv);
              setInventory(Array.isArray(parsed) ? parsed : []);
          } else {
              // Generate mock inventory for all projects
              let initialInventory: Unit[] = [];
              INITIAL_PROJECTS.forEach(p => {
                 initialInventory = [...initialInventory, ...generateInventory(p.id)];
              });
              setInventory(initialInventory);
          }
      } catch (e) {
          console.error("Inventory generation failed", e);
          setInventory([]); // Fallback to empty to prevent crash
      }
  }, []);


  // Sync storage with error handling
  useEffect(() => { try { localStorage.setItem('estateflow_leads', JSON.stringify(leads)); } catch(e){} }, [leads]);
  useEffect(() => { try { localStorage.setItem('estateflow_projects', JSON.stringify(projects)); } catch(e){} }, [projects]);
  useEffect(() => { try { localStorage.setItem('estateflow_campaigns', JSON.stringify(campaigns)); } catch(e){} }, [campaigns]);
  useEffect(() => { try { localStorage.setItem('estateflow_agents', JSON.stringify(agents)); } catch(e){} }, [agents]);
  useEffect(() => { try { localStorage.setItem('estateflow_bookings', JSON.stringify(bookings)); } catch(e){} }, [bookings]);
  useEffect(() => { try { localStorage.setItem('estateflow_inventory', JSON.stringify(inventory)); } catch(e){} }, [inventory]);
  useEffect(() => { try { localStorage.setItem('estateflow_sitevisits', JSON.stringify(siteVisits)); } catch(e){} }, [siteVisits]);
  useEffect(() => { try { localStorage.setItem('estateflow_pricing', JSON.stringify(pricingConfig)); } catch(e){} }, [pricingConfig]);
  useEffect(() => { try { localStorage.setItem('estateflow_sources', JSON.stringify(leadSources)); } catch(e){} }, [leadSources]);
  useEffect(() => { try { localStorage.setItem('estateflow_cps', JSON.stringify(channelPartners)); } catch(e){} }, [channelPartners]);
  useEffect(() => { try { localStorage.setItem('estateflow_invoices', JSON.stringify(invoices)); } catch(e){} }, [invoices]);

  /**
   * Intelligent Round Robin Assignment (LRU)
   */
  const assignAgentRoundRobin = (): Agent | null => {
    const activeAgents = agents
        .filter(a => a.role === 'Presales' && a.active)
        .sort((a, b) => a.lastLeadAssignedAt - b.lastLeadAssignedAt);

    if (activeAgents.length === 0) return null;

    const targetAgent = activeAgents[0];
    
    // Update the agent's timestamp immediately in state
    const updatedAgents = agents.map(a => 
        a.id === targetAgent.id ? { ...a, lastLeadAssignedAt: Date.now() } : a
    );
    setAgents(updatedAgents);
    
    return targetAgent;
  };

  const handleSaveLead = (lead: Lead) => {
    setLeads(prev => {
      const exists = prev.find(l => l.id === lead.id);
      if (exists) {
        // Update existing
        return prev.map(l => l.id === lead.id ? lead : l);
      } else {
        // Add New - Apply LRU Round Robin if agent not set manually
        let finalLead = { ...lead };
        if (!finalLead.agentId) {
            const assignedAgent = assignAgentRoundRobin();
            if (assignedAgent) {
                finalLead.agentId = assignedAgent.id;
                finalLead.agentName = assignedAgent.name;
                finalLead.remarksHistory.push({
                    timestamp: new Date().toISOString(),
                    text: `System: Auto-assigned to ${assignedAgent.name} (Round Robin - Active).`,
                    author: 'System'
                });
            } else {
                finalLead.agentName = 'Unassigned';
                finalLead.remarksHistory.push({
                    timestamp: new Date().toISOString(),
                    text: `System: No active agents available for Round Robin.`,
                    author: 'System'
                });
            }
        }
        return [finalLead, ...prev];
      }
    });
  };

  const handleDeleteLead = (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleAddBooking = (newBooking: Booking) => {
      setBookings(prev => [newBooking, ...prev]);
  };
  
  const handleAddVisit = (visit: SiteVisit) => {
      setSiteVisits(prev => [visit, ...prev]);
      // Mark agent as Busy (Mock logic)
      if(visit.agentId) {
          setAgents(prev => prev.map(a => a.id === visit.agentId ? {...a, status: 'Busy'} : a));
      }
  };

  const handleUpdateVisit = (updatedVisit: SiteVisit) => {
      setSiteVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
      // If finished, mark agent online
      if(updatedVisit.status === 'Completed' && updatedVisit.agentId) {
         setAgents(prev => prev.map(a => a.id === updatedVisit.agentId ? {...a, status: 'Online'} : a));
      }
  };
  
  const handleSaveInvoice = (inv: CommissionInvoice) => {
      setInvoices(prev => [...prev, inv]);
  };

  const openAddModal = () => {
    setEditingLead(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleTourComplete = () => {
      setShowWalkthrough(false);
      localStorage.setItem('estateflow_tour_done', 'true');
  };

  const getHeaderTitle = () => {
    switch(view) {
      case 'dashboard': return 'Analytical Dashboards';
      case 'leads': return 'Lead Management';
      case 'nurture': return 'Pre-sales Center';
      case 'settings': return 'Super Admin Console';
      case 'team': return 'Team Leader Dashboard';
      case 'channel-partners': return 'Channel Partner Connect';
      case 'bookings': return 'Bookings & Customers';
      case 'visits': return 'Visit Management';
      case 'sales': return 'Sales Closing Center';
      case 'reception': return 'Front Desk / Reception';
      case 'marketing': return 'Marketing & Campaigns';
      case 'construction': return 'Construction Engineering';
      case 'incentives': return 'HR & Incentives';
      case 'cockpit': return 'Director\'s Cockpit';
      default: return 'EstateFlow';
    }
  };

  // Aggregation for Incentives
  const agentSalesCounts = bookings.reduce((acc, booking) => {
      // Mocking linkage: Find lead's agent
      const lead = leads.find(l => l.id === booking.leadId);
      if (lead && lead.agentId) {
          acc[lead.agentId] = (acc[lead.agentId] || 0) + 1;
      }
      return acc;
  }, {} as Record<string, number>);

  // --- HANDLER: Switch Role ---
  const handleSwitchRole = (role: Agent['role']) => {
      // Find first agent of that role
      const agent = agents.find(a => a.role === role) || agents[0] || FALLBACK_AGENT;
      setCurrentUser(agent);
      
      // Default landing view per role
      if (role === 'Presales') setView('leads');
      else if (role === 'Sales') setView('sales');
      else if (role === 'Reception') setView('reception');
      else setView('dashboard');
      
      setShowRoleSwitcher(false);
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Loading EstateFlow...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      <Walkthrough isActive={showWalkthrough} onComplete={handleTourComplete} />
      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} view={view} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
            currentView={view} 
            setView={(v) => { setView(v); setSidebarOpen(false); }} 
            currentUser={currentUser}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {getHeaderTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
              
              {/* ROLE SWITCHER (DEMO PURPOSE) */}
              <div className="relative">
                  <button 
                    onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-200 border border-slate-200"
                  >
                      <UserCircle className="w-4 h-4 text-slate-500" />
                      {currentUser.role} View
                      <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {showRoleSwitcher && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">Switch Perspective</div>
                          <button onClick={() => handleSwitchRole('SuperAdmin')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm hover:text-blue-600">Super Admin</button>
                          <button onClick={() => handleSwitchRole('Presales')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm hover:text-blue-600">Presales Agent</button>
                          <button onClick={() => handleSwitchRole('Sales')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm hover:text-blue-600">Sales Manager</button>
                          <button onClick={() => handleSwitchRole('Reception')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm hover:text-blue-600">Reception Desk</button>
                      </div>
                  )}
              </div>

              <button 
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
                title="Help & Guide"
              >
                  <HelpCircle className="w-5 h-5" />
              </button>

              {view === 'leads' && (
                <button 
                  onClick={openAddModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md shadow-blue-200 transition"
                >
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Lead</span>
                </button>
              )}
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-auto p-0 relative">
          {view === 'dashboard' && <div className="p-6"><Dashboard leads={leads} /></div>}
          {view === 'leads' && (
             <div className="p-6 h-full">
                <LeadsTable 
                  leads={leads} 
                  projects={projects} 
                  onEdit={openEditModal} 
                  onDelete={handleDeleteLead} 
                  onAddLead={handleSaveLead} 
                  currentUser={currentUser}
                />
             </div>
          )}
          {view === 'nurture' && <NurtureMode leads={leads} onUpdateLead={handleSaveLead} />}
          {view === 'team' && <TeamManagement agents={agents} setAgents={setAgents} leads={leads} onUpdateLead={handleSaveLead} />}
          {view === 'settings' && (
            <SettingsView 
              projects={projects} 
              setProjects={setProjects} 
              campaigns={campaigns} 
              setCampaigns={setCampaigns} 
              pricingConfig={pricingConfig}
              setPricingConfig={setPricingConfig}
              agents={agents}
              setAgents={setAgents}
              leadSources={leadSources}
              setLeadSources={setLeadSources}
            />
          )}
          {view === 'bookings' && <BookingModule bookings={bookings} />}
          {view === 'sales' && (
            <SalesModule 
                projects={projects} 
                leads={leads} 
                inventory={inventory} 
                setInventory={setInventory} 
                onAddBooking={handleAddBooking}
                onUpdateLead={handleSaveLead}
                pricingConfig={pricingConfig}
            />
          )}
          {view === 'reception' && (
              <ReceptionModule 
                leads={leads}
                agents={agents}
                siteVisits={siteVisits}
                projects={projects}
                onAddLead={handleSaveLead}
                onUpdateLead={handleSaveLead}
                onCheckIn={handleAddVisit}
                onUpdateVisit={handleUpdateVisit}
                leadSources={leadSources}
              />
          )}
          {view === 'channel-partners' && (
              <ChannelPartnerModule 
                partners={channelPartners}
                setPartners={setChannelPartners}
                leads={leads}
                onAddLead={handleSaveLead}
                projects={projects}
                inventory={inventory}
                invoices={invoices}
                onAddInvoice={handleSaveInvoice}
              />
          )}
          
          {/* New Strategic Modules */}
          {view === 'marketing' && <MarketingModule campaigns={marketingCampaigns} setCampaigns={setMarketingCampaigns} />}
          {view === 'construction' && <ConstructionModule projects={projects} />}
          {view === 'incentives' && <IncentiveModule agents={agents} bookingsCount={agentSalesCounts} />}
          {view === 'cockpit' && <CockpitModule leads={leads} bookings={bookings} inventory={inventory} />}

          
          {/* Placeholder for new modules */}
          {(view === 'visits') && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                  <div className="bg-white p-8 rounded-full shadow-sm mb-4">
                      {view === 'visits' && <HardHat className="w-12 h-12 text-yellow-500" />}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">Module Under Construction</h2>
                  <p className="text-slate-500 text-center max-w-md">
                      The <b>{getHeaderTitle()}</b> module is currently being set up with specific configurations for Sonawane Group.
                  </p>
              </div>
          )}
        </div>

      </main>

      {/* Modals */}
      <LeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveLead}
        initialData={editingLead}
        projects={projects}
        campaigns={campaigns}
        agents={agents}
        leadSources={leadSources}
      />
    </div>
  );
};

export default App;
