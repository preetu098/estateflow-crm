
import React, { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface WalkthroughProps {
  isActive: boolean;
  onComplete: () => void;
}

const Walkthrough: React.FC<WalkthroughProps> = ({ isActive, onComplete }) => {
  const [step, setStep] = useState(0);

  if (!isActive) return null;

  const steps = [
    {
      target: 'header', 
      title: 'Welcome to Real Estate 360',
      desc: 'Your complete ecosystem. The data flows like a relay race: Acquisition -> Transaction -> Fulfillment.'
    },
    {
      target: 'leads-nav',
      title: '1. Acquisition (Presales)',
      desc: 'Start here. Ingest leads, filter them via the Dialer, and trigger Site Visits (Gate Pass).',
      position: 'top-left'
    },
    {
      target: 'sales-nav',
      title: '2. Transaction (Sales)',
      desc: 'The Closing Engine. Check live inventory (Green=Available), generate quotes, and block units.',
      position: 'top-left'
    },
    {
      target: 'bookings-nav', 
      title: '3. Fulfillment (CRM)',
      desc: 'Post-Sales magic. Generate Agreements, raise Demands based on construction milestones, and manage possessions.',
      position: 'top-left'
    },
    {
        target: 'reports-nav',
        title: '4. Intelligence',
        desc: 'Track your performance. ROI dashboards, Sales Velocity, and Collection reports.',
        position: 'top-left'
    }
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white p-8 rounded-2xl max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{current.title}</h2>
        <p className="text-slate-600 mb-6 leading-relaxed text-sm">{current.desc}</p>
        
        <div className="flex justify-between items-center">
           <div className="flex gap-1">
               {steps.map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
               ))}
           </div>
           <button 
             onClick={handleNext}
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-blue-200"
           >
             {step === steps.length - 1 ? 'Get Started' : 'Next'} 
             {step === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
