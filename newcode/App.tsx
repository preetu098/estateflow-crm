
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
import DeveloperHub from './components/DeveloperHub';
import OperationsModule from './components/OperationsModule';
import CustomerPortal from './components/CustomerPortal';
import VendorModule from './components/VendorModule';
import LegalModule from './components/LegalModule';
import ReportsModule from './components/ReportsModule';
import QualityAuditModule from './components/QualityAuditModule';
import LandingPageBuilder from './components/LandingPageBuilder';
import DataArchivalModule from './components/DataArchivalModule';
import SuperAdminModule from './components/SuperAdminModule';
import LoanModule from './components/LoanModule';
import SnaggingModule from './components/SnaggingModule';
import ImportLeadsModal, { ImportType } from './components/ImportLeadsModal';
import { MOCK_LEADS, INITIAL_PROJECTS, INITIAL_CAMPAIGNS, INITIAL_AGENTS, MOCK_BOOKINGS, generateInventory, DEFAULT_PRICING_CONFIG, MOCK_CHANNEL_PARTNERS, MOCK_INVOICES, MOCK_CAMPAIGNS, DEFAULT_SECURITY_CONFIG, MOCK_EMAIL_TEMPLATES, DEFAULT_FEATURE_FLAGS, MOCK_CONSTRUCTION_LOGS, MOCK_VENDORS, MOCK_TENANTS, SAAS_PLANS } from './constants';
import { Lead, Project, Agent, Booking, Unit, SiteVisit, PricingConfig, LeadSource, ChannelPartner, CommissionInvoice, MarketingCampaign, LeadStage, SecurityConfig, EmailTemplate, IntegrationConfig, FeatureFlags, ConstructionUpdate, Vendor, Tenant } from './types';
import { Plus, Menu, UserCircle, ChevronDown, HelpCircle, RefreshCw, ShieldAlert } from 'lucide-react';

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
  const [view, setView] = useState<'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception' | 'marketing' | 'construction' | 'incentives' | 'cockpit' | 'developer-hub' | 'operations' | 'customer-portal' | 'procurement' | 'legal' | 'reports' | 'quality-audit' | 'landing-pages' | 'archival' | 'super-admin' | 'loan' | 'snagging'>('dashboard');
  
  // --- MULTI-TENANT STATE ---
  const [currentTenant, setCurrentTenant] = useState<Tenant>(MOCK_TENANTS[0]); // Default to first tenant
  // --------------------------

  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [campaigns, setCampaigns] = useState<string[]>(INITIAL_CAMPAIGNS);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(MOCK_CAMPAIGNS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [inventory, setInventory] = useState<Unit[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [channelPartners, setChannelPartners] = useState<ChannelPartner[]>(MOCK_CHANNEL_PARTNERS);
  const [invoices, setInvoices] = useState<CommissionInvoice[]>(MOCK_INVOICES);
  const [constructionLogs, setConstructionLogs] = useState<ConstructionUpdate[]>(MOCK_CONSTRUCTION_LOGS);
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  
  // New State for Security & Integrations
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(DEFAULT_SECURITY_CONFIG);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(MOCK_EMAIL_TEMPLATES);
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({});
  
  // Computed Feature Flags based on Tenant Plan
  const featureFlags: FeatureFlags = React.useMemo(() => {
      const plan = SAAS_PLANS.find(p => p.name === currentTenant.plan);
      const baseFlags = { ...DEFAULT_FEATURE_FLAGS };
      
      // Reset all to false first
      (Object.keys(baseFlags) as (keyof FeatureFlags)[]).forEach(key => {
          baseFlags[key] = false;
      });

      // Enable based on Plan
      if (plan) {
          plan.features.forEach(f => {
              baseFlags[f] = true;
          });
      }
      return baseFlags;
  }, [currentTenant.plan]);

  // Dynamic Lead Sources (initialized from Enum, but editable)
  const [leadSources, setLeadSources] = useState<string[]>(Object.values(LeadSource));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Global Import Wizard State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Help & Tour State
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // --- GLOBAL USER / ROLE STATE ---
  const [currentUser, setCurrentUser] = useState<Agent>(INITIAL_AGENTS?.[0] || FALLBACK_AGENT);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // --- SECURITY SHIELD EFFECT ---
  useEffect(() => {
      const handleContext = (e: Event) => {
          if (securityConfig.screenShieldEnabled) {
              e.preventDefault();
              return false;
          }
      };
      
      if (securityConfig.screenShieldEnabled) {
          document.addEventListener('contextmenu', handleContext);
          document.addEventListener('copy', handleContext);
          document.addEventListener('selectstart', handleContext);
      } else {
          document.removeEventListener('contextmenu', handleContext);
          document.removeEventListener('copy', handleContext);
          document.removeEventListener('selectstart', handleContext);
      }

      return () => {
          document.removeEventListener('contextmenu', handleContext);
          document.removeEventListener('copy', handleContext);
          document.removeEventListener('selectstart', handleContext);
      }
  }, [securityConfig.screenShieldEnabled]);

  // Load initial data with ROBUST SANITIZATION
  useEffect(() => {
    // ... (Existing data loading logic remains the same)
    // Generate Inventory on first load or when projects change
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
        setLeads(MOCK_LEADS); // Simplified re-hydration for demo
        setAgents(INITIAL_AGENTS);
    } catch (e) {
        console.error("Inventory generation failed", e);
        setInventory([]);
    }

    const tourDone = localStorage.getItem('estateflow_tour_done');
    if (!tourDone) {
        setShowWalkthrough(true);
    }
  }, []);

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

  const handleUpdateBooking = (updatedBooking: Booking) => {
      setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  };
  
  const handleAddVisit = (visit: SiteVisit) => {
      setSiteVisits(prev => [visit, ...prev]);
      if(visit.agentId) {
          setAgents(prev => prev.map(a => a.id === visit.agentId ? {...a, status: 'Busy'} : a));
      }
  };

  const handleUpdateVisit = (updatedVisit: SiteVisit) => {
      setSiteVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
      if(updatedVisit.status === 'Completed' && updatedVisit.agentId) {
         setAgents(prev => prev.map(a => a.id === updatedVisit.agentId ? {...a, status: 'Online'} : a));
      }
  };
  
  const handleSaveInvoice = (inv: CommissionInvoice) => {
      setInvoices(prev => [...prev, inv]);
  };

  // --- UNIVERSAL IMPORT HANDLER ---
  const handleUniversalImport = (data: any[], type: ImportType) => {
      if (type === 'leads') {
          const newLeads = data as Lead[];
          const processedLeads = newLeads.map(l => {
              if (!l.agentId) {
                  const agent = assignAgentRoundRobin();
                  return { 
                      ...l, 
                      agentId: agent?.id, 
                      agentName: agent?.name || 'Unassigned' 
                  };
              }
              return l;
          });
          setLeads(prev => [...processedLeads, ...prev]);
          alert(`Successfully migrated ${processedLeads.length} Leads!`);
      } 
      else if (type === 'inventory') {
          const newUnits = data as Unit[];
          const safeUnits = newUnits.filter(nu => !inventory.some(eu => eu.id === nu.id));
          setInventory(prev => [...prev, ...safeUnits]);
          alert(`Successfully added ${safeUnits.length} Units to Inventory!`);
      }
      else if (type === 'partners') {
          const newPartners = data as ChannelPartner[];
          const safePartners = newPartners.filter(np => !channelPartners.some(cp => cp.mobile === np.mobile));
          setChannelPartners(prev => [...prev, ...safePartners]);
          alert(`Successfully onboarded ${safePartners.length} Channel Partners!`);
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

  const handleFactoryReset = () => {
      if(confirm("CRITICAL: This will wipe all data and restore the factory demo state. Continue?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleBulkTransfer = (fromAgentId: string, toAgentId: string) => {
      const targetAgent = agents.find(a => a.id === toAgentId);
      if(!targetAgent) return;

      setLeads(prev => prev.map(l => {
          if(l.agentId === fromAgentId) {
              return {
                  ...l,
                  agentId: toAgentId,
                  agentName: targetAgent.name,
                  remarksHistory: [
                      ...l.remarksHistory,
                      {
                          timestamp: new Date().toISOString(),
                          text: `System: Bulk Transfer from ${agents.find(a=>a.id===fromAgentId)?.name} to ${targetAgent.name} due to deactivation.`,
                          author: 'System'
                      }
                  ]
              }
          }
          return l;
      }));
  };

  const getHeaderTitle = () => {
    if (view === 'super-admin') return 'Super Admin Console';
    // Dynamic Terminology
    const leadTerm = currentTenant.branding.terminology['Lead'] || 'Lead';
    const unitTerm = currentTenant.branding.terminology['Unit'] || 'Unit';

    switch(view) {
      case 'dashboard': return 'Analytical Dashboards';
      case 'leads': return `${leadTerm} Management`;
      case 'nurture': return 'Pre-sales Center';
      case 'settings': return 'Admin Configuration';
      case 'team': return 'Team Leader Dashboard';
      case 'channel-partners': return 'Channel Partner Connect';
      case 'bookings': return 'Bookings & Customers';
      case 'visits': return 'Visit Management';
      case 'sales': return `Sales Center (${unitTerm}s)`;
      case 'reception': return 'Front Desk / Reception';
      case 'marketing': return 'Marketing & Campaigns';
      case 'construction': return 'Site Engineering';
      case 'incentives': return 'HR & Incentives';
      case 'cockpit': return 'Director\'s Cockpit';
      case 'developer-hub': return 'Developer Hub & CTO';
      case 'operations': return 'Operations & Fraud Control';
      case 'customer-portal': return 'Customer Pulse App';
      case 'procurement': return 'Vendor & Procurement Hub';
      case 'legal': return 'Legal & Compliance Vault';
      case 'reports': return 'Advanced Report Builder';
      case 'quality-audit': return 'Call Quality Audit';
      case 'landing-pages': return 'Landing Page Builder';
      case 'archival': return 'System Health & Archival';
      case 'loan': return 'Loan & Banker Management';
      case 'snagging': return 'Snagging & Quality Control';
      default: return currentTenant.name;
    }
  };

  // Aggregation for Incentives
  const agentSalesCounts = bookings.reduce((acc, booking) => {
      const lead = leads.find(l => l.id === booking.leadId);
      if (lead && lead.agentId) {
          acc[lead.agentId] = (acc[lead.agentId] || 0) + 1;
      }
      return acc;
  }, {} as Record<string, number>);

  const handleSwitchRole = (role: Agent['role']) => {
      const agent = agents.find(a => a.role === role) || agents[0] || FALLBACK_AGENT;
      setCurrentUser(agent);
      
      if (role === 'Presales') setView('leads');
      else if (role === 'Sales') setView('sales');
      else if (role === 'Reception') setView('reception');
      else if (role === 'Legal') setView('legal');
      else if (role === 'Banker') setView('loan');
      else setView('dashboard');
      
      setShowRoleSwitcher(false);
  };

  // Handle Tenant Switching (Super Admin Action)
  const handleSwitchTenant = (tenantId: string) => {
      const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
      if (tenant) {
          setCurrentTenant(tenant);
          setView('dashboard'); // Reset view to dashboard of new tenant
          alert(`Switched context to ${tenant.name}`);
      }
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
            setView={(v) => { setView(v as any); setSidebarOpen(false); }} 
            currentUser={currentUser}
            featureFlags={featureFlags}
            tenantName={currentTenant.name}
            primaryColor={currentTenant.branding.primaryColor}
        />
        {securityConfig.screenShieldEnabled && (
            <div className="absolute bottom-16 left-4 right-4 bg-red-900/80 p-3 rounded-lg border border-red-500/50 flex items-center gap-2 text-red-200 text-xs">
                <ShieldAlert className="w-4 h-4 animate-pulse" /> Security Shield Active
            </div>
        )}
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
                          <button onClick={() => handleSwitchRole('Banker')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm hover:text-blue-600">Banker / Finance</button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button onClick={handleFactoryReset} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm hover:text-red-600 flex items-center gap-2 text-red-500 font-bold">
                              <RefreshCw className="w-3 h-3" /> Factory Reset
                          </button>
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
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: currentTenant.branding.primaryColor }}
                >
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add {currentTenant.branding.terminology['Lead'] || 'Lead'}</span>
                </button>
              )}
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-auto p-0 relative">
          {view === 'super-admin' && <SuperAdminModule activeTenant={currentTenant} onSwitchTenant={handleSwitchTenant} />}
          {view === 'dashboard' && <Dashboard leads={leads} />}
          {view === 'leads' && (
             <div className="p-6 h-full">
                <LeadsTable 
                  leads={leads} 
                  projects={projects} 
                  onEdit={openEditModal} 
                  onDelete={handleDeleteLead} 
                  onAddLead={handleSaveLead} 
                  currentUser={currentUser}
                  onOpenImportWizard={() => setIsImportModalOpen(true)}
                />
             </div>
          )}
          {view === 'nurture' && featureFlags.presalesDialer && <NurtureMode leads={leads} onUpdateLead={handleSaveLead} />}
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
              onOpenImportWizard={() => setIsImportModalOpen(true)}
              securityConfig={securityConfig}
              setSecurityConfig={setSecurityConfig}
              emailTemplates={emailTemplates}
              setEmailTemplates={setEmailTemplates}
              integrationConfig={integrationConfig}
              setIntegrationConfig={setIntegrationConfig}
              leads={leads}
              onBulkTransfer={handleBulkTransfer}
            />
          )}
          {view === 'bookings' && featureFlags.postSales && <BookingModule bookings={bookings} />}
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
          {view === 'reception' && featureFlags.visitEngine && (
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
          {view === 'channel-partners' && featureFlags.cpModule && (
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
          {view === 'marketing' && featureFlags.marketingModule && <MarketingModule campaigns={marketingCampaigns} setCampaigns={setMarketingCampaigns} />}
          {view === 'construction' && featureFlags.constructionModule && <ConstructionModule projects={projects} logs={constructionLogs} setLogs={setConstructionLogs} />}
          {view === 'incentives' && <IncentiveModule agents={agents} bookingsCount={agentSalesCounts} />}
          {view === 'cockpit' && <CockpitModule leads={leads} bookings={bookings} inventory={inventory} />}
          {view === 'operations' && featureFlags.operationsModule && <OperationsModule />}
          {view === 'procurement' && featureFlags.procurementModule && <VendorModule vendors={vendors} setVendors={setVendors} projects={projects} />}
          {view === 'legal' && featureFlags.legalModule && <LegalModule />}
          
          {/* New Physical Dependency Modules */}
          {view === 'loan' && featureFlags.loanModule && <LoanModule bookings={bookings} onUpdateBooking={handleUpdateBooking} currentUser={currentUser} />}
          {view === 'snagging' && featureFlags.snaggingModule && <SnaggingModule bookings={bookings} projects={projects} />}

          {/* The Brain Modules */}
          {view === 'reports' && featureFlags.reportsModule && <ReportsModule leads={leads} bookings={bookings} inventory={inventory} />}
          {view === 'quality-audit' && <QualityAuditModule />}
          {view === 'landing-pages' && <LandingPageBuilder />}
          {view === 'archival' && <DataArchivalModule />}
          
          {/* Developer Hub */}
          {view === 'developer-hub' && (
              <DeveloperHub />
          )}

          {/* Customer Portal Simulator */}
          {view === 'customer-portal' && (
              <CustomerPortal 
                  bookings={bookings}
                  projects={projects}
                  constructionLogs={constructionLogs}
              />
          )}
          
          {/* Placeholder for disabled modules */}
          {!featureFlags[view as keyof FeatureFlags] && view !== 'dashboard' && view !== 'super-admin' && view !== 'settings' && view !== 'team' && view !== 'leads' && view !== 'customer-portal' && view !== 'developer-hub' && view !== 'incentives' && view !== 'cockpit' && view !== 'quality-audit' && view !== 'landing-pages' && view !== 'archival' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                  <div className="bg-white p-8 rounded-full shadow-sm mb-4">
                      <ShieldAlert className="w-12 h-12 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">Module Not Available</h2>
                  <p className="text-slate-500 text-center max-w-md">
                      The <b>{getHeaderTitle()}</b> module is not included in the <b>{currentTenant.plan}</b> plan.
                      <br/>Please contact Super Admin to upgrade.
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
        customFields={currentTenant.customFields || []} // Dynamic Fields injection
        leads={leads} // Pass leads for duplicate check
      />

      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleUniversalImport}
        projects={projects}
        existingLeads={leads}
      />
    </div>
  );
};

export default App;
