
import React, { useState, useEffect } from 'react';
import { Lead, LeadStage } from '../types';
import { SUB_STAGES } from '../constants';
import { Phone, MessageSquare, Calendar, Clock, CheckCircle, ArrowRight, Smartphone, Save, XCircle } from 'lucide-react';
import CommunicationModal from './CommunicationModal';

interface NurtureModeProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
}

const NurtureMode: React.FC<NurtureModeProps> = ({ leads, onUpdateLead }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [commType, setCommType] = useState<'whatsapp' | 'sms' | null>(null);
  
  // Interaction State
  const [callOutcome, setCallOutcome] = useState('');
  const [tempStage, setTempStage] = useState<LeadStage>(LeadStage.NEW);
  const [tempSubStage, setTempSubStage] = useState<string>('');
  const [nextFollowUp, setNextFollowUp] = useState({ date: '', time: '' });

  // Filter leads requiring attention
  const today = new Date().toISOString().split('T')[0];
  const todoLeads = leads.filter(l => 
    (l.stage !== LeadStage.LOST && l.stage !== LeadStage.BOOKED) &&
    (l.followUpDate <= today || l.stage === LeadStage.NEW)
  ).sort((a, b) => {
    if (a.followUpDate === b.followUpDate) return 0;
    return a.followUpDate < b.followUpDate ? -1 : 1; // Overdue first
  });

  useEffect(() => {
    if (!selectedLead && todoLeads.length > 0) {
      handleSelectLead(todoLeads[0]);
    }
  }, [leads]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setTempStage(lead.stage);
    setTempSubStage(lead.subStage || '');
    setNextFollowUp({ date: lead.followUpDate, time: lead.followUpTime });
    setCallOutcome('');
  };

  const quickDisposition = (type: 'RNR' | 'Busy' | 'Interested' | 'Visit') => {
    if (!selectedLead) return;
    let newStage = selectedLead.stage;
    let newSubStage = '';
    let remarks = '';
    let nextDate = new Date();

    switch (type) {
      case 'RNR':
        newStage = LeadStage.CONNECTED;
        newSubStage = 'RNR (Ring No Response)';
        remarks = 'Called client, RNR.';
        nextDate.setDate(nextDate.getDate() + 1); // Call tomorrow
        break;
      case 'Busy':
        newStage = LeadStage.CONNECTED;
        newSubStage = 'Busy';
        remarks = 'Client is busy, asked to call later.';
        nextDate.setHours(nextDate.getHours() + 4); // Call in 4 hours (approx logic)
        break;
      case 'Interested':
        newStage = LeadStage.QUALIFIED;
        newSubStage = 'Warm';
        remarks = 'Client showed interest. Needs details.';
        nextDate.setDate(nextDate.getDate() + 2);
        break;
      case 'Visit':
        newStage = LeadStage.VISIT_SCHEDULED;
        newSubStage = 'Tentative';
        remarks = 'Client agreed for site visit. Need to confirm time.';
        nextDate.setDate(nextDate.getDate() + 1);
        break;
    }

    const updatedLead: Lead = {
        ...selectedLead,
        stage: newStage,
        subStage: newSubStage,
        callCount: selectedLead.callCount + 1,
        followUpDate: nextDate.toISOString().split('T')[0],
        remarksHistory: [...selectedLead.remarksHistory, { timestamp: new Date().toISOString(), text: `Quick Action: ${remarks}`, author: 'Agent' }]
    };
    onUpdateLead(updatedLead);
    advanceToNext();
  };

  const handleSaveInteraction = () => {
    if (!selectedLead) return;
    
    const updatedLead = {
      ...selectedLead,
      stage: tempStage,
      subStage: tempSubStage,
      followUpDate: nextFollowUp.date,
      followUpTime: nextFollowUp.time,
      callCount: callOutcome ? selectedLead.callCount + 1 : selectedLead.callCount,
      remarksHistory: callOutcome ? [
        ...selectedLead.remarksHistory,
        {
          timestamp: new Date().toISOString(),
          text: callOutcome,
          author: 'Agent'
        }
      ] : selectedLead.remarksHistory
    };
    
    onUpdateLead(updatedLead);
    advanceToNext();
  };

  const advanceToNext = () => {
    const currentIndex = todoLeads.findIndex(l => l.id === selectedLead?.id);
    if (currentIndex !== -1 && currentIndex < todoLeads.length - 1) {
        handleSelectLead(todoLeads[currentIndex + 1]);
    }
  };

  return (
    <div className="flex h-full animate-fade-in overflow-hidden bg-slate-50">
      {/* Left Panel: Queue */}
      <div className="w-1/3 min-w-[300px] max-w-[350px] border-r border-slate-200 bg-white flex flex-col z-10 shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> Call Queue</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{todoLeads.length}</span>
          </h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {todoLeads.map(lead => {
            const isOverdue = lead.followUpDate < today && lead.followUpDate !== '';
            const isSelected = selectedLead?.id === lead.id;
            return (
              <div 
                key={lead.id}
                onClick={() => handleSelectLead(lead)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition group ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold text-sm ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>{lead.name}</h4>
                  {isOverdue && <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded shadow-sm">OVERDUE</span>}
                </div>
                <p className="text-xs text-slate-500 mb-1.5">{lead.project}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" /> 
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'No Date'}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isSelected ? 'border-blue-200 bg-white text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                        {lead.stage}
                    </span>
                </div>
              </div>
            );
          })}
          {todoLeads.length === 0 && (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-64">
              <CheckCircle className="w-12 h-12 mb-3 text-emerald-400 opacity-50" />
              <p className="font-medium text-slate-600">All caught up!</p>
              <p className="text-sm">No pending follow-ups for today.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Workspace */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedLead ? (
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            
            {/* Header & Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {/* Top Bar */}
               <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                   <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                       {selectedLead.name}
                       <a href={`tel:${selectedLead.mobile}`} className="text-sm font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 transition">
                           <Phone className="w-3 h-3" /> {selectedLead.mobile}
                       </a>
                   </h1>
                   <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                     <span className="bg-slate-100 px-2 py-1 rounded">{selectedLead.project}</span>
                     <span>•</span>
                     <span>Source: {selectedLead.source}</span>
                     <span>•</span>
                     <span>Last Call: {selectedLead.remarksHistory.length > 0 ? new Date(selectedLead.remarksHistory[selectedLead.remarksHistory.length - 1].timestamp).toLocaleDateString() : 'Never'}</span>
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setCommType('whatsapp')} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition" title="WhatsApp">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCommType('sms')} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="SMS">
                        <Smartphone className="w-5 h-5" />
                    </button>
                 </div>
               </div>

               {/* One-Click Disposition */}
               <div className="bg-slate-50 px-6 py-4 flex flex-wrap gap-3 items-center border-b border-slate-100">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Fast Action:</span>
                   <button onClick={() => quickDisposition('RNR')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-md hover:border-orange-400 hover:text-orange-600 transition shadow-sm">
                       RNR (No Reply)
                   </button>
                   <button onClick={() => quickDisposition('Busy')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-md hover:border-yellow-400 hover:text-yellow-600 transition shadow-sm">
                       Busy / Call Later
                   </button>
                   <button onClick={() => quickDisposition('Visit')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-md hover:border-blue-400 hover:text-blue-600 transition shadow-sm">
                       Schedule Visit
                   </button>
                   <button onClick={() => quickDisposition('Interested')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-md hover:border-green-400 hover:text-green-600 transition shadow-sm">
                       Mark Interested
                   </button>
               </div>

               {/* Stage & Interaction Logger */}
               <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Column 1: Status Management */}
                  <div className="space-y-5">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-slate-400" /> Update Status
                      </h3>
                      <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Stage</label>
                              <select 
                                value={tempStage}
                                onChange={(e) => {
                                    setTempStage(e.target.value as LeadStage);
                                    setTempSubStage(''); // Reset sub-stage on stage change
                                }}
                                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              >
                                  {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Sub-Stage (Detailed Status)</label>
                              <select 
                                value={tempSubStage}
                                onChange={(e) => setTempSubStage(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              >
                                  <option value="">Select Detail...</option>
                                  {SUB_STAGES[tempStage]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                              </select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Next Follow-up</label>
                                  <input 
                                    type="date"
                                    value={nextFollowUp.date}
                                    onChange={(e) => setNextFollowUp({...nextFollowUp, date: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                                  <input 
                                    type="time"
                                    value={nextFollowUp.time}
                                    onChange={(e) => setNextFollowUp({...nextFollowUp, time: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Column 2: Remarks */}
                  <div className="space-y-5 flex flex-col">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400" /> Interaction Notes
                      </h3>
                      <textarea 
                          value={callOutcome}
                          onChange={(e) => setCallOutcome(e.target.value)}
                          placeholder="Type notes here... (e.g., Client asked for floor plan, budget issue, etc.)"
                          className="w-full flex-1 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[140px]"
                      />
                      <div className="flex justify-end pt-2">
                          <button 
                            onClick={handleSaveInteraction}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition flex items-center gap-2"
                          >
                              <Save className="w-4 h-4" /> Update & Next
                          </button>
                      </div>
                  </div>
               </div>
            </div>

            {/* History Feed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Activity Timeline</h3>
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {selectedLead.remarksHistory.slice().reverse().map((log, idx) => (
                    <div key={idx} className="relative pl-8 group">
                       <div className="absolute left-0 top-1.5 w-4 h-4 bg-slate-200 rounded-full border-2 border-white group-hover:bg-blue-400 transition"></div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-slate-700">{log.author}</span>
                               <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                           </div>
                           <p className="text-sm text-slate-600">{log.text}</p>
                       </div>
                    </div>
                  ))}
                  {selectedLead.remarksHistory.length === 0 && <p className="text-sm text-slate-400 italic pl-8">No history available.</p>}
                </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <div className="bg-slate-100 p-6 rounded-full mb-4">
                 <Phone className="w-8 h-8 text-slate-300" />
             </div>
             <p className="font-medium text-slate-600">Select a lead to start nurturing</p>
             <p className="text-sm">Click on any lead from the queue on the left.</p>
          </div>
        )}
      </div>

      <CommunicationModal 
        isOpen={!!commType}
        onClose={() => setCommType(null)}
        lead={selectedLead}
        type={commType || 'sms'}
      />
    </div>
  );
};

export default NurtureMode;
