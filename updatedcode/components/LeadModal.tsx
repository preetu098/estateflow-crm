
import React, { useState, useEffect } from 'react';
import { Lead, LeadSource, LeadStage, Project, RemarkLog, Agent, ProjectType, FormField } from '../types';
import { SUB_STAGES, RESIDENTIAL_CONFIGS, COMMERCIAL_TYPES } from '../constants';
import { X, Clock, Save, Loader2, UserCircle, QrCode, Send, RefreshCw, Share2, Target, Globe, AlertCircle, ArrowRight, FileText, Printer } from 'lucide-react';
import { analyzeLeadWithAI, AIAnalysisResult } from '../services/geminiService';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  initialData?: Lead;
  projects: Project[];
  campaigns: string[];
  agents?: Agent[];
  leadSources: string[];
  customFields?: FormField[];
  leads?: Lead[]; // Passed for duplicate check
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, initialData, projects, campaigns, agents = [], leadSources = [], customFields = [], leads = [] }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [newRemark, setNewRemark] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'quotes'>('details');
  
  // Duplicate State
  const [duplicateAlert, setDuplicateAlert] = useState<Lead | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
      if (initialData) {
        setFormData({ ...initialData });
        const proj = projects.find(p => p.name === initialData.project);
        setSelectedProject(proj || null);

        if (initialData.aiScore !== undefined) {
             setAiResult({
                 score: initialData.aiScore,
                 summary: initialData.aiSummary || '',
                 suggestedAction: '' 
             });
        } else {
            setAiResult(null);
        }
      } else {
        setFormData({
          id: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
          createdAt: new Date().toISOString(),
          stage: LeadStage.NEW,
          callCount: 0,
          remarksHistory: [],
          project: projects.length > 0 ? projects[0].name : '',
          configuration: '',
          agentName: '', // Auto-assigned on save if empty
          agentId: '',
          customFields: {}
        });
        if (projects.length > 0) setSelectedProject(projects[0]);
        setAiResult(null);
      }
      setNewRemark('');
      setDuplicateAlert(null);
    }
  }, [isOpen, initialData, projects]);

  const handleChange = (field: keyof Lead, value: any) => {
    if (field === 'project') {
        const proj = projects.find(p => p.name === value);
        setSelectedProject(proj || null);
        setFormData(prev => ({ ...prev, project: value, configuration: '' })); // Reset config on project change
    } else {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'stage') {
                updated.subStage = '';
            }
            return updated;
        });
    }
  };

  const handleMobileBlur = () => {
      if (formData.mobile && formData.mobile.length === 10 && !initialData) {
          const found = leads.find(l => l.mobile === formData.mobile);
          if (found) {
              setDuplicateAlert(found);
          } else {
              setDuplicateAlert(null);
          }
      }
  };

  const handleEditExisting = () => {
      if(duplicateAlert) {
          setFormData({...duplicateAlert});
          setDuplicateAlert(null);
      }
  };

  const handleCustomFieldChange = (key: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          customFields: {
              ...(prev.customFields || {}),
              [key]: value
          }
      }));
  };

  const handleAgentChange = (agentId: string) => {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
          setFormData(prev => ({...prev, agentId: agent.id, agentName: agent.name}));
      }
  };

  const handleAddRemark = () => {
    if (!newRemark.trim()) return;
    const log: RemarkLog = {
      timestamp: new Date().toISOString(),
      text: newRemark,
      author: 'Agent'
    };
    setFormData(prev => ({
      ...prev,
      remarksHistory: [...(prev.remarksHistory || []), log]
    }));
    setNewRemark('');
  };

  const handleGeneratePass = () => {
    if (!formData.name || !formData.project) {
        alert('Save the lead with Name and Project before generating a pass.');
        return;
    }

    const token = `VP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days validity

    setFormData(prev => ({
        ...prev,
        visitToken: token,
        visitTokenExpiry: expiry.toISOString(),
        isTokenUsed: false,
        remarksHistory: [
            ...(prev.remarksHistory || []),
            { timestamp: new Date().toISOString(), text: `Generated VIP Gate Pass (Token: ${token}). Sent via WhatsApp.`, author: 'System' }
        ]
    }));

    alert(`VIP Pass Generated!\n\nToken: ${token}\n\nSending WhatsApp to ${formData.mobile}...\n\n"Hello ${formData.name}, Welcome to ${formData.project}. Show this QR code at the gate for express entry."`);
  };

  const handleResendPass = () => {
      if(!formData.visitToken) return;
      alert(`Resending existing pass (${formData.visitToken}) to ${formData.mobile} via WhatsApp.`);
  };

  const handleSave = () => {
    if (!formData.name || !formData.mobile || !formData.project) {
      alert("Name, Mobile, and Project are required.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    let finalRemarks = formData.remarksHistory || [];
    if (newRemark.trim()) {
        finalRemarks = [...finalRemarks, {
            timestamp: new Date().toISOString(),
            text: newRemark,
            author: 'Agent'
        }];
    }

    const savedLead = {
      ...formData,
      remarksHistory: finalRemarks,
      aiScore: aiResult?.score,
      aiSummary: aiResult?.summary
    } as Lead;

    onSave(savedLead);
    onClose();
  };

  const triggerAIAnalysis = async () => {
    if (!formData.name) return;
    setAiLoading(true);
    const tempLead = { ...formData, remarksHistory: [...(formData.remarksHistory || [])] } as Lead;
    if (newRemark) {
        tempLead.remarksHistory.push({ timestamp: new Date().toISOString(), text: newRemark, author: 'Current Input' });
    }
    
    const result = await analyzeLeadWithAI(tempLead);
    setAiResult(result);
    setAiLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
              <h2 className="text-xl font-bold text-slate-800">
                {initialData ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <p className="text-xs text-slate-500">Manage prospect details and history</p>
          </div>
          <div className="flex items-center gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                  <button onClick={() => setActiveTab('details')} className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeTab === 'details' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Details</button>
                  <button onClick={() => setActiveTab('quotes')} className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeTab === 'quotes' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Quotes ({formData.quotes?.length || 0})</button>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'quotes' ? (
              <div className="space-y-4">
                  {formData.quotes && formData.quotes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                          {formData.quotes.slice().reverse().map((quote) => (
                              <div key={quote.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                          <FileText className="w-6 h-6" />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-800">Unit {quote.unitNumber}</h4>
                                          <p className="text-xs text-slate-500">Created: {new Date(quote.createdAt).toLocaleDateString()} • v{quote.version}</p>
                                          <div className="flex gap-2 mt-1">
                                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{quote.paymentPlan}</span>
                                              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                  quote.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                              }`}>{quote.status}</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="text-right">
                                      <p className="text-xl font-bold text-slate-800">₹{quote.costSheet.finalPrice.toLocaleString()}</p>
                                      <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover:opacity-100 transition">
                                          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded" title="Print"><Printer className="w-4 h-4"/></button>
                                          <button className="p-2 text-green-600 hover:bg-green-50 rounded" title="Share WhatsApp"><Share2 className="w-4 h-4"/></button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No quotes generated yet.</p>
                          <p className="text-xs mt-1">Go to <b>Sales Center</b>, select a unit, and click "Generate Quote".</p>
                      </div>
                  )}
              </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* DUPLICATE ALERT */}
                {duplicateAlert && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 animate-slide-down">
                        <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-bold text-orange-800 text-sm">Customer Exists in Database!</h4>
                            <p className="text-xs text-orange-700 mt-1">
                                {duplicateAlert.name} is already assigned to <strong>{duplicateAlert.agentName}</strong> for <strong>{duplicateAlert.project}</strong>.
                            </p>
                            <div className="mt-3 flex gap-3">
                                <button 
                                    onClick={handleEditExisting}
                                    className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-700 flex items-center gap-1"
                                >
                                    Edit Existing Record <ArrowRight className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={() => setDuplicateAlert(null)}
                                    className="bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-100"
                                >
                                    Ignore (Create New Opportunity)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                    <input 
                      type="text" 
                      value={formData.mobile || ''} 
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      onBlur={handleMobileBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${duplicateAlert ? 'border-orange-300 focus:ring-orange-500' : 'border-slate-300 focus:ring-blue-500'}`}
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
                    <select 
                      value={formData.project || ''} 
                      onChange={(e) => handleChange('project', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>

                  {/* Dynamic Configuration Field based on Project Type */}
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                          {selectedProject?.type === ProjectType.COMMERCIAL ? 'Commercial Type' : 'Apartment Config'}
                      </label>
                      <select 
                        value={formData.configuration || ''} 
                        onChange={(e) => handleChange('configuration', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Requirement</option>
                        {selectedProject?.type === ProjectType.COMMERCIAL 
                            ? COMMERCIAL_TYPES.map(c => <option key={c} value={c}>{c}</option>)
                            : RESIDENTIAL_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)
                        }
                      </select>
                  </div>
                </div>

                {/* CUSTOM DYNAMIC FIELDS (MODULE 18) */}
                {customFields.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="md:col-span-2 text-xs font-bold text-slate-500 uppercase">Additional Info</div>
                        {customFields.map(field => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {field.label} {field.mandatory && '*'}
                                </label>
                                {field.type === 'Dropdown' ? (
                                    <select 
                                        value={formData.customFields?.[field.id] || ''}
                                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input 
                                        type={field.type === 'Number' ? 'number' : 'text'}
                                        value={formData.customFields?.[field.id] || ''}
                                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campaign</label>
                    <select 
                      value={formData.campaign || ''} 
                      onChange={(e) => handleChange('campaign', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Campaign</option>
                      {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                    <select 
                      value={formData.source || ''} 
                      onChange={(e) => handleChange('source', e.target.value as LeadSource)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stage Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
                    <select 
                      value={formData.stage || ''} 
                      onChange={(e) => handleChange('stage', e.target.value as LeadStage)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Sub Stage Selection (Conditional) */}
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Stage Status</label>
                      <select 
                        value={formData.subStage || ''}
                        onChange={(e) => handleChange('subStage', e.target.value)}
                        disabled={!formData.stage}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                      >
                        <option value="">Select status detail...</option>
                        {formData.stage && SUB_STAGES[formData.stage]?.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" /> Next Follow-up Date
                    </label>
                    <input 
                      type="date" 
                      value={formData.followUpDate || ''} 
                      onChange={(e) => handleChange('followUpDate', e.target.value)}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-1">Time</label>
                    <input 
                      type="time" 
                      value={formData.followUpTime || ''} 
                      onChange={(e) => handleChange('followUpTime', e.target.value)}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Remarks / Notes</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Enter notes about the latest interaction..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddRemark()}
                    />
                    <button 
                      onClick={handleAddRemark}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* History Feed */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-48 overflow-y-auto">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks History</h4>
                  <div className="space-y-3">
                    {formData.remarksHistory && formData.remarksHistory.length > 0 ? (
                      [...formData.remarksHistory].reverse().map((log, idx) => (
                        <div key={idx} className="flex flex-col text-sm">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>{log.author}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{log.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No history yet.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: AI, Assignment & Gate Pass */}
              <div className="space-y-6">

                {/* Meta Digital Footprint (New) */}
                {formData.metaData && (
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Digital Footprint
                      </h4>
                      <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                              <span className="text-slate-500">Campaign:</span>
                              <span className="font-medium text-slate-800">{formData.metaData.campaignName}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-slate-500">Ad Set:</span>
                              <span className="font-medium text-slate-800">{formData.metaData.adSetName}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-slate-500">Creative:</span>
                              <span className="font-medium text-slate-800">{formData.metaData.adName}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100">
                              <span className="text-slate-500 block mb-1">Form ID:</span>
                              <span className="font-mono bg-slate-50 px-2 py-1 rounded">{formData.metaData.formId}</span>
                          </div>
                      </div>
                  </div>
                )}

                {/* VIP Gate Pass Generator */}
                {formData.stage === LeadStage.VISIT_SCHEDULED && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                        <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                            <QrCode className="w-5 h-5" /> VIP Gate Pass
                        </h4>
                        
                        {!formData.visitToken ? (
                            <div className="text-center">
                                <p className="text-xs text-emerald-600 mb-3">
                                    Schedule confirmed? Generate a digital pass to allow express entry at the gate.
                                </p>
                                <button 
                                    onClick={handleGeneratePass}
                                    className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Generate & Send Pass
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded border border-emerald-100 text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Active Token</div>
                                    <div className="font-mono text-lg font-bold text-slate-800 tracking-widest">{formData.visitToken}</div>
                                    <div className={`text-[10px] mt-1 font-medium ${formData.isTokenUsed ? 'text-red-500' : 'text-green-600'}`}>
                                        {formData.isTokenUsed ? 'USED / EXPIRED' : `Valid until ${new Date(formData.visitTokenExpiry!).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handleResendPass}
                                        className="py-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-50 flex items-center justify-center gap-1"
                                    >
                                        <Share2 className="w-3 h-3" /> Resend
                                    </button>
                                    <button 
                                        onClick={handleGeneratePass} // Regenerate
                                        className="py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> New Token
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Assignment Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-blue-600" /> Assigned Agent
                    </h4>
                    {formData.agentId || formData.agentName ? (
                        <div className="flex items-center justify-between">
                            <select 
                                value={formData.agentId || ''}
                                onChange={(e) => handleAgentChange(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{formData.agentName || 'Select Agent'}</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500 italic">
                            System will auto-assign via Round Robin upon saving.
                        </div>
                    )}
                </div>

                {/* AI Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white opacity-10 rounded-full"></div>
                  
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        ✨ AI Insights
                      </h3>
                      {aiResult?.score !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${aiResult.score > 70 ? 'bg-green-400 text-green-900' : aiResult.score > 30 ? 'bg-yellow-400 text-yellow-900' : 'bg-red-400 text-red-900'}`}>
                          Score: {aiResult.score}/100
                        </span>
                      )}
                  </div>

                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm opacity-80">Analyzing lead potential...</span>
                    </div>
                  ) : aiResult ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="opacity-70 text-xs block mb-1">SUMMARY</span>
                        <p className="leading-snug">{aiResult.summary}</p>
                      </div>
                      {aiResult.suggestedAction && (
                        <div className="bg-white/10 p-3 rounded-lg border border-white/20 mt-2">
                          <span className="opacity-70 text-xs block mb-1">SUGGESTED ACTION</span>
                          <p className="font-medium text-yellow-200">{aiResult.suggestedAction}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm opacity-80 italic">
                      Click below to let AI analyze the lead history, remarks, and profile to suggest a score and next steps.
                    </p>
                  )}

                  <button 
                    onClick={triggerAIAnalysis}
                    disabled={aiLoading}
                    className="mt-6 w-full py-2 bg-white text-indigo-700 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition shadow-sm disabled:opacity-50"
                  >
                    {aiLoading ? 'Processing...' : 'Run AI Analysis'}
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Lead Information</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">ID:</span> <span className="font-mono">{formData.id}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Created:</span> <span>{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Calls Logged:</span> <span>{formData.callCount}</span></div>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'details' && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:text-slate-800 transition">
                Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-md shadow-blue-200">
                <Save className="w-4 h-4" /> Save Lead
            </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default LeadModal;
