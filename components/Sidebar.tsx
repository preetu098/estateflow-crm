
import React, { useEffect } from 'react';
import { LayoutDashboard, Users, Settings, Building2, PhoneCall, Briefcase, UserCog, Handshake, FileCheck, Map, ScanLine, ConciergeBell, Megaphone, HardHat, Trophy, LineChart } from 'lucide-react';
import { Agent } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception' | 'marketing' | 'construction' | 'incentives' | 'cockpit';
  setView: (view: 'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception' | 'marketing' | 'construction' | 'incentives' | 'cockpit') => void;
  currentUser: Agent;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser }) => {
  
  const navClass = (view: string) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === view ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`;

  // Define Visibility based on Role
  const showAdmin = currentUser.role === 'SuperAdmin' || currentUser.role === 'TeamLeader';
  const showPresales = currentUser.role === 'SuperAdmin' || currentUser.role === 'Presales' || currentUser.role === 'TeamLeader';
  const showSales = currentUser.role === 'SuperAdmin' || currentUser.role === 'Sales' || currentUser.role === 'SalesHead';
  const showReception = currentUser.role === 'SuperAdmin' || currentUser.role === 'Reception';
  
  const showExec = currentUser.role === 'SuperAdmin' || currentUser.role === 'SalesHead';

  // Ensure we don't stay on a hidden view if role changes
  useEffect(() => {
     // Simplified check: if in sales mode but role is presales, go to leads
     if (!showSales && (currentView === 'sales' || currentView === 'bookings')) {
         setView('leads');
     }
  }, [currentUser.role]);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full hidden md:flex border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">EstateFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        
        {showExec && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Executive</div>
                <button onClick={() => setView('cockpit')} className={navClass('cockpit')}>
                <LineChart className="w-5 h-5" />
                <span className="font-medium">Director's Cockpit</span>
                </button>
            </>
        )}

        {(showReception || showAdmin) && (
             <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Front Office</div>
                <button onClick={() => setView('reception')} className={navClass('reception')}>
                    <ConciergeBell className="w-5 h-5" />
                    <span className="font-medium">Reception / GRE</span>
                </button>
             </>
        )}

        {(showPresales) && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Presales (Calling)</div>
                <button onClick={() => setView('dashboard')} className={navClass('dashboard')}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Overview</span>
                </button>
                <button onClick={() => setView('leads')} className={navClass('leads')}>
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Lead Management</span>
                </button>
                <button onClick={() => setView('nurture')} className={navClass('nurture')}>
                    <PhoneCall className="w-5 h-5" />
                    <span className="font-medium">Nurture Mode</span>
                </button>
            </>
        )}
        
        {(showSales) && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Closing Team</div>
                <button onClick={() => setView('sales')} className={navClass('sales')}>
                <ScanLine className="w-5 h-5" />
                <span className="font-medium">Sales Center (Tablet)</span>
                </button>
                <button onClick={() => setView('bookings')} className={navClass('bookings')}>
                <FileCheck className="w-5 h-5" />
                <span className="font-medium">Bookings & CRM</span>
                </button>
            </>
        )}

        {showAdmin && (
            <>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Growth & Engineering</div>
                <button onClick={() => setView('marketing')} className={navClass('marketing')}>
                <Megaphone className="w-5 h-5" />
                <span className="font-medium">Marketing ROI</span>
                </button>
                <button onClick={() => setView('construction')} className={navClass('construction')}>
                <HardHat className="w-5 h-5" />
                <span className="font-medium">Site Engineering</span>
                </button>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Partners & Admin</div>
                <button onClick={() => setView('channel-partners')} className={navClass('channel-partners')}>
                <Handshake className="w-5 h-5" />
                <span className="font-medium">Channel Partners</span>
                </button>
                <button onClick={() => setView('team')} className={navClass('team')}>
                <UserCog className="w-5 h-5" />
                <span className="font-medium">Team Leader</span>
                </button>
                <button onClick={() => setView('incentives')} className={navClass('incentives')}>
                <Trophy className="w-5 h-5" />
                <span className="font-medium">HR Incentives</span>
                </button>
                <button onClick={() => setView('settings')} className={navClass('settings')}>
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Configuration</span>
                </button>
            </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
         <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
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
