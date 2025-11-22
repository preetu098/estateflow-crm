
import React, { useState } from 'react';
import { Agent, Lead, LeadStage } from '../types';
import { Users, UserPlus, ToggleLeft, ToggleRight, BarChart2, ArrowRightLeft, CheckCircle, Phone, TrendingUp, Clock, X, MapPin, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamManagementProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ agents, setAgents, leads, onUpdateLead }) => {
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [targetAgentId, setTargetAgentId] = useState<string>('');
  const [viewAgent, setViewAgent] = useState<Agent | null>(null);

  // Helper to calculate "Today's" metrics
  const today = new Date().toISOString().split('T')[0];
  
  const getLeadsAssignedToday = (agentId: string) => {
    return leads.filter(l => 
      l.agentId === agentId && 
      l.createdAt.startsWith(today)
    ).length;
  };

  const getCallsMadeToday = (agentName: string) => {
    let count = 0;
    leads.forEach(lead => {
      const calls = lead.remarksHistory.filter(r => 
        r.author === agentName && 
        r.timestamp.startsWith(today)
      );
      count += calls.length;
    });
    return count;
  };

  const getConversionRate = (agentId: string) => {
      const agentLeads = leads.filter(l => l.agentId === agentId);
      if (agentLeads.length === 0) return 0;
      const booked = agentLeads.filter(l => l.stage === LeadStage.BOOKED || l.stage === LeadStage.QUALIFIED).length;
      return Math.round((booked / agentLeads.length) * 100);
  };

  // Session Helpers
  const getFirstLogin = (agent: Agent) => {
    const todaySessions = agent.sessions.filter(s => s.loginTime.startsWith(today));
    if (todaySessions.length === 0) return '-';
    // Assuming sessions are chronological
    return new Date(todaySessions[0].loginTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getLastLogout = (agent: Agent) => {
    const todaySessions = agent.sessions.filter(s => s.loginTime.startsWith(today));
    if (todaySessions.length === 0) return '-';
    const last = todaySessions[todaySessions.length - 1];
    return last.logoutTime 
        ? new Date(last.logoutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        : <span className="text-green-600 font-bold text-xs animate-pulse">Active</span>;
  };

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return 'Active';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(diff / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getTotalHours = (agent: Agent) => {
     const todaySessions = agent.sessions.filter(s => s.loginTime.startsWith(today));
     let minutes = 0;
     todaySessions.forEach(s => {
         if (s.durationMinutes) {
             minutes += s.durationMinutes;
         } else {
             // Calculate if currently active
             const start = new Date(s.loginTime).getTime();
             const now = Date.now();
             minutes += Math.floor((now - start) / 60000);
         }
     });
     if (minutes === 0) return '-';
     const hrs = Math.floor(minutes / 60);
     const mins = minutes % 60;
     return `${hrs}h ${mins}m`;
  };

  // Add new agent
  const handleAddAgent = () => {
    if (!newAgentName.trim()) return;
    const newAgent: Agent = {
      id: `a${Date.now()}`,
      name: newAgentName,
      role: 'Presales',
      active: true,
      status: 'Offline',
      lastLeadAssignedAt: 0,
      sessions: []
    };
    setAgents([...agents, newAgent]);
    setNewAgentName('');
  };

  // Toggle Active Status (Round Robin)
  const toggleAgentActive = (id: string) => {
    setAgents(agents.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  // Bulk Reassign
  const handleReassign = () => {
    if (!selectedAgentId || !targetAgentId || selectedAgentId === targetAgentId) {
        alert("Please select different source and target agents.");
        return;
    }

    const leadsToMove = leads.filter(l => l.agentId === selectedAgentId);
    const targetAgent = agents.find(a => a.id === targetAgentId);

    if (!targetAgent) return;

    if (confirm(`Are you sure you want to move ${leadsToMove.length} leads to ${targetAgent.name}?`)) {
        leadsToMove.forEach(lead => {
            onUpdateLead({
                ...lead,
                agentId: targetAgent.id,
                agentName: targetAgent.name,
                remarksHistory: [
                    ...lead.remarksHistory,
                    { timestamp: new Date().toISOString(), text: `System: Bulk Reassigned from ${lead.agentName} to ${targetAgent.name} by Team Leader.`, author: 'System' }
                ]
            });
        });
        alert("Leads reassigned successfully.");
    }
  };

  // Chart Data
  const chartData = agents.filter(a => a.role === 'Presales').map(agent => ({
    name: agent.name,
    leads: leads.filter(l => l.agentId === agent.id).length
  }));

  return (
    <div className="p-6 animate-fade-in max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Team Leader Dashboard</h2>
                <p className="text-slate-500">Manage presales team performance and automated distribution.</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2 text-blue-700">
                <Users className="w-5 h-5" />
                <span className="font-bold">{agents.filter(a => a.role === 'Presales').length}</span> Presales Agents
            </div>
        </div>

        {/* 1. Agent Roster & Performance Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ToggleLeft className="w-5 h-5 text-blue-600" /> Agent Attendance & Roster (Today)
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Agent Name</th>
                                <th className="px-6 py-4 text-center">Round Robin</th>
                                <th className="px-6 py-4 text-center">First Login</th>
                                <th className="px-6 py-4 text-center">Last Logout</th>
                                <th className="px-6 py-4 text-center">Work Hours</th>
                                <th className="px-6 py-4 text-center">Calls Today</th>
                                <th className="px-6 py-4 text-center">Conversion</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agents.filter(a => a.role === 'Presales').map(agent => (
                                <tr key={agent.id} className={`group transition ${agent.active ? 'bg-white' : 'bg-slate-50 opacity-75'}`}>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${agent.active ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                    {agent.name.charAt(0)}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                                    agent.status === 'Online' ? 'bg-green-500' : 
                                                    agent.status === 'Break' ? 'bg-orange-400' : 'bg-slate-400'
                                                }`} title={agent.status}></div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{agent.name}</div>
                                                <div className="text-xs text-slate-400">{agent.status}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <button 
                                            onClick={() => toggleAgentActive(agent.id)}
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition border ${
                                                agent.active 
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                            }`}
                                        >
                                            {agent.active ? 'Receiving Leads' : 'Paused'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-500">
                                        {getFirstLogin(agent)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-500">
                                        {getLastLogout(agent)}
                                    </td>
                                     <td className="px-6 py-4 text-center font-medium text-slate-700">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {getTotalHours(agent)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">
                                        <div className="flex items-center justify-center gap-1">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            {getCallsMadeToday(agent.name)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-medium">
                                            <TrendingUp className="w-3 h-3" />
                                            {getConversionRate(agent.id)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setViewAgent(agent)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="View Performance Logs"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add New Agent */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 items-end">
                    <div className="flex-1 max-w-md">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Add New Team Member</label>
                        <input 
                            type="text" 
                            value={newAgentName} 
                            onChange={(e) => setNewAgentName(e.target.value)}
                            placeholder="Enter full name" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button onClick={handleAddAgent} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-slate-300">
                        <UserPlus className="w-4 h-4" /> Add Agent
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2. Workload Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-600" /> Total Workload
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="leads" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Bulk Reassignment Tool */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Bulk Reassign Leads</h3>
                        <p className="text-sm text-slate-500">Re-route leads from inactive agents to active ones.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end p-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From (Source)</label>
                        <select 
                            value={selectedAgentId} 
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Agent...</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({leads.filter(l => l.agentId === a.id).length} leads)</option>)}
                        </select>
                    </div>

                    <div className="flex items-center justify-center pb-3 text-slate-400">
                        <ArrowRightLeft className="w-6 h-6" />
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To (Target)</label>
                        <select 
                            value={targetAgentId} 
                            onChange={(e) => setTargetAgentId(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Agent...</option>
                            {agents.filter(a => a.id !== selectedAgentId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={handleReassign}
                        disabled={!selectedAgentId || !targetAgentId}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold shadow-md shadow-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                        Transfer
                    </button>
                </div>
            </div>
        </div>

        {/* Agent Performance Modal */}
        {viewAgent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-200">
                                {viewAgent.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{viewAgent.name}</h2>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${viewAgent.status === 'Online' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                    {viewAgent.role} • Performance & Logs
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setViewAgent(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="text-blue-600 mb-1"><Users className="w-5 h-5" /></div>
                                <div className="text-2xl font-bold text-slate-800">{leads.filter(l => l.agentId === viewAgent.id && l.stage !== LeadStage.LOST && l.stage !== LeadStage.BOOKED).length}</div>
                                <div className="text-xs text-slate-500">Active Pipeline</div>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="text-indigo-600 mb-1"><Phone className="w-5 h-5" /></div>
                                <div className="text-2xl font-bold text-slate-800">{getCallsMadeToday(viewAgent.name)}</div>
                                <div className="text-xs text-slate-500">Calls Today</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                <div className="text-yellow-600 mb-1"><MapPin className="w-5 h-5" /></div>
                                <div className="text-2xl font-bold text-slate-800">{leads.filter(l => l.agentId === viewAgent.id && l.stage === LeadStage.VISIT_SCHEDULED).length}</div>
                                <div className="text-xs text-slate-500">Visits Scheduled</div>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <div className="text-emerald-600 mb-1"><CheckCircle className="w-5 h-5" /></div>
                                <div className="text-2xl font-bold text-slate-800">{leads.filter(l => l.agentId === viewAgent.id && l.stage === LeadStage.BOOKED).length}</div>
                                <div className="text-xs text-slate-500">Total Bookings</div>
                            </div>
                        </div>

                        {/* Session Table */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-500" /> Session History (Today)
                                </h3>
                                <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                                    Total: {getTotalHours(viewAgent)}
                                </span>
                            </div>
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Login Time</th>
                                        <th className="px-6 py-3 font-medium">Logout Time</th>
                                        <th className="px-6 py-3 font-medium">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {viewAgent.sessions.length > 0 ? (
                                        viewAgent.sessions.map((session, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-6 py-3 font-mono text-slate-700">
                                                    {new Date(session.loginTime).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-3 font-mono text-slate-700">
                                                    {session.logoutTime ? new Date(session.logoutTime).toLocaleTimeString() : <span className="text-green-600 font-bold text-xs px-2 py-0.5 bg-green-100 rounded-full">Active Now</span>}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500">
                                                    {calculateDuration(session.loginTime, session.logoutTime)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                                                No session logs found for today.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default TeamManagement;
