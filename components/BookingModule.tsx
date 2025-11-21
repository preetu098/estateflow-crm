
import React, { useState, useEffect } from 'react';
import { Booking, PaymentStatus, PaymentMilestone, ProjectMilestone, ServiceTicket, LoanDetails } from '../types';
import { MOCK_PROJECT_MILESTONES, INITIAL_PROJECTS } from '../constants';
import { 
  Search, FileText, Wallet, Calendar, CheckCircle, AlertCircle, 
  Download, Mail, Printer, ChevronRight, Building, DollarSign, Phone, 
  Briefcase, PenTool, HardHat, Ticket, CheckSquare, RefreshCw, Landmark, FileCheck, MessageCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface BookingModuleProps {
    bookings: Booking[];
}

const BookingModule: React.FC<BookingModuleProps> = ({ bookings }) => {
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>(MOCK_PROJECT_MILESTONES);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'bookings' | 'milestones' | 'tickets'>('dashboard');
  const [bookingTab, setBookingTab] = useState<'overview' | 'payments' | 'documents' | 'support'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure state updates if props change (e.g. new sale)
  useEffect(() => {
      // Optional: If we had local state derived from props, we'd update it here. 
      // Currently using props directly for display.
  }, [bookings]);

  // --- Helper Functions ---

  const handleGenerateDemand = (milestone: PaymentMilestone, booking: Booking) => {
    alert(`Generating Demand Letter for ${booking.customerName} - ${milestone.name} (₹${milestone.amount.toLocaleString()})\nSending via Email & WhatsApp...`);
  };

  const handleRecordPayment = (milestone: PaymentMilestone) => {
    const amount = prompt(`Enter amount received for ${milestone.name}:`, milestone.amount.toString());
    if (amount) alert(`Payment of ₹${amount} recorded successfully!`);
  };

  const handleGenerateDoc = (docName: string) => {
    alert(`Generating ${docName} using template variables...\n{Customer_Name}, {Unit_No} auto-filled.\nPDF Download started.`);
  };

  const handleMarkProjectMilestone = (milestone: ProjectMilestone) => {
      if (confirm(`Mark '${milestone.name}' as COMPLETE for Project? \n\nThis will automatically RAISE DEMAND for all linked bookings.`)) {
          // 1. Update Milestone Status
          setProjectMilestones(prev => prev.map(pm => pm.id === milestone.id ? { ...pm, completed: true, completionDate: new Date().toISOString().split('T')[0] } : pm));
          alert(`Success! Demand raised for customers linked to ${milestone.name}.`);
      }
  };

  // --- Dashboard Stats Calculation ---
  const totalCollection = bookings.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalValue = bookings.reduce((sum, b) => sum + b.totalCost, 0);
  const outstanding = totalValue - totalCollection;
  
  // Overdue buckets
  const overdueBookings = bookings.filter(b => b.paymentSchedule.some(p => p.status === PaymentStatus.OVERDUE));
  const totalOverdueAmount = overdueBookings.reduce((sum, b) => 
      sum + b.paymentSchedule.filter(p => p.status === PaymentStatus.OVERDUE).reduce((s, p) => s + p.amount, 0)
  , 0);

  // Mock Chart Data
  const cashFlowData = [
      { name: 'Collected', value: totalCollection },
      { name: 'Outstanding', value: outstanding }
  ];
  const COLORS = ['#10b981', '#f97316'];

  const filteredBookingsList = bookings.filter(b => 
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
                {activeView === 'dashboard' && 'Collections & Cashflow'}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500">Total Receivables</p>
                        <p className="text-2xl font-bold text-slate-800 mt-2">₹{(totalValue / 10000000).toFixed(2)} Cr</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500">Total Collected</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">₹{(totalCollection / 10000000).toFixed(2)} Cr</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <p className="text-sm font-medium text-slate-500">Total Outstanding</p>
                         <p className="text-2xl font-bold text-orange-500 mt-2">₹{(outstanding / 10000000).toFixed(2)} Cr</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                        <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Critical Overdue
                        </p>
                        <p className="text-2xl font-bold text-red-600 mt-2">₹{(totalOverdueAmount / 100000).toFixed(2)} L</p>
                        <p className="text-xs text-red-500 mt-1">{overdueBookings.length} Customers > 30 Days</p>
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
                            <h3 className="font-bold text-slate-800">Aging Report (Overdue)</h3>
                            <button className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Export PDF</button>
                        </div>
                        <div className="overflow-y-auto max-h-64">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Customer</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Days Late</th>
                                        <th className="px-4 py-2 text-right">Action</th>
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
                                                <td className="px-4 py-3"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold">32 Days</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => alert(`Sending Notice to ${b.customerName}`)} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold">Send Notice</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {overdueBookings.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No overdue payments. Good job!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: MILESTONES */}
        {activeView === 'milestones' && (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3">
                        <HardHat className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-blue-800">Project Construction Switchboard</h3>
                            <p className="text-sm text-blue-600">Updating a milestone here will automatically generate Demand Letters for all eligible customers in that project.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {INITIAL_PROJECTS.map(project => {
                            const milestones = projectMilestones.filter(pm => pm.projectId === project.id);
                            if(milestones.length === 0) return null;

                            return (
                                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">{project.name}</h3>
                                        <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{milestones.filter(m => m.completed).length}/{milestones.length} Completed</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {milestones.map(ms => (
                                            <div key={ms.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ms.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {ms.completed ? <CheckCircle className="w-5 h-5" /> : <HardHat className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-medium ${ms.completed ? 'text-slate-800' : 'text-slate-500'}`}>{ms.name}</h4>
                                                        {ms.completed && <p className="text-xs text-green-600">Completed on {ms.completionDate}</p>}
                                                    </div>
                                                </div>
                                                {ms.completed ? (
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100">Demands Raised</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleMarkProjectMilestone(ms)}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-200 transition flex items-center gap-2"
                                                    >
                                                        Mark Complete & Raise Demand
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: TICKETS */}
        {activeView === 'tickets' && (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="font-bold text-lg text-slate-700">Customer Support Tickets</h2>
                     <div className="flex gap-2">
                         <select className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"><option>All Status</option><option>Open</option></select>
                     </div>
                 </div>
                 
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-3">Ticket ID</th>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Priority</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bookings.flatMap(b => b.tickets.map(t => ({...t, customer: b.customerName, bookingId: b.id}))).map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{ticket.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{ticket.subject}</td>
                                    <td className="px-6 py-4 text-slate-600">{ticket.customer}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.priority === 'High' ? 'text-orange-600 bg-orange-50' : 'text-slate-600 bg-slate-100'}`}>{ticket.priority}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                             {bookings.every(b => b.tickets.length === 0) && (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No support tickets found.</td></tr>
                            )}
                        </tbody>
                    </table>
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
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${booking.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700'}`}>
                                {booking.status}
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
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedBooking.customerName}</h2>
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
                             <div className="flex gap-6 mt-6 border-b border-slate-100">
                                {['overview', 'payments', 'documents', 'support'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setBookingTab(tab as any)}
                                        className={`pb-3 text-sm font-medium border-b-2 capitalize transition ${bookingTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                             </div>
                         </div>

                         {/* Booking Content */}
                         <div className="flex-1 overflow-y-auto p-6">
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
                                            <button className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Add Request</button>
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
                                                             {pm.status !== 'Paid' && (
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
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Document History</div>
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

      </div>
    </div>
  );
};

export default BookingModule;
