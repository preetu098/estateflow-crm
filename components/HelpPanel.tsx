import React from 'react';
import { X, PlayCircle, MessageCircle, FileText, HelpCircle } from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  view: string;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose, view }) => {
  const getContent = () => {
    switch (view) {
      case 'sales':
        return {
          title: 'Sales Center Help',
          items: [
            { title: 'Generating a Cost Sheet', desc: 'Select a unit from the Inventory Map. The cost sheet auto-calculates based on Admin settings.' },
            { title: 'Blocking a Unit', desc: 'Click "Block" to reserve a unit for 24 hours. Requires a checked-in lead.' },
            { title: 'Booking Process', desc: 'Click "Book Now", upload KYC docs, and select payment mode to generate the receipt.' }
          ],
          video: 'How to close a sale in 3 mins'
        };
      case 'reception':
        return {
          title: 'Reception & Gate Help',
          items: [
            { title: 'Scanning QR Passes', desc: 'Click "Scan QR Pass" and point camera at visitor phone. System validates entry instantly.' },
            { title: 'Handling Conflicts', desc: 'If a lead source conflict appears (Amber Alert), contact the Sales Head before proceeding.' },
            { title: 'Walk-in Registration', desc: 'Search mobile number first. If not found, register as "New Walk-in".' }
          ],
          video: 'Managing the Front Desk'
        };
      case 'settings':
        return {
          title: 'Super Admin Help',
          items: [
            { title: 'Updating Pricing', desc: 'Changes in "Financial Config" apply globally to all unsold units immediately.' },
            { title: 'User Management', desc: 'Deactivating a user logs them out instantly. Use this for employee exits.' },
            { title: 'Adding Sources', desc: 'Add new marketing sources in "CRM Masters" to make them available in Reception.' }
          ],
          video: 'Admin Dashboard Overview'
        };
      case 'leads':
        return {
          title: 'Lead Management Help',
          items: [
            { title: 'Scheduling Visits', desc: 'Edit a lead and change stage to "Visit Scheduled" to generate a Gate Pass.' },
            { title: 'Bulk Actions', desc: 'Use the checkboxes (coming soon) to delete or reassign multiple leads.' }
          ]
        };
      default:
        return {
          title: 'EstateFlow Help',
          items: [
            { title: 'Navigation', desc: 'Use the sidebar to switch between modules.' },
            { title: 'Notifications', desc: 'Check the bell icon for real-time alerts on lead assignments.' }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={onClose}></div>}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
          <h2 className="font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Help Center</h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">{content.title}</h3>
            <div className="space-y-4">
              {content.items.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100">
                  <h4 className="font-bold text-slate-700 text-sm mb-1 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-blue-500" /> {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {content.video && (
             <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">Video Tutorial</h3>
                <div className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200 cursor-pointer transition">
                    <PlayCircle className="w-10 h-10 mb-2" />
                    <span className="text-xs font-medium">{content.video}</span>
                </div>
             </div>
          )}

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">Need Support?</h3>
            <button className="w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-100">
                <MessageCircle className="w-4 h-4" /> Chat with IT Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPanel;