
import React, { useState } from 'react';
import { SiteVisit, Project, Agent } from '../types';
import { Calendar, CheckCircle, Clock, Search, Filter, User, MapPin, ArrowRight } from 'lucide-react';

interface SiteVisitModuleProps {
    siteVisits: SiteVisit[];
    projects: Project[];
    agents: Agent[];
}

const SiteVisitModule: React.FC<SiteVisitModuleProps> = ({ siteVisits, projects, agents }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // KPIs
    const total = siteVisits.length;
    const completed = siteVisits.filter(v => v.status === 'Completed').length;
    const scheduled = siteVisits.filter(v => v.status === 'Waiting' || v.status === 'In Meeting').length; // Approximating 'Scheduled' as pending
    const conversion = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Filter Logic
    const filteredVisits = siteVisits.filter(v => {
        const matchesSearch = v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              v.project.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="h-full flex flex-col bg-slate-50 p-6 animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Site Visit Management</h1>
                    <p className="text-slate-500 text-sm">Track and manage property visits.</p>
                </div>
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition">
                    Download Report
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Total Visits</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{total}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Completed</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">{completed}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Scheduled/Active</p>
                            <h3 className="text-2xl font-bold text-orange-600 mt-1">{scheduled}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Conversion Rate</p>
                            <h3 className="text-2xl font-bold text-purple-600 mt-1">{conversion}%</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ArrowRight className="w-5 h-5" /></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search visitor or project..." 
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                    {['All', 'Scheduled', 'Waiting', 'In Meeting', 'Completed'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                                filterStatus === status 
                                ? 'bg-slate-800 text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Visitor</th>
                                <th className="px-6 py-4">Project & Agent</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredVisits.map(visit => (
                                <tr key={visit.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                                                {visit.visitorName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{visit.visitorName}</p>
                                                <p className="text-xs text-slate-500">{visit.mobile}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1 text-xs font-medium text-slate-700">
                                                <MapPin className="w-3 h-3 text-slate-400" /> {visit.project}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <User className="w-3 h-3" /> {visit.agentName || 'Unassigned'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-xs">
                                        {new Date(visit.checkInTime).toLocaleDateString()} <br/>
                                        {new Date(visit.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                            visit.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                            visit.status === 'In Meeting' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {visit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:underline text-xs font-bold">View Details</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredVisits.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No site visits found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SiteVisitModule;
