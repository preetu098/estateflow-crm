
import React, { useState } from 'react';
import { Booking, Project, ConstructionUpdate, Referral, PaymentStatus } from '../types';
import { Home, Wallet, UserPlus, FileText, MessageCircle, Bell, ChevronRight, Download, Upload, IndianRupee, CheckCircle, Clock, Gift, Send } from 'lucide-react';

interface CustomerPortalProps {
    bookings: Booking[];
    projects: Project[];
    constructionLogs: ConstructionUpdate[];
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ bookings, projects, constructionLogs }) => {
    // Default to first booking for simulation
    const booking = bookings[0];
    const [activeTab, setActiveTab] = useState<'home' | 'money' | 'refer' | 'docs' | 'help'>('home');
    
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
    const outstanding = booking.totalCost - totalPaid;
    const nextDue = booking.paymentSchedule.find(p => p.status === PaymentStatus.DUE || p.status === PaymentStatus.OVERDUE);

    const handleSimulateReferralProgress = (id: string) => {
        setReferrals(prev => prev.map(r => {
            if (r.id === id) {
                if (r.status === 'Sent') return { ...r, status: 'Site Visit', rewardAmount: 500 };
                if (r.status === 'Site Visit') return { ...r, status: 'Booked', rewardAmount: 25000 };
                if (r.status === 'Booked') return { ...r, status: 'Agreement Done', rewardAmount: 25000 };
            }
            return r;
        }));
    };

    const handlePay = (milestoneId: string) => {
        setProcessingPayment(milestoneId);
        setTimeout(() => {
            alert("Payment Gateway Simulation: Payment Successful!");
            setProcessingPayment(null);
            // In a real app, this would update the backend. Here we just simulate success UI.
        }, 1500);
    };

    return (
        <div className="h-full flex items-center justify-center bg-slate-200 p-4 overflow-y-auto">
            {/* Phone Frame */}
            <div className="w-[375px] h-[812px] bg-white rounded-[40px] border-8 border-slate-800 overflow-hidden relative flex flex-col shadow-2xl">
                
                {/* Dynamic Island / Status Bar */}
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

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 custom-scrollbar">
                    
                    {/* TAB: HOME */}
                    {activeTab === 'home' && (
                        <div className="p-5 space-y-6">
                            {/* Unit Card */}
                            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-xl"></div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{booking.project}</p>
                                <h1 className="text-3xl font-bold mb-4">{booking.unitNumber}</h1>
                                <div className="flex gap-4 text-xs text-slate-300">
                                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">{booking.carpetArea}</div>
                                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">{booking.tower}</div>
                                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">{booking.parkingSlot}</div>
                                </div>
                            </div>

                            {/* Live Feed */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" /> Construction Live
                                </h3>
                                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                    {projectLogs.length > 0 ? projectLogs.map(log => (
                                        <div key={log.id} className="relative pl-6">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full z-10"></div>
                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-slate-700">{log.milestoneName}</span>
                                                    <span className="text-[10px] text-slate-400">{log.updateDate}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{log.towerName} • {log.percentageComplete}% Complete</p>
                                                {log.photoUrl && (
                                                    <div className="mt-2 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                                                        [Site Photo]
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="pl-6 text-xs text-slate-400">No updates yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MONEY */}
                    {activeTab === 'money' && (
                        <div className="p-5 space-y-6">
                            <h3 className="font-bold text-xl text-slate-800">Financial Lounge</h3>
                            
                            {/* Ledger Summary */}
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

                            {/* Demand Hub */}
                            {nextDue ? (
                                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Payment Due</span>
                                        <span className="text-xs text-red-500 font-bold">Due by {nextDue.dueDate}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-red-900 mb-1">{nextDue.name}</h4>
                                    <p className="text-2xl font-bold text-slate-900 mb-4">₹{nextDue.amount.toLocaleString()}</p>
                                    
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                                            <Download className="w-3 h-3" /> Demand Letter
                                        </button>
                                        <button 
                                            onClick={() => handlePay(nextDue.id)}
                                            disabled={!!processingPayment}
                                            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-red-700 transition"
                                        >
                                            {processingPayment === nextDue.id ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 text-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-emerald-800 font-bold">All payments up to date!</p>
                                </div>
                            )}

                            {/* Receipt Repository */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-600 mb-3">Payment History</h4>
                                <div className="space-y-2">
                                    {booking.paymentSchedule.filter(p => p.status === 'Paid').map(p => (
                                        <div key={p.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-xs text-slate-700">{p.name}</p>
                                                <p className="text-[10px] text-slate-400">Paid on {p.paidDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xs text-emerald-600">₹{p.amount.toLocaleString()}</p>
                                                <button className="text-[10px] text-blue-500 underline">Receipt</button>
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
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-white text-purple-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2">
                                        <UserPlus className="w-3 h-3" /> Add Contact
                                    </button>
                                    <button className="flex-1 bg-purple-800 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-purple-500">
                                        <Send className="w-3 h-3" /> Share Link
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Wallet Balance</span>
                                    <button className="text-xs text-blue-600 font-bold">History</button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-slate-800">₹25,500</span>
                                    <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold">Redeem</button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Use this to adjust against your next demand.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-sm text-slate-700 mb-3">Referral Status</h3>
                                <div className="space-y-3">
                                    {referrals.map(ref => (
                                        <div key={ref.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-bold text-slate-800">{ref.name}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ref.status === 'Booked' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ref.status}</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="relative pt-4">
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-green-500 transition-all duration-500`} style={{ width: ref.status === 'Sent' ? '25%' : ref.status === 'Site Visit' ? '50%' : '100%' }}></div>
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                                    <span>Sent</span>
                                                    <span>Visit</span>
                                                    <span>Booked</span>
                                                </div>
                                            </div>
                                            
                                            {/* SIMULATION ONLY */}
                                            <button 
                                                onClick={() => handleSimulateReferralProgress(ref.id)}
                                                className="mt-3 w-full py-1.5 bg-slate-50 text-slate-500 text-[10px] rounded border border-slate-200 hover:bg-slate-100"
                                            >
                                                (Simulate Progress)
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: DOCS */}
                    {activeTab === 'docs' && (
                        <div className="p-5 space-y-6">
                            <h3 className="font-bold text-xl text-slate-800">Document Vault</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-2 cursor-pointer">
                                    <FileText className="w-8 h-8 text-blue-500" />
                                    <span className="text-xs font-bold text-blue-700">Legal Docs</span>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col items-center justify-center gap-2 cursor-pointer">
                                    <FileText className="w-8 h-8 text-orange-500" />
                                    <span className="text-xs font-bold text-orange-700">Invoices</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-slate-700">Recent Files</h4>
                                </div>
                                <div>
                                    {booking.documents.map(doc => (
                                        <div key={doc.id} className="p-4 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50">
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

                            <div className="bg-slate-100 p-4 rounded-xl border border-dashed border-slate-300 text-center">
                                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-600">Upload TDS Certificate (Form 16B)</p>
                                <p className="text-[10px] text-slate-400 mt-1">Required for payments > 50L</p>
                            </div>
                        </div>
                    )}

                    {/* TAB: HELP */}
                    {activeTab === 'help' && (
                        <div className="p-5 space-y-6">
                            <h3 className="font-bold text-xl text-slate-800">Helpdesk</h3>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                                <p className="text-sm text-slate-600 mb-4">How can we help you today?</p>
                                <div className="flex gap-2 justify-center">
                                    <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Payments</button>
                                    <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Construction</button>
                                    <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Documents</button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-3">Your Tickets</h4>
                                {booking.tickets.length > 0 ? (
                                    booking.tickets.map(t => (
                                        <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-xs text-slate-800">{t.subject}</span>
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{t.status}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 text-center">No active tickets.</p>
                                )}
                            </div>

                            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg">Raise New Ticket</button>
                        </div>
                    )}

                </div>

                {/* Bottom Tab Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 pb-6 px-6 flex justify-between items-center z-20">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Home</span>
                    </button>
                    <button onClick={() => setActiveTab('money')} className={`flex flex-col items-center gap-1 ${activeTab === 'money' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <IndianRupee className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Money</span>
                    </button>
                    <button onClick={() => setActiveTab('refer')} className={`flex flex-col items-center gap-1 -mt-6`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${activeTab === 'refer' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                            <Gift className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1">Refer</span>
                    </button>
                    <button onClick={() => setActiveTab('docs')} className={`flex flex-col items-center gap-1 ${activeTab === 'docs' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <FileText className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Docs</span>
                    </button>
                    <button onClick={() => setActiveTab('help')} className={`flex flex-col items-center gap-1 ${activeTab === 'help' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Help</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CustomerPortal;
