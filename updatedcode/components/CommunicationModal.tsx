
import React, { useState, useEffect } from 'react';
import { CommunicationTemplate, EmailTemplate, Lead } from '../types';
import { MOCK_TEMPLATES, MOCK_EMAIL_TEMPLATES } from '../constants';
import { X, Send, MessageSquare, Smartphone, Mail, Paperclip, ChevronDown, Clock, CheckCheck, Check } from 'lucide-react';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  type: 'whatsapp' | 'sms' | 'email'; // Initial Tab
}

const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, lead, type }) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms' | 'email'>(type);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState(''); // For Email
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
      setActiveTab(type);
      setMessage('');
      setSubject('');
      setSelectedTemplateId('');
  }, [isOpen, type]);

  // Mock Chat History for WhatsApp view
  const mockChatHistory = [
      { id: 1, sender: 'agent', text: 'Hello, thank you for your interest in Krishna Trident.', time: '10:00 AM' },
      { id: 2, sender: 'user', text: 'Hi, can you send the floor plan?', time: '10:05 AM' },
      { id: 3, sender: 'agent', text: 'Sure, sending it right away.', time: '10:06 AM' }
  ];

  const handleTemplateChange = (tmplId: string) => {
      setSelectedTemplateId(tmplId);
      if(!lead) return;

      if (activeTab === 'email') {
          const tmpl = MOCK_EMAIL_TEMPLATES.find(t => t.id === tmplId);
          if (tmpl) {
              setSubject(tmpl.subject.replace('{project}', lead.project));
              setMessage(tmpl.body.replace('{name}', lead.name).replace('{project}', lead.project).replace('{agent_name}', lead.agentName));
          }
      } else {
          const tmpl = MOCK_TEMPLATES.find(t => t.id === tmplId);
          if (tmpl) {
              setMessage(tmpl.content.replace('{name}', lead.name).replace('{project}', lead.project));
          }
      }
  };

  const handleSend = () => {
      if(!lead) return;
      setSending(true);
      setTimeout(() => {
          const method = activeTab === 'whatsapp' ? 'WhatsApp' : activeTab === 'email' ? 'Email' : 'SMS';
          alert(`${method} Sent to ${lead.name}!\n\nTracking Pixel Active.`);
          if(lead.remarksHistory) {
              lead.remarksHistory.push({
                  timestamp: new Date().toISOString(),
                  text: `${method} Sent: ${activeTab === 'email' ? subject : 'Template Msg'}`,
                  author: 'Agent',
                  type: activeTab
              });
          }
          setSending(false);
          onClose();
      }, 1000);
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">Unified Communication Hub</h3>
                <p className="text-xs text-slate-400">Connect with {lead.name}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <button onClick={() => setActiveTab('whatsapp')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'whatsapp' ? 'border-green-500 text-green-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                <MessageSquare className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={() => setActiveTab('sms')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'sms' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                <Smartphone className="w-4 h-4" /> SMS
            </button>
            <button onClick={() => setActiveTab('email')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'email' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                <Mail className="w-4 h-4" /> Email
            </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
            
            {/* WHATSAPP VIEW (Chat Interface) */}
            {activeTab === 'whatsapp' && (
                <div className="flex flex-col h-[400px]">
                    {/* Chat History Mock */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#e5ded8]">
                        {mockChatHistory.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm shadow-sm ${msg.sender === 'agent' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                    <p className="text-slate-800 leading-snug">{msg.text}</p>
                                    <div className="flex justify-end items-center gap-1 mt-1">
                                        <span className="text-[10px] text-slate-500">{msg.time}</span>
                                        {msg.sender === 'agent' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-200">
                        <div className="mb-2">
                            <select 
                                value={selectedTemplateId} 
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="w-full text-xs border border-slate-300 rounded px-2 py-1 bg-yellow-50 text-slate-700 outline-none"
                            >
                                <option value="">-- Select Approved Template --</option>
                                {MOCK_TEMPLATES.filter(t => t.type === 'whatsapp').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none resize-none h-12"
                            />
                            <button onClick={handleSend} disabled={!message} className="bg-green-600 text-white p-3 rounded-full shadow-md hover:bg-green-700 disabled:opacity-50">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-center flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> 24-hour window active
                        </p>
                    </div>
                </div>
            )}

            {/* SMS VIEW */}
            {activeTab === 'sms' && (
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Template</label>
                        <select 
                            value={selectedTemplateId} 
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none bg-white"
                        >
                            <option value="">Select SMS Template</option>
                            {MOCK_TEMPLATES.filter(t => t.type === 'sms').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Message</label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        />
                        <div className="text-right text-xs text-slate-400 mt-1">{message.length} chars (1 credit)</div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSend} disabled={!message} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2">
                            Send SMS <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* EMAIL VIEW */}
            {activeTab === 'email' && (
                <div className="p-6 space-y-4 bg-white h-full flex flex-col">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-700">Compose Email</h4>
                            <select 
                                value={selectedTemplateId} 
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="border border-slate-300 rounded px-2 py-1 text-xs bg-white outline-none w-48"
                            >
                                <option value="">Load Template...</option>
                                {MOCK_EMAIL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="Subject" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border-b border-slate-200 py-2 text-sm outline-none font-medium placeholder-slate-400"
                            />
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your email..."
                                className="w-full h-48 border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none bg-slate-50"
                            />
                        </div>

                        {/* Mock Attachments */}
                        <div className="flex items-center gap-2">
                            <button className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded flex items-center gap-1 text-slate-600 font-medium border border-slate-200">
                                <Paperclip className="w-3 h-3" /> Attach Brochure
                            </button>
                            <button className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded flex items-center gap-1 text-slate-600 font-medium border border-slate-200">
                                <Paperclip className="w-3 h-3" /> Attach Cost Sheet
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Spy Pixel Active
                        </div>
                        <button onClick={handleSend} disabled={!message || !subject} className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-700 flex items-center gap-2 shadow-lg shadow-orange-200">
                            Send Email <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default CommunicationModal;
