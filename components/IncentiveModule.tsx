
import React, { useState } from 'react';
import { IncentiveScheme, Agent, Lead } from '../types';
import { MOCK_INCENTIVES } from '../constants';
import { Trophy, Target, TrendingUp, Award, Coins } from 'lucide-react';

interface IncentiveModuleProps {
  agents: Agent[];
  bookingsCount: Record<string, number>; // Map agentId to count
}

const IncentiveModule: React.FC<IncentiveModuleProps> = ({ agents, bookingsCount }) => {
  const [schemes, setSchemes] = useState<IncentiveScheme[]>(MOCK_INCENTIVES);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'config'>('leaderboard');

  const calculateIncentive = (count: number, role: 'Presales' | 'Sales') => {
      const scheme = schemes.find(s => s.role === role);
      if (!scheme) return 0;
      
      let total = 0;
      // Simplified logic: Find slab that matches count, multiply count by rate
      const applicableSlab = scheme.slabs.find(s => count >= s.minUnits && count <= s.maxUnits);
      if (applicableSlab) {
          total = count * applicableSlab.amountPerUnit;
      }
      return total;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" /> Incentive & Rewards
            </h1>
            <p className="text-slate-500">Transparent earnings calculation for the team</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
            <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'leaderboard' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Leaderboard</button>
            <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'config' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Scheme Config</button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Cards */}
              {agents.filter(a => a.role === 'Presales').map(agent => {
                  const sales = bookingsCount[agent.id] || Math.floor(Math.random() * 10); // Mock random if 0
                  const earnings = calculateIncentive(sales, 'Presales');
                  
                  return (
                    <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Award className="w-24 h-24" />
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-600">
                                    {agent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{agent.name}</h3>
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Presales</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Units Sold</p>
                                    <p className="text-2xl font-bold text-slate-800">{sales}</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded border border-emerald-100 text-center">
                                    <p className="text-xs text-emerald-600 uppercase font-bold">Incentive</p>
                                    <p className="text-2xl font-bold text-emerald-700">₹{(earnings/1000).toFixed(1)}k</p>
                                </div>
                            </div>

                            {/* Progress Bar to next slab */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500 font-medium">Target Progress</span>
                                    <span className="text-slate-800 font-bold">{sales}/10 Units</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" style={{ width: `${Math.min((sales/10)*100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="font-bold text-slate-800 mb-6">Incentive Slabs Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {schemes.map(scheme => (
                      <div key={scheme.id} className="border border-slate-200 rounded-xl p-6">
                          <h3 className="font-bold text-lg text-slate-700 mb-4 border-b border-slate-100 pb-2">{scheme.role} Team</h3>
                          <div className="space-y-3">
                              {scheme.slabs.map((slab, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                                      <span className="text-sm font-medium text-slate-600">{slab.minUnits} - {slab.maxUnits} Units</span>
                                      <span className="font-bold text-emerald-600">₹{slab.amountPerUnit.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ unit</span></span>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                              <span className="text-sm font-bold text-orange-600 flex items-center gap-2"><Target className="w-4 h-4" /> Kicker (Spot Incentive)</span>
                              <span className="font-bold text-slate-800">+ ₹{scheme.kicker}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default IncentiveModule;
