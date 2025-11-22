import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Lead, LeadStage } from '../types';

interface DashboardProps {
  leads: Lead[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  
  // Calculate Stats
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.stage === LeadStage.QUALIFIED || l.stage === LeadStage.BOOKED || l.stage === LeadStage.NEGOTIATION).length;
  const visitScheduled = leads.filter(l => l.stage === LeadStage.VISIT_SCHEDULED).length;
  const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.stage === LeadStage.BOOKED).length / totalLeads) * 100).toFixed(1) : '0';

  // Prepare Chart Data
  const leadsByStage = Object.values(LeadStage).map(stage => ({
    name: stage,
    count: leads.filter(l => l.stage === stage).length
  })).filter(item => item.count > 0);

  const leadsByProject = leads.reduce((acc, lead) => {
    const existing = acc.find(item => item.name === lead.project);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: lead.project, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total Leads</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Qualified Pipeline</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{qualifiedLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Visits Scheduled</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{visitScheduled}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{conversionRate}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Lead Distribution by Stage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStage} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Leads by Project</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsByProject}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                >
                  {leadsByProject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
