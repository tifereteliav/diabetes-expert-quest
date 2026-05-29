import React from 'react';
import { Stethoscope, Activity, Users, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentPhase: 'welcome' | 'anamnesis' | 'physical_labs' | 'treatment' | 'counselling' | 'feedback';
  scores: {
    accuracy: number;
    alliance: number;
    safety: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ currentPhase, scores }) => {
  const phases = [
    { id: 'welcome', label: 'פרטי המטופל' },
    { id: 'anamnesis', label: 'אנמנזה' },
    { id: 'physical_labs', label: 'מדדים ומעבדה' },
    { id: 'treatment', label: 'תוכנית טיפול' },
    { id: 'counselling', label: 'ייעוץ והדרכה' },
    { id: 'feedback', label: 'הערכה סופית' },
  ];

  const getPhaseIndex = (phaseId: string) => {
    return phases.findIndex((p) => p.id === phaseId);
  };

  const currentIdx = getPhaseIndex(currentPhase);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-950/15">
            <Stethoscope className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans leading-tight">
              ארכיטקט <span className="text-sky-500">הסוכרת</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-sans">
              סימולטור קליני למומחים
            </p>
          </div>
        </div>

        {/* Phase Progress Tracker */}
        <nav className="hidden md:flex items-center space-x-2 space-x-reverse">
          {phases.map((phase, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;

            return (
              <React.Fragment key={phase.id}>
                {idx > 0 && (
                  <div className={`h-[2px] w-4 lg:w-8 transition-colors duration-500 ${
                    isCompleted ? 'bg-sky-500' : 'bg-slate-100'
                  }`} />
                )}
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${
                      isActive
                        ? 'bg-slate-900 text-white ring-4 ring-slate-100 scale-105'
                        : isCompleted
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`text-xs font-medium transition-colors duration-500 ${
                      isActive
                        ? 'text-slate-900 font-semibold'
                        : isCompleted
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Score Badges */}
        <div className="flex items-center space-x-4 space-x-reverse">
          
          {/* Clinical Accuracy */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 space-x-reverse rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 text-emerald-700 shadow-sm transition-all duration-300">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-bold font-sans">דיוק קליני: {scores.accuracy}</span>
            </div>
            <div className="mt-1 h-1 w-24 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                style={{ width: `${Math.max(0, Math.min(100, scores.accuracy))}%` }}
              />
            </div>
          </div>

          {/* Therapeutic Alliance */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 space-x-reverse rounded-full border border-sky-100 bg-sky-50/50 px-3 py-1 text-sky-700 shadow-sm transition-all duration-300">
              <Users className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-bold font-sans">ברית טיפולית: {scores.alliance}</span>
            </div>
            <div className="mt-1 h-1 w-24 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-sky-500 transition-all duration-500 ease-out" 
                style={{ width: `${Math.max(0, Math.min(100, scores.alliance))}%` }}
              />
            </div>
          </div>

          {/* Patient Safety */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 space-x-reverse rounded-full border border-rose-100 bg-rose-50/50 px-3 py-1 text-rose-700 shadow-sm transition-all duration-300">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-bold font-sans">בטיחות המטופל: {scores.safety}</span>
            </div>
            <div className="mt-1 h-1 w-24 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-500 ease-out" 
                style={{ width: `${Math.max(0, Math.min(100, scores.safety))}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
