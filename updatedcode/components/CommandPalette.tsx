
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowRight, User, Building, FileText, Settings, Plus, LayoutGrid, HelpCircle, Command, X } from 'lucide-react';
import { Lead, Booking } from '../types';
import { NAVIGATION_GROUPS } from '../config/NavigationConfig';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  bookings: Booking[];
  onNavigate: (viewId: string) => void;
  onAction: (action: string, payload?: any) => void;
}

type ResultType = 'navigation' | 'lead' | 'booking' | 'action' | 'help';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, leads, bookings, onNavigate, onAction 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        // Scroll into view logic could go here
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]); // Removed 'results' from deps to avoid loop, handled via ref or memo if needed, but here it's fine as results derive from query

  // Search Logic
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) {
      // Default Suggestions
      return [
        {
          id: 'nav-dashboard',
          type: 'navigation',
          title: 'Go to Dashboard',
          group: 'Quick Access',
          icon: LayoutGrid,
          action: () => onNavigate('dashboard')
        },
        {
          id: 'act-add-lead',
          type: 'action',
          title: 'Add New Lead',
          group: 'Quick Access',
          icon: Plus,
          action: () => onAction('add_lead')
        },
        {
          id: 'nav-leads',
          type: 'navigation',
          title: 'All Leads',
          group: 'Quick Access',
          icon: User,
          action: () => onNavigate('leads')
        },
        {
          id: 'nav-sales',
          type: 'navigation',
          title: 'Sales Center',
          group: 'Quick Access',
          icon: Building,
          action: () => onNavigate('sales')
        }
      ];
    }

    const q = query.toLowerCase();
    const combined: SearchResult[] = [];

    // 1. Actions
    if ('add lead'.includes(q) || 'create lead'.includes(q) || 'new lead'.includes(q)) {
        combined.push({ id: 'act-new-lead', type: 'action', title: 'Add New Lead', group: 'Actions', icon: Plus, action: () => onAction('add_lead') });
    }
    if ('settings'.includes(q) || 'config'.includes(q)) {
        combined.push({ id: 'nav-settings', type: 'navigation', title: 'Open Settings', group: 'Actions', icon: Settings, action: () => onNavigate('settings') });
    }

    // 2. Navigation
    NAVIGATION_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (item.label.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) {
          combined.push({
            id: `nav-${item.id}`,
            type: 'navigation',
            title: item.label,
            subtitle: item.description,
            group: 'Pages',
            icon: item.icon,
            action: () => onNavigate(item.id)
          });
        }
      });
    });

    // 3. Leads (Top 5)
    const matchedLeads = leads.filter(l => l.name.toLowerCase().includes(q) || l.mobile.includes(q)).slice(0, 5);
    matchedLeads.forEach(l => {
      combined.push({
        id: `lead-${l.id}`,
        type: 'lead',
        title: l.name,
        subtitle: `${l.project} • ${l.stage}`,
        group: 'Leads',
        icon: User,
        action: () => onAction('edit_lead', l)
      });
    });

    // 4. Bookings (Top 3)
    const matchedBookings = bookings.filter(b => b.customerName.toLowerCase().includes(q) || b.unitNumber.toLowerCase().includes(q)).slice(0, 3);
    matchedBookings.forEach(b => {
      combined.push({
        id: `bk-${b.id}`,
        type: 'booking',
        title: `${b.customerName} (${b.unitNumber})`,
        subtitle: `Booking ID: ${b.id} • ${b.status}`,
        group: 'Bookings',
        icon: FileText,
        action: () => { onNavigate('bookings'); /* In a real app, trigger selection in booking module */ }
      });
    });

    return combined;
  }, [query, leads, bookings]);

  // Grouping for Display
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    return groups;
  }, [results]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-slate-900/40 backdrop-blur-sm px-4 transition-all">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-lg bg-transparent outline-none text-slate-800 placeholder:text-slate-400 h-10"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">ESC</span>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400"><X className="w-5 h-5"/></button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar bg-slate-50/50">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No results found for <span className="font-bold text-slate-600">"{query}"</span></p>
              <p className="text-sm mt-1">Try searching for leads, pages, or actions.</p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([group, items]) => (
              <div key={group} className="mb-2">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
                  {group}
                </div>
                <div className="px-2">
                  {items.map((item) => {
                    // Calculate absolute index for highlighting
                    const absIndex = results.findIndex(r => r.id === item.id);
                    const isSelected = absIndex === selectedIndex;
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => { item.action(); onClose(); }}
                        onMouseEnter={() => setSelectedIndex(absIndex)}
                        className={`
                          px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-100
                          ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-200/50'}
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected && <ArrowRight className="w-4 h-4 text-white/80" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400">
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><span className="bg-white border border-slate-200 rounded px-1">↵</span> Select</span>
            <span className="flex items-center gap-1"><span className="bg-white border border-slate-200 rounded px-1">↑↓</span> Navigate</span>
          </div>
          <div>Universal Search Module (v1.0)</div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
