
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
import { MOCK_LEADS, INITIAL_PROJECTS, INITIAL_CAMPAIGNS, INITIAL_AGENTS, MOCK_BOOKINGS, generateInventory, DEFAULT_PRICING_CONFIG } from './constants';
import { Lead, Project, Agent, Booking, Unit, SiteVisit, PricingConfig, LeadSource } from './types';
import { Plus, Menu, MonitorSmartphone, HardHat, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [campaigns, setCampaigns] = useState<string[]>(INITIAL_CAMPAIGNS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inventory, setInventory] = useState<Unit[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  
  // Dynamic Lead Sources (initialized from Enum, but editable)
  const [leadSources, setLeadSources] = useState<string[]>(Object.values(LeadSource));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Help & Tour State
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Load initial data
  useEffect(() => {
    const storedLeads = localStorage.getItem('estateflow_leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      setLeads(MOCK_LEADS);
    }
    
    const storedProjects = localStorage.getItem('estateflow_projects');
    if (storedProjects) setProjects(JSON.parse(storedProjects));

    const storedCampaigns = localStorage.getItem('estateflow_campaigns');
    if (storedCampaigns) setCampaigns(JSON.parse(storedCampaigns));

    const storedAgents = localStorage.getItem('estateflow_agents');
    if (storedAgents) {
        setAgents(JSON.parse(storedAgents));
    }

    const storedBookings = localStorage.getItem('estateflow_bookings');
    if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
    } else {
        setBookings(MOCK_BOOKINGS);
    }

    const storedVisits = localStorage.getItem('estateflow_sitevisits');
    if (storedVisits) {
        setSiteVisits(JSON.parse(storedVisits));
    }

    const storedPricing = localStorage.getItem('estateflow_pricing');
    if (storedPricing) {
      setPricingConfig(JSON.parse(storedPricing));
    }
    
    const storedSources = localStorage.getItem('estateflow_sources');
    if (storedSources) {
        setLeadSources(JSON.parse(storedSources));
    }

    // Check for first time user
    const tourDone = localStorage.getItem('estateflow_tour_done');
    if (!tourDone) {
        setShowWalkthrough(true);
    }
  }, []);

  // Generate Inventory on first load or when projects change (simplified)
  useEffect(() => {
      const storedInv = localStorage.getItem('estateflow_inventory');
      if (storedInv) {
          setInventory(JSON.parse(storedInv));
      } else {
          // Generate mock inventory for all projects
          let initialInventory: Unit[] = [];
          INITIAL_PROJECTS.forEach(p => {
             initialInventory = [...initialInventory, ...generateInventory(p.id)];
          });
          setInventory(initialInventory);
      }
  }, []);


  // Sync storage
  useEffect(() => { localStorage.setItem('estateflow_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('estateflow_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('estateflow_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('estateflow_agents', JSON.stringify(agents)); }, [agents]);
  useEffect(() => { localStorage.setItem('estateflow_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('estateflow_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('estateflow_sitevisits', JSON.stringify(siteVisits)); }, [siteVisits]);
  useEffect(() => { localStorage.setItem('estateflow_pricing', JSON.stringify(pricingConfig)); }, [pricingConfig]);
  useEffect(() => { localStorage.setItem('estateflow_sources', JSON.stringify(leadSources)); }, [leadSources]);

  /**
   * Intelligent Round Robin Assignment (LRU)
   * Logic: 
   * 1. Filter agents where role='Presales' and active=true
   * 2. Sort by lastLeadAssignedAt (Ascending) -> The one who waited longest gets it.
   * 3. Assign lead, update timestamp.
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
      case 'channel-partners': return 'Channel Partner Center';
      case 'bookings': return 'Bookings & Customers';
      case 'visits': return 'Visit Management';
      case 'sales': return 'Sales Closing Center';
      case 'reception': return 'Front Desk / Reception';
      default: return 'EstateFlow';
    }
  };

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
        <Sidebar currentView={view} setView={(v) => { setView(v); setSidebarOpen(false); }} />
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
          {view === 'leads' && <div className="p-6 h-full"><LeadsTable leads={leads} projects={projects} onEdit={openEditModal} onDelete={handleDeleteLead} /></div>}
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
          
          {/* Placeholder for new modules */}
          {(view === 'channel-partners' || view === 'visits') && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                  <div className="bg-white p-8 rounded-full shadow-sm mb-4">
                      {view === 'channel-partners' && <MonitorSmartphone className="w-12 h-12 text-blue-500" />}
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
