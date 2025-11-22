
import React from 'react';
import { Lead } from '../types';
import { Users, Phone, CalendarCheck, Building2, Wallet, HardHat, ArrowRight } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const stats = {
    totalLeads: leads.length,
    siteVisits: leads.filter(l => l.stage === 'Visit Scheduled' || l.stage === 'Negotiation').length,
    bookings: leads.filter(l => l.stage === 'Booked').length,
    collections: '₹ 2.4 Cr',
    outstanding: '₹ 85 L'
  };

  const LifecycleSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+{trend}%</span>}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Business Overview</h2>
        <p className="text-slate-500">Real-time snapshot of your real estate lifecycle.</p>
      </div>

      {/* PHASE 1: ACQUISITION */}
      <LifecycleSection title="Phase 1: Acquisition (Marketing & Presales)">
        <StatCard label="Total Active Leads" value={stats.totalLeads} icon={Users} color="bg-blue-500" trend="12" />
        <StatCard label="Calls Made Today" value="142" icon={Phone} color="bg-indigo-500" trend="5" />
        <StatCard label="Site Visits Scheduled" value={stats.siteVisits} icon={CalendarCheck} color="bg-violet-500" trend="8" />
      </LifecycleSection>

      {/* PHASE 2: TRANSACTION (SALES) */}
      <LifecycleSection title="Phase 2: Transaction (Sales & Inventory)">
        <StatCard label="Units Blocked" value="12" icon={Building2} color="bg-orange-500" />
        <StatCard label="Bookings This Month" value={stats.bookings} icon={Wallet} color="bg-emerald-500" trend="15" />
        <StatCard label="Sales Velocity" value="4.2 Units/Week" icon={ArrowRight} color="bg-teal-500" />
      </LifecycleSection>

      {/* PHASE 3: FULFILLMENT (POST-SALES) */}
      <LifecycleSection title="Phase 3: Fulfillment (Construction & Accounts)">
        <StatCard label="Collections (MTD)" value={stats.collections} icon={Wallet} color="bg-cyan-600" />
        <StatCard label="Pending Demands" value={stats.outstanding} icon={Wallet} color="bg-red-500" />
        <StatCard label="Construction Milestones" value="Slab 5 Active" icon={HardHat} color="bg-slate-600" />
      </LifecycleSection>
      
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Director's Intelligence</h3>
              <p className="text-blue-100 max-w-xl text-sm leading-relaxed">AI Analysis: Lead quality has dropped by 15% from 'Facebook Campaign A', but Site Visit ratio is up for 'Google Search'. <br/><strong>Recommended Action: Shift budget to Google.</strong></p>
          </div>
          <button className="relative z-10 bg-white text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg">View Cockpit</button>
      </div>
    </div>
  );
};

export default Dashboard;
