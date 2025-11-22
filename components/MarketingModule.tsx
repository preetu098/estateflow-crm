
import React, { useState } from 'react';
import { MarketingCampaign } from '../types';
import { Megaphone, TrendingUp, Users, DollarSign, PlayCircle, PauseCircle, Filter, BarChart2, Mail, MessageCircle, Facebook, Target, Layers, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TooltipInfo from './Tooltip';

interface MarketingModuleProps {
  campaigns: MarketingCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<MarketingCampaign[]>>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const MarketingModule: React.FC<MarketingModuleProps> = ({ campaigns, setCampaigns }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drip'>('dashboard');
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

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

  const platformData = campaigns.reduce((acc, c) => {
    const existing = acc.find(a => a.name === c.platform);
    if (existing) {
      existing.value += c.leadsGenerated;
    } else {
      acc.push({ name: c.platform, value: c.leadsGenerated });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Marketing Command Center</h1>
          <p className="text-sm text-slate-500">Track ROI, CPL, and Automate Nurturing</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            Campaign ROI
          </button>
          <button onClick={() => setActiveTab('drip')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'drip' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            Drip Automation
          </button>
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
                    <button className="text-xs font-bold text-blue-600">+ Connect New Source</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                      <tr>
                         <th className="px-4 py-3 w-8"></th>
                         <th className="px-4 py-3">
                             Campaign Name / ID
                             <TooltipInfo text="The unique ID assigned by Facebook. Use this when speaking to your Digital Agency." />
                         </th>
                         <th className="px-4 py-3">
                             Platform
                             <TooltipInfo text="Indicates whether the user saw the ad on Facebook or Instagram." />
                         </th>
                         <th className="px-4 py-3">Daily Budget</th>
                         <th className="px-4 py-3">Spend / Leads</th>
                         <th className="px-4 py-3">CPL</th>
                         <th className="px-4 py-3">Duration</th>
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
                                <td className="px-4 py-3 text-xs text-slate-500">
                                    <div>{new Date(c.startDate).toLocaleDateString()}</div>
                                    <div>{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Ongoing'}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleStatus(c.id)} className={`flex items-center gap-1 text-xs font-bold ${c.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Platform Mix Chart */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-700 mb-4">Lead Sources Mix</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
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
