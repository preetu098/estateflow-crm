
import React, { useState, useMemo } from 'react';
import { Lead, Booking, Unit, ReportConfig, ReportFilter, ChartType } from '../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
    FileSpreadsheet, Filter, Play, Save, Download, LayoutGrid, PieChart as PieIcon, 
    BarChart2, TrendingUp, Grid, ChevronRight, Plus, Trash2, CheckCircle, Settings
} from 'lucide-react';

interface ReportsModuleProps {
    leads: Lead[];
    bookings: Booking[];
    inventory: Unit[];
}

const ReportsModule: React.FC<ReportsModuleProps> = ({ leads, bookings, inventory }) => {
    const [step, setStep] = useState<number>(1);
    const [config, setConfig] = useState<ReportConfig>({
        source: 'Leads',
        filters: [],
        groupBy: '',
        metric: 'Count',
        chartType: 'Bar',
        title: 'New Report',
        metricField: ''
    });
    const [resultData, setResultData] = useState<any[]>([]);

    // --- Available Fields Mapping ---
    const FIELDS: Record<string, string[]> = {
        Leads: ['source', 'status', 'project', 'agentName', 'campaign', 'subStage'],
        Bookings: ['project', 'status', 'customerName', 'unitNumber', 'amountPaid', 'agreementValue', 'bookingDate'],
        Inventory: ['tower', 'type', 'status', 'floor', 'unitNumber', 'basePrice']
    };

    const NUMERIC_FIELDS: Record<string, string[]> = {
        Leads: ['callCount'],
        Bookings: ['agreementValue', 'amountPaid', 'totalCost'],
        Inventory: ['basePrice', 'carpetArea']
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const handleAddFilter = () => {
        setConfig(prev => ({
            ...prev,
            filters: [...prev.filters, { id: `f-${Date.now()}`, field: FIELDS[prev.source][0], operator: 'equals', value: '' }]
        }));
    };

    const updateFilter = (id: string, key: keyof ReportFilter, val: string) => {
        setConfig(prev => ({
            ...prev,
            filters: prev.filters.map(f => f.id === id ? { ...f, [key]: val } : f)
        }));
    };

    const removeFilter = (id: string) => {
        setConfig(prev => ({
            ...prev,
            filters: prev.filters.filter(f => f.id !== id)
        }));
    };

    const runQuery = () => {
        let data: any[] = [];
        if (config.source === 'Leads') data = [...leads];
        else if (config.source === 'Bookings') data = [...bookings];
        else if (config.source === 'Inventory') data = [...inventory];

        // 1. Filter
        config.filters.forEach(f => {
            data = data.filter(item => {
                const itemVal = String(item[f.field] || '').toLowerCase();
                const searchVal = f.value.toLowerCase();
                
                if (f.operator === 'equals') return itemVal === searchVal;
                if (f.operator === 'contains') return itemVal.includes(searchVal);
                if (f.operator === 'not_equals') return itemVal !== searchVal;
                // Basic number comparison for GT/LT
                const numItem = Number(itemVal);
                const numSearch = Number(searchVal);
                if (!isNaN(numItem) && !isNaN(numSearch)) {
                    if (f.operator === 'gt') return numItem > numSearch;
                    if (f.operator === 'lt') return numItem < numSearch;
                }
                return true;
            });
        });

        // 2. Group & Aggregate
        if (config.groupBy) {
            const grouped = data.reduce((acc: any, item: any) => {
                const key = item[config.groupBy] || 'Unknown';
                if (!acc[key]) acc[key] = 0;
                
                if (config.metric === 'Count') {
                    acc[key] += 1;
                } else if (config.metric === 'Sum' && config.metricField) {
                    acc[key] += Number(item[config.metricField] || 0);
                }
                return acc;
            }, {});

            // Transform to Array for Recharts
            const chartData = Object.keys(grouped).map(key => ({
                name: key,
                value: grouped[key]
            })).sort((a, b) => b.value - a.value); // Sort desc

            setResultData(chartData);
        } else {
            // Table View (Raw Data - limited)
            setResultData(data.slice(0, 50));
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" /> Advanced Report Builder
                    </h1>
                    <p className="text-sm text-slate-500">Self-Service BI & Analytics Engine</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => alert("Report Scheduled for Weekly Email!")} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200">
                        Schedule
                    </button>
                    <button onClick={() => alert("Report Saved to 'My Folder'")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Report
                    </button>
                </div>
            </div>

            {/* Wizard Progress */}
            <div className="flex bg-white border-b border-slate-200">
                {['Select Source', 'Filter Logic', 'Grouping & Metrics', 'Visualize'].map((label, i) => (
                    <div 
                        key={i} 
                        onClick={() => setStep(i + 1)}
                        className={`flex-1 py-3 text-center text-xs font-bold uppercase border-b-4 cursor-pointer transition ${
                            step === i + 1 ? 'border-blue-600 text-blue-600 bg-blue-50' : 
                            step > i + 1 ? 'border-green-500 text-green-600' : 'border-transparent text-slate-400'
                        }`}
                    >
                        Step {i + 1}: {label}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                
                {/* STEP 1: SOURCE */}
                {step === 1 && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">What data do you want to analyze?</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {['Leads', 'Bookings', 'Inventory'].map((src) => (
                                <div 
                                    key={src}
                                    onClick={() => { setConfig({...config, source: src as any, filters: [], groupBy: '', metricField: ''}); setStep(2); }}
                                    className={`p-8 rounded-xl border-2 cursor-pointer transition hover:shadow-xl group text-center ${
                                        config.source === src ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                                    }`}
                                >
                                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition ${
                                        config.source === src ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                    }`}>
                                        <LayoutGrid className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">{src}</h3>
                                    <p className="text-sm text-slate-500 mt-2">Analyze {src.toLowerCase()} records</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: FILTERS */}
                {step === 2 && (
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" /> Filter Data: {config.source}
                        </h3>
                        
                        {config.filters.length === 0 && (
                            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl mb-4">
                                No filters applied. Showing all data.
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            {config.filters.map((f, idx) => (
                                <div key={f.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                                    <select 
                                        value={f.field}
                                        onChange={(e) => updateFilter(f.id, 'field', e.target.value)}
                                        className="flex-1 p-2 border border-slate-300 rounded text-sm"
                                    >
                                        {FIELDS[config.source].map(field => <option key={field} value={field}>{field}</option>)}
                                    </select>
                                    <select 
                                        value={f.operator}
                                        onChange={(e) => updateFilter(f.id, 'operator', e.target.value as any)}
                                        className="w-32 p-2 border border-slate-300 rounded text-sm"
                                    >
                                        <option value="equals">Equals</option>
                                        <option value="contains">Contains</option>
                                        <option value="not_equals">Not Equals</option>
                                        <option value="gt">Greater Than</option>
                                        <option value="lt">Less Than</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        value={f.value}
                                        onChange={(e) => updateFilter(f.id, 'value', e.target.value)}
                                        className="flex-1 p-2 border border-slate-300 rounded text-sm"
                                        placeholder="Value..."
                                    />
                                    <button onClick={() => removeFilter(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleAddFilter} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline mb-8">
                            <Plus className="w-4 h-4" /> Add Filter Logic
                        </button>

                        <div className="flex justify-end">
                            <button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                                Next Step <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: GROUPING */}
                {step === 3 && (
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" /> Grouping & Aggregation
                        </h3>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Group Rows By</label>
                                <select 
                                    value={config.groupBy} 
                                    onChange={(e) => setConfig({...config, groupBy: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                                >
                                    <option value="">-- No Grouping (Table View) --</option>
                                    {FIELDS[config.source].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Summarize By (Metric)</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setConfig({...config, metric: 'Count'})}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition ${config.metric === 'Count' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                    >
                                        Count (Rows)
                                    </button>
                                    <button 
                                        onClick={() => setConfig({...config, metric: 'Sum'})}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition ${config.metric === 'Sum' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                    >
                                        Sum (Total)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {config.metric === 'Sum' && (
                            <div className="mb-8 animate-fade-in">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Field to Sum</label>
                                <select 
                                    value={config.metricField} 
                                    onChange={(e) => setConfig({...config, metricField: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                                >
                                    <option value="">Select Numeric Field...</option>
                                    {NUMERIC_FIELDS[config.source].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button onClick={() => { runQuery(); nextStep(); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200">
                                <Play className="w-4 h-4" /> Run Report
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: VISUALIZE */}
                {step === 4 && (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex gap-2">
                                <button onClick={() => setConfig({...config, chartType: 'Bar'})} className={`p-2 rounded hover:bg-slate-100 ${config.chartType === 'Bar' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><BarChart2 className="w-5 h-5" /></button>
                                <button onClick={() => setConfig({...config, chartType: 'Pie'})} className={`p-2 rounded hover:bg-slate-100 ${config.chartType === 'Pie' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><PieIcon className="w-5 h-5" /></button>
                                <button onClick={() => setConfig({...config, chartType: 'Line'})} className={`p-2 rounded hover:bg-slate-100 ${config.chartType === 'Line' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><TrendingUp className="w-5 h-5" /></button>
                                <button onClick={() => setConfig({...config, chartType: 'Table'})} className={`p-2 rounded hover:bg-slate-100 ${config.chartType === 'Table' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><Grid className="w-5 h-5" /></button>
                            </div>
                            <div className="text-sm text-slate-500">
                                Found {resultData.length} records
                            </div>
                        </div>

                        {/* Chart Canvas */}
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg min-h-[400px] flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">{config.title}</h3>
                            
                            <div className="flex-1 w-full">
                                {config.groupBy ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        {config.chartType === 'Bar' ? (
                                            <BarChart data={resultData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" fill="#3b82f6" name={config.metric} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        ) : config.chartType === 'Pie' ? (
                                            <PieChart>
                                                <Pie data={resultData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                                                    {resultData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        ) : (
                                            <LineChart data={resultData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                                            </LineChart>
                                        )}
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                                <tr>
                                                    {Object.keys(resultData[0] || {}).slice(0, 6).map(key => (
                                                        <th key={key} className="px-4 py-3 capitalize">{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {resultData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        {Object.values(row).slice(0, 6).map((val: any, i) => (
                                                            <td key={i} className="px-4 py-3 text-slate-600">{String(val)}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {resultData.length === 0 && <p className="text-center text-slate-400 py-8">No data found matching filters.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ReportsModule;
