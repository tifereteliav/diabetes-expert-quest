import { useState } from 'react';
import { SimulatorLayout } from './components/Layout/SimulatorLayout';
import { patientCase1 } from './data/patientCase1';
import type { SimulationState } from './types/clinical';
import { 
  User, 
  ChevronLeft, 
  ArrowLeft, 
  Sparkles, 
  Activity, 
  Users, 
  ShieldAlert, 
  HelpCircle,
  FileText,
  Thermometer,
  Heart,
  Scale,
  CheckCircle2,
  Volume2,
  Info
} from 'lucide-react';

function App() {
  // Initialize Simulation State in Hebrew
  const [state, setState] = useState<SimulationState>({
    currentPhase: 'welcome',
    scores: {
      accuracy: 100,
      alliance: 100,
      safety: 100,
    },
    askedQuestions: [],
    dialogueHistory: [],
    currentDialogueId: patientCase1.initialDialogueId,
    selectedTreatments: [],
  });

  const activeDialogueNode = patientCase1.dialogueTree[state.currentDialogueId];
  const [isDataRead, setIsDataRead] = useState(false);

  // Phase 3: Diabetic Foot Examination states
  const [selectedFootTool, setSelectedFootTool] = useState<'pulses' | 'doppler' | 'monofilament' | 'visual' | null>(null);
  const [completedTools, setCompletedTools] = useState<Record<string, boolean>>({
    pulses: false,
    doppler: false,
    monofilament: false,
    visual: false,
  });
  const [quizAnswers, setQuizAnswers] = useState<{ riskLevel: string | null; frequency: string | null }>({
    riskLevel: null,
    frequency: null,
  });
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizSuccess, setQuizSuccess] = useState(false);

  const allQuestionsAsked = state.askedQuestions.length === patientCase1.anamnesisOptions.length;

  // Handler for Phase change
  const setPhase = (phase: SimulationState['currentPhase']) => {
    setState(prev => ({ ...prev, currentPhase: phase }));
  };

  // Handler for Dialogue choice selection
  const handleDialogueChoice = (choiceId: string, nextId: string, impact: typeof state.scores) => {
    setState(prev => {
      const newAccuracy = Math.max(0, Math.min(100, prev.scores.accuracy + impact.accuracy));
      const newAlliance = Math.max(0, Math.min(100, prev.scores.alliance + impact.alliance));
      const newSafety = Math.max(0, Math.min(100, prev.scores.safety + impact.safety));
      
      return {
        ...prev,
        scores: {
          accuracy: newAccuracy,
          alliance: newAlliance,
          safety: newSafety,
        },
        currentDialogueId: nextId,
        dialogueHistory: [...prev.dialogueHistory, { nodeId: prev.currentDialogueId, choiceId }],
      };
    });
  };

  // Handler for Anamnesis question selection
  const handleAskQuestion = (questionId: string, impact: typeof state.scores) => {
    if (state.askedQuestions.includes(questionId)) return;

    setState(prev => {
      const newAccuracy = Math.max(0, Math.min(100, prev.scores.accuracy + impact.accuracy));
      const newAlliance = Math.max(0, Math.min(100, prev.scores.alliance + impact.alliance));
      const newSafety = Math.max(0, Math.min(100, prev.scores.safety + impact.safety));

      return {
        ...prev,
        scores: {
          accuracy: newAccuracy,
          alliance: newAlliance,
          safety: newSafety,
        },
        askedQuestions: [...prev.askedQuestions, questionId],
      };
    });
  };

  // Reset dialogue to initial state
  const resetDialogue = () => {
    setState(prev => ({
      ...prev,
      currentPhase: 'anamnesis',
      currentDialogueId: patientCase1.initialDialogueId,
      scores: { accuracy: 100, alliance: 100, safety: 100 },
      askedQuestions: [],
      dialogueHistory: [],
      scoresAfterAnamnesis: undefined,
    }));
  };

  // Reset only the dialogue phase (preserving Anamnesis)
  const resetDialogueOnly = () => {
    setState(prev => ({
      ...prev,
      currentDialogueId: patientCase1.initialDialogueId,
      scores: prev.scoresAfterAnamnesis ? { ...prev.scoresAfterAnamnesis } : { accuracy: 100, alliance: 100, safety: 100 },
      dialogueHistory: [],
    }));
  };

  // Helper to determine if all foot exam tools have been applied
  const allToolsCompleted = completedTools.pulses && completedTools.doppler && completedTools.monofilament && completedTools.visual;

  // Handler to apply clinical examination tool
  const handleApplyTool = (tool: 'pulses' | 'doppler' | 'monofilament' | 'visual') => {
    // Award Doppler bonus points only once!
    if (tool === 'doppler' && !completedTools.doppler) {
      setState(prev => {
        const newAccuracy = Math.min(100, prev.scores.accuracy + 5);
        const newAlliance = Math.min(100, prev.scores.alliance + 5);
        return {
          ...prev,
          scores: {
            ...prev.scores,
            accuracy: newAccuracy,
            alliance: newAlliance,
          }
        };
      });
    }

    setCompletedTools(prev => ({ ...prev, [tool]: true }));
    setSelectedFootTool(tool);
  };

  // Handler for Phase 3 Diagnostic Quiz submission
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quizAnswers.riskLevel === 'level_1' && quizAnswers.frequency === '6_months') {
      setQuizSuccess(true);
      setQuizError(null);
      // Award risk quiz points (+10 accuracy, +10 safety) only once!
      if (!quizSuccess) {
        setState(prev => {
          const newAccuracy = Math.min(100, prev.scores.accuracy + 10);
          const newSafety = Math.min(100, prev.scores.safety + 10);
          return {
            ...prev,
            scores: {
              ...prev.scores,
              accuracy: newAccuracy,
              safety: newSafety,
            }
          };
        });
      }
    } else {
      setQuizSuccess(false);
      setQuizError("שגיאת סיווג קליני: סיווג הסיכון או תדירות המעקב אינם תואמים את ממצאי הבדיקה וחוזר מינהל הסיעוד 154/19. עליך לבחון מחדש את שילוב הנוירופתיה והקלוס הקיים.");
    }
  };

  return (
    <SimulatorLayout currentPhase={state.currentPhase} scores={state.scores}>
      
      {/* 1. Welcome Phase (Hebrew) */}
      {state.currentPhase === 'welcome' && (
        <div className="space-y-8 animate-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 text-right">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <Sparkles className="h-3 w-3" />
                <span>סימולציה ברמת מומחה</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                תיק מטופל לסימולציה קלינית
              </h2>
              <p className="text-slate-500 mt-1">
                הערך, אבחן ובנה תוכנית טיפול מותאמת אישית עבור מטופל מורכב עם סוכרת מסוג 2.
              </p>
            </div>
          </div>

          {/* Grid Layout of Patient Case Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right">
            
            {/* Column 1 & 2: Patient Profile & Labs */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Profile Card */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center text-center sm:text-right">
                <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <User className="h-10 w-10 text-sky-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    {patientCase1.demographics.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500">
                    בן {patientCase1.demographics.age} • {patientCase1.demographics.gender} • מוצא {patientCase1.demographics.ethnicity}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    עיסוק: <span className="text-slate-700 font-semibold">{patientCase1.demographics.occupation}</span>
                  </p>
                </div>
                <div className="w-full sm:w-auto sm:mr-auto sm:ml-0 grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-medium border-t sm:border-t-0 sm:border-r border-slate-200/80 pt-4 sm:pt-0 sm:pr-6 shrink-0 text-right">
                  <div className="text-slate-400">BMI: <span className="text-slate-800 font-bold">{patientCase1.demographics.bmi}</span></div>
                  <div className="text-slate-400">גובה: <span className="text-slate-800 font-bold">{patientCase1.demographics.height} ס״מ</span></div>
                  <div className="text-slate-400">משקל: <span className="text-slate-800 font-bold">{patientCase1.demographics.weight} ק״ג</span></div>
                  <div className="text-slate-400">ל״ד: <span className="text-slate-800 font-bold">{patientCase1.demographics.vitalSigns.bloodPressure}</span></div>
                  <div className="text-slate-400 col-span-2 border-t border-slate-100 pt-2 mt-1">שנת אבחון: <span className="text-slate-800 font-bold">2018 (במשך 8 שנים)</span></div>
                  <div className="text-slate-400 col-span-2">גיל אבחון: <span className="text-slate-800 font-bold">57</span></div>
                </div>
              </div>

              {/* Lab Panel Snapshot - Grouped Clinical Matrix */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <FileText className="h-5 w-5 text-slate-700" />
                  <h4 className="text-lg font-bold text-slate-900">לוח מדדים ובדיקות מעבדה מורחב</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Panel 1: אבחון ואיזון סוכר */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-sky-200">
                    <div className="bg-sky-50/50 px-4 py-3 border-b border-sky-100/50 flex items-center justify-between">
                      <span className="text-xs font-black text-sky-800">אבחון ואיזון סוכר</span>
                      <Activity className="h-4 w-4 text-sky-500" />
                    </div>
                    <div className="p-4 space-y-4 divide-y divide-slate-50">
                      {patientCase1.labs.glycemic.slice(0, 2).map((lab) => (
                        <div key={lab.name} className="pt-3 first:pt-0">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-900">{lab.name}</span>
                            <div className="text-right">
                              <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${lab.status === 'high' ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>{lab.value}{lab.unit}</span>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">יעד בצום: {lab.normalRange}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{lab.interpretation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 2: אבחנה מבדלת (סוג סוכרת) */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-amber-200">
                    <div className="bg-amber-50/50 px-4 py-3 border-b border-amber-100/50 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800">אבחנה מבדלת (סוג סוכרת)</span>
                      <HelpCircle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="p-4 space-y-4 divide-y divide-slate-50">
                      {patientCase1.labs.glycemic.slice(2, 4).map((lab) => (
                        <div key={lab.name} className="pt-3 first:pt-0">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-900">{lab.name}</span>
                            <div className="text-right">
                              <span className="text-sm font-black px-2 py-0.5 rounded-lg text-emerald-600 bg-emerald-50">{lab.value}</span>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">טווח: {lab.normalRange}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{lab.interpretation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 3: תפקודי כליות ושתן */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-emerald-200">
                    <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100/50 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800">תפקודי כליות ושתן</span>
                      <FileText className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="p-4 space-y-4 divide-y divide-slate-50">
                      {patientCase1.labs.renal.map((lab) => (
                        <div key={lab.name} className="pt-3 first:pt-0">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-900">{lab.name}</span>
                            <div className="text-right">
                              <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${lab.status === 'high' ? 'text-rose-600 bg-rose-50' : lab.status === 'low' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>{lab.value} {lab.unit}</span>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">טווח: {lab.normalRange}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{lab.interpretation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 4: פרופיל שומנים ולחץ דם */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-violet-200">
                    <div className="bg-violet-50/50 px-4 py-3 border-b border-violet-100/50 flex items-center justify-between">
                      <span className="text-xs font-black text-violet-800">פרופיל שומנים ולחץ דם</span>
                      <Activity className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="p-4 space-y-4 divide-y divide-slate-50">
                      {patientCase1.labs.lipids.map((lab) => (
                        <div key={lab.name} className="pt-3 first:pt-0">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-900">{lab.name}</span>
                            <div className="text-right">
                              <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${lab.status === 'high' ? 'text-rose-600 bg-rose-50' : lab.status === 'low' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>{lab.value} {lab.unit}</span>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">יעד: {lab.normalRange}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{lab.interpretation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Panel 5: כבד ואנמיה */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-rose-200">
                  <div className="bg-rose-50/50 px-4 py-3 border-b border-rose-100/50 flex items-center justify-between">
                    <span className="text-xs font-black text-rose-800">כבד ואנמיה</span>
                    <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
                    {patientCase1.labs.other.slice(2, 5).map((lab, index) => (
                      <div key={lab.name} className={`${index > 0 ? 'pt-4 md:pt-0 md:pr-6' : ''}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-slate-900">{lab.name}</span>
                          <div className="text-right">
                            <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${lab.status === 'high' ? 'text-rose-600 bg-rose-50' : lab.status === 'low' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>{lab.value} {lab.unit}</span>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">טווח: {lab.normalRange}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{lab.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Column 3: History & Presentation */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100/80 p-4 sm:p-6 space-y-6">
              <div>
                <h4 className="text-md font-bold text-slate-950 uppercase tracking-wider text-xs">תמונת המטופל</h4>
                <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed italic bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right">
                  {patientCase1.history[0].value}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-bold text-slate-950 uppercase tracking-wider text-xs">משטר טיפול נוכחי</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center space-x-2 space-x-reverse text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Metformin 850mg X2 ביום</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>רמיפריל (טרייטיס / Tritace) 5 מ״ג פעם ביום</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span>Atorvastatin 20mg Daily (פעם ביום)</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Action Card: Consent & Start Simulation */}
          <div className="mt-8 bg-slate-50/50 border border-slate-200/50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
            <div className="flex items-start space-x-3 space-x-reverse max-w-2xl">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={isDataRead}
                onChange={(e) => setIsDataRead(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
              />
              <label 
                htmlFor="consent-checkbox" 
                className="text-sm font-semibold text-slate-700 select-none cursor-pointer leading-relaxed text-right"
              >
                אישור קריאת נתונים: קראתי ועברתי על הממצאים הקליניים, תוצאות המעבדה והטיפול התרופתי שהוא מקבל.
              </label>
            </div>
            
            <button
              onClick={() => setPhase('anamnesis')}
              disabled={!isDataRead}
              className={`premium-btn-primary flex items-center justify-center space-x-2 space-x-reverse px-8 py-4 text-base font-bold transition-all duration-500 w-full md:w-auto shrink-0 ${
                isDataRead
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none hover:transform-none pointer-events-none'
              }`}
            >
              <span>התחל סימולציה</span>
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2A. Pure Anamnesis Phase (Phase 1) */}
      {state.currentPhase === 'anamnesis' && (
        <div className="space-y-8 animate-all duration-500 text-right">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <Users className="h-3 w-3 text-sky-500" />
                <span>שלב א': תשאול ואנמנזה</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                תשאול והערכה קלינית ראשונית
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                עליך לשאול את ארתור שש שאלות אנמנזה מרכזיות כדי לזהות את ההקשר המשפחתי, ההיענות לטיפול, התסמינים ומערך התמיכה שלו.
              </p>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse mt-4 sm:mt-0">
              <button 
                onClick={resetDialogue}
                className="premium-btn-secondary py-2 text-xs"
              >
                איפוס מפגש
              </button>
              <button
                onClick={() => setPhase('welcome')}
                className="premium-btn-secondary py-2 text-xs"
              >
                חזרה לפרופיל
              </button>
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="bg-white border border-slate-100/80 shadow-premium p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-slate-700">
              <span>התקדמות תשאול האנמנזה</span>
              <span className={allQuestionsAsked ? 'text-emerald-600' : 'text-sky-600'}>
                {state.askedQuestions.length} מתוך {patientCase1.anamnesisOptions.length} שאלות נענו
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  allQuestionsAsked ? 'bg-emerald-500' : 'bg-sky-500'
                }`}
                style={{ width: `${(state.askedQuestions.length / patientCase1.anamnesisOptions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Centered Anamnesis Questions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientCase1.anamnesisOptions.map((opt) => {
              const isAsked = state.askedQuestions.includes(opt.id);

              return (
                <div 
                  key={opt.id}
                  className={`rounded-3xl border transition-all duration-350 p-6 flex flex-col justify-between text-right ${
                    isAsked 
                      ? 'border-emerald-100 bg-emerald-50/10 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-200 shadow-premium hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <span className={`text-sm font-black leading-snug ${isAsked ? 'text-slate-800' : 'text-slate-900'}`}>
                        {opt.question}
                      </span>
                      {isAsked && (
                        <span className="text-emerald-500 bg-emerald-50 rounded-full p-1.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </span>
                      )}
                    </div>

                    {isAsked ? (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        {/* Arthur's Response */}
                        <div className="bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm leading-relaxed text-slate-800 text-xs font-semibold">
                          <span className="text-[10px] font-black text-emerald-500 block mb-1">המטופל (ארתור)</span>
                          "{opt.patientResponse}"
                        </div>
                        {/* Clinical Rationale */}
                        <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100/30 leading-relaxed text-sky-900 text-[11px] font-bold">
                          <span className="text-[10px] font-black text-sky-500 block mb-1">רציונל קליני</span>
                          {opt.clinicalRationale}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">
                        לחץ על הכפתור כדי לשאול את המטופל ולקבל מידע אנמנסטי חיוני.
                      </p>
                    )}
                  </div>

                  {!isAsked && (
                    <button
                      onClick={() => handleAskQuestion(opt.id, opt.impact)}
                      className="mt-6 w-full bg-slate-900 text-white rounded-2xl py-3 text-sm font-bold hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                    >
                      שאל את ארתור
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Premium Transition Action Button */}
          {allQuestionsAsked && (
            <div className="mt-12 flex justify-center animate-fade-in">
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  currentPhase: 'dialogue',
                  scoresAfterAnamnesis: { ...prev.scores }
                }))}
                className="premium-btn-primary bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 text-base font-black px-10 py-5 rounded-3xl flex items-center gap-3 transition-all duration-500 animate-float"
              >
                <span>המשך לשיחה הטיפולית</span>
                <ArrowLeft className="h-5 w-5 animate-pulse" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2B. Pure Dialogue Phase (Phase 2) */}
      {state.currentPhase === 'dialogue' && (
        <div className="space-y-8 animate-all duration-500 text-right">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Users className="h-3 w-3 text-indigo-500" />
                <span>שלב ב': שיח טיפולי וברית</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                התייעצות ושיח טיפולי
              </h2>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse mt-4 sm:mt-0">
              <button 
                onClick={resetDialogue}
                className="premium-btn-secondary py-2 text-xs"
              >
                איפוס מפגש
              </button>
              <button
                onClick={() => setPhase('welcome')}
                className="premium-btn-secondary py-2 text-xs"
              >
                חזרה לפרופיל
              </button>
              <button
                onClick={() => setPhase('physical_labs')}
                className="premium-btn-primary py-2 text-xs flex items-center space-x-1 space-x-reverse"
              >
                <span>מדדים ומעבדה</span>
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Right/Main: Dialogue Chat Area */}
            <div className="lg:col-span-2 flex flex-col space-y-6 bg-slate-50/50 p-4 sm:p-6 rounded-3xl border border-slate-100/80 shadow-premium">
              {state.currentDialogueId === 'game_over_node' ? (
                <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8 shadow-2xl flex flex-col justify-center items-center text-center space-y-6 transition-all duration-300">
                  <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-pulse shadow-md">
                    <ShieldAlert className="h-9 w-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-red-800 font-sans leading-none">
                      כישלון קליני / המפגש הופסק
                    </h3>
                    <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                      חוסר אמפתיה וגישה סמכותנית מדי גרמו למטופל להתגונן ולעזוב את המרפאה. אחות מומחית בסוכרת חייבת לבסס ברית טיפולית תחילה כדי לזכות באמונו ולסייע לו בתהליך הטיפולי.
                    </p>
                  </div>
                  <div className="p-4 bg-white/70 border border-red-100/50 rounded-2xl text-xs text-red-900 font-bold max-w-md leading-relaxed italic">
                    "עזבי, אני ממהר, ניפגש בפעם אחרת. אין לי כוח לזה עכשיו."
                  </div>
                  <button
                    onClick={resetDialogueOnly}
                    className="premium-btn-primary bg-slate-900 hover:bg-slate-800 transition-all rounded-2xl shadow-lg px-8 py-3 text-sm font-bold flex items-center space-x-2 space-x-reverse"
                  >
                    <span>נסה שוב</span>
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    יומן שיחה
                  </h3>

                  {/* Message Display Area */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pl-2 pr-1 flex-1">
                    
                    {/* Dynamic Start Context Block always at the top of Chat Log */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-950 shadow-md text-right text-xs leading-relaxed">
                      <span className="text-[10px] font-black text-sky-400 block mb-1">סביבת המפגש (רקע)</span>
                      {patientCase1.dialogueTree.start.text}
                    </div>

                    {/* dialogue history log */}
                    {state.dialogueHistory.map((item, idx) => {
                      const node = patientCase1.dialogueTree[item.nodeId];
                      const choice = node.choices.find(c => c.id === item.choiceId);
                      if (!choice) return null;
                      
                      const nextNode = patientCase1.dialogueTree[choice.nextId];

                      return (
                        <div key={idx} className="space-y-3 transition-all duration-300">
                          {/* Practitioner's choice bubble */}
                          <div className="bg-sky-50 border border-sky-100/80 text-sky-900 p-4 rounded-2xl text-sm font-semibold max-w-[85%] mr-auto ml-0 text-right shadow-sm">
                            <span className="text-[10px] font-black text-sky-500 block mb-1">את/ה (אחות מומחית)</span>
                            {choice.text}
                          </div>
                          {/* Patient's response bubble */}
                          {nextNode && nextNode.id !== 'game_over_node' && nextNode.id !== 'explore_phase' && nextNode.id !== 'anamnesis_intro' && (
                            <div className="bg-white border border-slate-100 text-slate-800 p-4 rounded-2xl text-sm font-medium max-w-[85%] ml-auto mr-0 text-right shadow-sm">
                              <span className="text-[10px] font-black text-emerald-500 block mb-1">המטופל (ארתור)</span>
                              "{nextNode.text}"
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Active Dialogue Node Message (Arthur's active response) */}
                    {state.currentDialogueId !== 'start' && state.currentDialogueId !== 'explore_phase' && (
                      <div className="p-5 rounded-2xl border font-medium bg-white text-slate-800 border-slate-100 shadow-sm animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-500">
                            {activeDialogueNode.speaker === 'system' ? 'סצנה קלינית' : 'המטופל (ארתור)'}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-line text-right">
                          {activeDialogueNode.text}
                        </p>
                      </div>
                    )}

                    {/* Clinical tip if active */}
                    {activeDialogueNode.clinicalTip && (
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-xs font-semibold text-right animate-fade-in">
                        💡 {activeDialogueNode.clinicalTip}
                      </div>
                    )}

                  </div>

                  {/* Dialogue Choices Panel */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      בחר פעולה מהשיח:
                    </h4>

                    {state.currentDialogueId === 'explore_phase' ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 text-center space-y-4 animate-fade-in shadow-inner">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-black text-emerald-800">הברית הטיפולית בוססה בהצלחה!</h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                          השלמת בהצלחה את שלב השיח הטיפולי הראשוני. הצלחת לבסס אמפתיה ואמון מול ארתור, תוך שימור רציונלים מקצועיים. כעת נעבור לבדיקה גופנית מלאה והזמנת מדדי מעבדה.
                        </p>
                        <button
                          onClick={() => setPhase('physical_labs')}
                          className="premium-btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 space-x-reverse mx-auto shadow-md"
                        >
                          <span>המשך לבדיקה גופנית ומעבדה</span>
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="transition-all duration-500 ease-in-out">
                        {activeDialogueNode.choices.length > 0 ? (
                          <div className="space-y-2">
                            {activeDialogueNode.choices.map((choice) => (
                              <button
                                key={choice.id}
                                onClick={() => handleDialogueChoice(choice.id, choice.nextId, choice.impact)}
                                className="w-full text-right p-4 rounded-2xl bg-white border border-slate-100 text-slate-700 text-sm font-semibold hover:border-sky-500 hover:text-slate-950 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow group space-x-2 space-x-reverse"
                              >
                                <span className="max-w-[90%] leading-snug">{choice.text}</span>
                                <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-sky-500 group-hover:-translate-x-1 transition-all shrink-0" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-100/50 text-slate-500 text-xs font-medium text-center">
                            המפגש הראשוני הושלם. השתמש במדדי מעבדה למעלה להתקדמות.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Left Sidebar: Read-only completed Anamnesis summary */}
            <div className="bg-white rounded-3xl border border-slate-100/80 p-4 sm:p-6 space-y-6 flex flex-col shadow-premium">
              <div>
                <div className="flex items-center space-x-2 space-x-reverse text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-max text-xs font-bold mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>אומדן אנמנזה הושלם</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-wider">
                  היסטוריה קלינית של ארתור
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  נתונים קליניים שנאספו במהלך תשאול האנמנזה. השתמש בהם לשיח הטיפולי.
                </p>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[380px] flex-1 pl-1">
                {patientCase1.anamnesisOptions.map((opt) => (
                  <div key={opt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/60 text-right space-y-2">
                    <span className="text-xs font-black text-slate-900 block border-b border-slate-200 pb-1.5">
                      {opt.question}
                    </span>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed italic bg-white p-3 rounded-xl border border-slate-50">
                      "{opt.patientResponse}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Physical Labs Phase (Dedicated Diabetic Foot Exam Station) */}
      {state.currentPhase === 'physical_labs' && (
        <div className="space-y-8 animate-all duration-500 text-right">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Thermometer className="h-3 w-3 text-indigo-500 animate-pulse" />
                <span>שלב ג': אומדן כף רגל סוכרתית (154/19)</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                תחנת אומדן כף רגל סוכרתית (חוזר מינהל הסיעוד 154/19)
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                בצע בדיקה גופנית מקיפה ואומדן כפות רגליים דו-צדדי לארתור. מפה את הדפקים, התחושה והמצב המבני כדי לסווג את רמת הסיכון שלו.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 space-x-reverse mt-4 sm:mt-0">
              <button 
                onClick={() => {
                  setPhase('dialogue');
                }} 
                className="premium-btn-secondary py-2 text-xs w-full sm:w-auto"
              >
                חזרה לשיח הטיפול
              </button>
            </div>
          </div>

          {/* Core Interactive Layout: Two Feet side-by-side & Exam Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1 & 2: Interactive Foot Outlines and Findings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Sensation/Findings Snapshot Header */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">כלי בדיקה פעיל</h4>
                  <p className="text-sm font-black text-slate-800 mt-0.5 animate-fade-in">
                    {selectedFootTool === 'pulses' && 'מישוש דפקים פריפריים (Dorsalis Pedis & Posterior Tibial)'}
                    {selectedFootTool === 'doppler' && 'בדיקת דופלר (Doppler Acoustic Flow Validation)'}
                    {selectedFootTool === 'monofilament' && 'בדיקת מונופילמנט 10 גרם (Neuropathy Mapping)'}
                    {selectedFootTool === 'visual' && 'אומדן ויזואלי ומבני (Skin, Callus, Ulcer & Footwear Inspection)'}
                    {!selectedFootTool && 'טרם נבחר כלי בדיקה'}
                  </p>
                </div>
                
                {/* Visual completion summary */}
                <div className="text-xs font-bold text-slate-500">
                  הושלמו: {Object.values(completedTools).filter(Boolean).length} מתוך 4 בדיקות
                </div>
              </div>

              {/* Side-by-Side Right and Left Foot Schematic Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Foot Map (כף רגל שמאל) */}
                <div className={`bg-white border p-6 rounded-3xl flex flex-col items-center justify-between relative min-h-[360px] transition-all duration-300 shadow-premium ${
                  selectedFootTool ? 'border-indigo-100 bg-indigo-50/5' : 'border-slate-100'
                }`}>
                  <div className="absolute top-4 right-4 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                    כף רגל שמאל
                  </div>

                  {/* Foot Outlines using CSS elements and test points */}
                  <div className="w-32 h-64 border-4 border-slate-200 rounded-full flex flex-col items-center justify-between p-4 relative bg-slate-50/50 shadow-inner mt-4">
                    {/* Metatarsal Heads Hotspots */}
                    <div className="absolute top-6 left-5 flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'monofilament' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'monofilament' && <span className="text-[8px] font-black text-rose-600 mt-1">1st Met.</span>}
                    </div>

                    <div className="absolute top-10 left-14 flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'monofilament' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'monofilament' && <span className="text-[8px] font-black text-rose-600 mt-1">3rd Met.</span>}
                    </div>

                    <div className="absolute top-14 left-22 flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'monofilament' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'monofilament' && <span className="text-[8px] font-black text-rose-600 mt-1">5th Met.</span>}
                    </div>

                    {/* Artery Hotspots */}
                    <div className="absolute top-28 left-14 flex flex-col items-center">
                      <span className={`h-4 w-4 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'pulses' ? 'bg-amber-500 animate-pulse' : selectedFootTool === 'doppler' ? 'bg-sky-500 animate-bounce' : 'bg-slate-300'
                      }`} />
                      {(selectedFootTool === 'pulses' || selectedFootTool === 'doppler') && <span className="text-[8px] font-bold text-slate-600 mt-1">A. Dorsalis Pedis</span>}
                    </div>

                    <div className="absolute bottom-16 left-8 flex flex-col items-center">
                      <span className={`h-4 w-4 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'pulses' ? 'bg-amber-500 animate-pulse' : selectedFootTool === 'doppler' ? 'bg-sky-500 animate-bounce' : 'bg-slate-300'
                      }`} />
                      {(selectedFootTool === 'pulses' || selectedFootTool === 'doppler') && <span className="text-[8px] font-bold text-slate-600 mt-1">A. Tibialis Post.</span>}
                    </div>

                    {/* Heel/Callus Hotspot */}
                    <div className="absolute bottom-6 left-13 flex flex-col items-center">
                      <span className={`h-3.5 w-3.5 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'visual' ? 'bg-orange-400' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'visual' && <span className="text-[8px] font-black text-orange-600 mt-1">Heel Callus</span>}
                    </div>
                  </div>

                  {/* Reactive Foot Finding Card Summary */}
                  <div className="w-full mt-4 text-xs font-semibold leading-relaxed text-right">
                    {selectedFootTool === 'pulses' && (
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-amber-900 animate-fade-in shadow-sm">
                        👣 <strong>מישוש דפקים:</strong> דפקים פריפריים מוחלשים (+2) במישוש עורקי גב כף הרגל (DP) והקרסול האחורי (PT).
                      </div>
                    )}
                    {selectedFootTool === 'doppler' && (
                      <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-2xl text-sky-900 animate-fade-in shadow-sm">
                        🔊 <strong>בדיקת דופלר:</strong> גל דו-פאזי מוחלש נמדד אקוסטית. זרימת דם קיימת ללא חסימה מלאה.
                      </div>
                    )}
                    {selectedFootTool === 'monofilament' && (
                      <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-rose-950 animate-fade-in shadow-sm">
                        🔴 <strong>בדיקת תחושה:</strong> אובדן תחושה מגן (LOPS) בראשי המטטרסוסים 1, 3 ו-5. שאר נקודות הבדיקה תקינות.
                      </div>
                    )}
                    {selectedFootTool === 'visual' && (
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-700 animate-fade-in shadow-sm space-y-1">
                        <div>• <strong>עור:</strong> יבש ומקשקש (Anhidrosis).</div>
                        <div>• <strong>יבלת (Callus):</strong> קלוס מתון בעקב שמאל.</div>
                        <div>• <strong>כיבים/עיוותים:</strong> אין עדות לכיבים פעילים, אין עיוותי שלד.</div>
                      </div>
                    )}
                    {!selectedFootTool && (
                      <div className="p-4 bg-slate-50 border border-slate-200/30 rounded-2xl text-slate-400 text-center text-[11px] font-medium leading-relaxed italic">
                        בחר כלי בדיקה מסרגל הכלים להצגת הממצאים כאן.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Foot Map (כף רגל ימין) */}
                <div className={`bg-white border p-6 rounded-3xl flex flex-col items-center justify-between relative min-h-[360px] transition-all duration-300 shadow-premium ${
                  selectedFootTool ? 'border-indigo-100 bg-indigo-50/5' : 'border-slate-100'
                }`}>
                  <div className="absolute top-4 right-4 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                    כף רגל ימין
                  </div>

                  {/* Foot Outlines using CSS elements and test points */}
                  <div className="w-32 h-64 border-4 border-slate-200 rounded-full flex flex-col items-center justify-between p-4 relative bg-slate-50/50 shadow-inner mt-4">
                    {/* Metatarsal Heads Hotspots */}
                    <div className="absolute top-6 right-5 flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'monofilament' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'monofilament' && <span className="text-[8px] font-black text-rose-600 mt-1">1st Met.</span>}
                    </div>

                    <div className="absolute top-10 right-14 flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'monofilament' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'monofilament' && <span className="text-[8px] font-black text-rose-600 mt-1">3rd Met.</span>}
                    </div>

                    <div className="absolute top-14 right-22 flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'monofilament' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'monofilament' && <span className="text-[8px] font-black text-rose-600 mt-1">5th Met.</span>}
                    </div>

                    {/* Artery Hotspots */}
                    <div className="absolute top-28 right-14 flex flex-col items-center">
                      <span className={`h-4 w-4 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'pulses' ? 'bg-amber-500 animate-pulse' : selectedFootTool === 'doppler' ? 'bg-sky-500 animate-bounce' : 'bg-slate-300'
                      }`} />
                      {(selectedFootTool === 'pulses' || selectedFootTool === 'doppler') && <span className="text-[8px] font-bold text-slate-600 mt-1">A. Dorsalis Pedis</span>}
                    </div>

                    <div className="absolute bottom-16 right-8 flex flex-col items-center">
                      <span className={`h-4 w-4 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'pulses' ? 'bg-amber-500 animate-pulse' : selectedFootTool === 'doppler' ? 'bg-sky-500 animate-bounce' : 'bg-slate-300'
                      }`} />
                      {(selectedFootTool === 'pulses' || selectedFootTool === 'doppler') && <span className="text-[8px] font-bold text-slate-600 mt-1">A. Tibialis Post.</span>}
                    </div>

                    {/* Heel/Callus Hotspot */}
                    <div className="absolute bottom-6 right-13 flex flex-col items-center">
                      <span className={`h-3.5 w-3.5 rounded-full shadow-sm transition-all duration-500 ${
                        selectedFootTool === 'visual' ? 'bg-orange-400' : 'bg-slate-300'
                      }`} />
                      {selectedFootTool === 'visual' && <span className="text-[8px] font-black text-orange-600 mt-1">Heel Callus</span>}
                    </div>
                  </div>

                  {/* Reactive Foot Finding Card Summary */}
                  <div className="w-full mt-4 text-xs font-semibold leading-relaxed text-right">
                    {selectedFootTool === 'pulses' && (
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-amber-900 animate-fade-in shadow-sm">
                        👣 <strong>מישוש דפקים:</strong> דפקים פריפריים מוחלשים (+2) במישוש עורקי גב כף הרגל (DP) והקרסול האחורי (PT).
                      </div>
                    )}
                    {selectedFootTool === 'doppler' && (
                      <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-2xl text-sky-900 animate-fade-in shadow-sm">
                        🔊 <strong>בדיקת דופלר:</strong> גל דו-פאזי מוחלש נמדד אקוסטית. זרימת דם קיימת ללא חסימה מלאה.
                      </div>
                    )}
                    {selectedFootTool === 'monofilament' && (
                      <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-rose-950 animate-fade-in shadow-sm">
                        🔴 <strong>בדיקת תחושה:</strong> אובדן תחושה מגן (LOPS) בראשי המטטרסוסים 1, 3 ו-5. שאר נקודות הבדיקה תקינות.
                      </div>
                    )}
                    {selectedFootTool === 'visual' && (
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-700 animate-fade-in shadow-sm space-y-1">
                        <div>• <strong>עור:</strong> יבש ומקשקש (Anhidrosis).</div>
                        <div>• <strong>יבלת (Callus):</strong> קלוס מתון בעקב ימין.</div>
                        <div>• <strong>כיבים/עיוותים:</strong> אין עדות לכיבים פעילים, אין עיוותי שלד.</div>
                      </div>
                    )}
                    {!selectedFootTool && (
                      <div className="p-4 bg-slate-50 border border-slate-200/30 rounded-2xl text-slate-400 text-center text-[11px] font-medium leading-relaxed italic">
                        בחר כלי בדיקה מסרגל הכלים להצגת הממצאים כאן.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Doppler validation card with premium acoustics waves feedback if selected */}
              {selectedFootTool === 'doppler' && (
                <div className="bg-sky-50 border border-sky-100/80 p-5 rounded-3xl text-right animate-fade-in shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Volume2 className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="inline-block text-[9px] font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md mb-1 uppercase tracking-wider">
                      בונוס קליני מועדף
                    </span>
                    <h5 className="text-xs font-black text-sky-900">
                      אומדן דופלר בוצע בהצלחה!
                    </h5>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-0.5">
                      בחירה בדופלר אקוסטי מהווה פרקטיקה קלינית מועדפת במרפאות מומחים להערכת זרימת דם ומניעת מחלות היקפיות (PAD). הוענקו 5 נקודות בונוס לדיוק קליני וברית טיפולית.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Column 3: Tools Selection or Cognitive Gatekeeping Risk Quiz */}
            <div className="bg-white rounded-3xl border border-slate-100/80 p-4 sm:p-6 space-y-6 shadow-premium flex flex-col justify-between">
              
              {!allToolsCompleted ? (
                /* 1. Clinical Tool Belt (Show when exams are in progress) */
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-right">
                    <h3 className="text-sm font-black text-slate-900 tracking-wider">
                      ארגז כלי אומדן קליניים
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      בחר כלי אבחוני כדי ליישם אותו על כפות הרגליים ולתעד את הממצאים הרפואיים.
                    </p>
                  </div>

                  <div className="space-y-3 flex-1 py-4">
                    {/* Tool 1: Pulses */}
                    <button
                      onClick={() => handleApplyTool('pulses')}
                      className={`w-full text-right p-4 rounded-2xl border transition-all duration-305 flex items-center justify-between shadow-sm group ${
                        selectedFootTool === 'pulses'
                          ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                          selectedFootTool === 'pulses' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          <Activity className="h-4 w-4" />
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black block">מישוש דפקים פריפריים</span>
                          <span className="text-[9px] text-slate-400 font-medium">עורקי גב הרגל והקרסול</span>
                        </div>
                      </div>
                      {completedTools.pulses && (
                        <span className="text-emerald-500 bg-emerald-50 rounded-full p-1 shadow-sm shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                    </button>

                    {/* Tool 2: Doppler */}
                    <button
                      onClick={() => handleApplyTool('doppler')}
                      className={`w-full text-right p-4 rounded-2xl border transition-all duration-305 flex items-center justify-between shadow-sm group ${
                        selectedFootTool === 'doppler'
                          ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                          selectedFootTool === 'doppler' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          <Volume2 className="h-4 w-4" />
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black block">בדיקת דופלר (Doppler)</span>
                          <span className="text-[9px] text-slate-400 font-medium">אישוש זרימה אקוסטי מועדף</span>
                        </div>
                      </div>
                      {completedTools.doppler && (
                        <span className="text-emerald-500 bg-emerald-50 rounded-full p-1 shadow-sm shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                    </button>

                    {/* Tool 3: Monofilament */}
                    <button
                      onClick={() => handleApplyTool('monofilament')}
                      className={`w-full text-right p-4 rounded-2xl border transition-all duration-305 flex items-center justify-between shadow-sm group ${
                        selectedFootTool === 'monofilament'
                          ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                          selectedFootTool === 'monofilament' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          <HelpCircle className="h-4 w-4" />
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black block">מונופילמנט 10 גרם</span>
                          <span className="text-[9px] text-slate-400 font-medium">מיפוי נוירופתיה תחושתית</span>
                        </div>
                      </div>
                      {completedTools.monofilament && (
                        <span className="text-emerald-500 bg-emerald-50 rounded-full p-1 shadow-sm shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                    </button>

                    {/* Tool 4: Visual */}
                    <button
                      onClick={() => handleApplyTool('visual')}
                      className={`w-full text-right p-4 rounded-2xl border transition-all duration-305 flex items-center justify-between shadow-sm group ${
                        selectedFootTool === 'visual'
                          ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                          selectedFootTool === 'visual' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black block">אומדן ויזואלי ומבני</span>
                          <span className="text-[9px] text-slate-400 font-medium">עור, יבלות, כיבים והנעלה</span>
                        </div>
                      </div>
                      {completedTools.visual && (
                        <span className="text-emerald-500 bg-emerald-50 rounded-full p-1 shadow-sm shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 text-[10px] text-slate-400 font-semibold leading-relaxed text-right">
                    💡 <strong>הנחיה:</strong> עליך להפעיל את כל 4 כלי האומדן הקליניים על כפות הרגליים כדי לגלות את כל הממצאים ולפתוח את שלב קביעת דרגת הסיכון.
                  </div>
                </div>
              ) : (
                /* 2. Cognitive Risk Quiz (Gatekeeping Risk Quiz) */
                <form onSubmit={handleQuizSubmit} className="space-y-6 flex-1 flex flex-col justify-between animate-fade-in text-right">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full w-max text-xs font-bold mb-1 shadow-sm">
                      <Thermometer className="h-4 w-4" />
                      <span>אומדן הושלם - נדרש סיווג סיכון</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 tracking-wider">
                      טופס קביעת סיכון ומעקב (154/19)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      סווג את מצבו של ארתור וקבע תוכנית מעקב מותאמת לפי ממצאי הנוירופתיה והקלוס הקיים.
                    </p>
                  </div>

                  <div className="space-y-4 flex-1 py-4">
                    
                    {/* Q1: Risk Level */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                        <Info className="h-3 w-3 text-indigo-500" />
                        <span>1. מהי רמת הסיכון של ארתור לפי הנוהל?</span>
                      </label>
                      <div className="space-y-1.5">
                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.riskLevel === 'level_0' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="riskLevel"
                            value="level_0"
                            checked={quizAnswers.riskLevel === 'level_0'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, riskLevel: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>דרגה 0: סיכון נמוך (ללא אובדן תחושה מגן וללא PAD)</span>
                        </label>

                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.riskLevel === 'level_1' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="riskLevel"
                            value="level_1"
                            checked={quizAnswers.riskLevel === 'level_1'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, riskLevel: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>דרגה 1 (בינונית): איבוד תחושה מגן עקב נוירופתיה וקלוס</span>
                        </label>

                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.riskLevel === 'level_2' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="riskLevel"
                            value="level_2"
                            checked={quizAnswers.riskLevel === 'level_2'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, riskLevel: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>דרגה 2 (גבוהה): מחלת עורקים היקפית עם איבוד תחושה מגן ו/או עיוות</span>
                        </label>

                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.riskLevel === 'level_3' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="riskLevel"
                            value="level_3"
                            checked={quizAnswers.riskLevel === 'level_3'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, riskLevel: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>דרגה 3: סיכון גבוה מאוד (היסטוריה של כיב או קטיעה בעבר)</span>
                        </label>
                      </div>
                    </div>

                    {/* Q2: Re-examination Frequency */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                        <Info className="h-3 w-3 text-indigo-500" />
                        <span>2. מהי תדירות ביצוע אומדן חוזר הנדרשת לדרגה זו?</span>
                      </label>
                      <div className="space-y-1.5">
                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.frequency === '12_months' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="frequency"
                            value="12_months"
                            checked={quizAnswers.frequency === '12_months'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, frequency: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>פעם בשנה (מעקב שנתי)</span>
                        </label>

                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.frequency === '6_months' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="frequency"
                            value="6_months"
                            checked={quizAnswers.frequency === '6_months'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, frequency: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>פעם בשישה חודשים (מעקב חצי-שנתי)</span>
                        </label>

                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.frequency === '3_6_months' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="frequency"
                            value="3_6_months"
                            checked={quizAnswers.frequency === '3_6_months'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, frequency: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>בטווח של 3 עד 6 חודשים</span>
                        </label>

                        <label className={`w-full flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                          quizAnswers.frequency === '3_months' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="frequency"
                            value="3_months"
                            checked={quizAnswers.frequency === '3_months'}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, frequency: e.target.value }))}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSuccess}
                          />
                          <span>פעם בשלושה חודשים (מעקב רבעוני)</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Feedback Messages & Submit Button */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {quizError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-bold rounded-2xl animate-fade-in shadow-sm leading-relaxed text-right">
                        ⚠️ {quizError}
                      </div>
                    )}

                    {quizSuccess && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-bold rounded-2xl animate-fade-in shadow-sm leading-relaxed text-right">
                        🎉 <strong>מצוין! סיווג קליני מדויק:</strong> ארתור סווג בהצלחה בדרגת סיכון 1 (עקב נוירופתיה וקלוס בעקבים), הדורשת מעקב חוזר פעם בשישה חודשים. הוענקו 10 נקודות לדיוק קליני ובטיחות המטופל!
                      </div>
                    )}

                    {!quizSuccess ? (
                      <button
                        type="submit"
                        disabled={!quizAnswers.riskLevel || !quizAnswers.frequency}
                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 shadow-md ${
                          quizAnswers.riskLevel && quizAnswers.frequency
                            ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
                        }`}
                      >
                        אשר וסווג סיכון קליני
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPhase('treatment');
                        }}
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:-translate-y-0.5 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer animate-float"
                      >
                        <span>המשך לתוכנית התערבות והדרכה</span>
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* 4. Treatment Strategy Phase (Hebrew Placeholder Shell) */}
      {state.currentPhase === 'treatment' && (
        <div className="space-y-8 animate-all duration-300 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Heart className="h-3 w-3 text-emerald-500" />
                <span>טיפול תרופתי ושינוי אורח חיים</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                אופטימיזציה טיפולית
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 space-x-reverse mt-4 sm:mt-0">
              <button onClick={() => setPhase('physical_labs')} className="premium-btn-secondary py-2 text-xs w-full sm:w-auto">
                חזרה למעבדה
              </button>
              <button onClick={() => setPhase('counselling')} className="premium-btn-primary py-2 text-xs w-full sm:w-auto">
                שלב הייעוץ
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8 border border-slate-100 bg-slate-50/40 rounded-3xl text-center space-y-4">
            <Scale className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">סביבת עבודה לרשימת מרשמים והתאמות מינון</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              בשלב הבא, תוכל לבחון אפשרויות קליניות מגוונות (כגון שילוב מעכבי SGLT2 להגנה כלייתית וקרדיווסקולרית עקב מיקרואלבומינוריה, אנלוגים ל-GLP-1 או כוונון היענות למטפורמין) ולמדוד את השפעתם.
            </p>
          </div>
        </div>
      )}

      {/* 5. Counselling / Follow-up Phase (Hebrew Placeholder Shell) */}
      {state.currentPhase === 'counselling' && (
        <div className="space-y-8 animate-all duration-300 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Users className="h-3 w-3 text-violet-500" />
                <span>הדרכת מטופל ותמיכה</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                ראיון מוטיבציוני ושמירה על הרגליים
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 space-x-reverse mt-4 sm:mt-0">
              <button onClick={() => setPhase('treatment')} className="premium-btn-secondary py-2 text-xs w-full sm:w-auto">
                חזרה לטיפול
              </button>
              <button onClick={() => setPhase('feedback')} className="premium-btn-primary py-2 text-xs w-full sm:w-auto">
                הערכה סופית
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8 border border-slate-100 bg-slate-50/40 rounded-3xl text-center space-y-4">
            <HelpCircle className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">סביבת עבודה לייעוץ והדרכה</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              בשלב הבא, תבנה תוכנית הסברה ולימוד הממוקדת בבדיקה עצמית של כפות הרגליים, ניהול תזונה תחת סדר יום לחוץ, ומציאת מנגנונים תומכים למניעת שכחת תרופות בערב.
            </p>
          </div>
        </div>
      )}

      {/* 6. Final Review / Feedback Phase (Hebrew Placeholder Shell) */}
      {state.currentPhase === 'feedback' && (
        <div className="space-y-8 animate-all duration-300 text-right">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>הסימולציה הושלמה</span>
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                יומן הערכת ביצועים
              </h2>
            </div>
            <button onClick={() => setPhase('welcome')} className="premium-btn-primary py-2 text-xs">
              התחל סימולציה מחדש
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-6 text-center">
              <Activity className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800">דיוק קליני</h4>
              <p className="text-2xl font-black text-emerald-700 mt-1">{state.scores.accuracy}/100</p>
            </div>
            <div className="bg-sky-50/30 border border-sky-100 rounded-2xl p-6 text-center">
              <Users className="h-8 w-8 text-sky-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800">ברית טיפולית</h4>
              <p className="text-2xl font-black text-sky-700 mt-1">{state.scores.alliance}/100</p>
            </div>
            <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 text-center">
              <ShieldAlert className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800">בטיחות המטופל</h4>
              <p className="text-2xl font-black text-rose-700 mt-1">{state.scores.safety}/100</p>
            </div>
          </div>
        </div>
      )}

    </SimulatorLayout>
  );
}

export default App;
