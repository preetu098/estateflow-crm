
import React, { useState } from 'react';
import { Agent } from '../types';
import { Wallet, Settings, TrendingUp, Users, Phone, Megaphone } from 'lucide-react';

interface IncentiveModuleProps {
  agents: Agent[];
  bookingsCount: Record<string, number>; // For Sales
  // You would pass other metrics here in a real app
}

const IncentiveModule: React.FC<IncentiveModuleProps> = ({ agents, bookingsCount }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'presales' | 'marketing'>('sales');
  const [viewMode, setViewMode] = useState<'payouts' | 'config'>('payouts');

  // Mock Config State
  const [config, setConfig] = useState({
      sales: { target: 5, bonus: 10000, metric: 'Bookings' },
      presales: { target: 20, bonus: 5000, metric: 'Site Visits' },
      marketing: { target: 100, bonus: 15000, metric: 'Qualified Leads' }
  });

  // Helper to render the active table
  const renderTable = () => {
      const currentRole = activeTab === 'sales' ? 'Sales' : activeTab === 'presales' ? 'Presales' : 'Marketing';
      const roleAgents = agents.filter(a => a.role === currentRole || (currentRole === 'Marketing' && a.role === 'SuperAdmin')); // Mocking marketing agents

      return (
          <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Metric ({config[activeTab].metric})</th>
                      <th className="p-4">Achieved</th>
                      <th className="p-4">Incentive Earned</th>
                      <th className="p-4">Status</th>
                  </tr>
              </thead>
              <tbody>
                  {roleAgents.map(agent => {
                      // Mock achievement calculation
                      const achieved = activeTab === 'sales' ? (bookingsCount[agent.id] || 0) : Math.floor(Math.random() * 30); 
                      const earned = achieved >= config[activeTab].target ? config[activeTab].bonus : 0;
                      
                      return (
                          <tr key={agent.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                                      {agent.name.charAt(0)}
                                  </div>
                                  {agent.name}
                              </td>
                              <td className="p-4 text-slate-500">Target: {config[activeTab].target}</td>
                              <td className="p-4 font-mono font-bold">{achieved}</td>
                              <td className={`p-4 font-bold ${earned > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                  ₹ {earned.toLocaleString()}
                              </td>
                              <td className="p-4">
                                  {earned > 0 ? (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Eligible</span>
                                  ) : (
                                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs">Pending</span>
                                  )}
                              </td>
                          </tr>
                      );
                  })}
                  {roleAgents.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 italic">No agents found in this department.</td>
                      </tr>
                  )}
              </tbody>
          </table>
      );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Incentive Manager</h2>
                <p className="text-slate-500 text-sm">Calculate commissions for all departments</p>
            </div>
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button onClick={() => setViewMode('payouts')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'payouts' ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>Payouts</button>
                <button onClick={() => setViewMode('config')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'config' ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>Configuration</button>
            </div>
        </div>

        {/* Department Tabs */}
        <div className="grid grid-cols-3 gap-4">
            <button 
                onClick={() => setActiveTab('sales')}
                className={`p-4 rounded-xl border transition flex items-center gap-3 ${activeTab === 'sales' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-blue-200'}`}
            >
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Wallet className="w-5 h-5"/></div>
                <div className="text-left">
                    <div className={`font-bold ${activeTab === 'sales' ? 'text-blue-800' : 'text-slate-700'}`}>Sales Team</div>
                    <div className="text-xs text-slate-500">Based on Bookings</div>
                </div>
            </button>
            <button 
                onClick={() => setActiveTab('presales')}
                className={`p-4 rounded-xl border transition flex items-center gap-3 ${activeTab === 'presales' ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'bg-white border-slate-200 hover:border-purple-200'}`}
            >
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Phone className="w-5 h-5"/></div>
                <div className="text-left">
                    <div className={`font-bold ${activeTab === 'presales' ? 'text-purple-800' : 'text-slate-700'}`}>Presales Team</div>
                    <div className="text-xs text-slate-500">Based on Site Visits</div>
                </div>
            </button>
            <button 
                onClick={() => setActiveTab('marketing')}
                className={`p-4 rounded-xl border transition flex items-center gap-3 ${activeTab === 'marketing' ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-slate-200 hover:border-orange-200'}`}
            >
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Megaphone className="w-5 h-5"/></div>
                <div className="text-left">
                    <div className={`font-bold ${activeTab === 'marketing' ? 'text-orange-800' : 'text-slate-700'}`}>Marketing Team</div>
                    <div className="text-xs text-slate-500">Based on Leads/CPL</div>
                </div>
            </button>
        </div>

        {viewMode === 'config' ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 max-w-2xl mx-auto shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                    <Settings className="w-5 h-5 text-slate-500"/> 
                    Configure {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Incentives
                </h3>
                
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Performance Metric</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-700"
                            value={config[activeTab].metric}
                            onChange={(e) => setConfig({...config, [activeTab]: {...config[activeTab], metric: e.target.value}})}
                        >
                            <option>Bookings</option>
                            <option>Revenue (₹)</option>
                            <option>Site Visits</option>
                            <option>Qualified Leads</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Target Threshold</label>
                            <input 
                                type="number" 
                                value={config[activeTab].target} 
                                onChange={(e) => setConfig({...config, [activeTab]: {...config[activeTab], target: parseInt(e.target.value)}})}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            <p className="text-xs text-slate-400 mt-1">Minimum to unlock bonus</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Bonus Amount (₹)</label>
                            <input 
                                type="number" 
                                value={config[activeTab].bonus} 
                                onChange={(e) => setConfig({...config, [activeTab]: {...config[activeTab], bonus: parseInt(e.target.value)}})}
                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            <p className="text-xs text-slate-400 mt-1">Flat payout on achievement</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setViewMode('payouts')} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
                        <button onClick={() => { alert('Configuration Saved!'); setViewMode('payouts'); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Save Changes</button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                {renderTable()}
            </div>
        )}
    </div>
  );
};

export default IncentiveModule;
