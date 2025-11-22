
import React from 'react';
import { Lead, Booking, Unit } from '../types';
import { 
    TrendingUp, AlertTriangle, DollarSign, Building2, 
    ArrowUpRight, ArrowDownRight, PieChart, Activity 
} from 'lucide-react';

interface CockpitModuleProps {
  leads: Lead[];
  bookings: Booking[];
  inventory: Unit[];
}

const CockpitModule: React.FC<CockpitModuleProps> = ({ leads, bookings, inventory }) => {
  
  // Mock Calculations for Strategy
  const totalRevenue = bookings.reduce((sum, b) => sum + b.agreementValue, 0);
  const targetRevenue = 500000000; // 50 Cr Target
  const achievement = (totalRevenue / targetRevenue) * 100;
  
  const soldUnits = inventory.filter(u => u.status === 'Sold').length;
  const totalUnits = inventory.length || 1; // Avoid NaN
  const velocity = (soldUnits / 30).toFixed(1); // Units per month (mock)

  const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${color} text-white`}>
                  <Icon className="w-5 h-5" />
              </div>
          </div>
          <div className="flex items-center gap-2">
              {trend === 'up' ? (
                  <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                  </span>
              ) : trend === 'down' ? (
                  <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      <ArrowDownRight className="w-3 h-3 mr-1" /> -5%
                  </span>
              ) : null}
              <span className="text-xs text-slate-400 truncate">{subtext}</span>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* HEADER - Responsive Flex */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" /> Director's Cockpit
            </h2>
            <p className="text-slate-500 text-sm">Strategic Intelligence & Forecasting (Live Data)</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5 flex-1 md:flex-none">
                <option>This Quarter (Q3)</option>
                <option>Financial Year (FY 24-25)</option>
            </select>
            <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition">
                Export Report
            </button>
        </div>
      </div>

      {/* KPI GRID - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            title="Total Collections" 
            value={`₹ ${(totalRevenue/10000000).toFixed(1)} Cr`} 
            subtext="vs ₹ 12 Cr Target"
            icon={DollarSign} 
            color="bg-emerald-500"
            trend="up"
          />
          <StatCard 
            title="Sales Velocity" 
            value={`${velocity} Units/Mo`} 
            subtext="Avg Time to Sell: 45 Days"
            icon={TrendingUp} 
            color="bg-blue-500"
            trend="up"
          />
          <StatCard 
            title="Inventory Health" 
            value={`${(100 - (soldUnits/totalUnits)*100).toFixed(0)}%`} 
            subtext="Unsold Inventory (Aging)"
            icon={Building2} 
            color="bg-purple-500"
            trend="down"
          />
          <StatCard 
            title="Critical Alerts" 
            value="3" 
            subtext="Legal / Compliance Issues"
            icon={AlertTriangle} 
            color="bg-red-500"
          />
      </div>

      {/* MAIN CONTENT GRID - Responsive: Stack on mobile, Side-by-side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: REVENUE CHART (Taking 2/3 width on desktop) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Revenue vs Target</h3>
                  <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Actual</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Target</span>
                  </div>
              </div>
              
              {/* Responsive Chart Container */}
              <div className="h-64 w-full bg-slate-50 rounded-lg flex items-end justify-around p-4 border-b border-slate-100 relative">
                  {/* Mock Bars */}
                  {[40, 65, 45, 80, 55, 90].map((h, i) => (
                      <div key={i} className="w-8 md:w-12 bg-blue-100 rounded-t-md relative group h-full flex items-end">
                          <div 
                            className="w-full bg-blue-600 rounded-t-md transition-all duration-1000 ease-out hover:bg-blue-700 relative"
                            style={{ height: `${h}%` }}
                          >
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                                  ₹{h}L
                              </div>
                          </div>
                      </div>
                  ))}
                  {/* Target Line */}
                  <div className="absolute top-1/3 w-full border-t-2 border-dashed border-slate-300 left-0"></div>
                  <div className="absolute top-[30%] right-0 text-xs text-slate-400 bg-white px-1">Target</div>
              </div>
              <div className="flex justify-around mt-2 text-xs text-slate-400 font-medium">
                  <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
              </div>
          </div>

          {/* RIGHT: INVENTORY PIE (Taking 1/3 width) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4">Inventory Mix</h3>
              <div className="flex-1 flex items-center justify-center relative">
                  {/* CSS Pie Chart Simulation */}
                  <div className="w-48 h-48 rounded-full border-[16px] border-blue-100 relative flex items-center justify-center">
                      <div className="absolute inset-0 border-[16px] border-blue-600 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'rotate(45deg)' }}></div>
                      <div className="absolute inset-0 border-[16px] border-orange-400 rounded-full" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)', transform: 'rotate(180deg)' }}></div>
                      <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">{totalUnits}</div>
                          <div className="text-xs text-slate-400 uppercase">Total Units</div>
                      </div>
                  </div>
              </div>
              <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Sold</span>
                      <span className="font-bold text-slate-800">{soldUnits} ({((soldUnits/totalUnits)*100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-orange-400"></div> Available</span>
                      <span className="font-bold text-slate-800">{totalUnits - soldUnits}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* BOTTOM: ALERTS TABLE - Responsive Table Wrapper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Requires Attention</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                          <th className="p-4">Severity</th>
                          <th className="p-4">Issue Type</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Assigned To</th>
                          <th className="p-4">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="p-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Critical</span></td>
                          <td className="p-4 text-slate-700 font-medium">Legal Compliance</td>
                          <td className="p-4 text-slate-600">RERA QPR Filing due in 2 days</td>
                          <td className="p-4 flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">L</div>
                              Legal Team
                          </td>
                          <td className="p-4"><button className="text-blue-600 hover:underline">View Details</button></td>
                      </tr>
                      <tr className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">High</span></td>
                          <td className="p-4 text-slate-700 font-medium">Accounts</td>
                          <td className="p-4 text-slate-600">Uncollected Demands > ₹ 50L</td>
                          <td className="p-4 flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">A</div>
                              Account Manager
                          </td>
                          <td className="p-4"><button className="text-blue-600 hover:underline">View Details</button></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default CockpitModule;
