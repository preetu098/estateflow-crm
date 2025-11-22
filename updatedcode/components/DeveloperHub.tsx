
import React, { useState, useMemo } from 'react';
import { 
    Terminal, Database, Activity, Server, Code, CheckCircle, XCircle, RefreshCw, 
    Shield, ToggleLeft, ToggleRight, Globe, Zap, Book, GitMerge, AlertTriangle, 
    Link, Key, Wifi, Plug, Search, LayoutGrid, MessageSquare, Phone, DollarSign, 
    Mail, ShoppingCart, MessageCircle, Cloud, FileText, Settings, Filter, ArrowRight
} from 'lucide-react';
import { FeatureFlags } from '../types';

interface DeveloperHubProps {
    featureFlags?: FeatureFlags;
    setFeatureFlags?: React.Dispatch<React.SetStateAction<FeatureFlags>>;
}

// Expanded Integration Database
const ALL_INTEGRATIONS = [
    { id: 'zapier', name: 'Zapier', category: 'Automation', desc: 'Automate workflows with 5000+ apps', icon: Zap },
    { id: 'slack', name: 'Slack', category: 'Communication', desc: 'Team notifications & critical alerts', icon: MessageSquare },
    { id: 'salesforce', name: 'Salesforce', category: 'CRM', desc: 'Bi-directional CRM data sync', icon: Database },
    { id: 'hubspot', name: 'HubSpot', category: 'Marketing', desc: 'Marketing automation integration', icon: Globe },
    { id: 'exotel', name: 'Exotel', category: 'Telephony', desc: 'Cloud telephony & IVR call tracking', icon: Phone },
    { id: 'razorpay', name: 'Razorpay', category: 'Payments', desc: 'Payment gateway webhooks', icon: DollarSign },
    { id: 'meta', name: 'WhatsApp', category: 'Communication', desc: 'Official WhatsApp Business API', icon: MessageCircle },
    { id: 'google_sheets', name: 'Google Sheets', category: 'Utility', desc: 'Sync leads to spreadsheet rows', icon: FileText },
    { id: 'pabbly', name: 'Pabbly Connect', category: 'Automation', desc: 'Affordable alternative to Zapier', icon: Zap },
    { id: 'zoho', name: 'Zoho CRM', category: 'CRM', desc: 'Sync contacts and deals', icon: Database },
    { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', desc: 'Email marketing campaigns', icon: Mail },
    { id: 'sendgrid', name: 'SendGrid', category: 'Marketing', desc: 'Transactional email API', icon: Mail },
    { id: 'stripe', name: 'Stripe', category: 'Payments', desc: 'International payments & billing', icon: DollarSign },
    { id: 'twilio', name: 'Twilio', category: 'Telephony', desc: 'SMS and Voice API', icon: Phone },
    { id: 'intercom', name: 'Intercom', category: 'Support', desc: 'Customer messaging platform', icon: MessageSquare },
    { id: 'shopify', name: 'Shopify', category: 'eCommerce', desc: 'Sync orders and customers', icon: ShoppingCart },
    { id: 'aws_s3', name: 'AWS S3', category: 'Storage', desc: 'Archive documents to cloud bucket', icon: Cloud },
    { id: 'tally', name: 'Tally Prime', category: 'Accounting', desc: 'Push vouchers via TDL connector', icon: Activity },
];

const DeveloperHub: React.FC<DeveloperHubProps> = ({ featureFlags, setFeatureFlags }) => {
    const [activeTab, setActiveTab] = useState<'marketplace' | 'api' | 'webhooks' | 'schema' | 'features'>('marketplace');
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>('leads-create');
    const [searchQuery, setSearchQuery] = useState('');

    // --- INTEGRATION STATE ---
    const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>({
        'Exotel': true, 
        'Razorpay': true,
        'Slack': true
    });
    const [configuringApp, setConfiguringApp] = useState<string | null>(null);
    const [apiKeyValue, setApiKeyValue] = useState('');

    // --- HANDLERS ---
    const handleConnectClick = (appName: string) => {
        setConfiguringApp(appName);
        setApiKeyValue('');
    };

    const handleSaveConnection = () => {
        if (configuringApp) {
            if (apiKeyValue.length < 5) {
                alert("Please enter a valid API Key.");
                return;
            }
            setConnectedIntegrations(prev => ({ ...prev, [configuringApp]: true }));
            setConfiguringApp(null);
            setApiKeyValue('');
            alert(`${configuringApp} connected successfully!`);
        }
    };

    const handleDisconnect = (appName: string) => {
        if (confirm(`Are you sure you want to disconnect ${appName}? Data sync will stop immediately.`)) {
            setConnectedIntegrations(prev => {
                const newState = { ...prev };
                delete newState[appName];
                return newState;
            });
        }
    };

    const toggleFlag = (key: keyof FeatureFlags) => {
        if (setFeatureFlags && featureFlags) {
            setFeatureFlags({ ...featureFlags, [key]: !featureFlags[key] });
        }
    };

    // Filter Integrations
    const filteredIntegrations = useMemo(() => {
        return ALL_INTEGRATIONS.filter(app => 
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            app.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // Mock Webhook Logs
    const [webhookLogs] = useState([
        { id: 'evt_1', source: 'Facebook', timestamp: '2024-10-26 10:45:22', status: 200, payload: '{"lead_id": "fb_123", "form_id": "8899" }' },
        { id: 'evt_2', source: 'Google Ads', timestamp: '2024-10-26 11:12:05', status: 200, payload: '{"gclid": "Ax7...", "campaign_id": "9922" }' },
        { id: 'evt_3', source: 'MagicBricks', timestamp: '2024-10-26 11:30:00', status: 400, payload: '{"error": "Invalid API Key" }' },
    ]);

    // Mock Schema
    const schemaData = [
        { table: 'Leads', column: 'id', type: 'UUID', desc: 'Primary Key. Prefix "LD-"' },
        { table: 'Leads', column: 'lead_score', type: 'Integer', desc: 'AI Calculated (0-100)' },
        { table: 'Bookings', column: 'payment_schedule', type: 'JSONB', desc: 'Milestones Array' },
        { table: 'Units', column: 'status', type: 'Enum', desc: "'Available' | 'Sold' | 'Blocked'" },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200 animate-fade-in relative font-sans">
            
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-30 shadow-md">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <Terminal className="w-7 h-7 text-green-500" /> 
                        Developer Hub
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">System Documentation, Integrations & Configuration</p>
                </div>
                
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        {[
                            { id: 'marketplace', label: 'Marketplace', icon: Plug },
                            { id: 'api', label: 'API Reference', icon: Code },
                            { id: 'webhooks', label: 'Webhooks', icon: Activity },
                            { id: 'schema', label: 'Schema', icon: Database },
                            { id: 'features', label: 'Flags', icon: ToggleRight }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)} 
                                className={`
                                    px-4 py-2.5 rounded-md text-sm font-bold transition flex items-center gap-2 whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                
                {/* TAB: MARKETPLACE */}
                {activeTab === 'marketplace' && (
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    Integration Marketplace
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Connect your favorite tools to sync leads and events.</p>
                            </div>
                            
                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl leading-5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                                    placeholder="Search apps (e.g. Slack, CRM...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <span className="text-xs text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">CTRL+K</span>
                                </div>
                            </div>
                        </div>

                        {/* App Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredIntegrations.map(app => {
                                const isConnected = connectedIntegrations[app.name];
                                return (
                                    <div 
                                        key={app.id} 
                                        className={`
                                            relative p-6 rounded-2xl border flex flex-col h-full justify-between transition-all duration-300 group
                                            ${isConnected 
                                                ? 'bg-slate-800 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.05)]' 
                                                : 'bg-slate-900 border-slate-800 hover:border-blue-500/30 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl'
                                            }
                                        `}
                                    >
                                        {isConnected && (
                                            <div className="absolute top-4 right-4">
                                                <span className="flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-900/20 text-green-400' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-900/20'} transition-colors`}>
                                                    <app.icon className="w-7 h-7" />
                                                </div>
                                            </div>
                                            <h4 className={`font-bold text-lg mb-1 ${isConnected ? 'text-green-50' : 'text-slate-200'}`}>{app.name}</h4>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-slate-500 border border-slate-800 mb-3">
                                                {app.category}
                                            </span>
                                            <p className="text-sm text-slate-400 leading-relaxed">{app.desc}</p>
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
                                            <span className={`text-[10px] font-mono font-bold ${isConnected ? 'text-green-400' : 'text-slate-600'}`}>
                                                {isConnected ? 'ACTIVE' : 'DISCONNECTED'}
                                            </span>
                                            
                                            {isConnected ? (
                                                <button 
                                                    onClick={() => handleDisconnect(app.name)} 
                                                    className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition"
                                                >
                                                    Disconnect
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleConnectClick(app.name)} 
                                                    className="px-4 py-1.5 text-xs font-bold bg-white text-slate-900 rounded-lg hover:bg-blue-50 transition shadow-lg shadow-white/5 flex items-center gap-1.5 group-hover:bg-blue-500 group-hover:text-white"
                                                >
                                                    <Plug className="w-3 h-3" /> Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {filteredIntegrations.length === 0 && (
                            <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-800 border-dashed">
                                <div className="bg-slate-800 p-4 rounded-full inline-block mb-4">
                                    <Search className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300">No integrations found</h3>
                                <p className="text-slate-500 text-sm mt-2">Try searching for a different app or category.</p>
                                <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-bold hover:underline">Clear Search</button>
                            </div>
                        )}

                        {/* Help Footer */}
                        <div className="mt-12 border-t border-slate-800 pt-8 pb-4">
                            <h4 className="text-center text-slate-500 font-bold text-xs uppercase tracking-wider mb-6">Integration Workflow</h4>
                            <div className="flex flex-col md:flex-row justify-center items-center gap-8 opacity-80">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-700 shadow-lg">1</div>
                                    <p className="text-sm font-bold text-slate-300">Select App</p>
                                    <p className="text-xs text-slate-500 max-w-[150px]">Choose from our directory of supported providers.</p>
                                </div>
                                <div className="hidden md:block h-px w-16 bg-slate-700"></div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-700 shadow-lg">2</div>
                                    <p className="text-sm font-bold text-slate-300">Authenticate</p>
                                    <p className="text-xs text-slate-500 max-w-[150px]">Enter API Key or OAuth credentials securely.</p>
                                </div>
                                <div className="hidden md:block h-px w-16 bg-slate-700"></div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-700 shadow-lg">3</div>
                                    <p className="text-sm font-bold text-slate-300">Sync Data</p>
                                    <p className="text-xs text-slate-500 max-w-[150px]">Map fields and start real-time synchronization.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: WEBHOOKS (LOGS) */}
                {activeTab === 'webhooks' && (
                    <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">Live Webhook Stream</h3>
                                <p className="text-xs text-slate-400">Real-time incoming payload inspector</p>
                            </div>
                            <button className="text-xs bg-slate-700 hover:bg-slate-600 text-blue-300 px-3 py-1.5 rounded flex items-center gap-2 transition">
                                <RefreshCw className="w-3 h-3" /> Auto-refresh: ON
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-950 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Payload Preview</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700 font-mono text-xs">
                                    {webhookLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                {log.source}
                                            </td>
                                            <td className="px-6 py-4">{log.timestamp}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded border ${
                                                    log.status === 200 
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                    {log.status} OK
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 truncate max-w-xs" title={log.payload}>
                                                {log.payload}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-400 hover:text-blue-300 hover:underline">Replay</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB: API DOCS */}
                {activeTab === 'api' && (
                    <div className="flex flex-col lg:flex-row h-full gap-6 max-w-7xl mx-auto">
                        <div className="w-full lg:w-64 bg-slate-800 rounded-xl border border-slate-700 p-4 h-fit">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Resources</h3>
                            <div className="space-y-1">
                                <button onClick={() => setSelectedEndpoint('leads-create')} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-mono transition ${selectedEndpoint === 'leads-create' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-700'}`}>POST /leads</button>
                                <button onClick={() => setSelectedEndpoint('leads-get')} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-mono transition ${selectedEndpoint === 'leads-get' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-700'}`}>GET /leads/:id</button>
                                <button onClick={() => setSelectedEndpoint('leads-update')} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-mono transition ${selectedEndpoint === 'leads-update' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-700'}`}>PUT /leads/:id</button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl">
                             <div className="space-y-8">
                                 <div>
                                     <div className="flex items-center gap-3 mb-4">
                                         <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-md text-sm font-bold font-mono">POST</span>
                                         <span className="text-2xl font-mono font-bold text-white tracking-tight">/api/v1/leads</span>
                                     </div>
                                     <p className="text-slate-400 text-lg">Creates a new lead in the system. Auto-assigns an agent based on the configured Round Robin logic.</p>
                                 </div>
                                 
                                 <div>
                                     <h4 className="text-sm font-bold text-slate-300 uppercase mb-3">Request Body (JSON)</h4>
                                     <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-sm text-blue-300 shadow-inner overflow-x-auto">
                                         <pre>{`{
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "project": "Krishna Trident",
  "source": "API",
  "campaign": "Website Form"
}`}</pre>
                                     </div>
                                 </div>

                                 <div>
                                     <h4 className="text-sm font-bold text-slate-300 uppercase mb-3">Response (201 Created)</h4>
                                     <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-sm text-green-400 shadow-inner overflow-x-auto">
                                         <pre>{`{
  "success": true,
  "data": {
    "id": "LD-17239485",
    "assigned_agent": "Amit Sales",
    "status": "New"
  }
}`}</pre>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* TAB: FEATURE FLAGS */}
                {activeTab === 'features' && featureFlags && (
                    <div className="max-w-5xl mx-auto bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">System Feature Flags</h3>
                                <p className="text-slate-400 text-sm mt-1">Control module visibility and beta features globally.</p>
                            </div>
                            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Reset Defaults</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(featureFlags).map(([key, value]) => (
                                <div key={key} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center hover:border-blue-500/30 transition-colors">
                                    <div>
                                        <span className="text-sm font-medium text-slate-200 capitalize block">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-xs text-slate-500 font-mono">{key}</span>
                                    </div>
                                    <button onClick={() => toggleFlag(key as keyof FeatureFlags)} className={`transition-colors p-1 rounded-full hover:bg-slate-700 ${value ? 'text-green-400' : 'text-slate-600'}`}>
                                        {value ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: SCHEMA */}
                {activeTab === 'schema' && (
                    <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                         <div className="p-6 border-b border-slate-700">
                             <h3 className="font-bold text-white">Database Schema Reference</h3>
                         </div>
                         <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-500 font-bold border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Table Name</th>
                                    <th className="px-6 py-4">Column</th>
                                    <th className="px-6 py-4">Data Type</th>
                                    <th className="px-6 py-4">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {schemaData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-white font-bold">{row.table}</td>
                                        <td className="px-6 py-4 font-mono text-yellow-400">{row.column}</td>
                                        <td className="px-6 py-4 font-mono text-blue-400">{row.type}</td>
                                        <td className="px-6 py-4 text-slate-500">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CONNECTION MODAL */}
            {configuringApp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" /> Connect {configuringApp}
                            </h3>
                            <button onClick={() => setConfiguringApp(null)} className="text-slate-400 hover:text-white transition"><XCircle className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Enter your API Key or Webhook Secret to establish a secure bi-directional sync with <strong>{configuringApp}</strong>.
                            </p>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">API Key / Secret</label>
                                <div className="relative group">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        type="password" 
                                        value={apiKeyValue}
                                        onChange={(e) => setApiKeyValue(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono shadow-inner"
                                        placeholder="sk_live_..."
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-xs text-blue-200 flex items-start gap-3">
                                <Shield className="w-5 h-5 mt-0.5 shrink-0 text-blue-400" />
                                <span className="leading-relaxed">Credentials are encrypted at rest using AES-256. We never share your keys with third parties.</span>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setConfiguringApp(null)} className="px-5 py-2.5 text-slate-400 font-bold hover:text-white transition text-sm">Cancel</button>
                            <button 
                                onClick={handleSaveConnection}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-500 transition flex items-center gap-2 text-sm"
                            >
                                <CheckCircle className="w-4 h-4" /> Verify & Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperHub;
