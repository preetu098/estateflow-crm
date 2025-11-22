
import React, { useState } from 'react';
import { Booking, Project, ConstructionUpdate, Referral, PaymentStatus, PaymentMilestone } from '../types';
import { Home, Wallet, UserPlus, FileText, MessageCircle, Bell, ChevronRight, Download, Upload, IndianRupee, CheckCircle, Clock, Gift, Send, X, ShieldCheck } from 'lucide-react';

interface CustomerPortalProps {
    bookings: Booking[];
    projects: Project[];
    constructionLogs: ConstructionUpdate[];
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ bookings, projects, constructionLogs }) => {
    // Default to first booking for simulation
    const booking = bookings[0];
    const [activeTab, setActiveTab] = useState<'home' | 'money' | 'refer' | 'docs' | 'help'>('money'); // Default to Money for demo
    
    // Receipt View State
    const [viewingReceipt, setViewingReceipt] = useState<PaymentMilestone | null>(null);

    // Mock Referral State
    const [referrals, setReferrals] = useState<Referral[]>([
        { id: 'r1', name: 'Amit Cousin', mobile: '9988776655', status: 'Site Visit', rewardAmount: 500, date: '2024-10-20' },
        { id: 'r2', name: 'Suresh Colleague', mobile: '8877665544', status: 'Booked', rewardAmount: 25000, date: '2024-10-15' }
    ]);
    
    // Simulate Payment Logic
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);

    if (!booking) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-100 text-slate-400 p-8 text-center">
                <p>No active bookings found. Simulate a sale in "Sales Center" first.</p>
            </div>
        );
    }

    const project = projects.find(p => p.name === booking.project);
    const projectLogs = constructionLogs.filter(l => l.projectId === project?.id).sort((a,b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime());

    const totalPaid = booking.paymentSchedule.filter(p => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0);
    const nextDue = booking.paymentSchedule.find(p => p.status === PaymentStatus.DUE || p.status === PaymentStatus.OVERDUE);

    const handlePay = (milestoneId: string) => {
        setProcessingPayment(milestoneId);
        setTimeout(() => {
            alert("Payment Gateway Simulation: Payment Successful!");
            setProcessingPayment(null);
        }, 1500);
    };

    return (
        <div className="h-full flex items-center justify-center bg-slate-200 p-4 overflow-y-auto">
            {/* Phone Frame */}
            <div className="w-[375px] h-[812px] bg-white rounded-[40px] border-8 border-slate-800 overflow-hidden relative flex flex-col shadow-2xl">
                
                {/* Dynamic Island */}
                <div className="h-12 bg-white flex items-center justify-between px-6 text-xs font-bold text-slate-800 z-10">
                    <span>9:41</span>
                    <div className="w-20 h-6 bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                    <div className="flex gap-1">
                        <div className="w-4 h-3 bg-slate-800 rounded-sm"></div>
                        <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                    </div>
                </div>

                {/* App Header */}
                <div className="px-5 py-3 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <p className="text-xs text-slate-400">Welcome Home,</p>
                        <h2 className="font-bold text-lg text-slate-800">{booking.customerName.split(' ')[0]}</h2>
                    </div>
                    <button className="p-2 bg-slate-100 rounded-full relative">
                        <Bell className="w-5 h-5 text-slate-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 custom-scrollbar">
                    
                    {/* TAB: HOME */}
                    {activeTab === 'home' && (
                        <div className="p-5 space-y-6">
                            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-xl"></div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{booking.project}</p>
                                <h1 className="text-3xl font-bold mb-4">{booking.unitNumber}</h1>
                                <div className="flex gap-4 text-xs text-slate-300">
                                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">{booking.carpetArea}</div>
                                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">{booking.tower}</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> Timeline</h3>
                                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                    {projectLogs.map(log => (
                                        <div key={log.id} className="relative pl-6">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full z-10"></div>
                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-slate-700">{log.milestoneName}</span>
                                                    <span className="text-[10px] text-slate-400">{log.updateDate}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{log.percentageComplete}% Complete</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MONEY */}
                    {activeTab === 'money' && (
                        <div className="p-5 space-y-6">
                            <h3 className="font-bold text-xl text-slate-800">Financials</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Total Cost</p>
                                    <p className="text-lg font-bold text-slate-800">₹{(booking.totalCost/100000).toFixed(1)}L</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Paid</p>
                                    <p className="text-lg font-bold text-emerald-600">₹{(totalPaid/100000).toFixed(1)}L</p>
                                </div>
                            </div>

                            {/* NEXT DUE */}
                            {nextDue && (
                                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Payment Due</span>
                                        <span className="text-xs text-red-500 font-bold">by {nextDue.dueDate}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-red-900 mb-1">{nextDue.name}</h4>
                                    <p className="text-2xl font-bold text-slate-900 mb-4">₹{nextDue.amount.toLocaleString()}</p>
                                    <button 
                                        onClick={() => handlePay(nextDue.id)}
                                        disabled={!!processingPayment}
                                        className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-red-700 transition shadow-lg shadow-red-200"
                                    >
                                        {processingPayment === nextDue.id ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </div>
                            )}

                            {/* PAYMENT HISTORY WITH RECEIPTS */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-600 mb-3">Payment History</h4>
                                <div className="space-y-2">
                                    {booking.paymentSchedule.filter(p => p.status === 'Paid').map(p => (
                                        <div key={p.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition cursor-pointer group" onClick={() => setViewingReceipt(p)}>
                                            <div>
                                                <p className="font-bold text-xs text-slate-700">{p.name}</p>
                                                <p className="text-[10px] text-slate-400">Paid on {p.paidDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xs text-emerald-600">₹{p.amount.toLocaleString()}</p>
                                                <span className="text-[10px] text-blue-600 font-bold underline group-hover:text-blue-800 flex items-center gap-1 justify-end">
                                                    View Receipt <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: REFER */}
                    {activeTab === 'refer' && (
                        <div className="p-5 space-y-6">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                                <Gift className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-20" />
                                <h2 className="text-2xl font-bold mb-1">Refer & Earn</h2>
                                <p className="text-sm text-purple-100 opacity-90 mb-4">Get 1% Cashback per referral!</p>
                                <button className="w-full bg-white text-purple-700 py-2 rounded-lg font-bold text-xs shadow-md">Share Link</button>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-700 mb-3">Referral Status</h3>
                                {referrals.map(ref => (
                                    <div key={ref.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-2">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-800">{ref.name}</h4>
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">{ref.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: DOCS */}
                    {activeTab === 'docs' && (
                        <div className="p-5 space-y-6">
                            <h3 className="font-bold text-xl text-slate-800">Documents</h3>
                            <div className="bg-white rounded-xl border border-slate-200">
                                {booking.documents.map(doc => (
                                    <div key={doc.id} className="p-4 flex items-center justify-between border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500"><FileText className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400">{doc.generatedAt}</p>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Tab Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 pb-6 px-6 flex justify-between items-center z-20">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <Home className="w-6 h-6" /> <span className="text-[10px]">Home</span>
                    </button>
                    <button onClick={() => setActiveTab('money')} className={`flex flex-col items-center gap-1 ${activeTab === 'money' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <IndianRupee className="w-6 h-6" /> <span className="text-[10px]">Money</span>
                    </button>
                    <button onClick={() => setActiveTab('refer')} className={`flex flex-col items-center gap-1 -mt-6`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${activeTab === 'refer' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                            <Gift className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-slate-600 mt-1">Refer</span>
                    </button>
                    <button onClick={() => setActiveTab('docs')} className={`flex flex-col items-center gap-1 ${activeTab === 'docs' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <FileText className="w-6 h-6" /> <span className="text-[10px]">Docs</span>
                    </button>
                    <button onClick={() => setActiveTab('help')} className={`flex flex-col items-center gap-1 ${activeTab === 'help' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <MessageCircle className="w-6 h-6" /> <span className="text-[10px]">Help</span>
                    </button>
                </div>

            </div>

            {/* RECEIPT MODAL */}
            {viewingReceipt && (
                <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-6 text-white text-center relative">
                            <button 
                                onClick={() => setViewingReceipt(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-900/50">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold">Payment Receipt</h3>
                            <p className="text-xs text-slate-300 opacity-80">Official Transaction Record</p>
                        </div>
                        
                        <div className="p-6 space-y-4 relative bg-white">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                                <ShieldCheck className="w-64 h-64" />
                            </div>

                            <div className="text-center border-b border-slate-100 pb-4">
                                <p className="text-3xl font-bold text-slate-800">₹{viewingReceipt.amount.toLocaleString()}</p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-xs text-green-600 font-bold uppercase">Payment Verified</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Receipt No</span>
                                    <span className="font-mono font-bold text-slate-700">RCP-{viewingReceipt.id.split('-')[1] || '001'}-24</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Transaction Date</span>
                                    <span className="font-medium text-slate-700">{viewingReceipt.paidDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Transaction ID</span>
                                    <span className="font-mono text-slate-700">{viewingReceipt.transactionId || 'TXN-88329'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Project Name</span>
                                    <span className="font-medium text-slate-700 text-right">{booking.project}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Unit Number</span>
                                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{booking.unitNumber}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-dashed border-slate-200">
                                    <span className="text-slate-500">Paid For</span>
                                    <span className="font-bold text-slate-800">{viewingReceipt.name}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500 text-center mt-4 leading-tight">
                                This is a computer generated receipt. Valid for financial records. 
                                <br/>CIN: U45200MH2023PTC123456
                            </div>

                            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition active:scale-95">
                                <Download className="w-4 h-4" /> Download Official PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPortal;
