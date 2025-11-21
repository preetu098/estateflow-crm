
import React, { useState } from 'react';
import { CommunicationTemplate, Lead } from '../types';
import { MOCK_TEMPLATES } from '../constants';
import { X, Send, MessageSquare, Smartphone } from 'lucide-react';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  type: 'whatsapp' | 'sms';
}

const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, lead, type }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const templates = MOCK_TEMPLATES.filter(t => t.type === type);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && lead) {
      let text = template.content.replace('{name}', lead.name).replace('{project}', lead.project);
      setMessage(text);
    } else {
      setMessage('');
    }
  };

  const handleSend = () => {
    if (!lead) return;
    setSending(true);
    
    // Mock API call
    setTimeout(() => {
      alert(`${type === 'whatsapp' ? 'WhatsApp' : 'SMS'} sent to ${lead.mobile}:\n\n${message}`);
      setSending(false);
      onClose();
    }, 1000);
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`px-6 py-4 border-b flex justify-between items-center ${type === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
          <h3 className="text-lg font-bold flex items-center gap-2">
            {type === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            Send {type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
            <div className="px-3 py-2 bg-slate-100 rounded border border-slate-200 text-slate-700">
              {lead.name} ({lead.mobile})
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Template</label>
            <select 
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Custom Message --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Type your message here..."
            />
          </div>
          
          {type === 'whatsapp' && (
              <div className="text-xs text-slate-500 bg-green-50 p-2 rounded border border-green-100">
                  Note: This will use the configured WhatsApp Business API to send the message.
              </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">
            Cancel
          </button>
          <button 
            onClick={handleSend} 
            disabled={!message || sending}
            className={`px-6 py-2 text-white font-medium rounded-lg transition flex items-center gap-2 shadow-md ${
                type === 'whatsapp' 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            } ${sending || !message ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {sending ? 'Sending...' : <>Send <Send className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationModal;
