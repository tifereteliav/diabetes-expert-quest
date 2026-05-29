import React from 'react';
import { Navbar } from './Navbar';

interface SimulatorLayoutProps {
  children: React.ReactNode;
  currentPhase: 'welcome' | 'anamnesis' | 'dialogue' | 'physical_labs' | 'treatment' | 'counselling' | 'feedback';
  scores: {
    accuracy: number;
    alliance: number;
    safety: number;
  };
}

export const SimulatorLayout: React.FC<SimulatorLayoutProps> = ({
  children,
  currentPhase,
  scores,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] font-sans antialiased text-slate-800 flex flex-col transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar currentPhase={currentPhase} scores={scores} />

      {/* Main Spacious Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 py-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        
        {/* Floating Content Card with Premium Design Tokens */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-4xl border border-slate-200/60 shadow-premium p-4 sm:p-10 transition-all duration-500 ease-in-out hover:border-slate-300/60">
          
          {/* Internal Layout Frame */}
          <div className="w-full h-full min-h-[500px] flex flex-col justify-between">
            {children}
          </div>
          
        </div>

        {/* Footer info/credentials */}
        <footer className="mt-8 text-center text-xs font-semibold tracking-wider text-slate-400/80 uppercase">
          סימולטור הסמכה קליני לאחיות מומחיות בסוכרת • מהדורת פרימיום v1.0
        </footer>
        
      </main>
    </div>
  );
};
