
import React, { useState } from 'react';
import { MarketingCampaign } from '../types';
import { BarChart3, Facebook, Globe, RefreshCw, Calendar, Plus, AlertCircle, CheckCircle2, ExternalLink, ArrowUpRight, Filter } from 'lucide-react';

interface MarketingModuleProps {
  campaigns: MarketingCampaign[];
  setCampaigns: (campaigns: MarketingCampaign[]) => void;
}

const MarketingModule: React.FC<MarketingModuleProps> = ({ campaigns, setCampaigns }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'accounts'>('campaigns');
  const [isSyncing, setIsSyncing] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // Mock Connected Accounts
  const [accounts, setAccounts] = useState([
    { id: 1, platform: 'Meta', name: 'Sonawane Main', status: 'Connected', lastSync: '10 mins ago', spend: '₹ 45,000' },
    { id: 2, platform: 'Google', name: 'Search - Mumbai', status: 'Connected', lastSync: '1 hour ago', spend: '₹ 28,500' },
  ]);

  // Mock KPI Data
  const kpis = [
    { label: 'Total Spend', value: '₹ 73,500', change: '+12%', color: 'bg-blue-500' },
    { label: 'Leads Generated', value: '482', change: '+5%', color: 'bg-purple-500' },
    { label: 'Cost Per Lead', value: '₹ 152', change: '-8%', color: 'bg-green-500' },
    { label: 'Site Visits', value: '38', change: '+2%', color: 'bg-orange-500' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Data Synced Successfully from Meta & Google Ads!");
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* HEADER: Responsive Stack */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Marketing Command Center</h2>
          <p className="text-slate-500 text-sm hidden md:block">Manage ad campaigns and track ROI across platforms.</p>
        </div>
        
        {/* CONTROLS: Full width on mobile, auto on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <select 
                    className="w-full md:w-48 bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2.5 text-sm font-medium text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Custom Range</option>
                </select>
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            <button 
                onClick={handleSync}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-sm ${isSyncing ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isSyncing}
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
        </div>
      </div>

      {/* TABS: Scrollable on mobile */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button 
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'campaigns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Campaign Performance
        </button>
        <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'accounts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Ad Accounts & Settings
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {activeTab === 'accounts' ? (
            // ACCOUNTS TAB
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Connected Ad Platforms</h3>
                        <p className="text-sm text-slate-500">Manage API connections for data sync.</p>
                    </div>
                    <button className="w-full md:w-auto text-blue-600 text-sm font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 border border-dashed border-blue-200">
                        <Plus className="w-4 h-4" /> Connect New Account
                    </button>
                </div>

                <div className="space-y-4">
                    {accounts.map(acc => (
                        <div key={acc.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
                            {/* Left: Icon & Name */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${acc.platform === 'Meta' ? 'bg-[#1877F2] text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                                    {acc.platform === 'Meta' ? <Facebook className="w-6 h-6" /> : <Globe className="w-6 h-6 text-green-600" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base">{acc.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        ID: {Math.random().toString().substr(2,8)} • {acc.platform} Ads
                                    </p>
                                </div>
                            </div>

                            {/* Right: Status & Metrics - Stacks on mobile */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto pl-[4rem] md:pl-0">
                                <div className="text-left md:text-right">
                                    <p className="text-xs text-slate-400 font-medium uppercase">30-Day Spend</p>
                                    <p className="text-sm font-bold text-slate-700">{acc.spend}</p>
                                </div>
                                
                                <div className="text-left md:text-right">
                                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                        <CheckCircle2 className="w-3 h-3" /> Connected
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-medium">Last sync: {acc.lastSync}</div>
                                </div>

                                <button className="text-slate-400 hover:text-red-600 text-sm font-medium transition p-2 hover:bg-red-50 rounded-lg">
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            // CAMPAIGNS TAB
            <div className="space-y-6">
                
                {/* KPI CARDS: Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{kpi.value}</h3>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${kpi.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {kpi.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />} 
                                {kpi.change} vs last period
                            </div>
                        </div>
                    ))}
                </div>

                {/* CAMPAIGN TABLE / PLACEHOLDER */}
                <div className="bg-white p-8 text-center rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg">Campaign Data for "{dateRange}"</h3>
                    <p className="text-slate-500 text-sm max-w-md mt-2">
                        Showing aggregated performance from <b>{accounts.length} Connected Accounts</b>.
                        Detailed row-level data would appear here.
                    </p>
                    <button className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition">
                        Download Report
                    </button>
                </div>

            </div>
        )}
      </div>
    </div>
  );
};

export default MarketingModule;
