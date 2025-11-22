
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Project, Unit, Lead, LeadStage, CostSheet, 
    PaymentStatus, Booking, PricingConfig, Quote,
    Applicant, BookingPaymentDetails, ProjectType, Address
} from '../types';
import { 
    LayoutGrid, CheckCircle, XCircle, Lock, 
    CreditCard, Printer, User, Calendar, 
    AlertTriangle, Calculator, ShieldCheck, ScanLine, FileText, History, ArrowRight, 
    Filter, Search, Share2, Map, Layers, ChevronDown, ChevronUp, Smartphone,
    MessageSquare, UserPlus, MapPin, Briefcase, Check, Landmark, Shield, ArrowLeft,
    Building, Users, Car
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

interface BookingFormState {
    primaryApplicant: Applicant;
    coApplicant?: Applicant;
    useCorrespondenceSame: boolean;
    payment: BookingPaymentDetails;
}

const INITIAL_APPLICANT: Applicant = {
    type: 'Primary',
    title: 'Mr',
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    pan: '',
    aadhaar: '',
    occupation: 'Service',
    address: { street: '', city: '', state: '', pincode: '' }
};

const SalesModule: React.FC<SalesModuleProps> = ({ 
    projects, leads, inventory, setInventory, onAddBooking, onUpdateLead, pricingConfig 
}) => {
    const [viewMode, setViewMode] = useState<'visits' | 'inventory'>('inventory');
    const [inventoryViewType, setInventoryViewType] = useState<'grid' | 'stack'>('stack');
    
    const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '');
    const [selectedTower, setSelectedTower] = useState<string>('All');
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [activeLead, setActiveLead] = useState<Lead | null>(null); 
    
    // Filters
    const [filterType, setFilterType] = useState<string>('All');
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    // Quote Engine State
    const [discount, setDiscount] = useState(0);
    const [approvalRequested, setApprovalRequested] = useState(false);
    const [parkingCount, setParkingCount] = useState(1);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('Construction Linked Plan');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    
    // Lead Selector State (if no active lead)
    const [leadSearchTerm, setLeadSearchTerm] = useState('');

    // EMI Calculator State
    const [showEmiCalc, setShowEmiCalc] = useState(false);
    const [loanAmount, setLoanAmount] = useState(0);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);

    // Quote Booking Handshake
    const [approvedQuoteToBook, setApprovedQuoteToBook] = useState<Quote | null>(null);

    // BOOKING WIZARD STATE
    const [bookingStep, setBookingStep] = useState(1);
    const [bookingForm, setBookingForm] = useState<BookingFormState>({
        primaryApplicant: { ...INITIAL_APPLICANT },
        useCorrespondenceSame: true,
        payment: {
            amount: 0,
            mode: 'Cheque',
            isTdsDeducted: false
        }
    });
    const [hasCoApplicant, setHasCoApplicant] = useState(false);

    // Safe Config to prevent undefined arithmetic
    const safeConfig: PricingConfig = pricingConfig || {
        baseRate: 0, floorRise: 0, amenities: 0, parking: 0, parkingRate: 0, gst: 0, stampDuty: 0, registration: 0, maxDiscount: 0
    };

    // --- VISITS TAB LOGIC ---
    const relevantLeads = leads.filter(l => 
        l.stage === LeadStage.NEGOTIATION || 
        l.stage === LeadStage.VISIT_SCHEDULED || 
        l.stage === LeadStage.BOOKED ||
        l.stage === LeadStage.QUALIFIED
    );

    const activeVisits = relevantLeads.filter(l => l.stage === LeadStage.NEGOTIATION); // Checked in at reception

    const handleAttend = (lead: Lead) => {
        setActiveLead(lead);
        setViewMode('inventory'); // Auto-switch to closing mode
        if (lead.configuration) {
            if (lead.configuration.includes('2')) setFilterType('2 BHK');
            if (lead.configuration.includes('3')) setFilterType('3 BHK');
        }
        // Pre-fill booking form from Lead Data
        setBookingForm(prev => ({
            ...prev,
            primaryApplicant: {
                ...prev.primaryApplicant,
                fullName: lead.name,
                mobile: lead.mobile,
                email: lead.email || ''
            }
        }));
    };

    // --- INVENTORY TAB LOGIC ---
    const filteredUnits = useMemo(() => {
        return inventory.filter(u => {
            const idMatch = u.id.startsWith(selectedProject);
            const towerMatch = selectedTower === 'All' || u.tower === selectedTower;
            const typeMatch = filterType === 'All' || u.type === filterType;
            
            // Price Filter (Approximate based on basePrice)
            let priceMatch = true;
            if (filterMaxPrice) {
                const max = parseInt(filterMaxPrice) * 100000; // Convert Lakhs to absolute
                priceMatch = u.basePrice <= max;
            }

            return idMatch && towerMatch && typeMatch && priceMatch;
        });
    }, [inventory, selectedProject, selectedTower, filterType, filterMaxPrice]);

    const towers = useMemo(() => {
        const projUnits = inventory.filter(u => u.id.startsWith(selectedProject));
        return Array.from(new Set(projUnits.map(u => u.tower)));
    }, [inventory, selectedProject]);

    const unitTypes = useMemo(() => {
        const projUnits = inventory.filter(u => u.id.startsWith(selectedProject));
        return Array.from(new Set(projUnits.map(u => u.type)));
    }, [inventory, selectedProject]);

    // --- COST SHEET CALCULATOR ---
    const calculateCost = (unit: Unit): CostSheet => {
        const floor = Number(unit.floor) || 0;
        const carpetArea = Number(unit.carpetArea) || 0;
        
        const baseRate = Number(safeConfig.baseRate || 0);
        const floorRiseRate = Number(safeConfig.floorRise || 0);
        const amenities = Number(safeConfig.amenities || 0);
        const parkingRate = Number(safeConfig.parkingRate || 500000);
        
        // Parking Calculation
        const parkingCost = parkingCount * parkingRate;

        // Floor Rise & PLC
        const floorRiseCost = floor * floorRiseRate * carpetArea;
        
        // Mock PLC Logic: Units ending in 1 or 4 get 5% PLC
        const unitLastDigit = unit.unitNumber.slice(-1);
        const plc = (unitLastDigit === '1' || unitLastDigit === '4') ? (baseRate * carpetArea * 0.05) : 0;

        // Base Cost Components
        const dynamicBasePrice = baseRate * carpetArea;
        const actualBaseCost = dynamicBasePrice + floorRiseCost + plc;

        // Agreement Value (Base + PLC + Floor Rise + Parking + Amenities)
        const agreementValue = actualBaseCost + parkingCost + amenities;

        // GST Smart Logic
        let gstRate = 0;
        const currentProject = projects.find(p => p.id === selectedProject);
        
        if (currentProject?.status === 'Under Construction') {
            // Affordable Housing Check
            // Limits: Metro 60sqm / Non-Metro 90sqm AND Cost <= 45L
            const areaLimit = currentProject.isMetro ? 60 : 90;
            const isAffordable = (carpetArea * 0.092903) <= areaLimit && agreementValue <= 4500000; // Convert sqft to sqm approximately
            
            gstRate = isAffordable ? 0.01 : 0.05; // 1% or 5%
            
            // Commercial Override
            if (currentProject.type === ProjectType.COMMERCIAL) {
                gstRate = 0.12;
            }
        } else {
            gstRate = 0; // Ready to Move / CC Received
        }

        const gstAmount = agreementValue * gstRate;
        
        // Statutory
        const stampDutyAmount = agreementValue * (Number(safeConfig.stampDuty) || 0);
        const registrationAmount = Number(safeConfig.registration) || 0;

        const totalGross = agreementValue + gstAmount + stampDutyAmount + registrationAmount;
        
        const discountAmount = discount * carpetArea;
        const finalPrice = totalGross - discountAmount;

        return {
            baseCost: actualBaseCost,
            floorRise: floorRiseCost,
            plc: plc,
            amenities,
            
            parkingCount,
            parkingCost,
            
            agreementValue,
            gstRate,
            gstAmount,
            
            stampDutyAmount,
            registrationAmount,
            
            total: totalGross,
            discount: discountAmount,
            finalPrice,
            paymentPlan: selectedPaymentPlan
        };
    };

    const costSheet = selectedUnit ? calculateCost(selectedUnit) : null;
    
    // Update Loan Amount default when cost sheet changes
    React.useEffect(() => {
        if (costSheet) {
            setLoanAmount(Math.round(costSheet.finalPrice * 0.8)); // 80% default
        }
    }, [costSheet?.finalPrice]);

    const emiValue = useMemo(() => {
        if (!loanAmount) return 0;
        const r = interestRate / 12 / 100;
        const n = tenure * 12;
        return Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }, [loanAmount, interestRate, tenure]);

    // --- QUOTE MANAGEMENT ---
    const handleGenerateQuote = () => {
        if (!selectedUnit || !costSheet) return;
        
        // Force Lead Selection
        if (!activeLead) {
            alert("Please select a Lead (Active Customer) to link this quote to.");
            return;
        }

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
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        const updatedQuotes = [...(activeLead.quotes || []), newQuote];
        const updatedLead = { ...activeLead, quotes: updatedQuotes };
        onUpdateLead(updatedLead);
        setActiveLead(updatedLead); 

        alert(`Quote v${newVersion} generated successfully! Status: ${newQuote.status}`);
    };

    const handleShareWhatsApp = () => {
        if(!activeLead || !selectedUnit || !costSheet) return;
        const message = `Hello ${activeLead.name},\n\nHere is the cost sheet for *${projects.find(p=>p.id===selectedProject)?.name} - Unit ${selectedUnit.unitNumber}*.\n\nFinal Price: ₹${costSheet.finalPrice.toLocaleString()}\nPlan: ${selectedPaymentPlan}\n\nValid for 7 days.`;
        const url = `https://wa.me/91${activeLead.mobile}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // --- BOOKING WIZARD LOGIC ---

    const handleInitiateBooking = (quote: Quote) => {
        if (!selectedUnit) return;
        setApprovedQuoteToBook(quote);
        
        // Hard Block Inventory
        const updatedInventory = inventory.map(u => 
            u.id === selectedUnit.id 
            ? { ...u, status: 'Blocked' as const, blockedBy: activeLead?.name, blockedAt: Date.now() } 
            : u
        );
        setInventory(updatedInventory);
        setSelectedUnit(prev => prev ? { ...prev, status: 'Blocked' } : null);
        
        // Init Booking Form Data
        setBookingForm({
            primaryApplicant: { 
                ...INITIAL_APPLICANT, 
                fullName: activeLead?.name || '', 
                mobile: activeLead?.mobile || '',
                email: activeLead?.email || ''
            },
            useCorrespondenceSame: true,
            payment: {
                amount: quote.costSheet.finalPrice * 0.10, // Default Token 10%
                mode: 'Cheque',
                isTdsDeducted: false
            }
        });
        setBookingStep(1);
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
            ? { ...u, status: 'Blocked' as const, blockedBy: activeLead.name, blockedAt: Date.now() } 
            : u
        );
        setInventory(updatedInventory);
        setSelectedUnit({ ...selectedUnit, status: 'Blocked', blockedBy: activeLead.name, blockedAt: Date.now() });
        alert(`Unit ${selectedUnit.unitNumber} Blocked for 24 Hours!`);
    };

    // Booking Wizard Handlers
    const updateApplicant = (isPrimary: boolean, field: keyof Applicant | keyof Address, value: string) => {
        setBookingForm(prev => {
            const target = isPrimary ? 'primaryApplicant' : 'coApplicant';
            if (!prev[target] && !isPrimary) {
                // Init co-applicant if missing
                if(!isPrimary) return { ...prev, coApplicant: { ...INITIAL_APPLICANT, type: 'Co-Applicant', [field]: value } };
                return prev; 
            }

            // Check if field is part of address
            if (['street', 'city', 'state', 'pincode'].includes(field as string)) {
                return {
                    ...prev,
                    [target]: {
                        ...prev[target]!,
                        address: { ...prev[target]!.address, [field as keyof Address]: value }
                    }
                };
            }
            return {
                ...prev,
                [target]: { ...prev[target]!, [field]: value }
            };
        });
    };

    const validateStep = (step: number): boolean => {
        if (step === 1) {
            const { fullName, mobile, pan, dob } = bookingForm.primaryApplicant;
            if (!fullName || !mobile) { alert("Name and Mobile are mandatory."); return false; }
            
            // PAN Validation
            const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
            if (pan && !panRegex.test(pan)) { alert("Invalid PAN Number format."); return false; }

            // Age Validation
            if (dob) {
                const age = new Date().getFullYear() - new Date(dob).getFullYear();
                if (age < 18) { alert("Primary Applicant must be 18+ years old."); return false; }
            } else {
                alert("Date of Birth is required for Agreement."); return false;
            }
            return true;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(bookingStep)) setBookingStep(s => s + 1);
    };

    const prevStep = () => setBookingStep(s => s - 1);

    const handleBookingSubmit = () => {
        if (!selectedUnit || !activeLead || !approvedQuoteToBook) return;
        
        const lockedCost = approvedQuoteToBook.costSheet;
        const applicants = [bookingForm.primaryApplicant];
        if (hasCoApplicant && bookingForm.coApplicant) {
            applicants.push(bookingForm.coApplicant);
        }

        const newBooking: Booking = {
            id: `BK-${Date.now()}`,
            leadId: activeLead.id,
            customerName: bookingForm.primaryApplicant.fullName,
            mobile: bookingForm.primaryApplicant.mobile,
            email: bookingForm.primaryApplicant.email,
            project: projects.find(p => p.id === selectedProject)?.name || '',
            unitNumber: selectedUnit.unitNumber,
            tower: selectedUnit.tower,
            floor: selectedUnit.floor.toString(),
            carpetArea: `${selectedUnit.carpetArea} sqft`,
            parkingSlot: parkingCount > 0 ? `${parkingCount} Slot(s)` : 'NA',
            
            agreementValue: lockedCost.agreementValue, 
            taxes: lockedCost.gstAmount,
            otherCharges: lockedCost.amenities + lockedCost.parkingCost,
            totalCost: lockedCost.finalPrice,
            amountPaid: bookingForm.payment.amount,
            
            bookingDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            
            applicants: applicants,
            paymentTransaction: bookingForm.payment,

            paymentSchedule: [
                { id: 'pm1', name: 'Booking Token', percentage: 10, amount: bookingForm.payment.amount, dueDate: new Date().toISOString().split('T')[0], status: PaymentStatus.PAID, paidDate: new Date().toISOString().split('T')[0] },
                { id: 'pm2', name: 'Agreement (20%)', percentage: 20, amount: Number(lockedCost.finalPrice) * 0.2, dueDate: new Date(new Date().getTime() + 30*24*60*60*1000).toISOString(), status: PaymentStatus.UPCOMING },
                { id: 'pm3', name: 'Plinth Level (15%)', percentage: 15, amount: Number(lockedCost.finalPrice) * 0.15, dueDate: '2025-01-01', status: PaymentStatus.UPCOMING },
            ],
            documents: [],
            tickets: [],
            modifications: [],
            tdsCompliant: false
        };

        onAddBooking(newBooking);
        setInventory(prev => prev.map(u => u.id === selectedUnit.id ? { ...u, status: 'Sold' } : u));

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
        alert("Booking Confirmed! Receipt & Agreement Draft Generated.");
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-100 overflow-hidden relative">
            
            {/* --- SIDEBAR / MOBILE TOP NAV --- */}
            <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col z-10 flex-shrink-0">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center md:block">
                    <div>
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <ScanLine className="w-5 h-5 text-blue-600" /> Sales Center
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 hidden md:block">Role: Closing Manager</p>
                    </div>
                    {activeLead && (
                        <div className="md:hidden text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <User className="w-3 h-3" /> {activeLead.name}
                        </div>
                    )}
                </div>

                <div className="flex md:flex-col p-2 gap-2 overflow-x-auto">
                    <button 
                        onClick={() => setViewMode('visits')}
                        className={`flex-1 md:w-full text-left px-4 py-3 rounded-lg flex items-center justify-center md:justify-start gap-3 transition whitespace-nowrap ${viewMode === 'visits' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <User className="w-5 h-5" /> 
                        <span className="hidden md:inline">Active Customers</span>
                        <span className="md:hidden">Customers</span>
                        {activeVisits.length > 0 && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full md:ml-auto animate-pulse">{activeVisits.length}</span>}
                    </button>
                    <button 
                        onClick={() => setViewMode('inventory')}
                        className={`flex-1 md:w-full text-left px-4 py-3 rounded-lg flex items-center justify-center md:justify-start gap-3 transition whitespace-nowrap ${viewMode === 'inventory' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <LayoutGrid className="w-5 h-5" /> 
                        <span className="hidden md:inline">Inventory Map</span>
                        <span className="md:hidden">Inventory</span>
                    </button>
                </div>
                
                {activeLead && (
                    <div className="hidden md:block mt-auto p-4 bg-green-50 border-t border-green-100">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-green-600 uppercase">Client Seated</p>
                            <button onClick={() => setActiveLead(null)} className="text-red-500 hover:bg-red-50 p-1 rounded"><XCircle className="w-4 h-4"/></button>
                        </div>
                        <div className="font-bold text-slate-800 truncate">{activeLead.name}</div>
                        <div className="text-xs text-slate-500 truncate">{activeLead.configuration || 'Any'} • {activeLead.mobile}</div>
                        <div className="mt-2 flex gap-2">
                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">Budget: {activeLead.budgetRange || 'N/A'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* VIEW: ACTIVE CUSTOMERS */}
                {viewMode === 'visits' && (
                    <div className="p-4 md:p-8 overflow-y-auto bg-slate-50 h-full">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Client Queue</h2>
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> On Floor (Checked In)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeVisits.map(lead => (
                                        <div key={lead.id} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm flex flex-col gap-4 relative overflow-hidden hover:shadow-md transition">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800">{lead.name}</h3>
                                                    <p className="text-slate-500 text-sm flex items-center gap-1"><Calendar className="w-3 h-3" /> Arrived Just Now</p>
                                                </div>
                                                <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-600">{lead.id}</span>
                                            </div>
                                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-slate-400">Interested:</span> 
                                                    <span className="font-medium">{lead.project} ({lead.configuration})</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Prev Agent:</span> 
                                                    <span className="font-medium">{lead.agentName}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleAttend(lead)}
                                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Start Meeting
                                            </button>
                                        </div>
                                    ))}
                                    {activeVisits.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                                            <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            <p>No clients waiting in reception.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: INVENTORY */}
                {viewMode === 'inventory' && (
                    <div className="flex flex-col h-full">
                        <div className="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm z-20">
                            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
                                <select 
                                    value={selectedProject} 
                                    onChange={(e) => { setSelectedProject(e.target.value); setSelectedUnit(null); }}
                                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <select 
                                    value={selectedTower}
                                    onChange={(e) => setSelectedTower(e.target.value)}
                                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="All">All Towers</option>
                                    {towers.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-300 text-slate-600'}`}
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>

                            {showFilters && (
                                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 w-full md:w-auto">
                                    <select 
                                        value={filterType} 
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="All">All Types</option>
                                        {unitTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <select
                                        value={filterMaxPrice}
                                        onChange={(e) => setFilterMaxPrice(e.target.value)}
                                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="">Max Price</option>
                                        <option value="50">&lt; 50L</option>
                                        <option value="75">&lt; 75L</option>
                                        <option value="100">&lt; 1 Cr</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex ml-auto bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => setInventoryViewType('stack')} className={`p-1.5 rounded ${inventoryViewType === 'stack' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} title="Stacking Plan"><Layers className="w-4 h-4" /></button>
                                <button onClick={() => setInventoryViewType('grid')} className={`p-1.5 rounded ${inventoryViewType === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} title="Grid View"><LayoutGrid className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100">
                            {towers.map(tower => {
                                if (selectedTower !== 'All' && tower !== selectedTower) return null;
                                const towerUnits = filteredUnits.filter(u => u.tower === tower);
                                const floors = Array.from(new Set(towerUnits.map(u => u.floor))).sort((a: number, b: number) => b - a);

                                return (
                                    <div key={tower} className="mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                                <Building className="w-5 h-5 text-slate-400" /> {tower}
                                            </h3>
                                            <div className="flex gap-4 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {towerUnits.filter(u => u.status === 'Available').length} Avl</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> {towerUnits.filter(u => u.status === 'Sold').length} Sold</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 overflow-x-auto">
                                            {floors.map(floor => {
                                                const floorUnits = towerUnits.filter(u => u.floor === floor).sort((a,b) => a.unitNumber.localeCompare(b.unitNumber));
                                                if(floorUnits.length === 0) return null;

                                                return (
                                                <div key={floor} className="flex gap-4 items-center min-w-max">
                                                    <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 text-xs bg-slate-50 rounded">
                                                        {floor}
                                                    </div>
                                                    <div className={`flex gap-2 ${inventoryViewType === 'stack' ? 'bg-slate-50 p-2 rounded-lg border border-slate-100' : ''}`}>
                                                        {floorUnits.map(unit => {
                                                            const isMatch = activeLead && activeLead.configuration && unit.type.includes(activeLead.configuration.split(' ')[0]);
                                                            return (
                                                            <button
                                                                key={unit.id}
                                                                onClick={() => setSelectedUnit(unit)}
                                                                disabled={unit.status === 'Sold'}
                                                                className={`
                                                                    relative flex flex-col items-center justify-center transition-all duration-200
                                                                    ${inventoryViewType === 'grid' 
                                                                        ? 'w-24 h-20 rounded-lg border shadow-sm' 
                                                                        : 'w-16 h-12 rounded border text-xs'
                                                                    }
                                                                    ${unit.status === 'Available' ? 'bg-white border-emerald-200 hover:border-emerald-500 hover:shadow-md text-emerald-700' : ''}
                                                                    ${unit.status === 'Sold' ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' : ''}
                                                                    ${unit.status === 'Blocked' ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:border-yellow-500' : ''}
                                                                    ${selectedUnit?.id === unit.id ? 'ring-2 ring-blue-600 scale-105 z-10 bg-blue-50' : ''}
                                                                    ${isMatch && unit.status === 'Available' ? 'ring-2 ring-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : ''}
                                                                `}
                                                            >
                                                                {isMatch && unit.status === 'Available' && (
                                                                    <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-sm z-20">MATCH</div>
                                                                )}
                                                                
                                                                <span className={`font-bold ${inventoryViewType === 'grid' ? 'text-lg' : 'text-xs'}`}>
                                                                    {unit.unitNumber.split('-').pop()}
                                                                </span>
                                                                
                                                                {inventoryViewType === 'grid' && (
                                                                    <>
                                                                        <span className="text-[10px] text-slate-500 mt-1">{unit.type}</span>
                                                                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${unit.status === 'Available' ? 'bg-emerald-500' : unit.status === 'Sold' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )})}
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedUnit && (
                            <>
                                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setSelectedUnit(null)}></div>
                                <div className={`
                                    fixed md:absolute inset-x-0 bottom-0 md:top-0 md:bottom-auto md:right-0 md:left-auto 
                                    w-full md:w-[450px] md:h-full h-[85vh] 
                                    bg-white md:border-l border-t md:border-t-0 border-slate-200 shadow-2xl 
                                    flex flex-col z-40 transition-transform duration-300 transform translate-y-0 rounded-t-2xl md:rounded-none
                                `}>
                                    <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setSelectedUnit(null)}>
                                        <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                                    </div>

                                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl md:rounded-none">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800">Unit {selectedUnit.unitNumber.split('-').pop()}</h2>
                                            <p className="text-slate-500 text-sm">{selectedUnit.tower} • {selectedUnit.floor}th Floor • {selectedUnit.type}</p>
                                        </div>
                                        <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full border border-slate-200"><XCircle className="w-6 h-6" /></button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                        {/* LEAD CONTEXT SELECTOR */}
                                        {!activeLead && (
                                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                                <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold text-sm">
                                                    <AlertTriangle className="w-4 h-4" /> Select Lead to Generate Quote
                                                </div>
                                                <select 
                                                    className="w-full p-2 border border-yellow-300 rounded-lg text-sm"
                                                    onChange={(e) => {
                                                        const l = leads.find(lead => lead.id === e.target.value);
                                                        if (l) handleAttend(l);
                                                    }}
                                                >
                                                    <option value="">-- Choose Customer --</option>
                                                    {leads.filter(l => l.stage !== LeadStage.LOST && l.stage !== LeadStage.BOOKED).map(l => (
                                                        <option key={l.id} value={l.id}>{l.name} - {l.mobile}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* QUOTE BUILDER */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-slate-800 text-white p-3 flex items-center justify-between text-sm font-bold">
                                                <span className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Cost Sheet</span>
                                                {activeLead && <span className="text-xs font-normal bg-slate-700 px-2 py-0.5 rounded text-slate-200">For: {activeLead.name}</span>}
                                            </div>
                                            
                                            {costSheet && (
                                                <div className="p-4 space-y-3 text-sm bg-white">
                                                    <div className="mb-4 space-y-3 pb-4 border-b border-slate-100">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 mb-1">Payment Plan</label>
                                                            <select 
                                                                value={selectedPaymentPlan} 
                                                                onChange={(e) => setSelectedPaymentPlan(e.target.value)}
                                                                className="w-full p-2 border rounded-lg text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                                            >
                                                                <option>Construction Linked Plan</option>
                                                                <option>Down Payment (5% off)</option>
                                                                <option>Subvention 10:90</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg">
                                                            <span className="text-slate-700 font-medium flex items-center gap-2">
                                                                <Car className="w-4 h-4 text-slate-500" />
                                                                Parking Slots
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => setParkingCount(Math.max(0, parkingCount - 1))}
                                                                    className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="font-bold w-4 text-center">{parkingCount}</span>
                                                                <button 
                                                                    onClick={() => setParkingCount(Math.min(4, parkingCount + 1))}
                                                                    className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-slate-600">
                                                        <div className="flex justify-between"><span className="text-slate-500">Base Price ({selectedUnit.carpetArea} sqft)</span> <span>₹{costSheet.baseCost.toLocaleString()}</span></div>
                                                        <div className="flex justify-between"><span className="text-slate-500">Floor Rise</span> <span>₹{costSheet.floorRise.toLocaleString()}</span></div>
                                                        {costSheet.plc > 0 && <div className="flex justify-between"><span className="text-slate-500">PLC (View)</span> <span>₹{costSheet.plc.toLocaleString()}</span></div>}
                                                        <div className="flex justify-between"><span className="text-slate-500">Amenities</span> <span>₹{costSheet.amenities.toLocaleString()}</span></div>
                                                        {costSheet.parkingCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Parking ({parkingCount} x ₹{(safeConfig.parkingRate || 0)/100000}L)</span> <span>₹{costSheet.parkingCost.toLocaleString()}</span></div>}
                                                        
                                                        <div className="border-t border-dashed border-slate-200 my-2"></div>
                                                        
                                                        <div className="flex justify-between font-bold text-slate-800"><span className="text-slate-500 font-normal">Agreement Value (A)</span> <span>₹{costSheet.agreementValue.toLocaleString()}</span></div>
                                                        
                                                        <div className="flex justify-between"><span className="text-slate-500">GST ({costSheet.gstRate * 100}%)</span> <span>₹{costSheet.gstAmount.toLocaleString()}</span></div>
                                                        <div className="flex justify-between"><span className="text-slate-500">Stamp Duty & Reg.</span> <span>₹{(costSheet.stampDutyAmount + costSheet.registrationAmount).toLocaleString()}</span></div>
                                                    </div>

                                                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100 mt-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-xs font-bold text-yellow-800">Discount (per sqft)</label>
                                                            <span className="text-xs font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-yellow-200">- ₹{costSheet.discount.toLocaleString()}</span>
                                                        </div>
                                                        <input 
                                                            type="range" min="0" max="500" step="50" 
                                                            value={discount} 
                                                            onChange={(e) => {
                                                                setDiscount(Number(e.target.value));
                                                                setApprovalRequested(Number(e.target.value) > Number(safeConfig.maxDiscount || 200));
                                                            }} 
                                                            className="w-full accent-yellow-600 h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        {approvalRequested && <div className="text-[10px] text-red-600 flex items-center gap-1 mt-1 justify-end"><AlertTriangle className="w-3 h-3" /> Manager Approval Required</div>}
                                                    </div>

                                                    <div className="flex justify-between items-center text-lg font-bold text-slate-900 border-t-2 border-slate-100 pt-3 mt-2">
                                                        <span>Grand Total</span>
                                                        <span className="text-blue-700">₹{costSheet.finalPrice.toLocaleString()}</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        <button onClick={() => setShowPrintPreview(true)} className="py-2 border border-slate-300 text-slate-600 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 text-xs transition">
                                                            <Printer className="w-4 h-4" /> Print
                                                        </button>
                                                        <button onClick={handleShareWhatsApp} disabled={!activeLead} className="py-2 border border-green-200 text-green-700 bg-green-50 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-100 text-xs transition disabled:opacity-50">
                                                            <MessageSquare className="w-4 h-4" /> WhatsApp
                                                        </button>
                                                    </div>

                                                    <button 
                                                        onClick={handleGenerateQuote}
                                                        disabled={!activeLead}
                                                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg mt-2 shadow-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition active:scale-95"
                                                    >
                                                        {approvalRequested ? 'Submit for Approval' : 'Generate Official Quote'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                            <button 
                                                onClick={() => setShowEmiCalc(!showEmiCalc)}
                                                className="w-full p-3 flex justify-between items-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
                                            >
                                                <span className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> EMI Estimator</span>
                                                {showEmiCalc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                            
                                            {showEmiCalc && (
                                                <div className="p-4 space-y-4 bg-white animate-slide-down">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs text-slate-500 font-bold block mb-1">Loan Amount</label>
                                                            <input 
                                                                type="number" 
                                                                value={loanAmount} 
                                                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                                                className="w-full p-2 border rounded text-sm font-mono"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500 font-bold block mb-1">Rate (%)</label>
                                                            <input 
                                                                type="number" 
                                                                value={interestRate} 
                                                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                                                className="w-full p-2 border rounded text-sm font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-bold block mb-1">Tenure: {tenure} Years</label>
                                                        <input 
                                                            type="range" min="5" max="30" step="1"
                                                            value={tenure}
                                                            onChange={(e) => setTenure(Number(e.target.value))}
                                                            className="w-full accent-blue-600"
                                                        />
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded text-center border border-blue-100">
                                                        <p className="text-xs text-blue-600 font-bold uppercase">Monthly EMI</p>
                                                        <p className="text-xl font-bold text-blue-800">₹{emiValue.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

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
                                                                {quote.status === 'Approved' && (
                                                                    <button 
                                                                        onClick={() => handleInitiateBooking(quote)}
                                                                        className="text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700 font-bold text-xs"
                                                                    >
                                                                        Book Now
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-100 pb-8">
                                            <button 
                                                onClick={handleBlockUnit}
                                                disabled={selectedUnit.status !== 'Available' || !activeLead}
                                                className="py-3 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <Lock className="w-4 h-4" /> Block Unit (24 Hours)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* BOOKING WIZARD MODAL */}
                {showBookingModal && approvedQuoteToBook && activeLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                            
                            {/* Header with Progress */}
                            <div className="bg-slate-900 text-white p-6 flex-shrink-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Booking Application
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">Unit {approvedQuoteToBook.unitNumber} • {projects.find(p=>p.id===selectedProject)?.name}</p>
                                    </div>
                                    <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
                                </div>
                                
                                {/* Stepper */}
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -z-0"></div>
                                    {['Applicants', 'Address & KYC', 'Payment', 'Review'].map((label, idx) => {
                                        const stepNum = idx + 1;
                                        const isActive = stepNum === bookingStep;
                                        const isCompleted = stepNum < bookingStep;
                                        return (
                                            <div key={stepNum} className="flex flex-col items-center relative z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all ${isActive ? 'bg-blue-500 text-white scale-110 ring-4 ring-blue-500/30' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border-2 border-slate-700'}`}>
                                                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`}>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                                
                                {/* STEP 1: APPLICANTS */}
                                {bookingStep === 1 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                                <User className="w-5 h-5 text-blue-600" /> Primary Applicant
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                                                    <select 
                                                        value={bookingForm.primaryApplicant.title}
                                                        onChange={(e) => updateApplicant(true, 'title', e.target.value)}
                                                        className="w-full p-2 border rounded bg-white"
                                                    >
                                                        <option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Full Name (as per PAN)</label>
                                                    <input 
                                                        type="text" 
                                                        value={bookingForm.primaryApplicant.fullName}
                                                        onChange={(e) => updateApplicant(true, 'fullName', e.target.value)}
                                                        className="w-full p-2 border rounded uppercase"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Mobile</label>
                                                    <input 
                                                        type="text" 
                                                        value={bookingForm.primaryApplicant.mobile}
                                                        onChange={(e) => updateApplicant(true, 'mobile', e.target.value)}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                                    <input 
                                                        type="email" 
                                                        value={bookingForm.primaryApplicant.email}
                                                        onChange={(e) => updateApplicant(true, 'email', e.target.value)}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                                                    <input 
                                                        type="date" 
                                                        value={bookingForm.primaryApplicant.dob}
                                                        onChange={(e) => updateApplicant(true, 'dob', e.target.value)}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Occupation</label>
                                                    <select 
                                                        value={bookingForm.primaryApplicant.occupation}
                                                        onChange={(e) => updateApplicant(true, 'occupation', e.target.value)}
                                                        className="w-full p-2 border rounded bg-white"
                                                    >
                                                        <option>Service</option><option>Business</option><option>Professional</option><option>Housewife</option><option>Retired</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <input 
                                                type="checkbox" 
                                                id="hasCoApp" 
                                                checked={hasCoApplicant} 
                                                onChange={(e) => setHasCoApplicant(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="hasCoApp" className="font-bold text-slate-700">Add Co-Applicant</label>
                                        </div>

                                        {hasCoApplicant && (
                                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                                    <Users className="w-5 h-5 text-purple-600" /> Co-Applicant
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={bookingForm.coApplicant?.fullName || ''}
                                                            onChange={(e) => updateApplicant(false, 'fullName', e.target.value)}
                                                            className="w-full p-2 border rounded uppercase"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Relationship</label>
                                                        <select 
                                                            value={bookingForm.coApplicant?.relationship || ''}
                                                            onChange={(e) => updateApplicant(false, 'relationship', e.target.value)}
                                                            className="w-full p-2 border rounded bg-white"
                                                        >
                                                            <option value="">Select</option>
                                                            <option>Spouse</option><option>Father</option><option>Mother</option><option>Son</option><option>Daughter</option><option>Sibling</option>
                                                        </select>
                                                    </div>
                                                    {/* Simplified fields for co-applicant demo */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">PAN Number</label>
                                                        <input 
                                                            type="text" 
                                                            value={bookingForm.coApplicant?.pan || ''}
                                                            onChange={(e) => updateApplicant(false, 'pan', e.target.value)}
                                                            className="w-full p-2 border rounded uppercase"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                                                        <input 
                                                            type="date" 
                                                            value={bookingForm.coApplicant?.dob || ''}
                                                            onChange={(e) => updateApplicant(false, 'dob', e.target.value)}
                                                            className="w-full p-2 border rounded"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 2: ADDRESS & KYC */}
                                {bookingStep === 2 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-orange-600" /> Permanent Address
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Flat / House No / Building" 
                                                    className="w-full p-2 border rounded" 
                                                    value={bookingForm.primaryApplicant.address.street}
                                                    onChange={(e) => updateApplicant(true, 'street', e.target.value)}
                                                />
                                                <div className="grid grid-cols-3 gap-4">
                                                    <input 
                                                        type="text" placeholder="City" className="w-full p-2 border rounded"
                                                        value={bookingForm.primaryApplicant.address.city}
                                                        onChange={(e) => updateApplicant(true, 'city', e.target.value)}
                                                    />
                                                    <input 
                                                        type="text" placeholder="State" className="w-full p-2 border rounded"
                                                        value={bookingForm.primaryApplicant.address.state}
                                                        onChange={(e) => updateApplicant(true, 'state', e.target.value)}
                                                    />
                                                    <input 
                                                        type="text" placeholder="Pincode" className="w-full p-2 border rounded"
                                                        value={bookingForm.primaryApplicant.address.pincode}
                                                        onChange={(e) => updateApplicant(true, 'pincode', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <ScanLine className="w-5 h-5 text-blue-600" /> KYC Documents
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">PAN Number *</label>
                                                    <input 
                                                        type="text" 
                                                        value={bookingForm.primaryApplicant.pan}
                                                        onChange={(e) => updateApplicant(true, 'pan', e.target.value)}
                                                        className="w-full p-2 border rounded uppercase font-mono"
                                                        placeholder="ABCDE1234F"
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Aadhaar Number</label>
                                                    <input 
                                                        type="text" 
                                                        value={bookingForm.primaryApplicant.aadhaar}
                                                        onChange={(e) => updateApplicant(true, 'aadhaar', e.target.value)}
                                                        className="w-full p-2 border rounded font-mono"
                                                        maxLength={12}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: PAYMENT */}
                                {bookingStep === 3 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Booking Amount Payable</p>
                                            <p className="text-4xl font-bold">₹{bookingForm.payment.amount.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-2">10% of Agreement Value (Recommended)</p>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-emerald-600" /> Transaction Details
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Payment Mode</label>
                                                    <select 
                                                        value={bookingForm.payment.mode}
                                                        onChange={(e) => setBookingForm({...bookingForm, payment: {...bookingForm.payment, mode: e.target.value as any}})}
                                                        className="w-full p-2 border rounded bg-white"
                                                    >
                                                        <option>Cheque</option><option>NEFT</option><option>RTGS</option><option>UPI</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Amount Received</label>
                                                    <input 
                                                        type="number" 
                                                        value={bookingForm.payment.amount}
                                                        onChange={(e) => setBookingForm({...bookingForm, payment: {...bookingForm.payment, amount: Number(e.target.value)}})}
                                                        className="w-full p-2 border rounded font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Bank Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={bookingForm.payment.bankName || ''}
                                                        onChange={(e) => setBookingForm({...bookingForm, payment: {...bookingForm.payment, bankName: e.target.value}})}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">{bookingForm.payment.mode === 'Cheque' ? 'Cheque No' : 'UTR Number'}</label>
                                                    <input 
                                                        type="text" 
                                                        value={bookingForm.payment.instrumentNo || ''}
                                                        onChange={(e) => setBookingForm({...bookingForm, payment: {...bookingForm.payment, instrumentNo: e.target.value}})}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                                                    <input 
                                                        type="date" 
                                                        value={bookingForm.payment.instrumentDate || ''}
                                                        onChange={(e) => setBookingForm({...bookingForm, payment: {...bookingForm.payment, instrumentDate: e.target.value}})}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={bookingForm.payment.isTdsDeducted}
                                                        onChange={(e) => setBookingForm({...bookingForm, payment: {...bookingForm.payment, isTdsDeducted: e.target.checked}})}
                                                        className="w-5 h-5 rounded text-blue-600"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">TDS Deducted (1%)</p>
                                                        <p className="text-xs text-slate-500">Applicable if property value {'>'} 50 Lakhs</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: REVIEW */}
                                {bookingStep === 4 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                                            <div>
                                                <h4 className="font-bold text-emerald-800">Ready to Book</h4>
                                                <p className="text-xs text-emerald-700">Please verify all details. This action will generate the Agreement to Sale draft.</p>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">Summary</div>
                                            <div className="p-4 space-y-3 text-sm">
                                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Unit</span>
                                                    <span className="font-bold">{approvedQuoteToBook.unitNumber}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Primary Applicant</span>
                                                    <span className="font-bold">{bookingForm.primaryApplicant.fullName}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Total Cost</span>
                                                    <span className="font-bold">₹{approvedQuoteToBook.costSheet.finalPrice.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Paid Today</span>
                                                    <span className="font-bold text-emerald-600">₹{bookingForm.payment.amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
                                {bookingStep > 1 ? (
                                    <button onClick={prevStep} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                ) : (
                                    <div></div>
                                )}

                                {bookingStep < 4 ? (
                                    <button onClick={nextStep} className="px-8 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2">
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={handleBookingSubmit} className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200">
                                        <CheckCircle className="w-4 h-4" /> Confirm Booking
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {/* PRINT PREVIEW MODAL */}
                {showPrintPreview && costSheet && selectedUnit && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-3xl h-[85vh] flex flex-col rounded-lg shadow-2xl overflow-hidden">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg">Print Preview</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">Print</button>
                                    <button onClick={() => setShowPrintPreview(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-bold hover:bg-slate-300">Close</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 bg-white text-slate-800 print-area" id="printable-cost-sheet">
                                <div className="text-center mb-8 pb-4 border-b-2 border-slate-800">
                                    <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900">{projects.find(p=>p.id===selectedProject)?.name}</h1>
                                    <p className="text-sm text-slate-500">Official Cost Sheet Estimate</p>
                                </div>
                                
                                <div className="flex justify-between mb-8">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Customer</p>
                                        <p className="font-bold text-lg">{activeLead?.name}</p>
                                        <p>{activeLead?.mobile}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Unit Details</p>
                                        <p className="font-bold text-lg">{selectedUnit.unitNumber}</p>
                                        <p>{selectedUnit.type} • {selectedUnit.tower} • {selectedUnit.carpetArea} sqft</p>
                                    </div>
                                </div>

                                <table className="w-full text-left border-collapse mb-8">
                                    <thead>
                                        <tr className="bg-slate-100 border-b border-slate-300">
                                            <th className="p-3 font-bold text-sm">Component</th>
                                            <th className="p-3 font-bold text-sm text-right">Amount (INR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-100"><td className="p-3">Base Cost</td><td className="p-3 text-right">₹{costSheet.baseCost.toLocaleString()}</td></tr>
                                        <tr className="border-b border-slate-100"><td className="p-3">Floor Rise</td><td className="p-3 text-right">₹{costSheet.floorRise.toLocaleString()}</td></tr>
                                        {costSheet.plc > 0 && <tr className="border-b border-slate-100"><td className="p-3">PLC Charges</td><td className="p-3 text-right">₹{costSheet.plc.toLocaleString()}</td></tr>}
                                        {costSheet.parkingCost > 0 && <tr className="border-b border-slate-100"><td className="p-3">Parking ({costSheet.parkingCount} slots)</td><td className="p-3 text-right">₹{costSheet.parkingCost.toLocaleString()}</td></tr>}
                                        <tr className="border-b border-slate-100"><td className="p-3">Amenities & Infra</td><td className="p-3 text-right">₹{costSheet.amenities.toLocaleString()}</td></tr>
                                        <tr className="border-b border-slate-100 font-bold bg-slate-50"><td className="p-3">Agreement Value (A)</td><td className="p-3 text-right">₹{costSheet.agreementValue.toLocaleString()}</td></tr>
                                        <tr className="border-b border-slate-100"><td className="p-3 text-slate-500">GST ({costSheet.gstRate * 100}%)</td><td className="p-3 text-right text-slate-500">₹{costSheet.gstAmount.toLocaleString()}</td></tr>
                                        <tr className="border-b border-slate-100"><td className="p-3 text-slate-500">Stamp Duty & Reg.</td><td className="p-3 text-right text-slate-500">₹{(costSheet.stampDutyAmount + costSheet.registrationAmount).toLocaleString()}</td></tr>
                                        {costSheet.discount > 0 && <tr className="border-b border-slate-100 text-green-600"><td className="p-3">Less: Discount</td><td className="p-3 text-right">- ₹{costSheet.discount.toLocaleString()}</td></tr>}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-900 text-white">
                                            <td className="p-4 font-bold text-lg">Grand Total</td>
                                            <td className="p-4 font-bold text-lg text-right">₹{costSheet.finalPrice.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className="text-xs text-slate-400 mt-auto pt-8 border-t border-slate-200">
                                    <p>Terms & Conditions Apply. This is an estimate and not a legal offer. Prices valid for 7 days.</p>
                                    <p className="mt-2">Generated on {new Date().toLocaleDateString()} by EstateFlow CRM.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SalesModule;
