
import React, { useState } from 'react';
import { Archive, Trash2, Database, RefreshCw, AlertTriangle, Server, HardDrive, Search } from 'lucide-react';

const DataArchivalModule: React.FC = () => {
    const [storageUsed, setStorageUsed] = useState(78); // Mock %
    const [autoArchive, setAutoArchive] = useState({ junk: true, lost: false });
    
    const handlePurge = () => {
        const confirmText = prompt("DANGER: This action is irreversible. Type 'DELETE' to confirm purging old call recordings.");
        if (confirmText === 'DELETE') {
            setStorageUsed(prev => Math.max(0, prev - 20));
            alert("Purge Successful! 20% storage reclaimed.");
        }
    };

    return (
        <div className="h-full bg-slate-50 p-8 animate-fade-in overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Server className="w-8 h-8 text-slate-600" /> System Health & Data Archival
                    </h1>
                    <p className="text-slate-500">Manage database size and cold storage policies.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Storage Used</p>
                                <p className="text-3xl font-bold text-slate-800">{storageUsed}%</p>
                            </div>
                            <HardDrive className={`w-8 h-8 ${storageUsed > 80 ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                            <div className={`h-full rounded-full transition-all duration-1000 ${storageUsed > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${storageUsed}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500">780GB / 1TB</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Live Leads</p>
                                <p className="text-3xl font-bold text-emerald-600">12,450</p>
                            </div>
                            <Database className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500">Active in last 1 year</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Archived Leads</p>
                                <p className="text-3xl font-bold text-purple-600">45,000</p>
                            </div>
                            <Archive className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-xs text-slate-500">Moved to Cold Storage</p>
                    </div>
                </div>

                {/* Policies */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-6">Auto-Archive Policies</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-700">Junk Leads</p>
                                    <p className="text-xs text-slate-500">Move to cold storage if status is 'Junk' & inactive for 1 year.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={autoArchive.junk} onChange={(e) => setAutoArchive({...autoArchive, junk: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                                <div>
                                    <p className="font-bold text-slate-700">Lost Deals</p>
                                    <p className="text-xs text-slate-500">Move 'Lost' leads inactive for > 2 years.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={autoArchive.lost} onChange={(e) => setAutoArchive({...autoArchive, lost: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-red-700 mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Data Purging Zone
                        </h3>
                        
                        <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-6">
                            <p className="text-sm text-red-800 font-bold mb-1">Delete Call Recordings</p>
                            <p className="text-xs text-red-600">Recordings take up 60% of space. Policy recommends deleting files older than 6 months.</p>
                        </div>

                        <button onClick={handlePurge} className="w-full py-3 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 transition">
                            <Trash2 className="w-5 h-5" /> Purge Old Recordings
                        </button>
                    </div>
                </div>

                {/* Archive Search */}
                <div className="mt-8 bg-slate-800 rounded-xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5" /> Cold Storage Search
                    </h3>
                    <div className="flex gap-4">
                        <input type="text" placeholder="Search archived lead by mobile..." className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 outline-none focus:border-blue-500" />
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">Retrieve</button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Retrieving a lead will move it back to the Live Database.</p>
                </div>
            </div>
        </div>
    );
};

export default DataArchivalModule;
