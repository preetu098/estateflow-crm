
import React, { useState, useMemo } from 'react';
import { 
    Project, Unit, Lead, LeadStage, CostSheet, 
    PaymentStatus, Booking, PricingConfig, Quote
} from '../types';
import { 
    LayoutGrid, CheckCircle, XCircle, Lock, 
    CreditCard, Printer, User, Calendar, 
    AlertTriangle, Calculator, ShieldCheck, ScanLine, FileText, History, ArrowRight
} from 'lucide-react';
import Tooltip from './Tooltip';

interface SalesModuleProps {
    projects: Project[];
    leads: Lead[];
    inventory: Unit[];
    setInventory: React.Dispatch<React.SetStateAction<Unit[]>>;
    onAddBooking: (booking: Booking) => void;
    onUpdateLead: (lead: Lead) => void;
    pricingConfig: PricingConfig;
}

const SalesModule: React.FC<SalesModuleProps> = ({ 
    projects, leads, inventory, setInventory, onAddBooking, onUpdateLead, pricingConfig 
}) => {
    const [viewMode, setViewMode] = useState<'visits' | 'inventory'>('visits');
    const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '');
    const [selectedTower, setSelectedTower] = useState<string>('All');
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [activeLead, setActiveLead] = useState<Lead | null>(null); // Lead currently sitting at the table
    
    // Quote Engine State
    const [discount, setDiscount] = useState(0);
    const [approvalRequested, setApprovalRequested] = useState(false);
    const [parkingSelected, setParkingSelected] = useState(true);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('Construction Linked Plan');
    const [showBookingModal, setShowBookingModal] = useState(false);
    
    // Quote Booking Handshake
    const [approvedQuoteToBook, setApprovedQuoteToBook] = useState<Quote | null>(null);

    // Safe Config to prevent undefined arithmetic
    const safeConfig: PricingConfig = pricingConfig || {
        baseRate: 0,
        floorRise: 0,
        amenities: 0,
        parking: 0,
        gst: 0,
        stampDuty: 0,
        registration: 0,
        maxDiscount: 0
    };

    // --- VISITS TAB LOGIC ---
    const relevantLeads = leads.filter(l => 
        l.stage === LeadStage.NEGOTIATION || 
        l.stage === LeadStage.VISIT_SCHEDULED ||
        l.stage === LeadStage.BOOKED ||
        l.stage === LeadStage.QUALIFIED
    );

    const activeVisits = relevantLeads.filter(l => l.stage === LeadStage.NEGOTIATION); // Checked in at reception
    const upcomingVisits = relevantLeads.filter(l => l.stage === LeadStage.VISIT_SCHEDULED); // Not yet checked in

    const handleAttend = (lead: Lead) => {
        setActiveLead(lead);
        setViewMode('inventory'); // Auto-switch to closing mode
    };

    // --- INVENTORY TAB LOGIC ---
    const filteredUnits = useMemo(() => {
        return inventory.filter(u => {
            const idMatch = u.id.startsWith(selectedProject);
            const towerMatch = selectedTower === 'All' || u.tower === selectedTower;
            return idMatch && towerMatch;
        });
    }, [inventory, selectedProject, selectedTower]);

    const towers = useMemo(() => {
        const projUnits = inventory.filter(u => u.id.startsWith(selectedProject));
        return Array.from(new Set(projUnits.map(u => u.tower)));
    }, [inventory, selectedProject]);

    // --- COST SHEET CALCULATOR ---
    const calculateCost = (unit: Unit): CostSheet => {
        const floor = Number(unit.floor) || 0;
        const carpetArea = Number(unit.carpetArea) || 0;
        
        const baseRate = Number(safeConfig.baseRate || 0);
        const floorRiseRate = Number(safeConfig.floorRise || 0);
        const amenities = Number(safeConfig.amenities || 0);
        const parking = Number(parkingSelected ? (safeConfig.parking || 0) : 0);
        const gst = Number(safeConfig.gst || 0);
        const registration = Number(safeConfig.registration || 0);
        const stampDuty = Number(safeConfig.stampDuty || 0);

        const floorRiseCost = floor * floorRiseRate * carpetArea;
        
        const dynamicBasePrice = baseRate * carpetArea;
        const actualBaseCost = dynamicBasePrice + floorRiseCost;

        const gross = actualBaseCost + amenities + parking;
        const taxes = gross * gst; 
        const totalBeforeDiscount = gross + taxes + registration + (actualBaseCost * stampDuty);
        
        const discountAmount = discount * carpetArea;
        const finalPrice = totalBeforeDiscount - discountAmount;

        return {
            baseCost: actualBaseCost,
            floorRise: floorRiseCost,
            plc: 0,
            amenities,
            taxes,
            total: totalBeforeDiscount,
            discount: discountAmount,
            finalPrice
        };
    };

    const costSheet = selectedUnit ? calculateCost(selectedUnit) : null;
    
    const totalTaxes = useMemo((): number => {
        if (!costSheet) return 0;
        const taxesVal = Number(costSheet.taxes) || 0;
        const baseCostVal = Number(costSheet.baseCost) || 0;
        const stampDutyRate = Number(safeConfig.stampDuty) || 0;
        const registrationVal = Number(safeConfig.registration) || 0;

        return Number(taxesVal) + (Number(baseCostVal) * Number(stampDutyRate)) + Number(registrationVal);
    }, [costSheet, safeConfig]);

    // --- QUOTE MANAGEMENT ---
    const handleGenerateQuote = () => {
        if (!selectedUnit || !costSheet || !activeLead) return;

        const newVersion = (activeLead.quotes?.length || 0) + 1;
        const isApprovalRequired = discount > (safeConfig.maxDiscount || 200);

        const newQuote: Quote = {
            id: `Q-${Date.now()}`,
            leadId: activeLead.id,
            unitId: selectedUnit.id,
            unitNumber: selectedUnit.unitNumber,
            version: newVersion,
            costSheet: costSheet,
            paymentPlan: selectedPaymentPlan,
            status: isApprovalRequired ? 'Pending Approval' : 'Approved',
            generatedBy: 'Sales Agent',
            createdAt: new Date().toISOString(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };

        const updatedQuotes = [...(activeLead.quotes || []), newQuote];
        const updatedLead = { ...activeLead, quotes: updatedQuotes };
        onUpdateLead(updatedLead);
        setActiveLead(updatedLead); // Update local active lead to reflect new quote

        alert(`Quote v${newVersion} generated successfully! Status: ${newQuote.status}`);
    };

    const handleInitiateBooking = (quote: Quote) => {
        setApprovedQuoteToBook(quote);
        setShowBookingModal(true);
    };

    const handleBlockUnit = () => {
        if (!selectedUnit) return;
        if (!activeLead) {
            alert("Please select a Lead (Active Client) first before blocking.");
            return;
        }
        
        const updatedInventory = inventory.map(u => 
            u.id === selectedUnit.id 
            ? { ...u, status: 'Blocked' as const, blockedBy: 'Agent', blockedAt: Date.now() } 
            : u
        );
        setInventory(updatedInventory);
        setSelectedUnit({ ...selectedUnit, status: 'Blocked', blockedBy: 'Agent', blockedAt: Date.now() });
        alert(`Unit ${selectedUnit.unitNumber} Blocked for 24 Hours!`);
    };

    const handleBookingSubmit = () => {
        if (!selectedUnit || !activeLead || !approvedQuoteToBook) return;
        
        // Use data from the LOCKED QUOTE, not the current slider state
        const lockedCost = approvedQuoteToBook.costSheet;

        const newBooking: Booking = {
            id: `BK-${Date.now()}`,
            leadId: activeLead.id,
            customerName: activeLead.name,
            mobile: activeLead.mobile,
            email: activeLead.email || 'pending@email.com',
            project: projects.find(p => p.id === selectedProject)?.name || '',
            unitNumber: selectedUnit.unitNumber,
            tower: selectedUnit.tower,
            floor: selectedUnit.floor.toString(),
            carpetArea: `${selectedUnit.carpetArea} sqft`,
            parkingSlot: parkingSelected ? 'Pending Allocation' : 'NA',
            
            agreementValue: Number(lockedCost.finalPrice) * 0.9, 
            taxes: lockedCost.taxes,
            otherCharges: lockedCost.amenities,
            totalCost: lockedCost.finalPrice,
            amountPaid: 100000, // Initial Token
            
            bookingDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            paymentSchedule: [
                { id: 'pm1', name: 'Booking Token', percentage: 10, amount: Number(lockedCost.finalPrice) * 0.1, dueDate: new Date().toISOString().split('T')[0], status: PaymentStatus.PAID, paidDate: new Date().toISOString().split('T')[0] },
                { id: 'pm2', name: 'Agreement (20%)', percentage: 20, amount: Number(lockedCost.finalPrice) * 0.2, dueDate: new Date(new Date().getTime() + 30*24*60*60*1000).toISOString(), status: PaymentStatus.UPCOMING },
                { id: 'pm3', name: 'Plinth Level (15%)', percentage: 15, amount: Number(lockedCost.finalPrice) * 0.15, dueDate: '2025-01-01', status: PaymentStatus.UPCOMING },
            ],
            documents: [],
            tickets: [],
            modifications: [],
            tdsCompliant: false
        };

        // 1. Add Booking
        onAddBooking(newBooking);

        // 2. Update Inventory to Sold
        setInventory(prev => prev.map(u => u.id === selectedUnit.id ? { ...u, status: 'Sold' } : u));

        // 3. Update Lead Status & Mark Quote as Booked
        const updatedQuotes = activeLead.quotes?.map(q => q.id === approvedQuoteToBook.id ? { ...q, status: 'Booked' } : q) as Quote[];
        onUpdateLead({ 
            ...activeLead, 
            stage: LeadStage.BOOKED, 
            subStage: 'Token Received',
            quotes: updatedQuotes
        });

        setShowBookingModal(false);
        setSelectedUnit(null);
        setActiveLead(null);
        setApprovedQuoteToBook(null);
        alert("Booking Confirmed! Receipt Generated.");
    };

    return (
        <div className="flex h-full bg-slate-100 overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-10">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <ScanLine className="w-5 h-5 text-blue-600" /> Sales Center
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Role: Closing Manager</p>
                </div>
                <div className="p-2 space-y-1">
                    <button 
                        onClick={() => setViewMode('visits')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${viewMode === 'visits' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <User className="w-5 h-5" /> Active Customers
                        {activeVisits.length > 0 && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto animate-pulse">{activeVisits.length}</span>}
                    </button>
                    <button 
                        onClick={() => setViewMode('inventory')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${viewMode === 'inventory' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <LayoutGrid className="w-5 h-5" /> Inventory Map
                    </button>
                </div>
                
                {/* Active Lead Context */}
                {activeLead && (
                    <div className="mt-auto p-4 bg-green-50 border-t border-green-100">
                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Client Seated</p>
                        <div className="font-bold text-slate-800">{activeLead.name}</div>
                        <div className="text-xs text-slate-500">{activeLead.configuration} • {activeLead.mobile}</div>
                        <button 
                            onClick={() => setActiveLead(null)}
                            className="mt-2 text-xs text-red-500 hover:underline w-full text-left"
                        >
                            End Session
                        </button>
                    </div>
                )}
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* VIEW: SITE VISITS */}
                {viewMode === 'visits' && (
                    <div className="p-8 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Client Queue (Closing Team)</h2>
                        <div className="mb-8">
                             <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full bg-green-500"></span> On Floor (Checked In)
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeVisits.map(lead => (
                                    <div key={lead.id} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800">{lead.name}</h3>
                                                <p className="text-slate-500 text-sm flex items-center gap-1"><Calendar className="w-3 h-3" /> Arrived Just Now</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                            <span className="font-medium">Interested:</span> {lead.project} ({lead.configuration})<br/>
                                            <span className="font-medium">Prev Agent:</span> {lead.agentName}
                                        </div>
                                        <button 
                                            onClick={() => handleAttend(lead)}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Start Meeting
                                        </button>
                                    </div>
                                ))}
                                {activeVisits.length === 0 && <p className="text-slate-400 italic text-sm">No clients waiting in reception.</p>}
                             </div>
                        </div>
                    </div>
                )}

                {/* VIEW: INVENTORY */}
                {viewMode === 'inventory' && (
                    <div className="flex h-full">
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Filters */}
                            <div className="bg-white border-b border-slate-200 p-4 flex gap-4 items-center shadow-sm z-10">
                                <select 
                                    value={selectedProject} 
                                    onChange={(e) => { setSelectedProject(e.target.value); setSelectedUnit(null); }}
                                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <select 
                                    value={selectedTower}
                                    onChange={(e) => setSelectedTower(e.target.value)}
                                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="All">All Towers</option>
                                    {towers.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="ml-auto flex gap-4 text-sm">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Available</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Sold</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span> Blocked</div>
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                                {towers.map(tower => {
                                    if (selectedTower !== 'All' && tower !== selectedTower) return null;
                                    const towerUnits = filteredUnits.filter(u => u.tower === tower);
                                    const floors = Array.from(new Set(towerUnits.map(u => u.floor))).sort((a: number, b: number) => b - a);

                                    return (
                                        <div key={tower} className="mb-8">
                                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                {tower} 
                                                <Tooltip text="High-demand tower with sea view options." />
                                            </h3>
                                            <div className="space-y-2">
                                                {floors.map(floor => {
                                                    return (
                                                    <div key={floor} className="flex gap-4 relative">
                                                        <div className="w-12 flex items-center justify-center font-bold text-slate-400 text-xs">
                                                            {floor}F
                                                        </div>
                                                        <div className="flex gap-3 flex-wrap">
                                                            {towerUnits.filter(u => u.floor === floor).sort((a,b) => a.unitNumber.localeCompare(b.unitNumber)).map(unit => (
                                                                <button
                                                                    key={unit.id}
                                                                    onClick={() => setSelectedUnit(unit)}
                                                                    disabled={unit.status === 'Sold'}
                                                                    className={`
                                                                        w-24 h-20 rounded-lg border shadow-sm flex flex-col items-center justify-center transition relative
                                                                        ${unit.status === 'Available' ? 'bg-white border-emerald-200 hover:border-emerald-500 hover:shadow-md' : ''}
                                                                        ${unit.status === 'Sold' ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : ''}
                                                                        ${unit.status === 'Blocked' ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-500' : ''}
                                                                        ${selectedUnit?.id === unit.id ? 'ring-2 ring-blue-600 scale-105 z-10' : ''}
                                                                    `}
                                                                >
                                                                    <span className={`font-bold text-lg ${unit.status === 'Available' ? 'text-emerald-700' : unit.status === 'Blocked' ? 'text-yellow-700' : 'text-slate-400'}`}>
                                                                        {unit.unitNumber.split('-')[1]}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500">{unit.type}</span>
                                                                    <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${unit.status === 'Available' ? 'bg-emerald-500' : unit.status === 'Sold' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )})}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- CLOSING DRAWER (QUOTE ENGINE) --- */}
                        {selectedUnit && (
                            <div className="w-[450px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-slide-in-right z-20">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Unit {selectedUnit.unitNumber}</h2>
                                        <p className="text-slate-500 text-sm">{selectedUnit.tower} • {selectedUnit.floor}th Floor</p>
                                    </div>
                                    <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* 1. QUOTE BUILDER */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-800 text-white p-3 flex items-center gap-2 text-sm font-bold">
                                            <Calculator className="w-4 h-4" /> Quote Builder (Cost Sheet)
                                        </div>
                                        
                                        {costSheet && (
                                            <div className="p-4 space-y-3 text-sm bg-white">
                                                {/* Inputs */}
                                                <div className="mb-4 space-y-3 pb-4 border-b border-slate-100">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Payment Plan</label>
                                                        <select 
                                                            value={selectedPaymentPlan} 
                                                            onChange={(e) => setSelectedPaymentPlan(e.target.value)}
                                                            className="w-full p-2 border rounded text-sm font-medium"
                                                        >
                                                            <option>Construction Linked Plan</option>
                                                            <option>Down Payment (5% off)</option>
                                                            <option>Subvention 10:90</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={parkingSelected} onChange={(e) => setParkingSelected(e.target.checked)} /> 
                                                        <span className="text-slate-700 font-medium">Include Parking (₹{safeConfig.parking})</span>
                                                    </div>
                                                </div>

                                                {/* Calculation */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><span className="text-slate-500">Base Price</span> <span>₹{costSheet.baseCost.toLocaleString()}</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-500">Floor Rise</span> <span>₹{costSheet.floorRise.toLocaleString()}</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-500">Amenities</span> <span>₹{costSheet.amenities.toLocaleString()}</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-500">Taxes & Govt Charges</span> <span>₹{totalTaxes.toLocaleString()}</span></div>
                                                </div>

                                                {/* Discount Slider */}
                                                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 mt-3">
                                                    <label className="text-xs font-bold text-yellow-700 block mb-1">Discount (per sqft)</label>
                                                    <input 
                                                        type="range" min="0" max="500" step="50" 
                                                        value={discount} 
                                                        onChange={(e) => {
                                                            setDiscount(Number(e.target.value));
                                                            setApprovalRequested(Number(e.target.value) > Number(safeConfig.maxDiscount || 0));
                                                        }} 
                                                        className="w-full accent-yellow-600 h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <div className="flex justify-between text-xs mt-1 font-bold text-red-600">
                                                        <span>- ₹{costSheet.discount.toLocaleString()}</span>
                                                        {approvalRequested && <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Approval Required</span>}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center text-lg font-bold text-slate-900 border-t border-slate-300 pt-3 mt-2">
                                                    <span>Final Price</span>
                                                    <span>₹{costSheet.finalPrice.toLocaleString()}</span>
                                                </div>

                                                <button 
                                                    onClick={handleGenerateQuote}
                                                    disabled={!activeLead}
                                                    className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg mt-3 shadow-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {approvalRequested ? 'Submit for Approval' : 'Generate Quote'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. QUOTE HISTORY */}
                                    {activeLead && activeLead.quotes && activeLead.quotes.filter(q => q.unitId === selectedUnit.id).length > 0 && (
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-slate-100 p-3 flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <History className="w-4 h-4" /> Quote History
                                            </div>
                                            <div className="bg-white max-h-48 overflow-y-auto">
                                                {activeLead.quotes.filter(q => q.unitId === selectedUnit.id).reverse().map(quote => (
                                                    <div key={quote.id} className="p-3 border-b border-slate-50 hover:bg-slate-50">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-slate-800 text-sm">v{quote.version} - ₹{quote.costSheet.finalPrice.toLocaleString()}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                                quote.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                                quote.status === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {quote.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex justify-between items-center">
                                                            <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                                                            <div className="flex gap-2">
                                                                <button className="text-blue-600 hover:underline">Print</button>
                                                                {quote.status === 'Approved' && (
                                                                    <button 
                                                                        onClick={() => handleInitiateBooking(quote)}
                                                                        className="text-white bg-green-600 px-2 py-0.5 rounded hover:bg-green-700 font-bold"
                                                                    >
                                                                        Book
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. ACTIONS */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                        <button 
                                            onClick={handleBlockUnit}
                                            disabled={selectedUnit.status !== 'Available' || !activeLead}
                                            className="py-3 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Lock className="w-4 h-4" /> Block Unit
                                        </button>
                                        <div className="text-center text-xs text-slate-400 flex items-center justify-center">
                                            Use "Book" on Approved Quote
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- BOOKING MODAL (LOCKED TO QUOTE) --- */}
                {showBookingModal && approvedQuoteToBook && activeLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-emerald-600" /> Confirm Booking
                                </h2>
                                <button onClick={() => setShowBookingModal(false)}><XCircle className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Quote Summary */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Locked Quote: {approvedQuoteToBook.id}</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">VERIFIED</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-bold text-slate-800">{activeLead.name}</p>
                                            <p className="text-sm text-slate-600">{approvedQuoteToBook.unitNumber} • {projects.find(p=>p.id===selectedProject)?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-emerald-600">₹{approvedQuoteToBook.costSheet.finalPrice.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">{approvedQuoteToBook.paymentPlan}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* KYC Simulation */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><ScanLine className="w-4 h-4" /> KYC & Identity</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer">
                                            <div className="text-slate-400 text-xs mb-2">Pan Card</div>
                                            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded inline-block">Uploaded</div>
                                        </div>
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer">
                                            <div className="text-slate-400 text-xs mb-2">Aadhaar Card</div>
                                            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded inline-block">Uploaded</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Token Payment (₹1,00,000)</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button className="p-3 border border-blue-500 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm">UPI / QR</button>
                                        <button className="p-3 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50">Card Swipe</button>
                                        <button className="p-3 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50">Cheque</button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button onClick={() => setShowBookingModal(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button onClick={handleBookingSubmit} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                                    Process Payment & Book
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SalesModule;
