

import React, { useState } from 'react';
import { MarketingCampaign } from '../types';
import { Megaphone, TrendingUp, Users, DollarSign, PlayCircle, PauseCircle, Filter, BarChart2, Mail, MessageCircle, Facebook, Target, Layers, Info, ChevronDown, ChevronRight, Map, Zap, Eye, EyeOff, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TooltipInfo from './Tooltip';

interface MarketingModuleProps {
  campaigns: MarketingCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<MarketingCampaign[]>>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const MarketingModule: React.FC<MarketingModuleProps> = ({ campaigns, setCampaigns }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drip' | 'optimizer' | 'hotspots'>('dashboard');
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  
  // AGENCY PORTAL STATE
  const [isAgencyView, setIsAgencyView] = useState(false);

  const toggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c));
  };

  const toggleExpand = (id: string) => {
      setExpandedCampaignId(expandedCampaignId === id ? null : id);
  };

  // Analytics Calculation
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);
  const totalBookings = campaigns.reduce((acc, c) => acc + c.bookingsGenerated, 0);
  const overallCPL = totalLeads ? (totalSpent / totalLeads).toFixed(0) : 0;
  const overallCPB = totalBookings ? (totalSpent / totalBookings).toFixed(0) : 0;

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {isAgencyView && <Shield className="w-6 h-6 text-purple-600" />}
                    {isAgencyView ? 'Agency Partner Portal' : 'Marketing Command Center'}
                </h1>
                <p className="text-sm text-slate-500">{isAgencyView ? 'External View: Data Masked' : 'Track ROI, CPL, and Automate Nurturing'}</p>
            </div>
            {isAgencyView && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-2">
                    <EyeOff className="w-3 h-3" /> GLASS WALL ACTIVE
                </div>
            )}
        </div>
        
        <div className="flex items-center gap-4">
            {/* Toggle Agency View */}
            <button 
                onClick={() => setIsAgencyView(!isAgencyView)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${isAgencyView ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
                {isAgencyView ? 'Exit Agency View' : 'Simulate Agency Login'}
            </button>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>ROI</button>
                {!isAgencyView && (
                    <>
                        <button onClick={() => setActiveTab('optimizer')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'optimizer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>Optimizer (AI)</button>
                        <button onClick={() => setActiveTab('hotspots')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'hotspots' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>Hot Spots</button>
                        <button onClick={() => setActiveTab('drip')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'drip' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>Drip</button>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <DollarSign className="w-4 h-4" /> <span className="text-xs uppercase font-bold">Total Ad Spend</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">₹{(totalSpent / 100000).toFixed(2)} L</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Users className="w-4 h-4" /> <span className="text-xs uppercase font-bold">Total Leads</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalLeads}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <TrendingUp className="w-4 h-4" /> <span className="text-xs uppercase font-bold">Cost Per Lead (CPL)</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">₹{overallCPL}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <DollarSign className="w-4 h-4" /> <span className="text-xs uppercase font-bold">Cost Per Booking (CPB)</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">₹{Number(overallCPB).toLocaleString()}</p>
              </div>
            </div>

            {/* Campaigns List (Meta Integration Spec) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" /> Campaign Master
                    </h3>
                    {!isAgencyView && <button className="text-xs font-bold text-blue-600">+ Connect New Source</button>}
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                      <tr>
                         <th className="px-4 py-3 w-8"></th>
                         <th className="px-4 py-3">
                             Campaign Name / ID
                             <TooltipInfo text="The unique ID assigned by Facebook. Use this when speaking to your Digital Agency." />
                         </th>
                         <th className="px-4 py-3">Platform</th>
                         <th className="px-4 py-3">Daily Budget</th>
                         <th className="px-4 py-3">Spend / Leads</th>
                         <th className="px-4 py-3">CPL</th>
                         <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {campaigns.map(c => (
                         <React.Fragment key={c.id}>
                            <tr className={`hover:bg-slate-50 transition ${expandedCampaignId === c.id ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-3">
                                    {c.adSets && c.adSets.length > 0 && (
                                        <button onClick={() => toggleExpand(c.id)} className="text-slate-400 hover:text-blue-600">
                                            {expandedCampaignId === c.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800">{c.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">ID: {c.metaCampaignId || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${c.platform === 'Facebook' ? 'bg-blue-50 text-blue-600 border-blue-100' : c.platform === 'Google' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-600'}`}>
                                    {c.platform}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {c.dailyBudget ? `₹${c.dailyBudget.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    <div><span className="text-xs text-slate-400">Spend:</span> ₹{(c.spent/1000).toFixed(1)}k</div>
                                    <div><span className="text-xs text-slate-400">Leads:</span> {c.leadsGenerated}</div>
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700">₹{(c.spent / (c.leadsGenerated || 1)).toFixed(0)}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => !isAgencyView && toggleStatus(c.id)} className={`flex items-center gap-1 text-xs font-bold ${c.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                                        {c.status === 'Active' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                                        {c.status}
                                    </button>
                                </td>
                            </tr>
                            
                            {/* DRILL DOWN: AD SETS */}
                            {expandedCampaignId === c.id && c.adSets && (
                                <tr className="bg-slate-50">
                                    <td colSpan={8} className="p-0">
                                        <div className="p-4 pl-12 border-b border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                <Layers className="w-3 h-3" /> Ad Sets & Creatives
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {c.adSets.map(adSet => (
                                                    <div key={adSet.id} className="bg-white border border-slate-200 rounded-lg p-3">
                                                        <div className="flex justify-between items-center mb-2 border-b border-slate-50 pb-2">
                                                            <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                {adSet.name}
                                                                <TooltipInfo text="Tells you which audience was targeted (e.g., 'IT Professionals' or 'Lookalike Audience')." />
                                                            </div>
                                                            <div className="text-xs text-slate-400">ID: {adSet.id}</div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {adSet.ads.map(ad => (
                                                                <div key={ad.id} className="flex justify-between items-center text-xs pl-4 border-l-2 border-slate-100">
                                                                    <span className="text-slate-600 flex-1">{ad.name}</span>
                                                                    <span className="text-slate-500 w-20 text-right">{ad.leads} Leads</span>
                                                                    <span className="text-slate-800 font-bold w-20 text-right">₹{ad.cpl} CPL</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                         </React.Fragment>
                       ))}
                    </tbody>
                  </table>
            </div>
          </div>
        )}

        {activeTab === 'optimizer' && (
            <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-300" /> AI Budget Optimizer</h2>
                        <p className="opacity-90 max-w-2xl">The system has analyzed 30 days of data and identified opportunities to reduce CPL by up to 15%.</p>
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Recommendations</h3>
                        <div className="space-y-4">
                            {campaigns.map(c => {
                                const cpl = c.leadsGenerated > 0 ? c.spent / c.leadsGenerated : 0;
                                const isHighCPL = cpl > 300;
                                const isLowCPL = cpl > 0 && cpl < 200;

                                if(!isHighCPL && !isLowCPL) return null;

                                return (
                                    <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50">
                                        <div>
                                            <p className="font-bold text-slate-700">{c.name}</p>
                                            <p className="text-xs text-slate-500">Current CPL: ₹{cpl.toFixed(0)}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isHighCPL ? (
                                                <>
                                                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">High Cost</span>
                                                    <button className="px-3 py-1 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-100">Reduce Budget (-10%)</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">High ROAS</span>
                                                    <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Scale Up (+20%)</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'hotspots' && (
            <div className="h-full flex flex-col">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Map className="w-5 h-5 text-blue-500" /> Lead Origin Heatmap (Simulated)</h3>
                    <div className="flex-1 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/img/osm-intl,7,19,73,200x200.png')] bg-cover opacity-30"></div>
                        <div className="relative z-10 grid grid-cols-2 gap-8">
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 bg-red-500/40 rounded-full flex items-center justify-center blur-xl absolute"></div>
                                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white relative z-10"></div>
                                <span className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm mt-1">Kalyan East (120 Leads)</span>
                            </div>
                            <div className="flex flex-col items-center animate-pulse delay-75">
                                <div className="w-12 h-12 bg-orange-500/40 rounded-full flex items-center justify-center blur-xl absolute"></div>
                                <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white relative z-10"></div>
                                <span className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm mt-1">Dombivli (85 Leads)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'drip' && (
           <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800 mb-2">Automated Nurture Workflow</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto">Define what happens when a new lead enters the system. The system will automatically send WhatsApp/Email/SMS based on this timeline.</p>
              </div>
              
              <div className="relative">
                 <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-100 z-0"></div>
                 
                 {[
                   { day: 0, title: 'Immediate Response', type: 'WhatsApp', content: "Hi {Name}, thanks for inquiring about {Project}. Here is the brochure: [Link]." },
                   { day: 1, title: 'Project Walkthrough', type: 'Email', content: "Watch the premium walkthrough video of our show flat." },
                   { day: 3, title: 'Site Visit Invitation', type: 'WhatsApp', content: "We are organizing a site visit this weekend. Can we pick you up?" },
                   { day: 7, title: 'Price Alert', type: 'SMS', content: "Prices increasing by ₹200/sqft next week. Book now to save." },
                 ].map((step, idx) => (
                    <div key={idx} className="relative z-10 mb-8 pl-20 group">
                       <div className="absolute left-4 top-0 w-9 h-9 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 z-20">
                         {step.day === 0 ? 'Now' : `D${step.day}`}
                       </div>
                       
                       <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition hover:border-blue-300 cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                               {step.type === 'WhatsApp' ? <MessageCircle className="w-4 h-4 text-green-500" /> : step.type === 'Email' ? <Mail className="w-4 h-4 text-blue-500" /> : <Megaphone className="w-4 h-4 text-orange-500" />}
                               {step.title}
                             </h3>
                             <span className="text-xs font-bold text-slate-400 uppercase">Automated</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 font-mono border border-slate-100">
                             {step.content}
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 <div className="pl-20">
                    <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-blue-300 transition">
                       + Add Next Step
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MarketingModule;
