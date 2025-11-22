
import React, { useState } from 'react';
import { MOCK_LEGAL_CASES, MOCK_LAND_RECORDS, MOCK_RERA_PROJECTS } from '../constants';
import { LegalCase, LandParcel, ReraProject } from '../types';
import { Scale, Gavel, Map, FileText, Siren, Download, Upload, CheckCircle, AlertCircle, Calendar, ChevronRight, FileSignature, Search } from 'lucide-react';

const LegalModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'litigation' | 'land' | 'rera' | 'contracts'>('litigation');
    
    const [cases, setCases] = useState<LegalCase[]>(MOCK_LEGAL_CASES);
    const [landRecords, setLandRecords] = useState<LandParcel[]>(MOCK_LAND_RECORDS);
    
    // Contract Generator State
    const [contractType, setContractType] = useState('Vendor Agreement');
    const [vendorName, setVendorName] = useState('');
    const [amount, setAmount] = useState('');

    const handleGenerateContract = () => {
        if(!vendorName || !amount) return;
        alert(`Generating ${contractType} for ${vendorName}...\n\nValue: ₹${amount}\n\nPDF Download Initiated.`);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Scale className="w-8 h-8 text-slate-600" /> Legal & Compliance Vault
                    </h1>
                    <p className="text-slate-500">Litigation Management, Land Records & Regulatory Compliance</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                    <button onClick={() => setActiveTab('litigation')} className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 ${activeTab === 'litigation' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}><Gavel className="w-4 h-4" /> Litigation</button>
                    <button onClick={() => setActiveTab('land')} className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 ${activeTab === 'land' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}><Map className="w-4 h-4" /> Land Bank</button>
                    <button onClick={() => setActiveTab('rera')} className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 ${activeTab === 'rera' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}><Siren className="w-4 h-4" /> RERA</button>
                    <button onClick={() => setActiveTab('contracts')} className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 ${activeTab === 'contracts' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}><FileSignature className="w-4 h-4" /> Contracts</button>
                </div>
            </div>

            {/* TAB: LITIGATION */}
            {activeTab === 'litigation' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cases.map(c => (
                            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <span className="font-mono font-bold text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{c.caseNumber}</span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.status === 'Active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{c.status}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">{c.courtName}</h3>
                                    <p className="text-sm text-slate-500 mb-4">Vs. {c.opposingParty}</p>
                                    
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-3 mb-4">
                                        <Calendar className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="text-[10px] font-bold text-red-400 uppercase">Next Hearing</p>
                                            <p className="font-bold text-red-700">{c.nextHearingDate}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase">History</p>
                                        {c.history.map((h, i) => (
                                            <div key={i} className="text-xs text-slate-600 pl-2 border-l-2 border-slate-200">
                                                <span className="font-bold">{h.date}:</span> {h.outcome}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: LAND BANK */}
            {activeTab === 'land' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Digital Property Card Repository</h3>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Upload 7/12 Extract
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Survey No</th>
                                    <th className="px-6 py-4">Village / Location</th>
                                    <th className="px-6 py-4">Area (Acres)</th>
                                    <th className="px-6 py-4">Title Status</th>
                                    <th className="px-6 py-4">Documents</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {landRecords.map(land => (
                                    <tr key={land.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-800">{land.surveyNumber}</td>
                                        <td className="px-6 py-4 text-slate-600">{land.village}</td>
                                        <td className="px-6 py-4 font-mono">{land.areaAcres}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${land.status === 'Clear Title' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {land.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {land.documents.map((doc, idx) => (
                                                    <button key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100">
                                                        {doc.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: RERA WATCHDOG */}
            {activeTab === 'rera' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {MOCK_RERA_PROJECTS.map(proj => (
                            <div key={proj.projectId} className={`p-6 rounded-xl border-l-8 shadow-sm bg-white ${proj.complianceStatus === 'Critical' ? 'border-l-red-500' : 'border-l-green-500'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{proj.projectName}</h3>
                                        <p className="text-slate-500 text-sm font-mono">RERA: {proj.reraId}</p>
                                    </div>
                                    {proj.complianceStatus === 'Critical' ? (
                                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
                                            <AlertCircle className="w-4 h-4" /> Action Required
                                        </div>
                                    ) : (
                                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Compliant
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Completion Date</p>
                                        <p className="font-bold text-slate-700">{proj.completionDate}</p>
                                    </div>
                                    <div className={`${proj.complianceStatus === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} p-3 rounded border`}>
                                        <p className={`text-xs font-bold uppercase ${proj.complianceStatus === 'Critical' ? 'text-red-400' : 'text-slate-400'}`}>QPR Deadline</p>
                                        <p className={`font-bold ${proj.complianceStatus === 'Critical' ? 'text-red-700' : 'text-slate-700'}`}>{proj.qprDeadline}</p>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-2 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-sm flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> File QPR Update
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: CONTRACT GENERATOR */}
            {activeTab === 'contracts' && (
                <div className="flex h-full gap-8">
                    <div className="w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 mb-6">Generate Legal Draft</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Type</label>
                                <select 
                                    value={contractType} 
                                    onChange={(e) => setContractType(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                                >
                                    <option>Vendor Agreement</option>
                                    <option>Customer Sale Deed</option>
                                    <option>NDA for Employee</option>
                                    <option>Channel Partner MoU</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Party Name</label>
                                <input 
                                    type="text" 
                                    value={vendorName} 
                                    onChange={(e) => setVendorName(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none" 
                                    placeholder="e.g. ABC Constructions"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contract Value (₹)</label>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none" 
                                    placeholder="e.g. 500000"
                                />
                            </div>
                            <button 
                                onClick={handleGenerateContract}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" /> Generate PDF
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center p-8">
                        <div className="text-center text-slate-400">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Preview Area</p>
                            <p className="text-sm">Select parameters to view draft.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LegalModule;
