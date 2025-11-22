
import React, { useState, useEffect } from 'react';
import { Booking, PaymentStatus, PaymentMilestone, ProjectMilestone, ServiceTicket, LoanDetails, CancellationRecord, TransferRequest, ModificationRequest } from '../types';
import { MOCK_PROJECT_MILESTONES, INITIAL_PROJECTS } from '../constants';
import { 
  Search, FileText, Wallet, Calendar, CheckCircle, AlertCircle, 
  Download, Mail, Printer, ChevronRight, Building, DollarSign, Phone, 
  Briefcase, PenTool, HardHat, Ticket, CheckSquare, RefreshCw, Landmark, FileCheck, MessageCircle, FileSignature, XCircle, AlertTriangle, UserPlus, Users, Key, ShieldCheck, ArrowRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface BookingModuleProps {
    bookings: Booking[];
}

const BookingModule: React.FC<BookingModuleProps> = ({ bookings }) => {
  // Local state to manage bookings (simulation of database update)
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>(MOCK_PROJECT_MILESTONES);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'bookings' | 'milestones' | 'tickets'>('dashboard');
  const [bookingTab, setBookingTab] = useState<'overview' | 'payments' | 'documents' | 'support' | 'handover'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Personal Reason');
  const [refundCalc, setRefundCalc] = useState({ paid: 0, forfeiture: 0, gst: 0, refund: 0 });

  // Welcome Workflow State
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(1);

  // Transfer Workflow State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({ newName: '', relationship: '', fee: 25000 });

  // Modification Workflow State
  const [showModModal, setShowModModal] = useState(false);
  const [modData, setModData] = useState({ desc: '', cost: 0 });

  useEffect(() => {
      // Enrich mock data with handover status if missing
      const enriched = bookings.map(b => ({
          ...b,
          handoverStatus: b.handoverStatus || 'Pending Welcome',
          possessionChecklist: b.possessionChecklist || { paymentCleared: false, snaggingCleared: false, agreementRegistered: false, ndcIssued: false, possessionLetterIssued: false },
          transferHistory: b.transferHistory || []
      }));
      setLocalBookings(enriched);
  }, [bookings]);

  // --- Helper Functions ---

  const handleGenerateDemand = (milestone: PaymentMilestone, booking: Booking) => {
    alert(`Generating Demand Letter for ${booking.customerName} - ${milestone.name} (₹${milestone.amount.toLocaleString()})\nSending via Email & WhatsApp...`);
  };

  const handleRecordPayment = (milestone: PaymentMilestone) => {
    const amount = prompt(`Enter amount received for ${milestone.name}:`, milestone.amount.toString());
    if (amount) {
        alert(`Payment of ₹${amount} recorded successfully!`);
        // Update local state simulation
        if (selectedBooking) {
            const updatedSchedule = selectedBooking.paymentSchedule.map(pm => pm.id === milestone.id ? { ...pm, status: PaymentStatus.PAID, paidDate: new Date().toISOString().split('T')[0] } : pm);
            const amtPaid = Number(selectedBooking.amountPaid) + Number(amount);
            const updatedBooking = { ...selectedBooking, paymentSchedule: updatedSchedule, amountPaid: amtPaid };
            setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));
            setSelectedBooking(updatedBooking);
        }
    }
  };

  const handleGenerateDoc = (docName: string) => {
    alert(`Generating ${docName} using template variables...\n{Customer_Name}, {Unit_No} auto-filled.\nPDF Download started.`);
  };

  const handleESign = () => {
      alert("Initiating e-Sign via Zoho Sign / Aadhaar...\n\nLink sent to customer's mobile and email.");
  };

  const handleMarkProjectMilestone = (milestone: ProjectMilestone) => {
      if (confirm(`Mark '${milestone.name}' as COMPLETE for Project? \n\nThis will automatically RAISE DEMAND for all linked bookings.`)) {
          // 1. Update Milestone Status
          setProjectMilestones(prev => prev.map(pm => pm.id === milestone.id ? { ...pm, completed: true, completionDate: new Date().toISOString().split('T')[0] } : pm));
          alert(`Success! Demand raised for customers linked to ${milestone.name}.`);
      }
  };

  // --- Welcome Workflow ---
  const initiateWelcome = (booking: Booking) => {
      setSelectedBooking(booking);
      setWelcomeStep(1);
      setShowWelcomeModal(true);
  };

  const completeWelcome = () => {
      if (!selectedBooking) return;
      const updatedBooking = { ...selectedBooking, handoverStatus: 'Active' as const };
      setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSelectedBooking(updatedBooking);
      setShowWelcomeModal(false);
      alert("Handover Accepted! Sales team disconnected. You are now the Relationship Manager.");
  };

  // --- Transfer Workflow ---
  const handleTransfer = () => {
      if (!selectedBooking || !transferData.newName) return;
      const newTransfer: TransferRequest = {
          id: `TR-${Date.now()}`,
          originalName: selectedBooking.customerName,
          newName: transferData.newName,
          relationship: transferData.relationship,
          transferFee: transferData.fee,
          status: 'Completed',
          requestDate: new Date().toISOString()
      };
      
      const updatedBooking = {
          ...selectedBooking,
          customerName: transferData.newName,
          transferHistory: [...(selectedBooking.transferHistory || []), newTransfer]
      };

      setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSelectedBooking(updatedBooking);
      setShowTransferModal(false);
      setTransferData({ newName: '', relationship: '', fee: 25000 });
      alert(`Transfer Successful! Endorsement Letter Generated for ${newTransfer.newName}.`);
  };

  // --- Modification Workflow ---
  const handleModification = () => {
      if (!selectedBooking || !modData.desc) return;
      const newMod: ModificationRequest = {
          id: `MOD-${Date.now()}`,
          description: modData.desc,
          cost: Number(modData.cost),
          status: 'Costing', // Starts at costing
          addedToDemand: false
      };
      
      const updatedBooking = {
          ...selectedBooking,
          modifications: [...selectedBooking.modifications, newMod]
      };
      
      setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSelectedBooking(updatedBooking);
      setShowModModal(false);
      setModData({ desc: '', cost: 0 });
      alert("Modification Request Logged. Sent to Architect for Feasibility.");
  };

  // --- Handover Gatekeeper ---
  const generateNDC = () => {
      if (!selectedBooking) return;
      const totalDue = selectedBooking.totalCost - selectedBooking.amountPaid;
      if (totalDue > 0) {
          alert(`Cannot Issue NDC! Balance of ₹${totalDue.toLocaleString()} is pending.`);
          return;
      }
      const updated = { 
          ...selectedBooking, 
          possessionChecklist: { ...selectedBooking.possessionChecklist!, ndcIssued: true, paymentCleared: true } 
      };
      setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updated : b));
      setSelectedBooking(updated);
      alert("No Dues Certificate (NDC) Generated!");
  };

  const issuePossessionLetter = () => {
      if (!selectedBooking) return;
      const { ndcIssued, snaggingCleared } = selectedBooking.possessionChecklist!;
      if (!ndcIssued) { alert("Error: NDC not issued."); return; }
      if (!snaggingCleared) { alert("Error: Snagging points pending."); return; }
      
      const updated = {
          ...selectedBooking,
          status: 'Handover' as const,
          handoverStatus: 'Handed Over' as const,
          possessionChecklist: { ...selectedBooking.possessionChecklist!, possessionLetterIssued: true }
      };
      setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updated : b));
      setSelectedBooking(updated);
      alert("Possession Letter Issued! Keys Handed Over. Welcome Home!");
  };

  // --- Cancellation Workflow ---
  const openCancelModal = () => {
      if(!selectedBooking) return;
      const totalPaid = selectedBooking.amountPaid;
      // Logic: Forfeit 10% of paid amount if Personal Reason
      const forfeitPercent = cancelReason === 'Loan Rejected' ? 0 : 0.10;
      const forfeiture = Math.round(totalPaid * forfeitPercent);
      // Logic: Reverse GST on refund amount (Simplified)
      const gstReversal = 0; // Assume GST credit note handled separately in accounts
      const refund = totalPaid - forfeiture;

      setRefundCalc({ paid: totalPaid, forfeiture, gst: gstReversal, refund });
      setShowCancelModal(true);
  };

  const confirmCancellation = () => {
      if(!selectedBooking) return;
      
      const cancelRecord: CancellationRecord = {
          bookingId: selectedBooking.id,
          reason: cancelReason,
          forfeitureAmount: refundCalc.forfeiture,
          refundAmount: refundCalc.refund,
          refundStatus: 'Pending',
          cancelledAt: new Date().toISOString()
      };

      const updatedBooking: Booking = {
          ...selectedBooking,
          status: 'Cancelled',
          cancellation: cancelRecord
      };

      setLocalBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSelectedBooking(updatedBooking);
      setShowCancelModal(false);
      
      // Brokerage Clawback Check
      if(selectedBooking.channelPartnerId) {
          alert(`Notice: Brokerage Clawback Alert generated for CP ${selectedBooking.channelPartnerName}. Debit Note created.`);
      }
      
      alert("Booking Cancelled. Unit released to Inventory. Refund processed.");
  };

  // --- Dashboard Stats Calculation ---
  const totalCollection = localBookings.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalValue = localBookings.reduce((sum, b) => sum + b.totalCost, 0);
  const outstanding = totalValue - totalCollection;
  
  // Overdue buckets
  const overdueBookings = localBookings.filter(b => b.paymentSchedule.some(p => p.status === PaymentStatus.OVERDUE));
  const totalOverdueAmount = overdueBookings.reduce((sum, b) => 
      sum + b.paymentSchedule.filter(p => p.status === PaymentStatus.OVERDUE).reduce((s, p) => s + p.amount, 0)
  , 0);

  // Pending Handovers
  const pendingHandovers = localBookings.filter(b => b.handoverStatus === 'Pending Welcome');

  // Mock Chart Data
  const cashFlowData = [
      { name: 'Collected', value: totalCollection },
      { name: 'Outstanding', value: outstanding }
  ];
  const COLORS = ['#10b981', '#f97316'];

  const filteredBookingsList = localBookings.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-slate-50 animate-fade-in overflow-hidden">
      
      {/* Main Sidebar Navigation (Mini) */}
      <div className="w-16 bg-slate-900 text-slate-400 flex flex-col items-center py-6 gap-6 z-20 flex-shrink-0">
          <button onClick={() => setActiveView('dashboard')} className={`p-3 rounded-xl transition ${activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`} title="Dashboard">
              <Wallet className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveView('bookings')} className={`p-3 rounded-xl transition ${activeView === 'bookings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`} title="All Bookings">
              <Building className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveView('milestones')} className={`p-3 rounded-xl transition ${activeView === 'milestones' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`} title="Construction Milestones">
              <HardHat className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveView('tickets')} className={`p-3 rounded-xl transition ${activeView === 'tickets' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`} title="Service Tickets">
              <Ticket className="w-6 h-6" />
          </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER - Context Sensitive */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800">
                {activeView === 'dashboard' && 'Relationship Manager Dashboard'}
                {activeView === 'bookings' && 'Customer Bookings'}
                {activeView === 'milestones' && 'Project Milestones & Demands'}
                {activeView === 'tickets' && 'Service Requests (CRM)'}
            </h1>
            {activeView === 'bookings' && (
                <div className="relative w-64">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                     <input 
                       type="text" 
                       placeholder="Search customer..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                </div>
            )}
        </header>

        {/* VIEW: DASHBOARD */}
        {activeView === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-6">
                {/* Handover Alerts */}
                {pendingHandovers.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center animate-slide-down">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900">Welcome Calls Pending</h3>
                                <p className="text-sm text-blue-700">You have {pendingHandovers.length} new customers assigned from Sales. Complete the handover ritual.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setSelectedBooking(pendingHandovers[0]); setActiveView('bookings'); initiateWelcome(pendingHandovers[0]); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700"
                        >
                            Start Welcome Call
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500">Collections Due (This Month)</p>
                        <p className="text-2xl font-bold text-slate-800 mt-2">₹{(totalOverdueAmount / 100000).toFixed(2)} L</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500">Total Collected</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">₹{(totalCollection / 10000000).toFixed(2)} Cr</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <p className="text-sm font-medium text-slate-500">Outstanding</p>
                         <p className="text-2xl font-bold text-orange-500 mt-2">₹{(outstanding / 10000000).toFixed(2)} Cr</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500">Active Tickets</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                            {localBookings.reduce((acc, b) => acc + b.tickets.filter(t => t.status === 'Open').length, 0)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Cash Flow Status</h3>
                        <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                    data={cashFlowData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    >
                                    {cashFlowData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => `₹${(val/100000).toFixed(2)} L`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Aging Report (Overdue > 30 Days)</h3>
                            <button className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Export List</button>
                        </div>
                        <div className="overflow-y-auto max-h-64">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Customer</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {overdueBookings.map(b => {
                                        const overdueItems = b.paymentSchedule.filter(p => p.status === PaymentStatus.OVERDUE);
                                        const amt = overdueItems.reduce((s, p) => s + p.amount, 0);
                                        return (
                                            <tr key={b.id}>
                                                <td className="px-4 py-3 font-medium text-slate-800">{b.customerName} <span className="text-xs text-slate-400 block">{b.unitNumber}</span></td>
                                                <td className="px-4 py-3 text-red-600 font-bold">₹{amt.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => alert(`Sending Notice to ${b.customerName}`)} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold">Call</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {overdueBookings.length === 0 && (
                                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No overdue payments. Good job!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: BOOKINGS (DETAIL MODE) */}
        {activeView === 'bookings' && (
            <div className="flex h-full">
                {/* Left List */}
                <div className="w-80 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
                     <div className="overflow-y-auto flex-1">
                        {filteredBookingsList.map(booking => (
                            <div 
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`p-4 border-b border-slate-100 cursor-pointer transition hover:bg-slate-50 ${selectedBooking?.id === booking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                            >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-slate-800 text-sm">{booking.unitNumber}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    booking.handoverStatus === 'Pending Welcome' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                    booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-blue-50 text-blue-700'
                                }`}>
                                {booking.status === 'Active' ? booking.handoverStatus : booking.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 truncate">{booking.customerName}</p>
                            <p className="text-xs text-slate-500 mt-1">{booking.project}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Workspace */}
                {selectedBooking ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                         {/* Booking Header */}
                         <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        {selectedBooking.customerName}
                                        {selectedBooking.handoverStatus === 'Pending Welcome' && (
                                            <button onClick={() => initiateWelcome(selectedBooking)} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full animate-pulse hover:bg-orange-600 transition">
                                                Complete Welcome Call
                                            </button>
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {selectedBooking.project}, Unit {selectedBooking.unitNumber}</span>
                                        <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedBooking.mobile}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="text-xs text-slate-400 font-bold uppercase">Total Agreement Value</p>
                                     <p className="text-xl font-bold text-slate-900">₹{selectedBooking.totalCost.toLocaleString()}</p>
                                </div>
                             </div>
                             
                             {/* Internal Tabs */}
                             <div className="flex gap-6 mt-6 border-b border-slate-100 overflow-x-auto">
                                {['overview', 'payments', 'documents', 'support', 'handover'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setBookingTab(tab as any)}
                                        className={`pb-3 text-sm font-medium border-b-2 capitalize transition whitespace-nowrap ${bookingTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab === 'handover' ? 'Handover & Possession' : tab}
                                    </button>
                                ))}
                             </div>
                         </div>

                         {/* Booking Content */}
                         <div className="flex-1 overflow-y-auto p-6">
                             {selectedBooking.status === 'Cancelled' && (
                                 <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-red-800">
                                     <XCircle className="w-6 h-6" />
                                     <div>
                                         <h4 className="font-bold">Booking Cancelled</h4>
                                         <p className="text-xs">Refund Processed: ₹{selectedBooking.cancellation?.refundAmount.toLocaleString()} | Forfeited: ₹{selectedBooking.cancellation?.forfeitureAmount.toLocaleString()}</p>
                                     </div>
                                 </div>
                             )}

                             {/* TAB: OVERVIEW */}
                             {bookingTab === 'overview' && (
                                 <div className="max-w-4xl mx-auto space-y-6">
                                     {/* Loan Status Card */}
                                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                         <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                         <div className="flex justify-between items-start mb-4">
                                             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                 <Landmark className="w-5 h-5 text-indigo-600" /> Loan Details
                                             </h3>
                                             {selectedBooking.loanDetails ? (
                                                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                     selectedBooking.loanDetails.status === 'Sanctioned' ? 'bg-green-100 text-green-700' :
                                                     selectedBooking.loanDetails.status === 'Applied' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                                                 }`}>
                                                     {selectedBooking.loanDetails.status}
                                                 </span>
                                             ) : (
                                                 <button className="text-xs text-blue-600 hover:underline">+ Add Loan Info</button>
                                             )}
                                         </div>
                                         {selectedBooking.loanDetails ? (
                                             <div className="grid grid-cols-3 gap-4 text-sm">
                                                 <div><span className="block text-slate-400 text-xs">Banker</span> <span className="font-medium">{selectedBooking.loanDetails.bankName}</span></div>
                                                 <div><span className="block text-slate-400 text-xs">Sanction Amount</span> <span className="font-medium">₹{selectedBooking.loanDetails.sanctionAmount.toLocaleString()}</span></div>
                                                 <div><span className="block text-slate-400 text-xs">Date Applied</span> <span className="font-medium">{selectedBooking.loanDetails.applicationDate}</span></div>
                                             </div>
                                         ) : (
                                             <p className="text-sm text-slate-400 italic">No loan details recorded. Customer might be self-funding.</p>
                                         )}
                                     </div>

                                     {/* Modifications Card */}
                                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                         <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <PenTool className="w-4 h-4 text-orange-600" /> Modifications / Extras
                                            </h3>
                                            <button onClick={() => setShowModModal(true)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Add Request</button>
                                         </div>
                                         {selectedBooking.modifications.length > 0 ? (
                                             <div className="space-y-3">
                                                 {selectedBooking.modifications.map(mod => (
                                                     <div key={mod.id} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                                                         <div>
                                                             <p className="text-sm font-medium text-slate-800">{mod.description}</p>
                                                             <p className="text-xs text-slate-500">Status: {mod.status}</p>
                                                         </div>
                                                         <div className="text-right">
                                                             <p className="text-sm font-bold text-slate-800">₹{mod.cost.toLocaleString()}</p>
                                                             {mod.addedToDemand ? (
                                                                 <span className="text-[10px] text-green-600 flex items-center gap-1 justify-end"><CheckCircle className="w-3 h-3" /> Added to Demand</span>
                                                             ) : (
                                                                 <span className="text-[10px] text-orange-500">Pending Billing</span>
                                                             )}
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         ) : (
                                             <p className="text-sm text-slate-400 italic">No modification requests active.</p>
                                         )}
                                     </div>

                                     {/* Transfer History */}
                                     {selectedBooking.transferHistory && selectedBooking.transferHistory.length > 0 && (
                                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                 <Users className="w-4 h-4 text-blue-600" /> Ownership Transfer History
                                             </h3>
                                             <div className="space-y-3">
                                                 {selectedBooking.transferHistory.map(th => (
                                                     <div key={th.id} className="text-sm bg-slate-50 p-3 rounded border border-slate-100">
                                                         <p className="font-bold text-slate-700">Transferred from {th.originalName} to {th.newName}</p>
                                                         <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                             <span>Relation: {th.relationship}</span>
                                                             <span>Fee: ₹{th.transferFee.toLocaleString()}</span>
                                                             <span>Date: {new Date(th.requestDate).toLocaleDateString()}</span>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     )}

                                     {/* Actions Zone */}
                                     {selectedBooking.status === 'Active' && (
                                         <div className="flex gap-4 pt-6 border-t border-slate-200">
                                             <button onClick={() => setShowTransferModal(true)} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
                                                 <Users className="w-4 h-4" /> Transfer Ownership
                                             </button>
                                             <button onClick={openCancelModal} className="flex-1 py-3 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
                                                 <XCircle className="w-4 h-4" /> Request Cancellation
                                             </button>
                                         </div>
                                     )}
                                 </div>
                             )}

                             {/* TAB: PAYMENTS */}
                             {bookingTab === 'payments' && (
                                 <div className="max-w-5xl mx-auto space-y-6">
                                     {/* TDS Monitor */}
                                     <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
                                         <div className="flex items-center gap-3">
                                             <FileCheck className="w-8 h-8 text-purple-600" />
                                             <div>
                                                 <h3 className="font-bold text-purple-900 text-sm">TDS Compliance (Section 194-IA)</h3>
                                                 <p className="text-xs text-purple-700">For property > 50L, ensure 1% TDS is paid to Govt.</p>
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-3">
                                             {selectedBooking.tdsCompliant ? (
                                                 <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-white px-3 py-1 rounded border border-green-200"><CheckCircle className="w-4 h-4" /> Compliant</span>
                                             ) : (
                                                 <button className="px-4 py-2 bg-white text-purple-700 border border-purple-200 text-xs font-bold rounded hover:bg-purple-100">Upload Form 16B</button>
                                             )}
                                         </div>
                                     </div>

                                     {/* Payment Schedule Table */}
                                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                         <table className="w-full text-left text-sm">
                                             <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                                 <tr>
                                                     <th className="px-6 py-3">Milestone</th>
                                                     <th className="px-6 py-3">Amount</th>
                                                     <th className="px-6 py-3">Status</th>
                                                     <th className="px-6 py-3 text-right">Action</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-slate-100">
                                                 {selectedBooking.paymentSchedule.map(pm => (
                                                     <tr key={pm.id} className="hover:bg-slate-50">
                                                         <td className="px-6 py-4">
                                                             <p className="font-medium text-slate-800">{pm.name}</p>
                                                             <p className="text-xs text-slate-500">Due: {new Date(pm.dueDate).toLocaleDateString()}</p>
                                                         </td>
                                                         <td className="px-6 py-4">
                                                             <p className="font-medium text-slate-800">₹{pm.amount.toLocaleString()}</p>
                                                             {(pm.penalty || pm.interest) && (
                                                                 <p className="text-xs text-red-500">+ ₹{((pm.penalty||0) + (pm.interest||0)).toLocaleString()} Interest</p>
                                                             )}
                                                         </td>
                                                         <td className="px-6 py-4">
                                                             <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                                 pm.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                                 pm.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                                 pm.status === 'Due' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                                             }`}>
                                                                 {pm.status}
                                                             </span>
                                                         </td>
                                                         <td className="px-6 py-4 text-right space-x-2">
                                                             {pm.status !== 'Paid' && selectedBooking.status === 'Active' && (
                                                                 <>
                                                                    <button onClick={() => handleGenerateDemand(pm, selectedBooking)} className="text-blue-600 hover:underline text-xs font-bold">Demand</button>
                                                                    <span className="text-slate-300">|</span>
                                                                    <button onClick={() => handleRecordPayment(pm)} className="text-green-600 hover:underline text-xs font-bold">Pay</button>
                                                                 </>
                                                             )}
                                                             {pm.status === 'Paid' && <CheckCircle className="w-4 h-4 text-green-500 inline" />}
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             )}

                            {/* TAB: DOCUMENTS */}
                            {bookingTab === 'documents' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div onClick={() => handleGenerateDoc('Agreement to Sale')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group text-center">
                                            <FileText className="w-10 h-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition" />
                                            <h3 className="font-bold text-slate-800">Generate Agreement</h3>
                                            <p className="text-xs text-slate-500 mt-1">Auto-fill template with customer data</p>
                                        </div>
                                        <div onClick={() => handleGenerateDoc('Demand Letter')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group text-center">
                                            <Mail className="w-10 h-10 text-orange-500 mx-auto mb-3 group-hover:scale-110 transition" />
                                            <h3 className="font-bold text-slate-800">Generate Demand Letter</h3>
                                            <p className="text-xs text-slate-500 mt-1">Create PDF for current due milestones</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                            <span className="font-bold text-slate-700">Document History</span>
                                            <button onClick={handleESign} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-2 hover:bg-indigo-700">
                                                <FileSignature className="w-3 h-3" /> Send for e-Sign
                                            </button>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {selectedBooking.documents.map(doc => (
                                                <div key={doc.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500"><FileText className="w-4 h-4" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                                                            <p className="text-xs text-slate-400">{doc.generatedAt}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded">{doc.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SUPPORT */}
                            {bookingTab === 'support' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800">Active Tickets</h3>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-md">
                                            + Raise Ticket
                                        </button>
                                    </div>
                                    {selectedBooking.tickets.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedBooking.tickets.map(ticket => (
                                                <div key={ticket.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{ticket.id}</span>
                                                            <h4 className="font-bold text-slate-800">{ticket.subject}</h4>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-4">{ticket.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-3">
                                                        <span>Created: {ticket.createdAt}</span>
                                                        <span>Priority: {ticket.priority}</span>
                                                        <button className="text-blue-600 font-bold hover:underline ml-auto">Reply to Customer</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">No active support tickets.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: HANDOVER & POSSESSION (NEW) */}
                            {bookingTab === 'handover' && (
                                <div className="max-w-4xl mx-auto space-y-8">
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h2 className="text-2xl font-bold mb-2">Key Handover Gatekeeper</h2>
                                            <p className="opacity-90">Ensure 100% Compliance before releasing possession.</p>
                                        </div>
                                        <Key className="absolute right-8 top-1/2 transform -translate-y-1/2 w-32 h-32 text-white opacity-10" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* 1. Checklist */}
                                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Pre-Possession Checklist</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Total Payment Received</span>
                                                    {selectedBooking.possessionChecklist?.paymentCleared ? (
                                                        <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cleared</span>
                                                    ) : (
                                                        <span className="text-red-500 font-bold text-sm flex items-center gap-1"><XCircle className="w-4 h-4" /> Pending</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Agreement Registered</span>
                                                    {selectedBooking.documents.some(d => d.name.includes('Agreement') && d.status === 'Registered') ? (
                                                        <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Done</span>
                                                    ) : (
                                                        <span className="text-orange-500 font-bold text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Pending</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Snagging Points Closed</span>
                                                    {selectedBooking.possessionChecklist?.snaggingCleared ? (
                                                        <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cleared</span>
                                                    ) : (
                                                        <button className="text-blue-600 text-xs underline hover:text-blue-800">Check Snag List</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Actions */}
                                        <div className="space-y-4">
                                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                                <h3 className="font-bold text-slate-800 mb-2">Step 1: No Dues Certificate</h3>
                                                <p className="text-xs text-slate-500 mb-4">Generate only if balance is 0.</p>
                                                <button 
                                                    onClick={generateNDC}
                                                    disabled={selectedBooking.possessionChecklist?.ndcIssued}
                                                    className="w-full py-2 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400"
                                                >
                                                    {selectedBooking.possessionChecklist?.ndcIssued ? 'NDC Issued' : 'Generate NDC'}
                                                </button>
                                            </div>

                                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                                <h3 className="font-bold text-slate-800 mb-2">Step 2: Possession Letter</h3>
                                                <p className="text-xs text-slate-500 mb-4">Requires NDC & Snagging Clearance.</p>
                                                <button 
                                                    onClick={issuePossessionLetter}
                                                    disabled={selectedBooking.handoverStatus === 'Handed Over'}
                                                    className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {selectedBooking.handoverStatus === 'Handed Over' ? 'Possession Given' : 'Issue Possession Letter'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                         </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-slate-400 bg-slate-50">
                        <div className="bg-white p-8 rounded-full shadow-sm mb-4">
                            <Building className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-600">Select a customer to view details</p>
                    </div>
                )}
            </div>
        )}

        {/* WELCOME CALL WIZARD */}
        {showWelcomeModal && selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
                    <div className="bg-slate-900 text-white p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <UserPlus className="w-6 h-6" /> Welcome Ritual
                        </h2>
                        <p className="text-slate-400 text-sm">Onboarding {selectedBooking.customerName}</p>
                    </div>
                    
                    <div className="p-8">
                        {/* Progress */}
                        <div className="flex gap-2 mb-8">
                            {[1,2,3,4].map(step => (
                                <div key={step} className={`h-2 flex-1 rounded-full ${step <= welcomeStep ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                            ))}
                        </div>

                        {welcomeStep === 1 && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-xl font-bold text-slate-800">1. Verify Identity</h3>
                                <p className="text-slate-600">"Sir/Ma'am, for our records, I am verifying the spelling of your name for the Agreement."</p>
                                <div className="bg-slate-100 p-4 rounded-xl text-lg font-mono font-bold text-slate-800">
                                    {selectedBooking.customerName}
                                </div>
                                <div className="flex justify-center gap-4 pt-4">
                                    <button className="text-red-500 font-bold text-sm hover:underline">Edit Name</button>
                                    <button onClick={() => setWelcomeStep(2)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Confirm Correct</button>
                                </div>
                            </div>
                        )}

                        {welcomeStep === 2 && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-xl font-bold text-slate-800">2. KYC Check</h3>
                                <p className="text-slate-600">"I see your Pan Card is uploaded. We need a photo of the co-applicant."</p>
                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm">
                                    <div className="border p-3 rounded flex justify-between items-center">
                                        <span>Pan Card</span> <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="border p-3 rounded flex justify-between items-center">
                                        <span>Aadhaar</span> <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>
                                <button onClick={() => setWelcomeStep(3)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 mt-4">Next Step</button>
                            </div>
                        )}

                        {welcomeStep === 3 && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-xl font-bold text-slate-800">3. Payment Roadmap</h3>
                                <p className="text-slate-600">"Your next milestone payment is due on {selectedBooking.paymentSchedule.find(p => p.status === 'Upcoming')?.dueDate || 'Coming Soon'}."</p>
                                <button onClick={() => setWelcomeStep(4)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 mt-4">Acknowledge</button>
                            </div>
                        )}

                        {welcomeStep === 4 && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-xl font-bold text-slate-800">4. App Handover</h3>
                                <p className="text-slate-600">"I have sent your Customer App Login ID & Password to your WhatsApp."</p>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 inline-block">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                    <p className="text-green-800 font-bold">Credentials Sent!</p>
                                </div>
                                <div className="pt-6">
                                    <button onClick={completeWelcome} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800">
                                        Accept Handover & Activate
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* TRANSFER MODAL */}
        {showTransferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl w-full max-w-md p-6 animate-slide-up">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Transfer Ownership (TON)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Owner Name</label>
                            <input type="text" className="w-full p-2 border rounded" value={transferData.newName} onChange={e => setTransferData({...transferData, newName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Relationship</label>
                            <input type="text" className="w-full p-2 border rounded" value={transferData.relationship} onChange={e => setTransferData({...transferData, relationship: e.target.value})} placeholder="Brother, Spouse..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transfer Fee</label>
                            <input type="number" className="w-full p-2 border rounded" value={transferData.fee} onChange={e => setTransferData({...transferData, fee: Number(e.target.value)})} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowTransferModal(false)} className="flex-1 py-2 border rounded text-slate-600 font-bold">Cancel</button>
                            <button onClick={handleTransfer} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">Approve Transfer</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* MODIFICATION MODAL */}
        {showModModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl w-full max-w-md p-6 animate-slide-up">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Request Modification</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                            <textarea className="w-full p-2 border rounded" rows={3} value={modData.desc} onChange={e => setModData({...modData, desc: e.target.value})} placeholder="e.g. Break kitchen wall..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Cost (₹)</label>
                            <input type="number" className="w-full p-2 border rounded" value={modData.cost} onChange={e => setModData({...modData, cost: Number(e.target.value)})} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModModal(false)} className="flex-1 py-2 border rounded text-slate-600 font-bold">Cancel</button>
                            <button onClick={handleModification} className="flex-1 py-2 bg-orange-600 text-white rounded font-bold">Submit to Architect</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* CANCELLATION MODAL */}
        {showCancelModal && selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                    <div className="p-6 border-b border-red-100 bg-red-50 flex items-center gap-3 text-red-800">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="font-bold text-lg">Confirm Cancellation</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Cancellation</label>
                            <select 
                                className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                                value={cancelReason}
                                onChange={(e) => {
                                    setCancelReason(e.target.value);
                                    // Recalculate logic based on reason
                                    const totalPaid = selectedBooking.amountPaid;
                                    const forfeitPercent = e.target.value === 'Loan Rejected' ? 0 : 0.10;
                                    const forfeiture = Math.round(totalPaid * forfeitPercent);
                                    setRefundCalc({ ...refundCalc, forfeiture, refund: totalPaid - forfeiture });
                                }}
                            >
                                <option>Personal Reason</option>
                                <option>Loan Rejected</option>
                                <option>Financial Issue</option>
                                <option>Better Option Found</option>
                                <option>Force Majeure</option>
                            </select>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Amount Paid</span>
                                <span className="font-bold text-slate-800">₹{refundCalc.paid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Less: Forfeiture ({cancelReason === 'Loan Rejected' ? '0%' : '10%'})</span>
                                <span className="font-bold">- ₹{refundCalc.forfeiture.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Less: GST Reversal</span>
                                <span className="font-bold">- ₹{refundCalc.gst.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-lg text-emerald-600">
                                <span>Refundable Amount</span>
                                <span>₹{refundCalc.refund.toLocaleString()}</span>
                            </div>
                        </div>

                        {selectedBooking.channelPartnerId && (
                            <div className="bg-orange-50 p-3 rounded border border-orange-200 text-xs text-orange-800">
                                <strong>Brokerage Alert:</strong> This deal was sourced by {selectedBooking.channelPartnerName}. A debit note will be raised to claw back any paid commission.
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded">Cancel</button>
                        <button onClick={confirmCancellation} className="px-6 py-2 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700">Process Cancellation</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default BookingModule;
