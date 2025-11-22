
import React, { useState, useEffect } from 'react';
import { Lead, Agent, SiteVisit, LeadSource, LeadStage, Project } from '../types';
import { Search, UserPlus, Clock, CheckCircle, AlertTriangle, Users, QrCode, LogOut, Bell, Shield, User, Camera, X, AlertCircle, ArrowRightLeft } from 'lucide-react';
import Tooltip from './Tooltip';

interface ReceptionModuleProps {
  leads: Lead[];
  agents: Agent[];
  siteVisits: SiteVisit[];
  projects: Project[];
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onCheckIn: (visit: SiteVisit) => void;
  onUpdateVisit: (visit: SiteVisit) => void;
  leadSources: string[];
}

const ReceptionModule: React.FC<ReceptionModuleProps> = ({ 
  leads, agents, siteVisits, projects, onAddLead, onUpdateLead, onCheckIn, onUpdateVisit, leadSources 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [foundLead, setFoundLead] = useState<Lead | null>(null);
  
  // New Walk-in Form State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newProject, setNewProject] = useState(projects[0]?.name || '');
  const [newSource, setNewSource] = useState<string>('Walk-in');
  
  // Conflict Check State
  const [conflictSource, setConflictSource] = useState<string>('');
  
  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [scanError, setScanError] = useState('');

  const activeVisits = siteVisits.filter(v => v.status !== 'Completed');

  useEffect(() => {
      // Refresh timer for waiting duration
      const timer = setInterval(() => {
          // Force re-render to update relative time displays if needed
      }, 60000);
      return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Fuzzy search: check if mobile ends with query or contains query
    const lead = leads.find(l => l.mobile.includes(searchQuery) || l.id.toLowerCase() === searchQuery.toLowerCase());
    
    if (lead) {
      setSearchResult('found');
      setFoundLead(lead);
      setConflictSource(lead.source); // Default to current source
    } else {
      setSearchResult('not-found');
      setFoundLead(null);
      setNewMobile(searchQuery); // Auto-fill mobile
    }
  };

  // *** HANDOVER LOGIC: Assigns a Closing Manager (Sales Role) ***
  const getAvailableCloser = (): Agent | null => {
      // Round Robin Logic: Active, SALES ROLE, Online
      const eligible = agents
        .filter(a => a.role === 'Sales' && a.active && a.status === 'Online')
        .sort((a, b) => a.lastLeadAssignedAt - b.lastLeadAssignedAt);
      
      return eligible.length > 0 ? eligible[0] : null;
  };

  const handleNewRegistration = () => {
      if (!newName || !newMobile) return;

      const assignedCloser = getAvailableCloser();
      
      // 1. Create Lead
      const newLead: Lead = {
          id: `LD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          campaign: 'Walk-in',
          name: newName,
          mobile: newMobile,
          source: newSource,
          project: newProject,
          stage: LeadStage.NEGOTIATION, // Direct to site visit stage
          subStage: 'Site Visit Done',
          followUpDate: new Date().toISOString().split('T')[0],
          followUpTime: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          agentName: assignedCloser ? assignedCloser.name : 'Unassigned',
          agentId: assignedCloser ? assignedCloser.id : '',
          callCount: 0,
          remarksHistory: [{
              timestamp: new Date().toISOString(),
              text: `Walk-in Registered at Reception. Assigned to Closer ${assignedCloser ? assignedCloser.name : 'Unassigned'}.`,
              author: 'Reception'
          }],
          aiScore: 60
      };

      onAddLead(newLead);

      // 2. Check In
      const newVisit: SiteVisit = {
          id: `VS-${Date.now()}`,
          leadId: newLead.id,
          visitorName: newLead.name,
          mobile: newLead.mobile,
          project: newProject,
          agentId: newLead.agentId || '',
          agentName: newLead.agentName,
          checkInTime: new Date().toISOString(),
          status: 'Waiting',
          sourceType: 'Fresh'
      };

      onCheckIn(newVisit);
      resetForm();
  };

  const handleExistingCheckIn = (lead?: Lead) => {
      const targetLead = lead || foundLead;
      if (!targetLead) return;

      // Conflict Logic only if checking in via Search (manual)
      if (!lead && targetLead.source !== conflictSource && conflictSource !== '') {
          if (!confirm(`CONFLICT ALERT:\nLead is registered as '${targetLead.source}' but is visiting as '${conflictSource}'.\n\nDo you want to proceed and notify the manager?`)) {
              return;
          }
      }

      // *** HANDOVER PROTOCOL ***
      // If current agent is Presales, switch to Sales
      let finalAgentId = targetLead.agentId;
      let finalAgentName = targetLead.agentName;
      let remarksText = 'Re-visited site. Checked in at reception.';

      const currentAgent = agents.find(a => a.id === targetLead.agentId);
      
      // If currently assigned to Presales (or Unassigned), trigger Handover
      if (!currentAgent || currentAgent.role === 'Presales') {
          const closer = getAvailableCloser();
          if (closer) {
              finalAgentId = closer.id;
              finalAgentName = closer.name;
              remarksText = `Site Visit Check-in. HANDOVER from Presales (${targetLead.agentName}) to Closing Manager (${closer.name}).`;
          }
      }

      // Update lead status
      onUpdateLead({
          ...targetLead,
          agentId: finalAgentId,
          agentName: finalAgentName,
          stage: LeadStage.NEGOTIATION, // Bump to Negotiation
          subStage: 'Site Visit Done',
          remarksHistory: [...targetLead.remarksHistory, { timestamp: new Date().toISOString(), text: remarksText, author: 'Reception' }]
      });

      const visit: SiteVisit = {
          id: `VS-${Date.now()}`,
          leadId: targetLead.id,
          visitorName: targetLead.name,
          mobile: targetLead.mobile,
          project: targetLead.project,
          agentId: finalAgentId || '',
          agentName: finalAgentName,
          checkInTime: new Date().toISOString(),
          status: 'Waiting',
          sourceType: 'Revisit'
      };

      onCheckIn(visit);
      resetForm();
      if(isScannerOpen) setIsScannerOpen(false);
  };

  // --- QR SCANNER LOGIC ---
  const handleProcessToken = (token: string) => {
      setScanError('');
      
      // 1. Find Lead
      const lead = leads.find(l => l.visitToken === token);
      if (!lead) {
          setScanError("Invalid Token. Pass not found in system.");
          return;
      }

      // 2. Check Usage
      if (lead.isTokenUsed) {
          setScanError(`Pass Already Used on ${lead.remarksHistory.find(r => r.text.includes('Scanned'))?.timestamp.split('T')[0] || 'Unknown Date'}.`);
          return;
      }

      // 3. Check Expiry
      if (lead.visitTokenExpiry && new Date() > new Date(lead.visitTokenExpiry)) {
           setScanError("Pass Expired. Please register manually.");
           return;
      }

      // 4. SUCCESS
      // Mark token used
      const updatedLead = {
          ...lead,
          isTokenUsed: true,
          remarksHistory: [...lead.remarksHistory, { timestamp: new Date().toISOString(), text: `QR Pass Scanned at Gate. Entry Allowed.`, author: 'Scanner' }]
      };
      // Note: We don't call onUpdateLead here because handleExistingCheckIn will do it with the handover logic
      
      // Check In & Handover
      handleExistingCheckIn(updatedLead);
      
      // Need to find the assigned closer to show in alert
      // Since handleExistingCheckIn is async/detached in React state, we calc it locally for the alert
      const currentAgent = agents.find(a => a.id === lead.agentId);
      let msg = `Welcome ${lead.name}!`;
      if (!currentAgent || currentAgent.role === 'Presales') {
          msg += `\n\nHandover Initiated: Assigning Sales Manager...`;
      } else {
          msg += `\n\nManager: ${lead.agentName} notified.`;
      }

      alert(`✅ VIP ACCESS GRANTED\n\n${msg}`);
  };

  const resetForm = () => {
      setSearchQuery('');
      setSearchResult('idle');
      setFoundLead(null);
      setNewName('');
      setNewMobile('');
      setConflictSource('');
  };

  const getWaitTime = (startTime: string) => {
      const diff = Date.now() - new Date(startTime).getTime();
      return Math.floor(diff / 60000); // minutes
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden animate-fade-in relative">
      
      {/* SCANNER MODAL OVERLAY */}
      {isScannerOpen && (
          <div className="absolute inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                  <X className="w-8 h-8" />
              </button>

              <div className="w-full max-w-md bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                  <div className="p-6 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="text-white font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-green-400" /> Scan Gate Pass</h3>
                      <span className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Live</span>
                  </div>
                  
                  {/* Simulated Camera Viewport */}
                  <div className="h-64 bg-black relative flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-green-500/50 rounded-xl relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-[scan_2s_linear_infinite]"></div>
                      </div>
                      <p className="absolute bottom-4 text-slate-500 text-xs">Point camera at visitor's QR code</p>
                  </div>

                  <div className="p-6 space-y-4">
                      {scanError && (
                          <div className="bg-red-500/20 border border-red-500/50 p-3 rounded text-red-200 text-sm flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 flex-shrink-0" />
                              {scanError}
                          </div>
                      )}

                      <div>
                          <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Simulation: Enter Token</label>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={scannedToken}
                                onChange={(e) => setScannedToken(e.target.value)}
                                placeholder="e.g. VP-X7Z9..."
                                className="flex-1 bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg outline-none focus:border-green-500 font-mono"
                              />
                              <button 
                                onClick={() => handleProcessToken(scannedToken)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                  Verify
                              </button>
                          </div>
                      </div>

                      {/* Demo Helper: List Valid Tokens */}
                      <div className="border-t border-slate-700 pt-4">
                          <p className="text-xs text-slate-500 mb-2">Active Passes (Click to test):</p>
                          <div className="flex flex-wrap gap-2">
                              {leads.filter(l => l.visitToken && !l.isTokenUsed).map(l => (
                                  <button 
                                    key={l.id}
                                    onClick={() => { setScannedToken(l.visitToken!); handleProcessToken(l.visitToken!); }}
                                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-green-400 text-xs rounded border border-slate-600"
                                  >
                                      {l.visitToken} ({l.name})
                                  </button>
                              ))}
                              {leads.filter(l => l.visitToken && !l.isTokenUsed).length === 0 && (
                                  <span className="text-xs text-slate-600 italic">No active passes generated yet. Go to Leads -> Schedule Visit.</span>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* LEFT: CHECK-IN DESK */}
      <div className="w-1/2 min-w-[500px] bg-white border-r border-slate-200 flex flex-col p-8 overflow-y-auto">
        
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to EstateFlow</h1>
            <p className="text-slate-500">Digital Reception & Gatekeeper System</p>
        </div>

        {/* 1. SEARCH BAR */}
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-inner mb-8">
            <label className="block text-sm font-bold text-slate-600 mb-3 uppercase tracking-wide">Visitor Check-In</label>
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter Mobile Number (Last 4 or 10 digits)..." 
                        className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-sm transition"
                    />
                </div>
                <button 
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition shadow-md shadow-blue-200"
                >
                    Search
                </button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                 <span>Or quick scan:</span>
                 <button 
                    onClick={() => { setIsScannerOpen(true); setScanError(''); setScannedToken(''); }}
                    className="flex items-center gap-2 text-blue-600 hover:underline font-medium bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
                 >
                     <QrCode className="w-4 h-4" /> Scan QR Pass
                 </button>
            </div>
        </div>

        {/* 2. RESULTS AREA */}
        <div className="flex-1">
            {searchResult === 'idle' && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Shield className="w-16 h-16 mb-4" />
                    <p className="font-medium text-slate-500">Ready to verify visitors</p>
                    <p className="text-sm">Search number to begin check-in</p>
                </div>
            )}

            {/* SCENARIO: FOUND (EXISTING LEAD) */}
            {searchResult === 'found' && foundLead && (
                <div className="bg-white border-l-8 border-l-emerald-500 rounded-xl shadow-lg overflow-hidden animate-slide-up">
                    <div className="p-6 bg-emerald-50 flex justify-between items-start border-b border-emerald-100">
                        <div>
                            <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">Existing Client</span>
                            <h2 className="text-2xl font-bold text-slate-800">{foundLead.name}</h2>
                            <p className="text-slate-600 flex items-center gap-2 mt-1">
                                <span className="font-mono text-sm">{foundLead.mobile}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase">Managed By</p>
                            <p className="font-bold text-slate-800 text-lg">{foundLead.agentName}</p>
                            {/* Handover Indicator */}
                            {agents.find(a => a.id === foundLead.agentId)?.role === 'Presales' && (
                                <p className="text-xs text-orange-600 font-bold mt-1 flex items-center gap-1 justify-end">
                                    <ArrowRightLeft className="w-3 h-3" /> Handover to Sales
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Conflict Checker */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="flex items-center text-xs font-bold text-slate-500 uppercase mb-2">
                                Verify Visit Source
                                <Tooltip text="This lead already exists with another agent. Assigning it might cause a commission dispute." />
                            </label>
                            <select 
                                value={conflictSource} 
                                onChange={(e) => setConflictSource(e.target.value)}
                                className={`w-full p-3 border rounded-lg outline-none font-medium ${
                                    conflictSource !== foundLead.source 
                                    ? 'bg-orange-50 border-orange-300 text-orange-800' 
                                    : 'bg-white border-slate-300 text-slate-700'
                                }`}
                            >
                                {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            
                            {conflictSource !== foundLead.source && (
                                <div className="mt-3 flex items-start gap-3 text-orange-600 bg-orange-50 p-3 rounded-lg text-sm">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold">Conflict Alert:</span> Original source is <u>{foundLead.source}</u>.
                                        Changing this may affect commission attribution.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                             <button 
                                onClick={resetForm}
                                className="flex-1 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                             >
                                 Cancel
                             </button>
                             <button 
                                onClick={() => handleExistingCheckIn()}
                                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                             >
                                 <CheckCircle className="w-5 h-5" /> Confirm & Handover
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SCENARIO: NOT FOUND (NEW WALK-IN) */}
            {searchResult === 'not-found' && (
                <div className="bg-white border-l-8 border-l-blue-500 rounded-xl shadow-lg overflow-hidden animate-slide-up">
                     <div className="p-6 bg-blue-50 border-b border-blue-100">
                        <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">New Walk-in</span>
                        <h2 className="text-xl font-bold text-slate-800">Quick Registration</h2>
                     </div>
                     <div className="p-6 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
                                 <input 
                                    type="text" 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter Name"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-1">Mobile *</label>
                                 <input 
                                    type="text" 
                                    value={newMobile}
                                    onChange={(e) => setNewMobile(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                 />
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-1">Interested Project</label>
                                 <select 
                                    value={newProject}
                                    onChange={(e) => setNewProject(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                                 >
                                     {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-1">Source *</label>
                                 <select 
                                    value={newSource}
                                    onChange={(e) => setNewSource(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                                 >
                                     {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                             </div>
                         </div>

                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 flex items-start gap-2">
                             <UserPlus className="w-4 h-4 mt-0.5" />
                             System will automatically assign this lead to the next available Closing Manager (Round Robin).
                         </div>

                         <div className="flex gap-4 pt-2">
                             <button 
                                onClick={resetForm}
                                className="flex-1 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                             >
                                 Cancel
                             </button>
                             <button 
                                onClick={handleNewRegistration}
                                disabled={!newName || !newMobile}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                             >
                                 <CheckCircle className="w-5 h-5" /> Register & Assign
                             </button>
                        </div>
                     </div>
                </div>
            )}
        </div>

      </div>

      {/* RIGHT: OPERATIONS CENTER */}
      <div className="flex-1 flex flex-col bg-slate-50 p-6 gap-6 overflow-hidden">
        
        {/* 1. WAITING LOUNGE */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" /> Waiting Lounge
                </h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {activeVisits.filter(v => v.status === 'Waiting').length} Waiting
                </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeVisits.length > 0 ? (
                    activeVisits.map(visit => {
                        const waitMins = getWaitTime(visit.checkInTime);
                        const isLate = waitMins > 10;
                        return (
                            <div key={visit.id} className={`p-4 rounded-xl border shadow-sm flex justify-between items-center transition ${isLate ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isLate ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`}>
                                        {visit.visitorName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{visit.visitorName}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            {visit.agentName} 
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            {new Date(visit.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <div className={`text-center ${isLate ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                                         <div className="text-xs uppercase tracking-wider">Waited</div>
                                         <div className="text-lg">{waitMins} m</div>
                                     </div>
                                     {visit.status === 'Waiting' ? (
                                         <div className="flex flex-col gap-2">
                                             <button 
                                                onClick={() => alert(`Notification sent to ${visit.agentName}!`)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 flex items-center gap-1"
                                             >
                                                 <Bell className="w-3 h-3" /> Notify
                                             </button>
                                             <button 
                                                onClick={() => onUpdateVisit({...visit, status: 'In Meeting'})}
                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700"
                                             >
                                                 Attend
                                             </button>
                                         </div>
                                     ) : (
                                         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">In Meeting</span>
                                     )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Clock className="w-12 h-12 mb-3 opacity-20" />
                        <p>Lounge is empty</p>
                    </div>
                )}
            </div>
        </div>

        {/* 2. SALES ROSTER */}
        <div className="h-1/2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" /> Closing Managers (Sales)
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                    {agents.filter(a => a.role === 'Sales' || a.role === 'SalesHead').map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {agent.name.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                                    agent.status === 'Online' ? 'bg-green-500' : 
                                    agent.status === 'Busy' ? 'bg-red-500' : 
                                    agent.status === 'Break' ? 'bg-orange-400' : 'bg-slate-400'
                                }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">{agent.name}</p>
                                <p className={`text-xs font-medium ${
                                    agent.status === 'Online' ? 'text-green-600' : 
                                    agent.status === 'Busy' ? 'text-red-600' : 'text-slate-400'
                                }`}>
                                    {agent.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

    </div>
  );
};

export default ReceptionModule;
