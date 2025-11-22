

import React, { useEffect } from 'react';
import { LayoutDashboard, Users, Settings, Building2, PhoneCall, Briefcase, UserCog, Handshake, FileCheck, ScanLine, ConciergeBell, Megaphone, HardHat, Trophy, LineChart, Terminal, ShieldCheck, Smartphone, Truck, Scale, FileSpreadsheet, Headphones, Archive, Globe, LayoutGrid, Landmark, ClipboardList } from 'lucide-react';
import { Agent, FeatureFlags } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception' | 'marketing' | 'construction' | 'incentives' | 'cockpit' | 'developer-hub' | 'operations' | 'customer-portal' | 'procurement' | 'legal' | 'reports' | 'quality-audit' | 'landing-pages' | 'archival' | 'super-admin' | 'loan' | 'snagging';
  setView: (view: 'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception' | 'marketing' | 'construction' | 'incentives' | 'cockpit' | 'developer-hub' | 'operations' | 'customer-portal' | 'procurement' | 'legal' | 'reports' | 'quality-audit' | 'landing-pages' | 'archival' | 'super-admin' | 'loan' | 'snagging') => void;
  currentUser: Agent;
  featureFlags?: FeatureFlags;
  tenantName?: string;
  primaryColor?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, featureFlags, tenantName = 'EstateFlow', primaryColor = '#2563eb' }) => {
  
  // Dynamic class for navigation items based on active state and primary color
  const navClass = (view: string) => {
      const isActive = currentView === view;
      // Using inline style for dynamic color injection
      return `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'text-white shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;
  };

  const activeStyle = { backgroundColor: primaryColor };

  // Define Visibility based on Role
  const showAdmin = currentUser.role === 'SuperAdmin' || currentUser.role === 'TeamLeader';
  const showPresales = currentUser.role === 'SuperAdmin' || currentUser.role === 'Presales' || currentUser.role === 'TeamLeader';
  const showSales = currentUser.role === 'SuperAdmin' || currentUser.role === 'Sales' || currentUser.role === 'SalesHead';
  const showReception = currentUser.role === 'SuperAdmin' || currentUser.role === 'Reception';
  const showLegal = currentUser.role === 'SuperAdmin' || currentUser.role === 'Legal';
  const showBanker = currentUser.role === 'SuperAdmin' || currentUser.role === 'Banker';
  
  const showExec = currentUser.role === 'SuperAdmin' || currentUser.role === 'SalesHead';

  // Default flags if not provided
  const flags = featureFlags || {
      cpModule: true,
      postSales: true,
      presalesDialer: true,
      visitEngine: true,
      pricingVisibility: true,
      operationsModule: true,
      marketingModule: true,
      reportsModule: true,
      constructionModule: true,
      procurementModule: true,
      legalModule: true,
      loanModule: true,
      snaggingModule: true
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full hidden md:flex border-r border-slate-800 relative">
      <div className="p-6 flex items-center gap-3 text-white">
        <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
            style={{ backgroundColor: primaryColor }}
        >
          <Building2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight truncate">{tenantName}</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        
        {/* SUPER ADMIN ONLY */}
        {currentUser.role === 'SuperAdmin' && (
            <button 
                onClick={() => setView('super-admin')} 
                className={navClass('super-admin')}
                style={currentView === 'super-admin' ? { backgroundColor: '#dc2626' } : {}} // Always Red for Super Admin
            >
                <LayoutGrid className="w-5 h-5" />
                <span className="font-medium">Super Admin</span>
            </button>
        )}

        {/* 1. THE ENGINE (BACKEND) */}
        {showAdmin && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">The Engine</div>
                <button onClick={() => setView('settings')} className={navClass('settings')} style={currentView === 'settings' ? activeStyle : {}}>
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Global Settings</span>
                </button>
                <button onClick={() => setView('team')} className={navClass('team')} style={currentView === 'team' ? activeStyle : {}}>
                    <UserCog className="w-5 h-5" />
                    <span className="font-medium">Team & Roster</span>
                </button>
                <button onClick={() => setView('incentives')} className={navClass('incentives')} style={currentView === 'incentives' ? activeStyle : {}}>
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Incentives</span>
                </button>
                {flags.operationsModule && (
                    <button onClick={() => setView('operations')} className={navClass('operations')} style={currentView === 'operations' ? activeStyle : {}}>
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-medium">Ops & Fraud</span>
                    </button>
                )}
            </>
        )}

        {/* 2. THE GROWTH PILLAR (ACQUISITION) */}
        {(showPresales || showAdmin) && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Growth Pillar</div>
                {showAdmin && flags.marketingModule && (
                    <>
                        <button onClick={() => setView('marketing')} className={navClass('marketing')} style={currentView === 'marketing' ? activeStyle : {}}>
                            <Megaphone className="w-5 h-5" />
                            <span className="font-medium">Marketing ROI</span>
                        </button>
                        <button onClick={() => setView('landing-pages')} className={navClass('landing-pages')} style={currentView === 'landing-pages' ? activeStyle : {}}>
                            <Globe className="w-5 h-5" />
                            <span className="font-medium">Landing Pages</span>
                        </button>
                    </>
                )}
                {flags.presalesDialer && (
                    <button onClick={() => setView('nurture')} className={navClass('nurture')} style={currentView === 'nurture' ? activeStyle : {}}>
                        <PhoneCall className="w-5 h-5" />
                        <span className="font-medium">Presales Dialer</span>
                    </button>
                )}
                <button onClick={() => setView('leads')} className={navClass('leads')} style={currentView === 'leads' ? activeStyle : {}}>
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Lead Central</span>
                </button>
                {(showReception || showAdmin) && flags.visitEngine && (
                    <button onClick={() => setView('reception')} className={navClass('reception')} style={currentView === 'reception' ? activeStyle : {}}>
                        <ConciergeBell className="w-5 h-5" />
                        <span className="font-medium">Reception / Gate</span>
                    </button>
                )}
            </>
        )}

        {/* 3. THE REVENUE PILLAR (TRANSACTION) */}
        {(showSales || showBanker) && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Revenue Pillar</div>
                {showSales && (
                    <button onClick={() => setView('sales')} className={navClass('sales')} style={currentView === 'sales' ? activeStyle : {}}>
                        <ScanLine className="w-5 h-5" />
                        <span className="font-medium">Sales Center</span>
                    </button>
                )}
                {(showBanker || showSales) && flags.loanModule && (
                    <button onClick={() => setView('loan')} className={navClass('loan')} style={currentView === 'loan' ? activeStyle : {}}>
                        <Landmark className="w-5 h-5" />
                        <span className="font-medium">Loan Management</span>
                    </button>
                )}
                {showAdmin && flags.cpModule && (
                    <button onClick={() => setView('channel-partners')} className={navClass('channel-partners')} style={currentView === 'channel-partners' ? activeStyle : {}}>
                        <Handshake className="w-5 h-5" />
                        <span className="font-medium">Channel Partners</span>
                    </button>
                )}
            </>
        )}

        {/* 4. THE OPERATIONS PILLAR (FULFILLMENT) */}
        {(showAdmin || showSales || showLegal) && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Operations Pillar</div>
                {showSales && flags.postSales && (
                    <button onClick={() => setView('bookings')} className={navClass('bookings')} style={currentView === 'bookings' ? activeStyle : {}}>
                        <FileCheck className="w-5 h-5" />
                        <span className="font-medium">Bookings & CRM</span>
                    </button>
                )}
                {showAdmin && flags.constructionModule && (
                    <button onClick={() => setView('construction')} className={navClass('construction')} style={currentView === 'construction' ? activeStyle : {}}>
                        <HardHat className="w-5 h-5" />
                        <span className="font-medium">Site Engineering</span>
                    </button>
                )}
                {showAdmin && flags.snaggingModule && (
                    <button onClick={() => setView('snagging')} className={navClass('snagging')} style={currentView === 'snagging' ? activeStyle : {}}>
                        <ClipboardList className="w-5 h-5" />
                        <span className="font-medium">Snagging & QC</span>
                    </button>
                )}
                {showAdmin && flags.procurementModule && (
                    <button onClick={() => setView('procurement')} className={navClass('procurement')} style={currentView === 'procurement' ? activeStyle : {}}>
                        <Truck className="w-5 h-5" />
                        <span className="font-medium">Procurement</span>
                    </button>
                )}
                {(showAdmin || showLegal) && flags.legalModule && (
                    <button onClick={() => setView('legal')} className={navClass('legal')} style={currentView === 'legal' ? activeStyle : {}}>
                        <Scale className="w-5 h-5" />
                        <span className="font-medium">Legal Vault</span>
                    </button>
                )}
            </>
        )}

        {/* 5. THE BRAIN (INTELLIGENCE) */}
        {(showExec || showAdmin) && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">The Brain</div>
                <button onClick={() => setView('cockpit')} className={navClass('cockpit')} style={currentView === 'cockpit' ? activeStyle : {}}>
                    <LineChart className="w-5 h-5" />
                    <span className="font-medium">Director's Cockpit</span>
                </button>
                {flags.reportsModule && (
                    <button onClick={() => setView('reports')} className={navClass('reports')} style={currentView === 'reports' ? activeStyle : {}}>
                        <FileSpreadsheet className="w-5 h-5" />
                        <span className="font-medium">Custom Reports</span>
                    </button>
                )}
                <button onClick={() => setView('quality-audit')} className={navClass('quality-audit')} style={currentView === 'quality-audit' ? activeStyle : {}}>
                    <Headphones className="w-5 h-5" />
                    <span className="font-medium">Call Audit (QA)</span>
                </button>
                <button onClick={() => setView('archival')} className={navClass('archival')} style={currentView === 'archival' ? activeStyle : {}}>
                    <Archive className="w-5 h-5" />
                    <span className="font-medium">Data Archival</span>
                </button>
                <button onClick={() => setView('developer-hub')} className={navClass('developer-hub')} style={currentView === 'developer-hub' ? activeStyle : {}}>
                    <Terminal className="w-5 h-5" />
                    <span className="font-medium">Developer Hub</span>
                </button>
            </>
        )}

        {/* MISC: SIMULATORS */}
        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Simulators</div>
        <button onClick={() => setView('customer-portal')} className={navClass('customer-portal')} style={currentView === 'customer-portal' ? activeStyle : {}}>
            <Smartphone className="w-5 h-5" />
            <span className="font-medium">Customer App</span>
        </button>

      </nav>

      <div className="p-4 border-t border-slate-800">
         <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
             <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
             >
                 {currentUser.name.charAt(0)}
             </div>
             <div>
                 <div className="text-white font-bold">{currentUser.name}</div>
                 <div className="text-xs opacity-70">{currentUser.role}</div>
             </div>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
