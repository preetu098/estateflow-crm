
import React, { useState, useEffect } from 'react';
import { Lead, Agent, SiteVisit, LeadSource, LeadStage, Project, SiteVisitLog, VisitorProfile } from '../types';
import { Search, UserPlus, Clock, CheckCircle, AlertTriangle, Users, QrCode, LogOut, Bell, Shield, User, Camera, X, AlertCircle, ArrowRightLeft, ChevronDown, ChevronUp, MapPin, DollarSign, Briefcase, Calendar, Flag, Loader2 } from 'lucide-react';
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
  
  // --- 5-SECTION FORM STATE ---
  // Section 1: Identity
  const [salutation, setSalutation] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [residenceStatus, setResidenceStatus] = useState<'Owned' | 'Rented'>('Owned');
  const [city, setCity] = useState('');

  // Section 2: Logistics
  const [visitProject, setVisitProject] = useState(projects[0]?.name || '');
  const [visitType, setVisitType] = useState<'First Visit' | 'Revisit'>('First Visit');
  const [pickup, setPickup] = useState(false);
  const [drop, setDrop] = useState(false);
  const [withFamily, setWithFamily] = useState(false);
  const [withCP, setWithCP] = useState(false);

  // Section 3: Source
  const [source, setSource] = useState<string>('Walk-in');
  const [subSource, setSubSource] = useState('');
  const [sourcingManager, setSourcingManager] = useState('');
  const [salesManager, setSalesManager] = useState(''); // Closing Manager

  // Section 4: Needs
  const [configuration, setConfiguration] = useState('');
  const [budget, setBudget] = useState('');
  const [purpose, setPurpose] = useState<'Self-Use' | 'Investment'>('Self-Use');
  const [possession, setPossession] = useState<'Ready to Move' | 'Under Construction'>('Under Construction');
  const [occupation, setOccupation] = useState({ industry: '', designation: '', officeLocation: '' });

  // Section 5: Outcome
  const [qualification, setQualification] = useState<'Hot' | 'Warm' | 'Cold' | 'Dead'>('Warm');
  const [followUpDate, setFollowUpDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // UI State
  const [expandedSection, setExpandedSection] = useState<number | null>(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [scanError, setScanError] = useState('');

  // Geo Fencing State
  const [geoStatus, setGeoStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState('');

  const activeVisits = siteVisits.filter(v => v.status !== 'Completed');

  useEffect(() => {
      // Auto-set date for follow-up
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      setFollowUpDate(tom.toISOString().split('T')[0]);
  }, []);

  // Search Logic
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const lead = leads.find(l => l.mobile.includes(searchQuery) || l.id.toLowerCase() === searchQuery.toLowerCase());
    
    if (lead) {
      setSearchResult('found');
      setFoundLead(lead);
      
      // Pre-fill Section 1 (Identity)
      const names = lead.name.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' '));
      setMobile(lead.mobile);
      setEmail(lead.email || '');
      
      if (lead.visitorProfile) {
          setSalutation(lead.visitorProfile.salutation);
          setAgeGroup(lead.visitorProfile.ageGroup);
          setResidenceStatus(lead.visitorProfile.residenceStatus);
          setCity(lead.visitorProfile.city);
          setOccupation({ 
              industry: lead.visitorProfile.occupation.industry,
              designation: lead.visitorProfile.occupation.designation,
              officeLocation: lead.visitorProfile.occupation.officeLocation
          });
      }

      // Pre-fill Section 3 (Source) - Keep original source if re-visiting same project
      setSource(lead.source);
      setSubSource(lead.subSource || '');
      
      // Pre-fill Section 4 (Needs) - If re-visiting
      if (lead.configuration) setConfiguration(lead.configuration);
      if (lead.budgetRange) setBudget(lead.budgetRange);

      setExpandedSection(2); // Move to Logistics
    } else {
      setSearchResult('not-found');
      setFoundLead(null);
      setMobile(searchQuery); // Auto-fill mobile
      setFirstName('');
      setLastName('');
      setExpandedSection(1);
    }
  };

  // Handover & Assignment Logic
  const getAvailableCloser = (): Agent | null => {
      const eligible = agents
        .filter(a => a.role === 'Sales' && a.active && a.status === 'Online')
        .sort((a, b) => a.lastLeadAssignedAt - b.lastLeadAssignedAt);
      return eligible.length > 0 ? eligible[0] : null;
  };

  // Geo Calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180; // φ, λ in radians
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in metres
  };

  const handleSubmitVisit = () => {
      if (!firstName || !mobile || !visitProject) {
          alert("Please fill mandatory fields: Name, Mobile, Project.");
          setExpandedSection(1);
          return;
      }

      // 1. GEO-CHECK
      setGeoStatus('checking');
      
      if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords;
              const project = projects.find(p => p.name === visitProject);
              
              if (project && project.coordinates) {
                  const dist = calculateDistance(latitude, longitude, project.coordinates.lat, project.coordinates.lng);
                  if (dist > 500) { // 500 meters tolerance
                      setGeoStatus('error');
                      setGeoMessage(`User is ${Math.round(dist)}m away from site. Physical Check-in failed.`);
                      if(!confirm(`WARNING: User location is ${Math.round(dist)}m away. Force Check-in anyway?`)) {
                          setGeoStatus('idle');
                          return; // Abort
                      }
                  } else {
                      setGeoStatus('success');
                  }
              } else {
                  setGeoStatus('success'); // No coordinates config, bypass
              }
              
              // Proceed with Submission
              finalizeSubmission();

          }, (error) => {
              console.error("Geo Error", error);
              setGeoStatus('error');
              setGeoMessage("Location access denied. Please enable GPS.");
              if(confirm("Location check failed. Proceed manually?")) {
                  finalizeSubmission();
              } else {
                  setGeoStatus('idle');
              }
          });
      } else {
          alert("Geolocation not supported.");
          finalizeSubmission();
      }
  };

  const finalizeSubmission = () => {
      let assignedCloserId = salesManager; // Manual selection
      let assignedCloserName = agents.find(a => a.id === salesManager)?.name || 'Unassigned';

      // Auto-Assign if not selected manually
      if (!salesManager) {
          const closer = getAvailableCloser();
          if (closer) {
              assignedCloserId = closer.id;
              assignedCloserName = closer.name;
          }
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const profileData: VisitorProfile = {
          salutation, firstName, lastName, ageGroup, maritalStatus: 'Single', familySize: 4, residenceStatus, address: '', city, pincode: '',
          occupation: { ...occupation, annualIncome: '' }
      };

      const visitLog: SiteVisitLog = {
          id: `SVL-${Date.now()}`,
          date: new Date().toISOString(),
          type: visitType,
          projectVisited: visitProject,
          pickupProvided: pickup,
          dropProvided: drop,
          withFamily: withFamily,
          withCP: withCP,
          salesManager: assignedCloserName,
          outcome: qualification,
          remarks: remarks,
          nextFollowUp: followUpDate
      };

      const existingOpportunity = leads.find(l => l.mobile === mobile && l.project === visitProject);
      const existingPerson = leads.find(l => l.mobile === mobile);

      if (existingOpportunity) {
          // REVISIT
          const updatedLead: Lead = {
              ...existingOpportunity,
              name: fullName, 
              visitorProfile: profileData,
              stage: LeadStage.NEGOTIATION,
              subStage: 'Site Visit Done',
              agentId: assignedCloserId || existingOpportunity.agentId,
              agentName: assignedCloserName !== 'Unassigned' ? assignedCloserName : existingOpportunity.agentName,
              siteVisitLogs: [...(existingOpportunity.siteVisitLogs || []), visitLog],
              remarksHistory: [...existingOpportunity.remarksHistory, {
                  timestamp: new Date().toISOString(),
                  text: `Revisit Logged: ${remarks}`,
                  author: 'Reception'
              }]
          };
          onUpdateLead(updatedLead);
          triggerCheckIn(updatedLead);
      } else if (existingPerson) {
          // NEW OPPORTUNITY
          const newLead: Lead = {
              ...existingPerson,
              id: `LD-${Date.now()}`,
              project: visitProject, 
              stage: LeadStage.NEGOTIATION,
              agentId: assignedCloserId,
              agentName: assignedCloserName,
              siteVisitLogs: [visitLog],
              remarksHistory: [{
                  timestamp: new Date().toISOString(),
                  text: `New Opportunity created for ${visitProject}. (Cross-project interest).`,
                  author: 'Reception'
              }]
          };
          onAddLead(newLead);
          triggerCheckIn(newLead);
      } else {
          // NEW VISITOR
          const newLead: Lead = {
              id: `LD-${Date.now()}`,
              createdAt: new Date().toISOString(),
              name: fullName,
              mobile,
              email,
              project: visitProject,
              source,
              subSource,
              stage: LeadStage.NEGOTIATION,
              subStage: 'Site Visit Done',
              followUpDate,
              followUpTime: '10:00',
              agentId: assignedCloserId,
              agentName: assignedCloserName,
              callCount: 0,
              visitorProfile: profileData,
              siteVisitLogs: [visitLog],
              remarksHistory: [{
                  timestamp: new Date().toISOString(),
                  text: `First Visit Registered. Assigned to ${assignedCloserName}.`,
                  author: 'Reception'
              }],
              campaign: 'Walk-in',
              configuration,
              budgetRange: budget
          };
          onAddLead(newLead);
          triggerCheckIn(newLead);
      }

      resetForm();
      setGeoStatus('idle');
  };

  const triggerCheckIn = (lead: Lead) => {
      const visit: SiteVisit = {
          id: `VS-${Date.now()}`,
          leadId: lead.id,
          visitorName: lead.name,
          mobile: lead.mobile,
          project: lead.project,
          agentId: lead.agentId || '',
          agentName: lead.agentName,
          checkInTime: new Date().toISOString(),
          status: 'Waiting',
          sourceType: visitType === 'First Visit' ? 'Fresh' : 'Revisit'
      };
      onCheckIn(visit);
  };

  const resetForm = () => {
      setSearchQuery('');
      setSearchResult('idle');
      setFoundLead(null);
      setFirstName(''); setLastName(''); setMobile(''); setEmail('');
      setExpandedSection(1);
      setRemarks('');
  };

  // Helper for Accordion Section
  const Section = ({ num, title, icon: Icon, children }: { num: number, title: string, icon: any, children: React.ReactNode }) => {
      const isOpen = expandedSection === num;
      return (
          <div className={`border rounded-xl transition-all duration-300 ${isOpen ? 'border-blue-300 bg-white shadow-md' : 'border-slate-200 bg-slate-50'}`}>
              <div 
                onClick={() => setExpandedSection(isOpen ? null : num)}
                className="p-4 flex items-center justify-between cursor-pointer"
              >
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {num}
                      </div>
                      <h3 className={`font-bold ${isOpen ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h3>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
              {isOpen && <div className="p-4 pt-0 border-t border-slate-100 animate-slide-down">{children}</div>}
          </div>
      );
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden animate-fade-in relative">
        
        {/* LEFT: THE FORM */}
        <div className="w-1/2 min-w-[550px] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h1 className="text-2xl font-bold text-slate-800">Site Visit Entry</h1>
                <p className="text-slate-500 text-sm">Visitor Registration & Digital Log</p>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                {/* 0. SEARCH */}
                <div className="relative">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search Mobile Number to Auto-fill..." 
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold">Check</button>
                </div>

                {/* 1. IDENTITY */}
                <Section num={1} title="Visitor Identity" icon={User}>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="label-text">Salutation</label>
                            <select value={salutation} onChange={e=>setSalutation(e.target.value)} className="input-field">
                                <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="label-text">First Name *</label>
                            <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label-text">Last Name</label>
                            <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-text">Mobile *</label>
                            <input type="text" value={mobile} onChange={e=>setMobile(e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Age Group</label>
                            <select value={ageGroup} onChange={e=>setAgeGroup(e.target.value)} className="input-field">
                                <option value="">Select...</option>
                                <option>25-35</option><option>35-45</option><option>45-55</option><option>55+</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Current Residence</label>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button onClick={()=>setResidenceStatus('Owned')} className={`flex-1 py-1 rounded text-xs font-bold ${residenceStatus==='Owned'?'bg-white shadow':'text-slate-500'}`}>Owned</button>
                                <button onClick={()=>setResidenceStatus('Rented')} className={`flex-1 py-1 rounded text-xs font-bold ${residenceStatus==='Rented'?'bg-white shadow':'text-slate-500'}`}>Rented</button>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 2. LOGISTICS */}
                <Section num={2} title="Visit Logistics" icon={MapPin}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label-text">Project Visited *</label>
                            <select value={visitProject} onChange={e=>setVisitProject(e.target.value)} className="input-field">
                                {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Visit Type</label>
                            <select value={visitType} onChange={e=>setVisitType(e.target.value as any)} className="input-field">
                                <option>First Visit</option>
                                <option>Revisit</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                            <span className="text-sm text-slate-600 font-medium">Pickup Provided?</span>
                            <input type="checkbox" checked={pickup} onChange={e=>setPickup(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                            <span className="text-sm text-slate-600 font-medium">Drop Provided?</span>
                            <input type="checkbox" checked={drop} onChange={e=>setDrop(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                        </div>
                    </div>
                </Section>

                {/* 3. SOURCE */}
                <Section num={3} title="Source Attribution" icon={Briefcase}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label-text">Master Source</label>
                            <select value={source} onChange={e=>setSource(e.target.value)} className="input-field">
                                {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Sub Source / CP Name</label>
                            <input type="text" value={subSource} onChange={e=>setSubSource(e.target.value)} className="input-field" placeholder="e.g. Sharma Estate" />
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Sales Manager (Closing)</label>
                        <select value={salesManager} onChange={e=>setSalesManager(e.target.value)} className="input-field">
                            <option value="">-- Auto Assign (Round Robin) --</option>
                            {agents.filter(a => a.role === 'Sales').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </Section>

                {/* 4. NEEDS */}
                <Section num={4} title="Requirements & Profile" icon={DollarSign}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label-text">Configuration</label>
                            <select value={configuration} onChange={e=>setConfiguration(e.target.value)} className="input-field">
                                <option value="">Select...</option>
                                <option>1 BHK</option><option>2 BHK</option><option>3 BHK</option><option>Office</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Budget Range</label>
                            <select value={budget} onChange={e=>setBudget(e.target.value)} className="input-field">
                                <option value="">Select...</option>
                                <option>Under 50L</option><option>50L - 80L</option><option>80L - 1.2Cr</option><option>1.2Cr+</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Buying Purpose</label>
                            <select value={purpose} onChange={e=>setPurpose(e.target.value as any)} className="input-field">
                                <option>Self-Use</option><option>Investment</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Occupation Industry</label>
                            <input type="text" value={occupation.industry} onChange={e=>setOccupation({...occupation, industry: e.target.value})} className="input-field" />
                        </div>
                    </div>
                </Section>

                {/* 5. CLOSING */}
                <Section num={5} title="Outcome & Next Steps" icon={Flag}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label-text">Qualification Status</label>
                            <select value={qualification} onChange={e=>setQualification(e.target.value as any)} className="input-field">
                                <option>Hot</option><option>Warm</option><option>Cold</option><option>Dead</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Next Follow-up</label>
                            <input type="date" value={followUpDate} onChange={e=>setFollowUpDate(e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Reception Remarks</label>
                        <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} className="input-field" rows={2} placeholder="Visitor comments, family details..." />
                    </div>
                </Section>

                <button 
                    onClick={handleSubmitVisit}
                    disabled={geoStatus === 'checking'}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition flex items-center justify-center gap-2 ${
                        geoStatus === 'error' ? 'bg-red-600 text-white hover:bg-red-700' : 
                        geoStatus === 'checking' ? 'bg-slate-300 text-slate-500 cursor-wait' :
                        'bg-blue-900 text-white hover:bg-blue-800 shadow-blue-200'
                    }`}
                >
                    {geoStatus === 'checking' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Verifying Location...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-6 h-6" /> Submit & Generate Pass
                        </>
                    )}
                </button>
                
                {geoMessage && (
                    <div className={`mt-3 text-xs text-center p-2 rounded ${geoStatus === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {geoMessage}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: WAITING LOUNGE (Simplified for space) */}
        <div className="flex-1 flex flex-col bg-slate-50 p-6 overflow-hidden">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" /> Waiting Lounge
                    </h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                        {activeVisits.length} Active
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeVisits.map(visit => (
                        <div key={visit.id} className="p-4 rounded-xl border bg-white border-slate-100 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                    {visit.visitorName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{visit.visitorName}</h4>
                                    <p className="text-xs text-slate-500">{visit.agentName} • {new Date(visit.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                            <button onClick={() => onUpdateVisit({...visit, status: 'In Meeting'})} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700">
                                Attend
                            </button>
                        </div>
                    ))}
                    {activeVisits.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Clock className="w-12 h-12 mb-3 opacity-20" />
                            <p>Lounge is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <style>{`
            .label-text { @apply block text-xs font-bold text-slate-500 uppercase mb-1; }
            .input-field { @apply w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white; }
        `}</style>
    </div>
  );
};

export default ReceptionModule;
