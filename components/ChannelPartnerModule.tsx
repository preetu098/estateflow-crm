
import React, { useState } from 'react';
import { ChannelPartner, Lead, Project, CommissionInvoice, Unit, MarketingCollateral, LeadSource, LeadStage } from '../types';
import { MOCK_COLLATERAL, COMMISSION_TIERS } from '../constants';
import { 
    Search, UserPlus, CheckCircle, XCircle, AlertTriangle, LayoutGrid, 
    Download, FileText, Upload, Smartphone, Briefcase, Share2, QrCode, 
    TrendingUp, DollarSign, Send, ShieldCheck, Eye, Check, X
} from 'lucide-react';
import Tooltip from './Tooltip';

interface ChannelPartnerModuleProps {
    partners: ChannelPartner[];
    setPartners: React.Dispatch<React.SetStateAction<ChannelPartner[]>>;
    leads: Lead[];
    onAddLead: (lead: Lead) => void;
    projects: Project[];
    inventory: Unit[];
    invoices: CommissionInvoice[];
    onAddInvoice: (invoice: CommissionInvoice) => void;
}

const ChannelPartnerModule: React.FC<ChannelPartnerModuleProps> = ({ 
    partners, setPartners, leads, onAddLead, projects, inventory, invoices, onAddInvoice
}) => {
    // View State
    const [viewMode, setViewMode] = useState<'admin' | 'partner-app'>('admin');
    
    // Admin State
    const [activeTab, setActiveTab] = useState<'list' | 'approvals' | 'config'>('list');
    
    // Partner App Simulator State
    const [appView, setAppView] = useState<'dashboard' | 'register' | 'inventory' | 'earnings'>('dashboard');
    const [simulatedUser, setSimulatedUser] = useState<ChannelPartner>(partners[0]);
    
    // Lead Reg State
    const [leadMobile, setLeadMobile] = useState('');
    const [leadCheckStatus, setLeadCheckStatus] = useState<'idle' | 'checking' | 'available' | 'conflict'>('idle');
    const [leadName, setLeadName] = useState('');
    const [leadProject, setLeadProject] = useState('');
    const [conflictDetails, setConflictDetails] = useState<string>('');

    // Invoice State
    const [newInvAmount, setNewInvAmount] = useState('');
    const [newInvBookingId, setNewInvBookingId] = useState('');

    // --- ADMIN FUNCTIONS ---
    
    const handleApproveKYC = (partnerId: string) => {
        if(confirm("Approve all documents and activate partner?")) {
            setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, status: 'Active' } : p));
        }
    };

    const handleRejectKYC = (partnerId: string) => {
        setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, status: 'Pending' } : p)); // Simplified
    };

    // --- PARTNER APP FUNCTIONS ---

    const checkLeadConflict = () => {
        setLeadCheckStatus('checking');
        setTimeout(() => {
            const conflict = leads.find(l => l.mobile === leadMobile);
            if (conflict) {
                setLeadCheckStatus('conflict');
                const lastActive = conflict.remarksHistory[conflict.remarksHistory.length - 1]?.timestamp;
                const daysAgo = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
                setConflictDetails(`Lead exists with ${conflict.source}. Last active: ${daysAgo} days ago.`);
            } else {
                setLeadCheckStatus('available');
            }
        }, 800);
    };

    const handleRegisterLead = () => {
        if (!leadName || !leadProject || !leadMobile) return;
        
        const newLead: Lead = {
            id: `LD-${Date.now()}`,
            createdAt: new Date().toISOString(),
            campaign: 'CP App',
            name: leadName,
            mobile: leadMobile,
            source: LeadSource.CHANNEL_PARTNER,
            subSource: simulatedUser.firmName,
            project: leadProject,
            stage: LeadStage.NEW,
            subStage: 'Fresh',
            followUpDate: new Date().toISOString().split('T')[0],
            followUpTime: '10:00',
            agentName: 'Unassigned',
            callCount: 0,
            remarksHistory: [{ timestamp: new Date().toISOString(), text: `Registered via Partner App by ${simulatedUser.name}`, author: 'System' }]
        };
        
        onAddLead(newLead);
        setLeadName('');
        setLeadMobile('');
        setLeadCheckStatus('idle');
        alert("Lead Registered Successfully! Locked for 45 days.");
    };

    const handleShareBrochure = (item: MarketingCollateral) => {
        alert(`Generating White-labeled PDF...\n\nRemoved: Builder Contact\nAdded: ${simulatedUser.name} (${simulatedUser.mobile})\n\nOpening WhatsApp Share...`);
    };

    const handleUploadInvoice = () => {
        if(!newInvAmount) return;
        const inv: CommissionInvoice = {
            id: `INV-${Date.now()}`,
            partnerId: simulatedUser.id,
            bookingId: newInvBookingId || 'Pending Link',
            amount: Number(newInvAmount),
            invoiceDate: new Date().toISOString().split('T')[0],
            invoiceNumber: `INV-${Math.floor(Math.random()*1000)}`,
            status: 'Processing'
        };
        onAddInvoice(inv);
        setNewInvAmount('');
        setNewInvBookingId('');
        alert("Invoice Uploaded! Status: Processing.");
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
            
            {/* Mode Switcher Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewMode('admin')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${viewMode === 'admin' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        CP Manager Console (Admin)
                    </button>
                    <button 
                        onClick={() => setViewMode('partner-app')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${viewMode === 'partner-app' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <Smartphone className="w-4 h-4" /> Partner App Simulator
                    </button>
                </div>
                {viewMode === 'partner-app' && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Simulating as:</span>
                        <select 
                            value={simulatedUser.id} 
                            onChange={(e) => setSimulatedUser(partners.find(p => p.id === e.target.value) || partners[0])}
                            className="text-sm border border-slate-300 rounded px-2 py-1"
                        >
                            {partners.map(p => <option key={p.id} value={p.id}>{p.firmName} ({p.name})</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* ================== ADMIN VIEW ================== */}
            {viewMode === 'admin' && (
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs uppercase font-bold">Total Partners</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{partners.length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs uppercase font-bold">Pending KYC</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{partners.filter(p => p.status === 'Pending').length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs uppercase font-bold">Total Sales (CP)</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">₹18.5 Cr</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs uppercase font-bold">Payouts Pending</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">₹12.4 L</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-6">
                        <button onClick={() => setActiveTab('list')} className={`px-6 py-3 text-sm font-bold border-b-2 ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Partner Directory</button>
                        <button onClick={() => setActiveTab('approvals')} className={`px-6 py-3 text-sm font-bold border-b-2 ${activeTab === 'approvals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>KYC Approvals</button>
                    </div>

                    {/* List Tab */}
                    {activeTab === 'list' && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Partner Name</th>
                                        <th className="px-6 py-4">Tier</th>
                                        <th className="px-6 py-4">RERA ID</th>
                                        <th className="px-6 py-4">Total Sales</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {partners.map(cp => (
                                        <tr key={cp.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{cp.firmName}</div>
                                                <div className="text-xs text-slate-500">{cp.name} • {cp.mobile}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                    cp.tier === 'Platinum' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    cp.tier === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {cp.tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-500">{cp.reraId}</td>
                                            <td className="px-6 py-4 font-medium">₹{(cp.totalSalesValue / 10000000).toFixed(2)} Cr</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1 text-xs font-bold ${cp.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {cp.status === 'Active' ? <CheckCircle className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                                                    {cp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:underline text-xs font-bold">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Approvals Tab */}
                    {activeTab === 'approvals' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {partners.filter(p => p.status === 'Pending').map(cp => (
                                 <div key={cp.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                     <div className="flex justify-between items-start mb-4">
                                         <div>
                                             <h3 className="font-bold text-lg text-slate-800">{cp.firmName}</h3>
                                             <p className="text-sm text-slate-500">Owner: {cp.name}</p>
                                         </div>
                                         <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Verification Pending</span>
                                     </div>
                                     
                                     <div className="space-y-3 mb-6">
                                         <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                             <span className="text-slate-500">RERA ID</span>
                                             <span className="font-mono font-medium">{cp.reraId}</span>
                                         </div>
                                         <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                             <span className="text-slate-500">Documents</span>
                                             <div className="flex gap-2">
                                                {cp.documents?.map((doc, idx) => (
                                                    <span key={idx} className="text-blue-600 hover:underline cursor-pointer text-xs bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {doc.name}
                                                    </span>
                                                ))}
                                             </div>
                                         </div>
                                     </div>

                                     <div className="flex gap-3">
                                         <button onClick={() => handleRejectKYC(cp.id)} className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50">Reject</button>
                                         <button onClick={() => handleApproveKYC(cp.id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200">Approve & Activate</button>
                                     </div>
                                 </div>
                             ))}
                             {partners.filter(p => p.status === 'Pending').length === 0 && (
                                 <div className="col-span-2 text-center py-12 text-slate-400">
                                     <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                     <p>All partners verified.</p>
                                 </div>
                             )}
                         </div>
                    )}

                </div>
            )}

            {/* ================== PARTNER APP SIMULATOR ================== */}
            {viewMode === 'partner-app' && (
                <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-y-auto flex justify-center">
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-8 border-slate-800 overflow-hidden flex flex-col h-[750px] relative">
                        
                        {/* Dynamic Island / Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>

                        {/* App Header */}
                        <div className="bg-blue-600 text-white p-5 pt-10 flex justify-between items-center flex-shrink-0 z-10">
                            <div>
                                <h2 className="font-bold text-lg">Hi, {simulatedUser.name.split(' ')[0]} 👋</h2>
                                <p className="text-xs text-blue-100 opacity-90">{simulatedUser.firmName} • {simulatedUser.tier} Partner</p>
                            </div>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <UserPlus className="w-5 h-5" />
                            </div>
                        </div>

                        {/* App Content Scrollable Area */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar pb-20">
                            
                            {/* APP VIEW: DASHBOARD */}
                            {appView === 'dashboard' && (
                                <div className="p-4 space-y-4">
                                    {/* Stats Carousel */}
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        <div className="min-w-[140px] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-xs text-slate-400 uppercase font-bold">Pipeline</p>
                                            <p className="text-xl font-bold text-slate-800 mt-1">{leads.filter(l => l.subSource === simulatedUser.firmName).length}</p>
                                            <p className="text-[10px] text-slate-400">Active Leads</p>
                                        </div>
                                        <div className="min-w-[140px] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-xs text-slate-400 uppercase font-bold">Earnings</p>
                                            <p className="text-xl font-bold text-emerald-600 mt-1">₹{(simulatedUser.commissionEarned/1000).toFixed(0)}k</p>
                                            <p className="text-[10px] text-slate-400">Paid Out</p>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setAppView('register')} className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 flex flex-col items-center gap-2">
                                            <UserPlus className="w-6 h-6" />
                                            <span className="text-xs font-bold">Add Lead</span>
                                        </button>
                                        <button onClick={() => setAppView('inventory')} className="bg-white text-slate-700 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col items-center gap-2">
                                            <LayoutGrid className="w-6 h-6 text-orange-500" />
                                            <span className="text-xs font-bold">Inventory</span>
                                        </button>
                                    </div>

                                    {/* Recent Leads List */}
                                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-slate-800 text-sm">Recent Leads</h3>
                                            <span className="text-xs text-blue-600 font-bold">View All</span>
                                        </div>
                                        <div className="space-y-3">
                                            {leads.filter(l => l.subSource === simulatedUser.firmName).slice(0,3).map(l => (
                                                <div key={l.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-700">{l.name}</p>
                                                        <p className="text-xs text-slate-400">{l.stage}</p>
                                                    </div>
                                                    <span className={`w-2 h-2 rounded-full ${l.stage === 'Booked' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                                </div>
                                            ))}
                                            {leads.filter(l => l.subSource === simulatedUser.firmName).length === 0 && <p className="text-xs text-slate-400 italic text-center">No leads yet.</p>}
                                        </div>
                                    </div>
                                    
                                    {/* Broadcast Msg */}
                                    <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Announcement</span>
                                        </div>
                                        <p className="text-sm font-medium leading-snug">🚀 Prices increasing by ₹200/sqft for Krishna Trident from Monday!</p>
                                    </div>
                                </div>
                            )}

                            {/* APP VIEW: REGISTER LEAD */}
                            {appView === 'register' && (
                                <div className="p-6 space-y-6 bg-white min-h-full">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">New Registration</h3>
                                        <p className="text-xs text-slate-500">Check availability before adding.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Client Mobile</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={leadMobile} 
                                                    onChange={(e) => setLeadMobile(e.target.value)}
                                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-3 text-lg outline-none focus:border-blue-500"
                                                    placeholder="98765XXXXX"
                                                />
                                                <button onClick={checkLeadConflict} className="bg-slate-100 px-4 rounded-lg font-bold text-slate-600 text-sm">Check</button>
                                            </div>
                                        </div>

                                        {leadCheckStatus === 'checking' && <div className="text-blue-600 text-sm animate-pulse">Checking global database...</div>}
                                        
                                        {leadCheckStatus === 'conflict' && (
                                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-red-700 text-sm">Lead Exists!</p>
                                                    <p className="text-xs text-red-600 mt-1">{conflictDetails}</p>
                                                </div>
                                            </div>
                                        )}

                                        {leadCheckStatus === 'available' && (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center gap-2 text-emerald-700 text-sm font-bold">
                                                    <CheckCircle className="w-5 h-5" /> Lead Available!
                                                </div>
                                                
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Client Name</label>
                                                    <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-3 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Interested Project</label>
                                                    <select value={leadProject} onChange={(e) => setLeadProject(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-3 bg-white">
                                                        <option value="">Select Project</option>
                                                        {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2 rounded">
                                                    <ShieldCheck className="w-3 h-3" /> 
                                                    Lead will be locked for 45 days in your name.
                                                </div>

                                                <button onClick={handleRegisterLead} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200">
                                                    Register Client
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* APP VIEW: INVENTORY & MARKETING */}
                            {appView === 'inventory' && (
                                <div className="p-4 space-y-6">
                                    <h3 className="font-bold text-slate-800">Marketing Center</h3>
                                    
                                    {/* Collateral List */}
                                    <div className="space-y-3">
                                        {MOCK_COLLATERAL.map(item => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                                        {item.type === 'PDF' ? <FileText className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-700 line-clamp-1">{item.title}</p>
                                                        <p className="text-[10px] text-slate-400">White-label Ready</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleShareBrochure(item)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Live Inventory Link */}
                                    <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h4 className="font-bold">Live Inventory Map</h4>
                                            <p className="text-xs text-slate-400 mt-1 mb-3">Check real-time availability</p>
                                            <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold">Open Map</button>
                                        </div>
                                        <LayoutGrid className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-slate-700 opacity-50" />
                                    </div>
                                </div>
                            )}
                            
                            {/* APP VIEW: EARNINGS */}
                            {appView === 'earnings' && (
                                <div className="p-4 space-y-6">
                                    <h3 className="font-bold text-slate-800">My Earnings</h3>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-xs text-slate-400 uppercase font-bold">Unbilled</p>
                                            <p className="text-xl font-bold text-slate-800 mt-1">₹2.5L</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-xs text-slate-400 uppercase font-bold">Processed</p>
                                            <p className="text-xl font-bold text-blue-600 mt-1">₹1.2L</p>
                                        </div>
                                    </div>

                                    {/* Upload Invoice */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-blue-600" /> Upload Invoice
                                        </h4>
                                        <div className="space-y-3">
                                            <input 
                                                type="number" 
                                                placeholder="Amount (₹)" 
                                                value={newInvAmount}
                                                onChange={(e) => setNewInvAmount(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none" 
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Booking ID / Unit No" 
                                                value={newInvBookingId}
                                                onChange={(e) => setNewInvBookingId(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none" 
                                            />
                                            <button onClick={handleUploadInvoice} className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold">Submit Invoice</button>
                                        </div>
                                    </div>

                                    {/* Invoice History */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Invoices</h4>
                                        <div className="space-y-2">
                                            {invoices.filter(i => i.partnerId === simulatedUser.id).map(inv => (
                                                <div key={inv.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-700">₹{inv.amount.toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400">{inv.invoiceDate} • {inv.unitNumber}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                                        inv.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </div>
                                            ))}
                                            {invoices.filter(i => i.partnerId === simulatedUser.id).length === 0 && <p className="text-xs text-slate-400 italic">No invoice history.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* App Bottom Nav */}
                        <div className="bg-white border-t border-slate-200 p-2 flex justify-around items-center absolute bottom-0 left-0 right-0 z-20">
                            <button onClick={() => setAppView('dashboard')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${appView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
                                <Briefcase className="w-5 h-5" />
                                <span className="text-[10px] font-medium">Home</span>
                            </button>
                            <button onClick={() => setAppView('inventory')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${appView === 'inventory' ? 'text-blue-600' : 'text-slate-400'}`}>
                                <LayoutGrid className="w-5 h-5" />
                                <span className="text-[10px] font-medium">Project</span>
                            </button>
                            <button onClick={() => setAppView('register')} className="p-3 bg-blue-600 text-white rounded-full -mt-8 shadow-lg shadow-blue-200 border-4 border-slate-100">
                                <UserPlus className="w-6 h-6" />
                            </button>
                            <button onClick={() => setAppView('earnings')} className={`p-2 rounded-lg flex flex-col items-center gap-1 ${appView === 'earnings' ? 'text-blue-600' : 'text-slate-400'}`}>
                                <DollarSign className="w-5 h-5" />
                                <span className="text-[10px] font-medium">Earnings</span>
                            </button>
                            <button className="p-2 rounded-lg flex flex-col items-center gap-1 text-slate-400">
                                <QrCode className="w-5 h-5" />
                                <span className="text-[10px] font-medium">Pass</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ChannelPartnerModule;
