
import React, { useState } from 'react';
import { Terminal, Database, Activity, Server, Code, Copy, CheckCircle, XCircle, RefreshCw, Shield, ToggleLeft, ToggleRight, Globe, Zap, Book, GitMerge, AlertTriangle } from 'lucide-react';
import { FeatureFlags } from '../types';

interface DeveloperHubProps {
    featureFlags?: FeatureFlags;
    setFeatureFlags?: React.Dispatch<React.SetStateAction<FeatureFlags>>;
}

const DeveloperHub: React.FC<DeveloperHubProps> = ({ featureFlags, setFeatureFlags }) => {
    const [activeTab, setActiveTab] = useState<'api' | 'webhooks' | 'schema' | 'health' | 'features' | 'bluebook'>('bluebook');
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>('leads-create');

    // Mock Webhook Logs
    const [webhookLogs, setWebhookLogs] = useState([
        { id: 'evt_1', source: 'Facebook', timestamp: '2024-10-26 10:45:22', status: 200, payload: '{"lead_id": "fb_123", "form_id": "8899", "field_data": [...] }' },
        { id: 'evt_2', source: 'Google Ads', timestamp: '2024-10-26 11:12:05', status: 200, payload: '{"gclid": "Ax7...", "campaign_id": "9922", "user_data": {...} }' },
        { id: 'evt_3', source: 'MagicBricks', timestamp: '2024-10-26 11:30:00', status: 400, payload: '{"error": "Invalid API Key", "payload": "XML_DATA..." }' },
        { id: 'evt_4', source: 'Website API', timestamp: '2024-10-26 12:01:10', status: 200, payload: '{"name": "Test Lead", "mobile": "9988776655" }' },
    ]);

    // Mock Schema Data
    const schemaData = [
        { table: 'Leads', column: 'id', type: 'UUID', desc: 'Primary Key. Prefix "LD-" for UI consistency.' },
        { table: 'Leads', column: 'lead_score', type: 'Integer (0-100)', desc: 'AI Calculated. Logic: (Email Verified=+10) + (Budget > 50L=+20) + (Site Visit=+50).' },
        { table: 'Leads', column: 'meta_data', type: 'JSONB', desc: 'Stores raw attribution data from FB/Google (campaign_id, ad_set_id).' },
        { table: 'Bookings', column: 'payment_schedule', type: 'JSONB', desc: 'Array of milestones. Includes "status", "penalty", and "interest" fields.' },
        { table: 'Inventory', column: 'status', type: 'Enum', desc: "'Available' | 'Sold' | 'Blocked'. 'Blocked' auto-expires in Redis after 24h." },
    ];

    const toggleFlag = (key: keyof FeatureFlags) => {
        if (setFeatureFlags && featureFlags) {
            setFeatureFlags({ ...featureFlags, [key]: !featureFlags[key] });
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200 animate-fade-in">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-green-400" /> Developer Hub
                    </h1>
                    <p className="text-slate-400 text-sm">System Documentation & Health Monitor</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('bluebook')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'bluebook' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>The Blue Book</button>
                    <button onClick={() => setActiveTab('features')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'features' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Feature Flags</button>
                    <button onClick={() => setActiveTab('health')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'health' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>System Health</button>
                    <button onClick={() => setActiveTab('api')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'api' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>API Docs</button>
                    <button onClick={() => setActiveTab('webhooks')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'webhooks' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Webhook Marketplace</button>
                    <button onClick={() => setActiveTab('schema')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'schema' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Data Schema</button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* TAB: BLUE BOOK (MASTER DOCS) */}
                {activeTab === 'bluebook' && (
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-6">
                                <Book className="w-12 h-12 text-blue-400" />
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Master System Documentation</h2>
                                    <p className="text-blue-300">The "Blue Book" - Source of Truth for Architecture & Logic</p>
                                </div>
                            </div>

                            {/* Part 1: Architecture */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><GitMerge className="w-5 h-5 text-purple-400" /> 1. The "Factory Line" Data Flow</h3>
                                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                    <div className="bg-slate-800 p-3 rounded border-l-4 border-blue-500">
                                        <span className="block font-bold text-blue-400 mb-1">1. Ingestion</span>
                                        <span className="text-slate-400">Leads enter via Marketing/CP/Website into Pool.</span>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded border-l-4 border-yellow-500">
                                        <span className="block font-bold text-yellow-400 mb-1">2. Filtration</span>
                                        <span className="text-slate-400">Presales qualifies & triggers Site Visit (Gate Pass).</span>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded border-l-4 border-orange-500">
                                        <span className="block font-bold text-orange-400 mb-1">3. Handover</span>
                                        <span className="text-slate-400">Reception scans Pass $\rightarrow$ Transfer to Sales.</span>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded border-l-4 border-green-500">
                                        <span className="block font-bold text-green-400 mb-1">4. Transaction</span>
                                        <span className="text-slate-400">Block Inventory $\rightarrow$ Quote $\rightarrow$ Booking.</span>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded border-l-4 border-purple-500">
                                        <span className="block font-bold text-purple-400 mb-1">5. Fulfillment</span>
                                        <span className="text-slate-400">Agreements $\rightarrow$ Construction $\rightarrow$ Possession.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Part 2: Developer Bible */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Server className="w-5 h-5 text-blue-400" /> Technical Standards</h3>
                                    <ul className="space-y-3 text-sm text-slate-300">
                                        <li className="bg-slate-900 p-3 rounded border border-slate-700">
                                            <strong className="text-white block mb-1">Optimistic Locking</strong>
                                            Use database versioning to prevent double-booking of Inventory units.
                                        </li>
                                        <li className="bg-slate-900 p-3 rounded border border-slate-700">
                                            <strong className="text-white block mb-1">Quote Snapshots</strong>
                                            Freeze Quote data into a JSON blob when converting to Booking. Do not reference live pricing.
                                        </li>
                                        <li className="bg-slate-900 p-3 rounded border border-slate-700">
                                            <strong className="text-white block mb-1">PDF Generation</strong>
                                            Use Handlebars/Puppeteer for Agreements. No client-side generation for legal docs.
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /> "What Not To Do"</h3>
                                    <ul className="space-y-3 text-sm text-slate-300">
                                        <li className="bg-red-900/20 p-3 rounded border border-red-900/50 text-red-200">
                                            <strong className="block mb-1">NEVER Hard Delete</strong>
                                            Always use `deleted_at` timestamps (Soft Delete) for auditing.
                                        </li>
                                        <li className="bg-red-900/20 p-3 rounded border border-red-900/50 text-red-200">
                                            <strong className="block mb-1">NEVER Expose Tenant Data</strong>
                                            Strictly enforce `Tenant_ID` checks on every API call.
                                        </li>
                                        <li className="bg-red-900/20 p-3 rounded border border-red-900/50 text-red-200">
                                            <strong className="block mb-1">NEVER Bypass Accounts</strong>
                                            Changing "Booking Amount" logic without updating "Accounts Module" is prohibited.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Part 3: Reciprocal Actions */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-emerald-400" /> The Butterfly Effect (Reciprocal Actions)</h3>
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm">
                                    <div className="grid grid-cols-2 gap-4 mb-4 border-b border-slate-800 pb-4">
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Scenario</span>
                                            <p className="text-white font-bold">Cancellation of a Booked Unit</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Trigger</span>
                                            <p className="text-white">Sales Manager approves "Cancel Booking"</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex gap-3">
                                            <span className="text-emerald-400 font-mono">Effect 1:</span>
                                            <span className="text-slate-300">Inventory Unit turns <strong>GREEN (Available)</strong> immediately.</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="text-emerald-400 font-mono">Effect 2:</span>
                                            <span className="text-slate-300">Accounts generates <strong>Credit Note</strong> for refund.</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="text-emerald-400 font-mono">Effect 3:</span>
                                            <span className="text-slate-300">Broker Commission Invoice is reversed via <strong>Debit Note</strong>.</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="text-emerald-400 font-mono">Effect 4:</span>
                                            <span className="text-slate-300">Unit pushed to <strong>Marketing API</strong> (e.g., 99acres, Housing) as Available.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: FEATURE FLAGS */}
                {activeTab === 'features' && featureFlags && (
                    <div className="space-y-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ToggleLeft className="w-5 h-5 text-purple-400" /> Modular Feature Control
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">Enable or disable entire modules instantly. Changes reflect in the sidebar immediately.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(featureFlags).map(([key, value]) => (
                                    <div key={key} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                            <p className="text-xs text-slate-400">Module toggle</p>
                                        </div>
                                        <button onClick={() => toggleFlag(key as keyof FeatureFlags)} className={`text-2xl ${value ? 'text-green-400' : 'text-slate-500'}`}>
                                            {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: SYSTEM HEALTH */}
                {activeTab === 'health' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-300">API Server</h3>
                                    <Activity className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">99.98%</div>
                                <div className="text-xs text-green-400">Uptime (Last 30 Days)</div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-green-500 h-full w-[99%]"></div>
                                </div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-300">Database (Postgres)</h3>
                                    <Database className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">45ms</div>
                                <div className="text-xs text-slate-400">Avg Query Latency</div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[30%]"></div>
                                </div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-300">Redis Cache</h3>
                                    <Server className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">1.2 GB</div>
                                <div className="text-xs text-slate-400">Memory Usage</div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-purple-500 h-full w-[60%]"></div>
                                </div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-300">Integration Status</h3>
                                    <Shield className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-slate-400">WhatsApp API</span> <span className="text-green-400">Connected</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">SendGrid Email</span> <span className="text-green-400">Connected</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Exotel (Voice)</span> <span className="text-red-400">Error (Timeout)</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                                <h3 className="font-bold text-white">Real-time Error Log</h3>
                                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
                            </div>
                            <div className="p-4 font-mono text-xs space-y-2 bg-black/20 h-64 overflow-y-auto">
                                <div className="text-red-400">[ERROR] 2024-10-26 12:05:01 - Connection timeout to Exotel API Gateway. Retrying...</div>
                                <div className="text-yellow-400">[WARN] 2024-10-26 11:45:12 - Lead ID LD-9928 missing 'mobile' field in CSV import. Row skipped.</div>
                                <div className="text-slate-500">[INFO] 2024-10-26 11:30:05 - Database backup completed successfully (2.4GB).</div>
                                <div className="text-red-400">[ERROR] 2024-10-26 10:15:00 - Webhook signature verification failed for Source: MagicBricks.</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: API DOCS */}
                {activeTab === 'api' && (
                    <div className="flex h-full gap-6">
                        {/* Sidebar */}
                        <div className="w-64 bg-slate-800 rounded-xl border border-slate-700 p-4 h-full overflow-y-auto">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Endpoints</h3>
                            <div className="space-y-1">
                                <button onClick={() => setSelectedEndpoint('leads-create')} className={`w-full text-left px-3 py-2 rounded text-sm font-mono ${selectedEndpoint === 'leads-create' ? 'bg-blue-900/50 text-blue-400' : 'text-slate-400 hover:bg-slate-700'}`}>
                                    <span className="text-green-400 font-bold mr-2">POST</span> /leads/create
                                </button>
                                <button onClick={() => setSelectedEndpoint('leads-get')} className={`w-full text-left px-3 py-2 rounded text-sm font-mono ${selectedEndpoint === 'leads-get' ? 'bg-blue-900/50 text-blue-400' : 'text-slate-400 hover:bg-slate-700'}`}>
                                    <span className="text-blue-400 font-bold mr-2">GET</span> /leads/{'{id}'}
                                </button>
                                <button onClick={() => setSelectedEndpoint('inventory')} className={`w-full text-left px-3 py-2 rounded text-sm font-mono ${selectedEndpoint === 'inventory' ? 'bg-blue-900/50 text-blue-400' : 'text-slate-400 hover:bg-slate-700'}`}>
                                    <span className="text-blue-400 font-bold mr-2">GET</span> /inventory
                                </button>
                                <button onClick={() => setSelectedEndpoint('booking')} className={`w-full text-left px-3 py-2 rounded text-sm font-mono ${selectedEndpoint === 'booking' ? 'bg-blue-900/50 text-blue-400' : 'text-slate-400 hover:bg-slate-700'}`}>
                                    <span className="text-green-400 font-bold mr-2">POST</span> /bookings/new
                                </button>
                            </div>
                        </div>

                        {/* Main Panel */}
                        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 h-full overflow-y-auto">
                             {selectedEndpoint === 'leads-create' && (
                                 <div className="space-y-6">
                                     <div>
                                         <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold uppercase mr-2">POST</span>
                                         <span className="text-xl font-mono font-bold text-white">/api/v1/leads/create</span>
                                         <p className="text-slate-400 mt-2">Creates a new lead in the system. Triggers auto-assignment logic and webhook enrichment.</p>
                                     </div>

                                     <div className="bg-black/30 p-4 rounded-lg border border-slate-700">
                                         <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase font-bold">
                                             <span>Request Body (JSON)</span>
                                             <span className="text-blue-400 cursor-pointer">Copy</span>
                                         </div>
                                         <pre className="font-mono text-sm text-green-300 overflow-x-auto">
{`{
  "name": "John Doe",          // Required. String.
  "mobile": "9876543210",      // Required. 10-digit String.
  "source": "Facebook",        // Optional. Enum.
  "project_id": "p1",          // Optional. String.
  "meta_data": {               // Optional. JSON Object.
     "campaign": "Diwali_Offer",
     "ad_set": "Pune_IT"
  }
}`}
                                         </pre>
                                     </div>

                                     <div className="bg-black/30 p-4 rounded-lg border border-slate-700">
                                         <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase font-bold">
                                             <span>Response (201 Created)</span>
                                         </div>
                                         <pre className="font-mono text-sm text-blue-300 overflow-x-auto">
{`{
  "success": true,
  "data": {
      "id": "LD-17299384",
      "status": "New",
      "assigned_to": {
          "id": "sales1",
          "name": "Rohit Closer"
      }
  }
}`}
                                         </pre>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>
                )}

                {/* TAB: WEBHOOKS MARKETPLACE */}
                {activeTab === 'webhooks' && (
                    <div className="space-y-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-400" /> Integration Marketplace
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Zapier', 'Slack', 'Salesforce', 'HubSpot', 'Exotel', 'Razorpay'].map(app => (
                                    <div key={app} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
                                        <span className="font-bold text-slate-200">{app}</span>
                                        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Connect</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
                                <h3 className="font-bold text-white">Incoming Webhook Logs</h3>
                            </div>
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-900 text-slate-500 font-bold border-b border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Payload Preview</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {webhookLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-bold text-white">{log.source}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{log.timestamp}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 200 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {log.status} {log.status === 200 ? 'OK' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 max-w-xs truncate">
                                                {log.payload}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {log.status !== 200 && <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">Retry</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB: SCHEMA */}
                {activeTab === 'schema' && (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                         <div className="p-4 bg-slate-900 border-b border-slate-700">
                             <h3 className="font-bold text-white">Database Schema (PostgreSQL)</h3>
                             <p className="text-xs text-slate-400">Reference for Analytics & Reporting queries.</p>
                         </div>
                         <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900 text-slate-500 font-bold border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Table</th>
                                    <th className="px-6 py-4">Column</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Description / Logic</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {schemaData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-white font-bold">{row.table}</td>
                                        <td className="px-6 py-4 font-mono text-yellow-400">{row.column}</td>
                                        <td className="px-6 py-4 font-mono text-blue-400">{row.type}</td>
                                        <td className="px-6 py-4 text-slate-300">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DeveloperHub;
