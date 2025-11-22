

import React, { useState } from 'react';
import { Lead, Booking, Unit, LeadStage, SimulationScenario } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Activity, Clock, Sliders, Layers, Brain } from 'lucide-react';

interface CockpitModuleProps {
  leads: Lead[];
  bookings: Booking[];
  inventory: Unit[];
}

const CockpitModule: React.FC<CockpitModuleProps> = ({ leads, bookings, inventory }) => {
  const [simulation, setSimulation] = useState<SimulationScenario>({
      name: 'Default',
      priceIncrease: 0,
      salesVelocityChange: 0,
      inventoryImpact: 0
  });

  // --- KPI CALCULATIONS ---
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalCost, 0);
  const totalCollections = bookings.reduce((sum, b) => sum + b.amountPaid, 0);
  const unitsSold = inventory.filter(u => u.status === 'Sold').length;
  const totalUnits = inventory.length;
  const sellOutPercentage = totalUnits > 0 ? ((unitsSold / totalUnits) * 100).toFixed(1) : '0';

  // --- SIMULATION LOGIC ---
  // Apply price increase to projected revenue
  const projectedRevenue = totalRevenue * (1 + simulation.priceIncrease / 100);
  const projectedCollections = totalCollections * (1 + (simulation.salesVelocityChange / 200)); // Mock logic

  const cashFlowData = [
      { month: 'Nov', amount: 5000000, projected: 5000000 },
      { month: 'Dec', amount: 7500000, projected: 7500000 * (1 + simulation.salesVelocityChange/100) },
      { month: 'Jan', amount: 4200000, projected: 4200000 * (1 + simulation.salesVelocityChange/100 + simulation.priceIncrease/200) },
      { month: 'Feb', amount: 6000000, projected: 6000000 * (1 + simulation.salesVelocityChange/100 + simulation.priceIncrease/100) },
  ];

  // Inventory Aging
  const inventoryByType = inventory.reduce((acc, u) => {
      if (!acc[u.type]) acc[u.type] = { total: 0, sold: 0 };
      acc[u.type].total += 1;
      if (u.status === 'Sold') acc[u.type].sold += 1;
      return acc;
  }, {} as Record<string, {total: number, sold: number}>);
  
  const inventoryChartData = Object.keys(inventoryByType).map(type => ({
      name: type,
      Unsold: inventoryByType[type].total - inventoryByType[type].sold,
      Sold: inventoryByType[type].sold
  }));

  // Waterfall Data
  const waterfallData = [
      { name: 'Base Price', value: 8500, fill: '#3b82f6' },
      { name: 'Floor Rise', value: 450, fill: '#10b981' },
      { name: 'Amenities', value: 300, fill: '#10b981' },
      { name: 'Discount', value: -250, fill: '#ef4444' },
      { name: 'Final Rate', value: 9000, fill: '#6366f1' }, // 8500+450+300-250
  ];

  return (
    <div className="h-full bg-slate-900 text-slate-200 p-6 overflow-y-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold text-white">Director's Cockpit</h1>
              <p className="text-slate-400">Strategic Intelligence & Forecasting</p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-emerald-400 border border-slate-700">
              LIVE DATA • UPDATED 2 MINS AGO
          </div>
      </div>

      {/* AI INSIGHTS HEADER (New Module 4) */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 mb-8 flex items-center justify-between border border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-full">
                  <Brain className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white">AI Predictive Intelligence</h3>
                  <p className="text-purple-200 text-sm">Forecast: <span className="font-bold">92% probability</span> of hitting Q4 targets.</p>
              </div>
          </div>
          <div className="flex gap-6 text-sm">
              <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Lead Quality</p>
                  <p className="text-emerald-400 font-bold text-lg">High (78%)</p>
              </div>
              <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Top Source</p>
                  <p className="text-blue-400 font-bold text-lg">LinkedIn</p>
              </div>
              <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Churn Risk</p>
                  <p className="text-red-400 font-bold text-lg">Low (12%)</p>
              </div>
          </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full"></div>
              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Total Sales Revenue</p>
              <h3 className="text-3xl font-bold text-white">₹{(totalRevenue / 10000000).toFixed(2)} Cr</h3>
              <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% vs Last Month</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Collections Received</p>
              <h3 className="text-3xl font-bold text-blue-400">₹{(totalCollections / 10000000).toFixed(2)} Cr</h3>
              <p className="text-slate-500 text-xs mt-2">{totalRevenue > 0 ? (totalCollections/totalRevenue*100).toFixed(1) : 0}% of Booked Value</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Inventory Sold</p>
              <h3 className="text-3xl font-bold text-white">{unitsSold} <span className="text-lg text-slate-500 font-normal">/ {totalUnits}</span></h3>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${sellOutPercentage}%` }}></div>
              </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Sales Velocity</p>
              <h3 className="text-3xl font-bold text-orange-400">7.2 <span className="text-sm text-slate-500 font-normal">units/mo</span></h3>
              <p className="text-slate-500 text-xs mt-2">Proj. Sellout: 14 Months</p>
          </div>
      </div>

      {/* SIMULATION & WATERFALL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Simulator Panel */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-1">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-yellow-500" /> Scenario Simulator
              </h3>
              <div className="space-y-6">
                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Price Increase</span>
                          <span className="text-white font-bold">{simulation.priceIncrease}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="1" 
                        value={simulation.priceIncrease} 
                        onChange={(e) => setSimulation({...simulation, priceIncrease: Number(e.target.value)})}
                        className="w-full accent-yellow-500"
                      />
                  </div>
                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Projected Velocity</span>
                          <span className="text-white font-bold">{simulation.salesVelocityChange > 0 ? '+' : ''}{simulation.salesVelocityChange}%</span>
                      </div>
                      <input 
                        type="range" min="-50" max="50" step="5" 
                        value={simulation.salesVelocityChange} 
                        onChange={(e) => setSimulation({...simulation, salesVelocityChange: Number(e.target.value)})}
                        className="w-full accent-blue-500"
                      />
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 mt-4">
                      <p className="text-xs text-slate-400 uppercase mb-1">Impact on Revenue</p>
                      <p className="text-xl font-bold text-emerald-400">+ ₹{((projectedRevenue - totalRevenue) / 100000).toFixed(2)} L</p>
                  </div>
              </div>
          </div>

          {/* Cashflow Chart */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" /> Cash Flow Projection (With Simulation)
              </h3>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={cashFlowData}>
                         <defs>
                             <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                             </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                         <XAxis dataKey="month" stroke="#94a3b8" />
                         <YAxis stroke="#94a3b8" tickFormatter={(val) => `₹${val/100000}L`} />
                         <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                         <Legend />
                         <Area type="monotone" dataKey="amount" name="Actual" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                         <Area type="monotone" dataKey="projected" name="Simulated" stroke="#fbbf24" fillOpacity={1} fill="url(#colorProjected)" strokeDasharray="5 5" />
                     </AreaChart>
                 </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Price Waterfall */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" /> Price Waterfall (Per Sqft)
              </h3>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={waterfallData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                         <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                         <YAxis stroke="#94a3b8" />
                         <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} cursor={{fill: '#334155', opacity: 0.4}} />
                         <Bar dataKey="value" fill="#3b82f6">
                            {waterfallData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                         </Bar>
                     </BarChart>
                 </ResponsiveContainer>
              </div>
          </div>

          {/* Inventory Analysis */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" /> Inventory Aging
              </h3>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={inventoryChartData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                         <XAxis dataKey="name" stroke="#94a3b8" />
                         <YAxis stroke="#94a3b8" />
                         <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} cursor={{fill: '#334155', opacity: 0.4}} />
                         <Legend />
                         <Bar dataKey="Sold" stackId="a" fill="#3b82f6" />
                         <Bar dataKey="Unsold" stackId="a" fill="#64748b" />
                     </BarChart>
                 </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CockpitModule;
