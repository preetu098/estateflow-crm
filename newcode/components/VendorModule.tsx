
import React, { useState } from 'react';
import { Vendor, Project, Indent, VendorCategory, PurchaseOrder, GRN } from '../types';
import { MOCK_INDENTS } from '../constants';
import { 
    Truck, ClipboardList, UserPlus, CheckCircle, AlertTriangle, Search, 
    FileText, DollarSign, BarChart2, Plus, ShoppingCart, Check, X, Package, ChevronRight
} from 'lucide-react';

interface VendorModuleProps {
    vendors: Vendor[];
    setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
    projects: Project[];
}

const VendorModule: React.FC<VendorModuleProps> = ({ vendors, setVendors, projects }) => {
    const [activeTab, setActiveTab] = useState<'master' | 'indents' | 'orders' | 'finance'>('master');
    
    // Local State for Procurement Workflow
    const [indents, setIndents] = useState<Indent[]>(MOCK_INDENTS);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [grns, setGrns] = useState<GRN[]>([]);
    
    // UI State
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [newVendor, setNewVendor] = useState<Partial<Vendor>>({});
    const [rfqIndent, setRfqIndent] = useState<Indent | null>(null);
    const [selectedVendorId, setSelectedVendorId] = useState('');

    // --- ACTIONS ---

    const handleAddVendor = () => {
        if (!newVendor.companyName || !newVendor.mobile) return;
        const vendor: Vendor = {
            id: `V-${Date.now()}`,
            companyName: newVendor.companyName,
            gst: newVendor.gst || 'Pending',
            category: newVendor.category || 'Services',
            contactPerson: newVendor.contactPerson || 'Manager',
            mobile: newVendor.mobile,
            status: 'Pending',
            rating: 0,
            balance: 0
        };
        setVendors([...vendors, vendor]);
        setShowVendorModal(false);
        setNewVendor({});
    };

    const handleRaiseRFQ = (indent: Indent) => {
        setRfqIndent(indent);
        // In a real app, this would trigger an email job
    };

    const handleCreatePO = () => {
        if (!rfqIndent || !selectedVendorId) return;
        
        const po: PurchaseOrder = {
            id: `PO-${Date.now()}`,
            indentId: rfqIndent.id,
            vendorId: selectedVendorId,
            amount: rfqIndent.quantity * 100, // Mock pricing logic
            status: 'Issued',
            date: new Date().toISOString().split('T')[0],
            items: [{ material: rfqIndent.material, qty: rfqIndent.quantity, rate: 100 }]
        };
        
        setPurchaseOrders([...purchaseOrders, po]);
        setIndents(indents.map(i => i.id === rfqIndent.id ? { ...i, status: 'Ordered' } : i));
        setRfqIndent(null);
        setSelectedVendorId('');
        alert("Purchase Order Generated & Emailed to Vendor!");
    };

    const handleReceiveGoods = (po: PurchaseOrder) => {
        const grn: GRN = {
            id: `GRN-${Date.now()}`,
            poId: po.id,
            receivedDate: new Date().toISOString().split('T')[0],
            receiverName: 'Store Keeper',
            itemsReceived: po.items.map(i => ({ material: i.material, qty: i.qty, condition: 'Good' }))
        };
        setGrns([...grns, grn]);
        setPurchaseOrders(prev => prev.map(p => p.id === po.id ? { ...p, status: 'Closed' } : p));
        alert("GRN Created. Inventory Updated.");
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Truck className="w-8 h-8 text-blue-600" /> Procurement Hub
                    </h1>
                    <p className="text-slate-500">Vendor Management & Supply Chain (P2P)</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                    <button onClick={() => setActiveTab('master')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'master' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Vendor Master</button>
                    <button onClick={() => setActiveTab('indents')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'indents' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Indents</button>
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'orders' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Orders (PO)</button>
                    <button onClick={() => setActiveTab('finance')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'finance' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Payables</button>
                </div>
            </div>

            {/* TAB: VENDOR MASTER */}
            {activeTab === 'master' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search vendors..." className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                        </div>
                        <button onClick={() => setShowVendorModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Onboard Vendor
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Company Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Compliance</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vendors.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{v.companyName}</div>
                                            <div className="text-xs text-slate-500">GST: {v.gst}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{v.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {v.status === 'Active' ? (
                                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle className="w-3 h-3" /> Verified</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-orange-600 text-xs font-bold"><AlertTriangle className="w-3 h-3" /> Pending Docs</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div>{v.contactPerson}</div>
                                            <div className="text-xs">{v.mobile}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: INDENTS (PROCUREMENT) */}
            {activeTab === 'indents' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Site Requirements (Indents)</h3>
                        <div className="space-y-4">
                            {indents.filter(i => i.status === 'Pending' || i.status === 'RFQ Sent').map(indent => (
                                <div key={indent.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{indent.material}</div>
                                            <div className="text-xs text-slate-500">Qty: {indent.quantity} {indent.unit} • Req By: {indent.requestedBy}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {indent.status === 'Pending' ? (
                                            <button onClick={() => handleRaiseRFQ(indent)} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">
                                                Raise RFQ
                                            </button>
                                        ) : (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">RFQ Sent</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {indents.filter(i => i.status === 'Pending').length === 0 && <p className="text-slate-400 italic text-sm">No pending indents.</p>}
                        </div>
                    </div>

                    {/* RFQ Comparison Modal (Simulated Inline) */}
                    {rfqIndent && (
                        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg animate-slide-up">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">Comparative Statement: {rfqIndent.material}</h3>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {vendors.slice(0, 3).map((v, idx) => (
                                    <div key={v.id} className={`border p-4 rounded-xl cursor-pointer transition ${selectedVendorId === v.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`} onClick={() => setSelectedVendorId(v.id)}>
                                        <h4 className="font-bold text-slate-700">{v.companyName}</h4>
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Price/Unit</span>
                                                <span className="font-bold">₹{100 + (idx * 5)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Delivery</span>
                                                <span className="font-bold">{2 + idx} Days</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Credit</span>
                                                <span className="font-bold">30 Days</span>
                                            </div>
                                        </div>
                                        {selectedVendorId === v.id && <div className="mt-3 text-center text-xs font-bold text-blue-600">Selected</div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setRfqIndent(null)} className="px-4 py-2 border border-slate-300 rounded font-bold text-slate-600">Cancel</button>
                                <button onClick={handleCreatePO} disabled={!selectedVendorId} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50">
                                    Approve & Generate PO
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: ORDERS (PO & GRN) */}
            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">PO Number</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchaseOrders.map(po => (
                                    <tr key={po.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700">{po.id}</td>
                                        <td className="px-6 py-4">{vendors.find(v => v.id === po.vendorId)?.companyName}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">₹{po.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${po.status === 'Issued' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {po.status === 'Issued' && (
                                                <button onClick={() => handleReceiveGoods(po)} className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-xs font-bold hover:bg-orange-200">
                                                    Create GRN
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {purchaseOrders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No active Purchase Orders.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: FINANCE (3-WAY MATCH) */}
            {activeTab === 'finance' && (
                <div className="p-6 bg-white rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">3-Way Matching Dashboard</h3>
                    <div className="space-y-4">
                        {grns.map(grn => {
                            const po = purchaseOrders.find(p => p.id === grn.poId);
                            return (
                                <div key={grn.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-xl">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-400">PO</span>
                                            <CheckCircle className="w-6 h-6 text-green-600 my-1" />
                                            <span className="text-xs font-mono">{grn.poId}</span>
                                        </div>
                                        <div className="h-px w-8 bg-green-300"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-400">GRN</span>
                                            <CheckCircle className="w-6 h-6 text-green-600 my-1" />
                                            <span className="text-xs font-mono">{grn.id}</span>
                                        </div>
                                        <div className="h-px w-8 bg-green-300"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-400">INVOICE</span>
                                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold">?</div>
                                            <span className="text-xs text-slate-400">Pending</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800">₹{po?.amount.toLocaleString()}</p>
                                        <button className="text-xs text-blue-600 font-bold hover:underline">Upload Invoice</button>
                                    </div>
                                </div>
                            );
                        })}
                        {grns.length === 0 && <p className="text-slate-400 italic text-center">No goods received yet to match.</p>}
                    </div>
                </div>
            )}

            {/* MODAL: ADD VENDOR */}
            {showVendorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Onboard New Vendor</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Company Name" className="w-full p-3 border rounded-lg" onChange={e => setNewVendor({...newVendor, companyName: e.target.value})} />
                            <input type="text" placeholder="GST Number" className="w-full p-3 border rounded-lg" onChange={e => setNewVendor({...newVendor, gst: e.target.value})} />
                            <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setNewVendor({...newVendor, category: e.target.value as any})}>
                                <option>Civil</option>
                                <option>Electrical</option>
                                <option>Plumbing</option>
                                <option>Steel</option>
                                <option>Cement</option>
                            </select>
                            <input type="text" placeholder="Contact Person" className="w-full p-3 border rounded-lg" onChange={e => setNewVendor({...newVendor, contactPerson: e.target.value})} />
                            <input type="text" placeholder="Mobile" className="w-full p-3 border rounded-lg" onChange={e => setNewVendor({...newVendor, mobile: e.target.value})} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowVendorModal(false)} className="flex-1 py-2 border rounded-lg font-bold text-slate-600">Cancel</button>
                            <button onClick={handleAddVendor} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Submit for Approval</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VendorModule;
