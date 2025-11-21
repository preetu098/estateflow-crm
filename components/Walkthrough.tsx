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
      target: 'header', // Generic center
      title: 'Welcome to EstateFlow',
      desc: 'Your all-in-one Real Estate CRM. Let\'s take a quick tour of the "God Mode" capabilities.'
    },
    {
      target: 'settings-nav', // Simulated position
      title: 'Super Admin Settings',
      desc: 'Start here. Configure Projects, Pricing, and Users. Changes here update the entire app instantly.',
      position: 'bottom-left'
    },
    {
      target: 'sales-nav',
      title: 'Sales Center',
      desc: 'Where your agents close deals. View live inventory, generate cost sheets, and book units.',
      position: 'top-left'
    },
    {
        target: 'reception-nav',
        title: 'Reception & Gate',
        desc: 'Manage walk-ins and scan QR Gate Passes for VIP entry.',
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
        <p className="text-slate-600 mb-6 leading-relaxed">{current.desc}</p>
        
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