
import React from 'react';
import { LayoutDashboard, Users, Settings, Building2, PhoneCall, Briefcase, UserCog, Handshake, FileCheck, Map, ScanLine, ConciergeBell } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception';
  setView: (view: 'dashboard' | 'leads' | 'nurture' | 'settings' | 'team' | 'channel-partners' | 'bookings' | 'visits' | 'sales' | 'reception') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  
  const navClass = (view: string) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === view ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full hidden md:flex border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">EstateFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        
        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Analytics</div>
        <button onClick={() => setView('dashboard')} className={navClass('dashboard')}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </button>

        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Front Office</div>
        <button onClick={() => setView('reception')} className={navClass('reception')}>
          <ConciergeBell className="w-5 h-5" />
          <span className="font-medium">Reception / GRE</span>
        </button>

        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Sales Operations</div>
        <button onClick={() => setView('nurture')} className={navClass('nurture')}>
          <PhoneCall className="w-5 h-5" />
          <span className="font-medium">Presales Nurture</span>
        </button>
        <button onClick={() => setView('leads')} className={navClass('leads')}>
          <Users className="w-5 h-5" />
          <span className="font-medium">Lead Management</span>
        </button>
        <button onClick={() => setView('sales')} className={navClass('sales')}>
          <ScanLine className="w-5 h-5" />
          <span className="font-medium">Sales Center (Tablet)</span>
        </button>
        
        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Post Sales & Partners</div>
        <button onClick={() => setView('channel-partners')} className={navClass('channel-partners')}>
          <Handshake className="w-5 h-5" />
          <span className="font-medium">Channel Partners</span>
        </button>
         <button onClick={() => setView('bookings')} className={navClass('bookings')}>
          <FileCheck className="w-5 h-5" />
          <span className="font-medium">Bookings & Clients</span>
        </button>

        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Admin & Team</div>
        <button onClick={() => setView('team')} className={navClass('team')}>
          <UserCog className="w-5 h-5" />
          <span className="font-medium">Team Leader</span>
        </button>
        <button onClick={() => setView('settings')} className={navClass('settings')}>
          <Briefcase className="w-5 h-5" />
          <span className="font-medium">Configuration</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-2 text-sm hover:text-white transition w-full text-slate-400">
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
