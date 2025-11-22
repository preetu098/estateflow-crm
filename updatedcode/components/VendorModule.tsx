
import React, { useState } from 'react';
import { Vendor, Project } from '../types';
import { Truck, FileText, Plus, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

interface VendorModuleProps {
    vendors: Vendor[];
    setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
    projects: Project[];
}

const VendorModule: React.FC<VendorModuleProps> = ({ vendors, setVendors, projects }) => {
    const [activeTab, setActiveTab] = useState<'indents' | 'rfq' | 'po' | 'vendors'>('indents');
    const [indents, setIndents] = useState([
        { id: 101, item: 'Ultratech Cement', qty: '500 Bags', project: 'Skyline Tower A', status: 'Pending', date: '2023-11-20' }
    ]);

    const [pos, setPos] = useState<any[]>([]);

    const handleApproveIndent = (id: number) => {
        const indent = indents.find(i => i.id === id);
        if (indent) {
            setIndents(prev => prev.map(i => i.id === id ? { ...i, status: 'Approved' } : i));
            // Create Draft PO
            setPos(prev => [...prev, { 
                id: `PO-${Math.random().toString().substr(2,4)}`, 
                vendor: 'Select Vendor', 
                items: indent.item, 
                amount: 0, 
                status: 'Draft' 
            }]);
            alert("Indent Approved! Draft PO created.");
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Procurement Hub</h2>
                    <p className="text-slate-500 text-sm">Vendor Management & Supply Chain (P2P)</p>
                </div>
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-bold hover:bg-slate-900">
                    <Plus className="w-4 h-4" /> Raise Indent
                </button>
            </div>

            <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2">
                {['indents', 'rfq', 'po', 'vendors'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                {activeTab === 'indents' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Item Requirement</th>
                                <th className="p-4">Project</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indents.map(indent => (
                                <tr key={indent.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="p-4 font-mono text-slate-500">#{indent.id}</td>
                                    <td className="p-4 font-bold text-slate-700">{indent.item} <span className="text-slate-400 font-normal">({indent.qty})</span></td>
                                    <td className="p-4">{indent.project}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${indent.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {indent.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {indent.status === 'Pending' && (
                                            <button 
                                                onClick={() => handleApproveIndent(indent.id)}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                Approve & Create PO
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'po' && (
                    <div className="p-8 text-center flex-1" >
                        {pos.length === 0 ? (
                            <div className="text-slate-400">No Purchase Orders yet. Approve an indent first.</div>
                        ) : (
                             <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">PO Number</th>
                                        <th className="p-4">Items</th>
                                        <th className="p-4">Vendor</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pos.map(po => (
                                        <tr key={po.id} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="p-4 font-mono">{po.id}</td>
                                            <td className="p-4">{po.items}</td>
                                            <td className="p-4 text-orange-600 font-bold">{po.vendor}</td>
                                            <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{po.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        )}
                    </div>
                )}
                
                {(activeTab === 'rfq' || activeTab === 'vendors') && (
                    <div className="p-10 text-center text-slate-400 italic">
                        Module loaded. Select 'Indents' to start workflow.
                    </div>
                )}
            </div>
            
            {/* Help Section specific to this module */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-blue-800 font-bold text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4"/> How Procurement Works</h4>
                <p className="text-xs text-blue-600 mt-1">1. Site Engineer raises <b>Indent</b>. 2. Manager approves Indent to create <b>Draft PO</b>. 3. Send <b>RFQ</b> to vendors. 4. Select best quote and issue <b>Final PO</b>.</p>
            </div>
        </div>
    );
};

export default VendorModule;
