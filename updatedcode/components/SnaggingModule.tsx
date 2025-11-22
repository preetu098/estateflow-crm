
import React, { useState } from 'react';
import { Booking, Snag, Project } from '../types';
import { MOCK_SNAGS } from '../constants';
import { ClipboardList, Plus, Camera, CheckCircle, AlertTriangle, Home, X } from 'lucide-react';

interface SnaggingModuleProps {
    bookings: Booking[]; // To select unit/customer
    projects: Project[];
}

const SnaggingModule: React.FC<SnaggingModuleProps> = ({ bookings, projects }) => {
    const [snags, setSnags] = useState<Snag[]>(MOCK_SNAGS);
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [viewMode, setViewMode] = useState<'list' | 'visual'>('visual');
    
    // Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSnag, setNewSnag] = useState<Partial<Snag>>({ priority: 'Medium', status: 'Open' });

    // Derived
    const filteredSnags = snags.filter(s => !selectedUnit || s.unitId === selectedUnit);
    const units = bookings.map(b => ({ id: b.unitNumber, project: b.project, customer: b.customerName })); // Simplified logic

    const handleAddSnag = () => {
        if (!selectedUnit || !newSnag.category || !newSnag.description) return;
        const snag: Snag = {
            id: `snag-${Date.now()}`,
            unitId: selectedUnit,
            location: newSnag.location as any || 'Living Room',
            category: newSnag.category as any,
            description: newSnag.description,
            status: 'Open',
            priority: newSnag.priority as any || 'Medium',
            loggedBy: 'Site Engineer',
            loggedAt: new Date().toISOString().split('T')[0]
        };
        setSnags([...snags, snag]);
        setShowAddModal(false);
        setNewSnag({ priority: 'Medium', status: 'Open' });
    };

    const handleResolveSnag = (id: string) => {
        setSnags(prev => prev.map(s => s.id === id ? { ...s, status: 'Fixed' } : s));
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardList className="w-8 h-8 text-orange-600" /> Snagging & QC
                    </h1>
                    <p className="text-slate-500">Pre-handover Quality Check</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <select 
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-sm w-64"
                    >
                        <option value="">Select Unit...</option>
                        {units.map(u => <option key={u.id} value={`${projects.find(p => p.name === u.project)?.id}-${u.id.split('-')[0]}-${u.id.split('-')[1]}`}>{u.project} - {u.id}</option>)}
                        {/* Using mock IDs from constants for demo match */}
                        <option value="p1-Wing A-101">Krishna Trident - Wing A-101</option>
                    </select>
                    
                    <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                        <button onClick={() => setViewMode('visual')} className={`px-4 py-2 rounded font-bold text-sm ${viewMode === 'visual' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Visual Map</button>
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded font-bold text-sm ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>List View</button>
                    </div>
                </div>
            </div>

            {selectedUnit ? (
                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* LEFT: SNAG LIST / VISUAL */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Defects Log</h3>
                            <button onClick={() => setShowAddModal(true)} className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-orange-700">
                                <Plus className="w-3 h-3" /> Add Snag
                            </button>
                        </div>
                        
                        {viewMode === 'list' && (
                            <div className="overflow-y-auto p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Location</th>
                                            <th className="p-4">Issue</th>
                                            <th className="p-4">Priority</th>
                                            <th className="p-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredSnags.map(snag => (
                                            <tr key={snag.id} className="hover:bg-slate-50">
                                                <td className="p-4">{snag.category}</td>
                                                <td className="p-4">{snag.location}</td>
                                                <td className="p-4 font-medium text-slate-700">{snag.description}</td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${snag.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{snag.priority}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {snag.status === 'Open' ? (
                                                        <button onClick={() => handleResolveSnag(snag.id)} className="text-xs border border-slate-300 px-2 py-1 rounded hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition">Mark Fixed</button>
                                                    ) : (
                                                        <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3" /> Fixed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {viewMode === 'visual' && (
                            <div className="flex-1 bg-slate-100 relative p-8 flex items-center justify-center">
                                {/* Mock Floor Plan */}
                                <div className="w-[500px] h-[400px] bg-white border-4 border-slate-800 relative shadow-2xl rounded-lg">
                                    <div className="absolute top-0 left-0 w-1/2 h-1/2 border-r-2 border-b-2 border-slate-300 flex items-center justify-center text-slate-300 font-bold text-2xl uppercase">Living</div>
                                    <div className="absolute top-0 right-0 w-1/2 h-1/2 border-b-2 border-slate-300 flex items-center justify-center text-slate-300 font-bold text-xl uppercase bg-blue-50/30">Master Bed</div>
                                    <div className="absolute bottom-0 left-0 w-1/3 h-1/2 border-r-2 border-slate-300 flex items-center justify-center text-slate-300 font-bold text-xl uppercase">Kitchen</div>
                                    <div className="absolute bottom-0 right-0 w-2/3 h-1/2 flex items-center justify-center text-slate-300 font-bold text-xl uppercase">Balcony</div>

                                    {/* Snag Pins */}
                                    {filteredSnags.map(snag => {
                                        // Mock positioning based on location
                                        const pos = 
                                            snag.location === 'Living Room' ? { top: '25%', left: '25%' } :
                                            snag.location === 'Master Bedroom' ? { top: '25%', right: '25%' } :
                                            snag.location === 'Kitchen' ? { bottom: '25%', left: '15%' } :
                                            { bottom: '25%', right: '30%' }; // Balcony

                                        return (
                                            <div 
                                                key={snag.id} 
                                                className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition z-10 ${snag.status === 'Open' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                                                style={pos}
                                                title={snag.description}
                                            >
                                                {snag.status === 'Open' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: SUMMARY */}
                    <div className="w-72 bg-white border border-slate-200 rounded-xl p-6 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4">Handover Status</h3>
                        
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-bold">Total Snags</p>
                                <p className="text-2xl font-bold text-slate-800">{filteredSnags.length}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <p className="text-xs text-red-500 uppercase font-bold">Open Issues</p>
                                <p className="text-2xl font-bold text-red-600">{filteredSnags.filter(s => s.status === 'Open').length}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <button 
                                disabled={filteredSnags.some(s => s.status === 'Open' && s.priority === 'Critical')}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition"
                            >
                                {filteredSnags.some(s => s.status === 'Open' && s.priority === 'Critical') 
                                    ? 'Resolve Critical Snags' 
                                    : 'Generate Possession Letter'}
                            </button>
                            {filteredSnags.some(s => s.status === 'Open' && s.priority === 'Critical') && (
                                <p className="text-xs text-red-500 mt-2 text-center">Handover blocked due to critical defects.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Home className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium">Select a unit to start inspection</p>
                </div>
            )}

            {/* ADD SNAG MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Log New Defect</h2>
                            <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        
                        <div className="space-y-3">
                            <select 
                                className="w-full p-3 border rounded-lg bg-white"
                                value={newSnag.location}
                                onChange={(e) => setNewSnag({...newSnag, location: e.target.value as any})}
                            >
                                <option value="">Select Location</option>
                                <option>Living Room</option><option>Master Bedroom</option><option>Kitchen</option><option>Bathroom</option><option>Balcony</option>
                            </select>
                            
                            <select 
                                className="w-full p-3 border rounded-lg bg-white"
                                value={newSnag.category}
                                onChange={(e) => setNewSnag({...newSnag, category: e.target.value as any})}
                            >
                                <option value="">Select Category</option>
                                <option>Plumbing</option><option>Electrical</option><option>Civil</option><option>Paint</option><option>Carpentry</option>
                            </select>

                            <select 
                                className="w-full p-3 border rounded-lg bg-white"
                                value={newSnag.priority}
                                onChange={(e) => setNewSnag({...newSnag, priority: e.target.value as any})}
                            >
                                <option>Low</option><option>Medium</option><option>Critical</option>
                            </select>

                            <textarea 
                                placeholder="Describe the issue..." 
                                className="w-full p-3 border rounded-lg h-24 resize-none"
                                value={newSnag.description}
                                onChange={(e) => setNewSnag({...newSnag, description: e.target.value})}
                            />

                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-xs">Add Photo Evidence</span>
                            </div>
                        </div>

                        <button onClick={handleAddSnag} className="w-full mt-6 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700">
                            Submit Ticket
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SnaggingModule;
