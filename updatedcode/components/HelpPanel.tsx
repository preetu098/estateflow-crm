
import React from 'react';
import { X, PlayCircle, MessageCircle, FileText, HelpCircle, BookOpen, Bug } from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  view: string;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose, view }) => {
  const getContent = () => {
    switch (view) {
      case 'leads':
      case 'nurture':
        return {
          title: 'Presales (The Dialer)',
          items: [
            { title: 'Step 1: Start Calling', desc: 'Click "Start Calling" on the queue. The system uses WebSockets to push the next lead automatically.' },
            { title: 'Step 2: Disposition', desc: 'Always mark status as "Connected" or "RNR". This updates the lead score.' },
            { title: 'Step 3: Site Visit', desc: 'If interested, click "Schedule Visit". This triggers the WhatsApp Gate Pass sent to the customer.' }
          ],
          video: 'How to Qualify Leads in 2 Mins'
        };
      case 'sales':
        return {
          title: 'Sales (Closing)',
          items: [
            { title: 'How to Create Quote', desc: 'Select Unit > Select Payment Plan > Add Discount > Click Print. Data is frozen upon booking.' },
            { title: 'Blocking Inventory', desc: 'Click "Block" on a unit. It reserves the unit for 24 hours using Redis expiration.' },
            { title: 'Generating Receipt', desc: 'Booking Date cannot be in the future. Receipts are auto-synced to Tally.' }
          ],
          video: 'Closing the Deal & Booking'
        };
      case 'reception':
        return {
          title: 'Reception & Handover',
          items: [
            { title: 'Scanning Gate Pass', desc: 'Use the QR scanner to instantly pull up visitor details and verify appointment.' },
            { title: 'Handling Walk-ins', desc: 'Search mobile number first. If not found, register as "New Walk-in".' },
            { title: 'Sales Handover', desc: 'The system auto-assigns the next available Sales Manager (Round Robin) upon check-in.' }
          ],
          video: 'Managing the Front Desk'
        };
      case 'bookings':
        return {
          title: 'Post-Sales (Fulfillment)',
          items: [
            { title: 'Generating Demand', desc: 'Wait for Engineering to mark "Slab Done". Go to Milestones > Generate Demand.' },
            { title: 'Agreements', desc: 'Agreements are generated using PDF templating. Ensure customer name spelling is verified in "Welcome Call".' },
            { title: 'Possession', desc: 'Possession Letter button is locked if "Total Due > 0". Collect payment to unlock.' }
          ],
          video: 'Post-Sales Lifecycle'
        };
      case 'procurement':
        return {
            title: 'Procurement (Vendors)',
            items: [
                { title: 'Process Flow', desc: 'Raise Indent > Manager Approves > Send RFQ > Compare Quotes > Issue PO.' },
                { title: 'Revisions', desc: 'Once a PO is approved, it is locked. Any change requires a "Revision PO" (v2).' }
            ],
            video: 'Raising a PO'
        };
      case 'inventory':
        return {
            title: 'Inventory (The Stock Market)',
            items: [
                { title: 'Color Codes', desc: 'Green = Available. Red = Sold. Yellow = Blocked.' },
                { title: 'Pricing Engine', desc: 'Base Rate changes by Admin reflect instantly on all "Available" units. Draft quotes are invalidated.' }
            ],
            video: 'Managing Inventory'
        };
      case 'settings':
        return {
          title: 'Admin & Governance',
          items: [
            { title: 'Permission Matrix', desc: 'Go to Roles & Permissions. Toggle View/Edit access per module. Updates are instant.' },
            { title: 'User Offboarding', desc: 'When deactivating a user, use the "Transfer Wizard" to reassign their active leads to a new owner.' }
          ],
          video: 'Admin Dashboard Overview'
        };
      default:
        return {
          title: 'EstateFlow Knowledge Base',
          items: [
            { title: 'Navigation', desc: 'Use the sidebar to switch between modules (Acquisition, Transaction, Fulfillment).' },
            { title: 'Data Flow', desc: 'Data passes from Marketing -> Presales -> Sales -> CRM -> Accounts. It is a relay race.' }
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
          <h2 className="font-bold flex items-center gap-2"><BookOpen className="w-5 h-5" /> Knowledge Base</h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">{content.title}</h3>
            <div className="space-y-4">
              {content.items.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100 hover:bg-blue-50 transition">
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
                <div className="aspect-video bg-slate-900 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800 cursor-pointer transition group">
                    <PlayCircle className="w-10 h-10 mb-2 group-hover:text-white transition" />
                    <span className="text-xs font-medium">{content.video}</span>
                </div>
             </div>
          )}

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-2">Need Help?</h3>
            <button className="w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">
                <MessageCircle className="w-4 h-4" /> Chat with IT Admin
            </button>
            <button className="w-full py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition">
                <Bug className="w-4 h-4" /> Report a Bug
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPanel;
