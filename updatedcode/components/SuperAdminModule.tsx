
import React, { useState } from 'react';
import { Tenant, SaaSPlan, PlanType, FeatureFlags, BrandingConfig } from '../types';
import { MOCK_TENANTS, SAAS_PLANS, DEFAULT_FEATURE_FLAGS } from '../constants';
import { Users, LayoutGrid, Palette, ToggleLeft, ToggleRight, Plus, Search, CheckCircle, Globe, Eye, ShieldCheck, RefreshCw, Upload } from 'lucide-react';

interface SuperAdminModuleProps {
    activeTenant: Tenant;
    onSwitchTenant: (tenantId: string) => void;
}

const SuperAdminModule: React.FC<SuperAdminModuleProps> = ({ activeTenant, onSwitchTenant }) => {
    const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'branding' | 'config'>('tenants');
    const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
    const [plans, setPlans] = useState<SaaSPlan[]>(SAAS_PLANS);
    
    // Branding State (Local Edit)
    const [tempBranding, setTempBranding] = useState<BrandingConfig>(activeTenant.branding);

    // New Tenant Form
    const [showNewTenant, setShowNewTenant] = useState(false);
    const [newTenantName, setNewTenantName] = useState('');
    const [newTenantSubdomain, setNewTenantSubdomain] = useState('');
    const [newTenantPlan, setNewTenantPlan] = useState<PlanType>('Silver');

    const handleCreateTenant = () => {
        if(!newTenantName || !newTenantSubdomain) return;
        
        const newTenant: Tenant = {
            id: `t_${Date.now()}`,
            name: newTenantName,
            subdomain: newTenantSubdomain.toLowerCase(),
            plan: newTenantPlan,
            status: 'Active',
            createdAt: new Date().toISOString().split('T')[0],
            usersCount: 1,
            branding: {
                primaryColor: '#2563eb',
                secondaryColor: '#1e293b',
                terminology: { 'Lead': 'Lead', 'Unit': 'Unit' }
            },
            customFields: []
        };
        
        setTenants([...tenants, newTenant]);
        setShowNewTenant(false);
        setNewTenantName('');
        setNewTenantSubdomain('');
        alert(`Tenant ${newTenant.name} provisioned successfully!`);
    };

    const updatePlanFeature = (planName: PlanType, feature: keyof FeatureFlags) => {
        setPlans(prev => prev.map(p => {
            if(p.name === planName) {
                const hasFeature = p.features.includes(feature);
                return {
                    ...p,
                    features: hasFeature ? p.features.filter(f => f !== feature) : [...p.features, feature]
                };
            }
            return p;
        }));
    };

    const handleSaveBranding = () => {
        // In a real app, this would save to backend. Here we just update local state/mock.
        // And we need to trigger the app update.
        alert("Branding Saved! (Note: In this prototype, branding resets on refresh unless persistent storage is used)");
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-red-600" /> God Mode (Super Admin)
                    </h1>
                    <p className="text-slate-500">Multi-Tenant Provisioning & Feature Control</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                    <button onClick={() => setActiveTab('tenants')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'tenants' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Tenants</button>
                    <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'plans' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Plan Builder</button>
                    <button onClick={() => setActiveTab('branding')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'branding' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>White-Label</button>
                </div>
            </div>

            {/* TAB: TENANTS */}
            {activeTab === 'tenants' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Registered Companies</h3>
                        <button onClick={() => setShowNewTenant(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md">
                            <Plus className="w-4 h-4" /> New Tenant
                        </button>
                    </div>

                    {showNewTenant && (
                        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg mb-6 animate-slide-down">
                            <h4 className="font-bold text-blue-800 mb-4">Provision New Company</h4>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Company Name</label>
                                    <input type="text" value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Acme Builders" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Subdomain</label>
                                    <div className="flex items-center">
                                        <input type="text" value={newTenantSubdomain} onChange={(e) => setNewTenantSubdomain(e.target.value)} className="w-full p-2 border rounded-l" placeholder="acme" />
                                        <span className="bg-slate-100 border border-l-0 rounded-r px-3 py-2 text-slate-500 text-sm font-mono">.crm.com</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Plan</label>
                                    <select value={newTenantPlan} onChange={(e) => setNewTenantPlan(e.target.value as PlanType)} className="w-full p-2 border rounded bg-white">
                                        <option value="Silver">Silver</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Platinum">Platinum</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowNewTenant(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                <button onClick={handleCreateTenant} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Create Tenant</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tenants.map(tenant => (
                            <div key={tenant.id} className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition relative overflow-hidden ${tenant.id === activeTenant.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                                {tenant.id === activeTenant.id && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Active Session</div>}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-xl" style={{ backgroundColor: tenant.branding.primaryColor }}>
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {tenant.status}
                                    </span>
                                </div>
                                
                                <h4 className="font-bold text-lg text-slate-800">{tenant.name}</h4>
                                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {tenant.subdomain}.estateflow.com
                                </p>

                                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Plan</p>
                                        <p className="font-bold text-slate-700">{tenant.plan}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Users</p>
                                        <p className="font-bold text-slate-700">{tenant.usersCount}</p>
                                    </div>
                                    <button 
                                        onClick={() => onSwitchTenant(tenant.id)}
                                        disabled={tenant.id === activeTenant.id}
                                        className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {tenant.id === activeTenant.id ? <CheckCircle className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        {tenant.id === activeTenant.id ? 'Live' : 'Impersonate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: PLANS */}
            {activeTab === 'plans' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg">Feature Flag Matrix</h3>
                        <p className="text-slate-500 text-sm">Toggle modules for each subscription tier. Updates apply instantly.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 w-1/3">Feature Module</th>
                                    {plans.map(p => (
                                        <th key={p.name} className="px-6 py-4 text-center">
                                            {p.name}
                                            <div className="text-xs font-normal text-slate-400 mt-1">₹{p.price.toLocaleString()}/mo</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.keys(DEFAULT_FEATURE_FLAGS).map((key) => {
                                    const featureKey = key as keyof FeatureFlags;
                                    return (
                                        <tr key={featureKey} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-700 capitalize">
                                                {featureKey.replace(/([A-Z])/g, ' $1').trim()}
                                            </td>
                                            {plans.map(p => {
                                                const isEnabled = p.features.includes(featureKey);
                                                return (
                                                    <td key={`${p.name}-${featureKey}`} className="px-6 py-4 text-center">
                                                        <button 
                                                            onClick={() => updatePlanFeature(p.name, featureKey)}
                                                            className={`text-2xl transition-colors ${isEnabled ? 'text-green-500' : 'text-slate-300'}`}
                                                        >
                                                            {isEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: BRANDING */}
            {activeTab === 'branding' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-purple-600" /> Theme Customization
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">Editing: <span className="font-bold text-slate-800">{activeTenant.name}</span></p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Primary Brand Color</label>
                                <div className="flex gap-3 items-center">
                                    <input 
                                        type="color" 
                                        value={tempBranding.primaryColor} 
                                        onChange={(e) => setTempBranding({...tempBranding, primaryColor: e.target.value})}
                                        className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                                    />
                                    <input 
                                        type="text" 
                                        value={tempBranding.primaryColor}
                                        onChange={(e) => setTempBranding({...tempBranding, primaryColor: e.target.value})} 
                                        className="p-2 border rounded font-mono uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Company Logo</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold">Click to upload new logo</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Terminology Mapping</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-400 block mb-1">System Term: 'Lead'</span>
                                        <input 
                                            type="text" 
                                            value={tempBranding.terminology['Lead'] || 'Lead'}
                                            onChange={(e) => setTempBranding({...tempBranding, terminology: {...tempBranding.terminology, 'Lead': e.target.value}})}
                                            className="w-full p-2 border rounded text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block mb-1">System Term: 'Unit'</span>
                                        <input 
                                            type="text" 
                                            value={tempBranding.terminology['Unit'] || 'Unit'}
                                            onChange={(e) => setTempBranding({...tempBranding, terminology: {...tempBranding.terminology, 'Unit': e.target.value}})}
                                            className="w-full p-2 border rounded text-sm" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSaveBranding} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Apply Changes
                            </button>
                        </div>
                    </div>

                    {/* PREVIEW */}
                    <div className="bg-slate-100 p-8 rounded-xl border border-slate-200 flex items-center justify-center">
                        <div className="w-[300px] bg-white rounded-xl shadow-xl overflow-hidden">
                            <div className="h-12 flex items-center px-4 text-white" style={{ backgroundColor: tempBranding.primaryColor }}>
                                <div className="w-6 h-6 bg-white/20 rounded mr-2"></div>
                                <span className="font-bold text-sm">{activeTenant.name}</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                                    Dashboard Area
                                </div>
                                <button className="w-full py-2 rounded text-white text-xs font-bold" style={{ backgroundColor: tempBranding.primaryColor }}>
                                    Add New {tempBranding.terminology['Lead'] || 'Lead'}
                                </button>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Total {tempBranding.terminology['Unit'] || 'Unit'}s</span>
                                    <span>120</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminModule;
