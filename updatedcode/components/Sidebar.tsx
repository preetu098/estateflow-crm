
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NAVIGATION_GROUPS } from '../config/NavigationConfig';
import { LogOut, ExternalLink } from 'lucide-react';
import { Agent, FeatureFlags } from '../types';
import { ENABLE_POWERED_BY } from '../constants';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  currentUser: Agent;
  featureFlags: FeatureFlags;
  tenantName: string;
  primaryColor: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setView, currentUser, featureFlags, tenantName, primaryColor 
}) => {
  const [hoveredItem, setHoveredItem] = useState<{ label: string; description: string; top: number } | null>(null);

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 shadow-xl w-64 z-40 relative">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
            360
          </div>
          <span className="truncate">{tenantName}</span>
        </div>
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider ml-1">
          Workspace
        </div>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar relative">
        {NAVIGATION_GROUPS.map((group, groupIndex) => {
          const activeItems = group.items.filter(item => {
            if (['dashboard', 'settings', 'developer-hub', 'archival', 'super-admin'].includes(item.id)) return true;
            if (item.id === 'leads') return true;
            if (item.id === 'sales') return true;
            if (item.id === 'bookings') return featureFlags.postSales;
            
            const flagKey = Object.keys(featureFlags).find(key => 
                key.toLowerCase().includes(item.id.replace(/-/g, '')) || 
                (item.id === 'nurture' && key === 'presalesDialer') ||
                (item.id === 'reception' && key === 'visitEngine') ||
                (item.id === 'channel-partners' && key === 'cpModule') ||
                (item.id === 'operations' && key === 'operationsModule')
            );
            if (flagKey) return featureFlags[flagKey as keyof FeatureFlags];
            return true;
          });

          if (activeItems.length === 0) return null;

          return (
            <div key={groupIndex} className="px-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-3">
                {group.title}
              </h3>
              <div className="space-y-1">
                {activeItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setView(item.id)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredItem({
                            label: item.label,
                            description: item.description,
                            top: rect.top
                          });
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
                          ${isActive 
                            ? 'bg-slate-50 text-slate-900 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                        style={isActive ? { borderLeft: `3px solid ${primaryColor}` } : {}}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span>{item.label}</span>
                      </button>
                      {/* Mobile Description (Inline) */}
                      <div className="md:hidden text-[10px] text-slate-400 pl-9 mt-1 mb-2 leading-tight opacity-80">
                        {item.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200 shadow-sm mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* BRANDING FOOTER */}
        {ENABLE_POWERED_BY && (
            <div className="flex flex-col items-center justify-center pt-2 border-t border-slate-200/50 mt-1">
                <a 
                    href="https://corporatespace.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-blue-600 transition-colors duration-200"
                >
                    <span className="opacity-60 group-hover:opacity-100 font-medium">Powered by</span>
                    <span className="font-bold opacity-80 group-hover:opacity-100">CorporateSpace.in</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
            </div>
        )}
      </div>

      {/* Tooltip Portal (Hidden on Mobile) */}
      {hoveredItem && createPortal(
        <div 
          className="hidden md:block fixed left-[270px] w-64 bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl z-[9999] pointer-events-none animate-in fade-in slide-in-from-left-2 duration-200 border border-slate-700/50 backdrop-blur-sm"
          style={{ top: hoveredItem.top }}
        >
          <div className="text-sm font-bold text-white mb-1 tracking-wide flex items-center gap-2">
            {hoveredItem.label}
          </div>
          <div className="text-xs text-slate-300 leading-relaxed border-t border-slate-700 pt-2 mt-1">
            {hoveredItem.description}
          </div>
          {/* Arrow */}
          <div className="absolute left-[-6px] top-6 w-3 h-3 bg-slate-900/95 border-l border-b border-slate-700/50 transform rotate-45"></div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Sidebar;
