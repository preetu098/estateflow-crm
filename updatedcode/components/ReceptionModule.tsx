
import React, { useState, useRef, useEffect } from 'react';
import { Lead, SiteVisit, Project, Agent } from '../types';
import { QrCode, Search, UserCheck, Camera, X, RefreshCw, MapPin, Clock } from 'lucide-react';

interface ReceptionModuleProps {
    leads: Lead[];
    agents: Agent[];
    siteVisits: SiteVisit[];
    projects: Project[];
    onAddLead: (lead: Lead) => void;
    onUpdateLead: (lead: Lead) => void;
    onCheckIn: (visit: SiteVisit) => void;
    onUpdateVisit: (visit: SiteVisit) => void;
    leadSources: string[];
}

const ReceptionModule: React.FC<ReceptionModuleProps> = ({ 
    leads, siteVisits, projects, onCheckIn 
}) => {
    const [scanInput, setScanInput] = useState('');
    const [scannedLead, setScannedLead] = useState<Lead | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string>('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // CAMERA LOGIC
    const startCamera = async () => {
        setCameraError('');
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setCameraError("Camera access denied or not available. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    // Simulate QR Decoding
    const captureAndScan = () => {
        // Visual flash effect
        const canvas = document.createElement("canvas");
        if (videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            
            // Mock Logic: In real app, pass canvas data to QR decoder
            // Here we simulate a successful scan for demonstration
            // finding a mock lead to "scan"
            const mockLead = leads[0]; 
            const mockQRCode = mockLead ? mockLead.mobile : "9876543210";
            
            setScanInput(mockQRCode);
            handleManualSearch(mockQRCode);
            stopCamera();
        }
    };

    useEffect(() => {
        return () => stopCamera(); // Cleanup on unmount
    }, []);

    const handleManualSearch = (term: string) => {
        // Search logic
        const found = leads.find(l => l.mobile.includes(term) || l.name.toLowerCase().includes(term.toLowerCase()));
        if (found) {
            setScannedLead(found);
            setScanInput('');
        } else {
            if(!isCameraOpen) alert("Visitor Not Found in Database!");
        }
    };

    const confirmCheckIn = () => {
        if (!scannedLead) return;
        const newVisit: SiteVisit = {
            id: Math.random().toString(),
            leadId: scannedLead.id,
            visitorName: scannedLead.name,
            mobile: scannedLead.mobile,
            project: projects[0].name, // Default to first project
            checkInTime: new Date().toISOString(),
            status: 'Waiting',
            agentId: scannedLead.agentId || '',
            agentName: scannedLead.agentName,
            sourceType: 'Fresh'
        };
        onCheckIn(newVisit);
        setScannedLead(null);
        alert(`✅ Access Granted: ${scannedLead.name} checked in.`);
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-6 animate-fade-in bg-slate-50">
            {/* LEFT: SCANNER */}
            <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center relative overflow-hidden">
                
                {!isCameraOpen ? (
                    <>
                        <div className="bg-blue-50 p-6 rounded-full mb-6 cursor-pointer hover:bg-blue-100 transition" onClick={startCamera}>
                            <Camera className="w-12 h-12 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Scan Gate Pass</h2>
                        <p className="text-slate-500 mb-6 text-sm">Tap camera icon to scan QR Code</p>
                        <button onClick={startCamera} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition mb-4">
                            Open Camera
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80"></video>
                        <div className="absolute inset-0 border-2 border-blue-500 w-64 h-64 m-auto rounded-lg opacity-50 animate-pulse"></div>
                        
                        {/* Overlay Controls */}
                        <div className="absolute bottom-8 flex gap-4">
                            <button onClick={stopCamera} className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition">
                                <X className="w-6 h-6" />
                            </button>
                            <button onClick={captureAndScan} className="bg-white text-black p-4 rounded-full shadow-lg ring-4 ring-white/30 hover:scale-105 transition">
                                <div className="w-6 h-6 bg-red-500 rounded-full"></div> {/* Shutter button */}
                            </button>
                        </div>
                    </div>
                )}

                {cameraError && <p className="text-red-500 text-xs mb-4">{cameraError}</p>}

                <div className="w-full relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">Or search manually</span>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleManualSearch(scanInput); }} className="w-full relative mt-4">
                    <input 
                        type="text" 
                        placeholder="Mobile Number / Name" 
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </form>
            </div>

            {/* RIGHT: RESULT */}
            <div className="flex-1 flex flex-col gap-6">
                {scannedLead ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-in zoom-in duration-300 shadow-lg h-full flex flex-col justify-center">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-green-800">Visitor Identified</h3>
                                <p className="text-green-700 font-medium">Current Status: {scannedLead.stage}</p>
                            </div>
                            <div className="bg-white p-3 rounded-full shadow-sm">
                                <UserCheck className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                                <label className="text-xs text-slate-500 uppercase font-bold">Name</label>
                                <p className="font-bold text-slate-800 text-lg">{scannedLead.name}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                                <label className="text-xs text-slate-500 uppercase font-bold">Assigned To</label>
                                <p className="font-bold text-slate-800 text-lg">{scannedLead.agentName || 'Unassigned'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                                <label className="text-xs text-slate-500 uppercase font-bold">Project</label>
                                <p className="font-bold text-slate-800 text-lg">{scannedLead.project}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                                <label className="text-xs text-slate-500 uppercase font-bold">Mobile</label>
                                <p className="font-bold text-slate-800 text-lg">{scannedLead.mobile}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setScannedLead(null)} className="flex-1 py-4 bg-white border border-green-200 text-green-700 rounded-lg font-bold hover:bg-green-50 transition">
                                Cancel
                            </button>
                            <button onClick={confirmCheckIn} className="flex-[2] bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-md">
                                Confirm Check-In
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Recent Walk-ins</h3>
                            <button className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                        </div>
                        <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                            {siteVisits.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                                    <Clock className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No visits recorded today.</p>
                                </div>
                            ) : (
                                siteVisits.map(v => (
                                    <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {v.visitorName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-700">{v.visitorName}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {v.project} • {new Date(v.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {v.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceptionModule;
