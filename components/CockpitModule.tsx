
import React from 'react';
import { Lead, Booking, Unit, LeadStage } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Activity, Clock } from 'lucide-react';

interface CockpitModuleProps {
  leads: Lead[];
  bookings: Booking[];
  inventory: Unit[];
}

const CockpitModule: React.FC<CockpitModuleProps> = ({ leads, bookings, inventory }) => {
  
  // --- KPI CALCULATIONS ---
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalCost, 0);
  const totalCollections = bookings.reduce((sum, b) => sum + b.amountPaid, 0);
  const unitsSold = inventory.filter(u => u.status === 'Sold').length;
  const totalUnits = inventory.length;
  const sellOutPercentage = totalUnits > 0 ? ((unitsSold / totalUnits) * 100).toFixed(1) : '0';

  // Mock Sales Velocity (Units sold per month)
  const velocityData = [
      { month: 'Jul', units: 4 },
      { month: 'Aug', units: 7 },
      { month: 'Sep', units: 5 },
      { month: 'Oct', units: 12 }, // Current
  ];

  // Cash Flow Projection (Mock)
  const cashFlowData = [
      { month: 'Nov', amount: 5000000 },
      { month: 'Dec', amount: 7500000 },
      { month: 'Jan', amount: 4200000 },
      { month: 'Feb', amount: 6000000 },
  ];

  // Inventory Aging (Unsold Inventory)
  // Group by type or floor for visualization
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

      {/* CHART ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" /> Cash Flow Projection (Receivables)
              </h3>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={cashFlowData}>
                         <defs>
                             <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                         <XAxis dataKey="month" stroke="#94a3b8" />
                         <YAxis stroke="#94a3b8" tickFormatter={(val) => `₹${val/100000}L`} />
                         <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                         <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                     </AreaChart>
                 </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Inventory Analysis
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

      {/* ALERTS & INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" /> Critical Alerts
              </h4>
              <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-200">
                      High Cancellation Rate in Wing A (2 this week).
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded text-sm text-orange-200">
                      3 Payment Milestones Overdue (Total ₹15L).
                  </div>
              </div>
          </div>

           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 md:col-span-2">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" /> Lead Source Performance (Efficiency)
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase mb-1">Facebook</p>
                      <p className="text-xl font-bold text-white">4.2%</p>
                      <p className="text-[10px] text-slate-500">Conversion Rate</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase mb-1">Google Ads</p>
                      <p className="text-xl font-bold text-white">6.8%</p>
                      <p className="text-[10px] text-slate-500">Conversion Rate</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase mb-1">Channel Partners</p>
                      <p className="text-xl font-bold text-white">12.5%</p>
                      <p className="text-[10px] text-slate-500">Conversion Rate</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CockpitModule;
