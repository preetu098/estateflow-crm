
import React, { useState } from 'react';
import { CallAudit } from '../types';
import { MOCK_CALL_AUDITS, MOCK_LEADS, INITIAL_AGENTS } from '../constants';
import { Headphones, PlayCircle, CheckCircle, XCircle, Star, Save } from 'lucide-react';

const QualityAuditModule: React.FC = () => {
    const [audits, setAudits] = useState<CallAudit[]>(MOCK_CALL_AUDITS);
    const [selectedAudit, setSelectedAudit] = useState<CallAudit | null>(null);
    
    // Scoring State
    const [scores, setScores] = useState({ greeting: 0, knowledge: 0, closing: 0, empathy: 0 });
    const [feedback, setFeedback] = useState('');

    const handleSelectAudit = (audit: CallAudit) => {
        setSelectedAudit(audit);
        setScores(audit.criteria);
        setFeedback(audit.feedback || '');
    };

    const calculateTotalScore = () => {
        const total = scores.greeting + scores.knowledge + scores.closing + scores.empathy;
        return (total / 20) * 100;
    };

    const handleSubmitScore = () => {
        if (!selectedAudit) return;
        const total = calculateTotalScore();
        const updatedAudit: CallAudit = {
            ...selectedAudit,
            score: total,
            status: 'Audited',
            feedback: feedback,
            criteria: scores
        };
        setAudits(prev => prev.map(a => a.id === selectedAudit.id ? updatedAudit : a));
        setSelectedAudit(null);
        alert(`Audit Submitted! Score: ${total}%`);
    };

    return (
        <div className="h-full flex bg-slate-50 animate-fade-in">
            {/* Left: List */}
            <div className="w-1/3 min-w-[350px] border-r border-slate-200 flex flex-col bg-white">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Headphones className="w-6 h-6 text-purple-600" /> Call Audits
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Randomly sampled calls for review</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {audits.map(audit => {
                        const agent = INITIAL_AGENTS.find(a => a.id === audit.agentId);
                        const lead = MOCK_LEADS.find(l => l.id === audit.leadId);
                        return (
                            <div 
                                key={audit.id} 
                                onClick={() => handleSelectAudit(audit)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition ${selectedAudit?.id === audit.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{agent?.name}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${audit.status === 'Audited' ? (audit.score >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-slate-100 text-slate-500'}`}>
                                        {audit.status === 'Audited' ? `${audit.score}%` : 'Pending'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Client: {lead?.name} ({lead?.project})</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <PlayCircle className="w-3 h-3" /> {audit.duration} • {new Date(audit.callDate).toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Player & Scorecard */}
            <div className="flex-1 p-8 overflow-y-auto">
                {selectedAudit ? (
                    <div className="max-w-3xl mx-auto">
                        {/* Player Mock */}
                        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg mb-8 flex flex-col items-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-900/50">
                                <PlayCircle className="w-8 h-8 text-white ml-1" />
                            </div>
                            <div className="w-full h-12 bg-slate-800 rounded-lg mb-4 flex items-center px-4 gap-1">
                                {/* Mock Audio Wave */}
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className="flex-1 bg-purple-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}></div>
                                ))}
                            </div>
                            <div className="flex justify-between w-full text-xs text-slate-400 font-mono">
                                <span>00:45</span>
                                <span>{selectedAudit.duration}</span>
                            </div>
                        </div>

                        {/* Scorecard */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">QA Scorecard</h3>
                                <div className="text-2xl font-bold text-purple-600">{calculateTotalScore()}%</div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                        Greeting & Introduction
                                        <span className="text-purple-600">{scores.greeting}/5</span>
                                    </label>
                                    <input type="range" min="0" max="5" step="1" value={scores.greeting} onChange={(e) => setScores({...scores, greeting: Number(e.target.value)})} className="w-full accent-purple-600" />
                                </div>
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                        Product Knowledge
                                        <span className="text-purple-600">{scores.knowledge}/5</span>
                                    </label>
                                    <input type="range" min="0" max="5" step="1" value={scores.knowledge} onChange={(e) => setScores({...scores, knowledge: Number(e.target.value)})} className="w-full accent-purple-600" />
                                </div>
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                        Closing Skills
                                        <span className="text-purple-600">{scores.closing}/5</span>
                                    </label>
                                    <input type="range" min="0" max="5" step="1" value={scores.closing} onChange={(e) => setScores({...scores, closing: Number(e.target.value)})} className="w-full accent-purple-600" />
                                </div>
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                        Empathy & Tone
                                        <span className="text-purple-600">{scores.empathy}/5</span>
                                    </label>
                                    <input type="range" min="0" max="5" step="1" value={scores.empathy} onChange={(e) => setScores({...scores, empathy: Number(e.target.value)})} className="w-full accent-purple-600" />
                                </div>
                            </div>

                            <div className="mt-8">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Manager Feedback</label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Enter specific feedback for the agent..."
                                    rows={3}
                                />
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button onClick={handleSubmitScore} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Submit Audit
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="font-medium">Select a call to audit</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualityAuditModule;
