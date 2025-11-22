
import React, { useState } from 'react';
import { Booking, LoanDetails, Agent } from '../types';
import { Landmark, Search, CheckCircle, XCircle, Calculator, FileText, DollarSign, Upload, UserCheck } from 'lucide-react';

interface LoanModuleProps {
    bookings: Booking[];
    onUpdateBooking: (booking: Booking) => void;
    currentUser: Agent;
}

const LoanModule: React.FC<LoanModuleProps> = ({ bookings, onUpdateBooking, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'pipeline' | 'banker' | 'calculator'>('pipeline');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    
    // Calculator State
    const [salary, setSalary] = useState('');
    const [age, setAge] = useState('');
    const [interestRate, setInterestRate] = useState('8.5');
    const [tenure, setTenure] = useState('20');
    const [eligibilityResult, setEligibilityResult] = useState<number | null>(null);

    // Filter bookings that need loans
    const loanCases = bookings.filter(b => b.loanDetails !== undefined);
    
    // If current user is a Banker, show only their assigned cases
    const myCases = currentUser.role === 'Banker' 
        ? loanCases.filter(b => b.loanDetails?.agentId === currentUser.id)
        : loanCases;

    const handleStatusUpdate = (booking: Booking, newStatus: LoanDetails['status']) => {
        const updatedBooking = {
            ...booking,
            loanDetails: {
                ...booking.loanDetails!,
                status: newStatus
            }
        };
        onUpdateBooking(updatedBooking);
        
        // If disbursed, trigger collection update logic here (mock)
        if(newStatus === 'Disbursed') {
            alert(`Loan Disbursed for ${booking.customerName}! Payment record created.`);
        }
    };

    const calculateEligibility = () => {
        const monthlyIncome = Number(salary);
        const maxEmi = monthlyIncome * 0.5; // 50% FOIR
        const r = Number(interestRate) / 12 / 100;
        const n = Number(tenure) * 12;
        
        // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        // P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
        
        const maxLoan = maxEmi * (Math.pow(1+r, n) - 1) / (r * Math.pow(1+r, n));
        setEligibilityResult(Math.round(maxLoan));
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Landmark className="w-8 h-8 text-blue-600" /> Home Finance Hub
                    </h1>
                    <p className="text-slate-500">Loan Processing & Banker Portal</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                    <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'pipeline' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Loan Pipeline</button>
                    <button onClick={() => setActiveTab('banker')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'banker' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Banker Portal</button>
                    <button onClick={() => setActiveTab('calculator')} className={`px-4 py-2 rounded font-bold text-sm ${activeTab === 'calculator' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Eligibility Calc</button>
                </div>
            </div>

            {activeTab === 'pipeline' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Unit</th>
                                <th className="px-6 py-4">Banker</th>
                                <th className="px-6 py-4">Sanction Amt</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loanCases.map(booking => (
                                <tr key={booking.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-800">{booking.customerName}</td>
                                    <td className="px-6 py-4">{booking.unitNumber}</td>
                                    <td className="px-6 py-4 text-slate-600">{booking.loanDetails?.agentName}</td>
                                    <td className="px-6 py-4 font-mono">₹{booking.loanDetails?.sanctionAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            booking.loanDetails?.status === 'Disbursed' ? 'bg-green-100 text-green-700' :
                                            booking.loanDetails?.status === 'Sanctioned' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {booking.loanDetails?.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline text-xs font-bold">View Docs</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'banker' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                        <div>
                            <h4 className="font-bold text-blue-800">Banker Access Mode</h4>
                            <p className="text-sm text-blue-600">Viewing assigned cases for {currentUser.name}. External login simulation.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {myCases.map(booking => (
                            <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{booking.customerName}</h3>
                                        <p className="text-xs text-slate-500">{booking.unitNumber} • {booking.project}</p>
                                    </div>
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{booking.loanDetails?.status}</span>
                                </div>
                                
                                <div className="bg-slate-50 p-3 rounded border border-slate-100 mb-4 space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Applied:</span> <span className="font-bold">₹{booking.loanDetails?.sanctionAmount.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Date:</span> <span>{booking.loanDetails?.applicationDate}</span></div>
                                </div>

                                <div className="space-y-2">
                                    {booking.loanDetails?.status === 'Applied' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(booking, 'Sanctioned')}
                                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                                        >
                                            Mark Sanctioned
                                        </button>
                                    )}
                                    {booking.loanDetails?.status === 'Sanctioned' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(booking, 'Disbursed')}
                                            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
                                        >
                                            Confirm Disbursement
                                        </button>
                                    )}
                                    <button className="w-full py-2 border border-slate-300 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" /> Review Documents
                                    </button>
                                </div>
                            </div>
                        ))}
                        {myCases.length === 0 && (
                            <div className="col-span-3 text-center py-12 text-slate-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No pending loan cases assigned to you.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'calculator' && (
                <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-green-600" /> Max Loan Eligibility
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Net Monthly Salary</label>
                            <input 
                                type="number" 
                                value={salary} 
                                onChange={(e) => setSalary(e.target.value)} 
                                className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold"
                                placeholder="e.g. 85000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                            <input 
                                type="number" 
                                value={age} 
                                onChange={(e) => setAge(e.target.value)} 
                                className="w-full p-3 border border-slate-300 rounded-lg text-lg"
                                placeholder="e.g. 32"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interest Rate (%)</label>
                            <input 
                                type="number" 
                                value={interestRate} 
                                onChange={(e) => setInterestRate(e.target.value)} 
                                className="w-full p-3 border border-slate-300 rounded-lg text-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tenure (Years)</label>
                            <input 
                                type="number" 
                                value={tenure} 
                                onChange={(e) => setTenure(e.target.value)} 
                                className="w-full p-3 border border-slate-300 rounded-lg text-lg"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={calculateEligibility}
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition mb-6"
                    >
                        Calculate
                    </button>

                    {eligibilityResult !== null && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-slide-up">
                            <p className="text-slate-500 text-sm uppercase font-bold mb-1">Maximum Loan Amount</p>
                            <p className="text-4xl font-bold text-green-600">₹{eligibilityResult.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-2">*Based on 50% FOIR norms.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoanModule;
