
import React, { useState } from 'react';
import { MOCK_FRAUD_ALERTS } from '../constants';
import { FraudAlert, ApprovalWorkflow } from '../types';
import { ShieldAlert, ShieldCheck, GitMerge, Plus, AlertCircle, Check, X, ArrowRight } from 'lucide-react';

const OperationsModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'fraud' | 'approvals'>('fraud');
    const [alerts, setAlerts] = useState<FraudAlert[]>(MOCK_FRAUD_ALERTS);
    const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
        { id: 'wf1', name: 'High Discount Approval', triggerCondition: 'Discount > 5%', approverRole: 'SalesHead', status: 'Active' },
        { id: 'wf2', name: 'Cancellation Process', triggerCondition: 'Status == Cancelled', approverRole: 'SuperAdmin', status: 'Active' }
    ]);

    const handleResolveAlert = (id: string, action: 'Resolved' | 'Ignored') => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-purple-600" /> Operations & Fraud Control
                    </h1>
                    <p className="text-slate-500">Monitor anomalies and manage approval gates</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                    <button onClick={() => setActiveTab('fraud')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'fraud' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Fraud Radar</button>
                    <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'approvals' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Workflow Builder</button>
                </div>
            </div>

            {activeTab === 'fraud' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-full text-red-600"><ShieldAlert className="w-6 h-6" /></div>
                            <div>
                                <p className="text-2xl font-bold text-red-700">{alerts.filter(a => a.status === 'Open' && a.severity === 'High').length}</p>
                                <p className="text-xs text-red-500 uppercase font-bold">Critical Alerts</p>
                            </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-orange-100 p-3 rounded-full text-orange-600"><AlertCircle className="w-6 h-6" /></div>
                            <div>
                                <p className="text-2xl font-bold text-orange-700">{alerts.filter(a => a.status === 'Open').length}</p>
                                <p className="text-xs text-orange-500 uppercase font-bold">Total Open Issues</p>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full text-green-600"><Check className="w-6 h-6" /></div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">{alerts.filter(a => a.status === 'Resolved').length}</p>
                                <p className="text-xs text-green-500 uppercase font-bold">Resolved this week</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">Live Activity Feed</div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Severity</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {alerts.map(alert => (
                                    <tr key={alert.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${alert.severity === 'High' ? 'bg-red-100 text-red-600' : alert.severity === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{alert.type}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-800 font-medium">{alert.message}</div>
                                            <div className="text-xs text-slate-500">{alert.details}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold ${alert.status === 'Open' ? 'text-red-600' : 'text-green-600'}`}>{alert.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {alert.status === 'Open' && (
                                                <>
                                                    <button onClick={() => handleResolveAlert(alert.id, 'Resolved')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark Resolved"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => handleResolveAlert(alert.id, 'Ignored')} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="Ignore"><X className="w-4 h-4" /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-700">Active Workflows</h3>
                        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700">
                            <Plus className="w-4 h-4" /> Create Workflow
                        </button>
                    </div>

                    <div className="space-y-4">
                        {workflows.map(wf => (
                            <div key={wf.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
                                <div className="bg-purple-50 p-4 rounded-full text-purple-600">
                                    <GitMerge className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-slate-800">{wf.name}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600 border border-slate-200">
                                            IF {wf.triggerCondition}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300" />
                                        <div className="bg-orange-100 px-3 py-1 rounded text-xs font-bold text-orange-700 border border-orange-200">
                                            Require {wf.approverRole} Approval
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                                    <button className="text-slate-400 hover:text-slate-600">Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-slate-100 p-6 rounded-xl border border-slate-200 border-dashed text-center">
                        <p className="text-slate-500 text-sm">Drag and drop triggers here to build new logic flows.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationsModule;
