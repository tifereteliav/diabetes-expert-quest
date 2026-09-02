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
  CheckCircle2,
  Volume2,
  Info,
  Clock,
  AlertCircle,
  CheckCircle
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
    maxUnlockedStep: 0,
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
  const [inspectedHotspots, setInspectedHotspots] = useState<Record<string, string[]>>({
    pulses: [],
    doppler: [],
    monofilament: [],
    visual: [],
  });
  const [quizAnswers, setQuizAnswers] = useState<{ riskLevel: string | null; frequency: string | null }>({
    riskLevel: null,
    frequency: null,
  });
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizSuccess, setQuizSuccess] = useState(false);

  const [activeFindingText, setActiveFindingText] = useState<string | null>(null);
  const [activeFindingTitle, setActiveFindingTitle] = useState<string | null>(null);
  const [tipText, setTipText] = useState<string | null>("בחר כלי אבחון והקש על נקודות האומדן להצגת ממצאים");

  // Phase 4: Treatment Strategy states
  const [treatmentPart, setTreatmentPart] = useState<'part1' | 'part2'>('part1');
  const [part1Checked, setPart1Checked] = useState<string[]>([]);
  const [part1Feedback, setPart1Feedback] = useState<string | null>(null);
  const [part1FeedbackType, setPart1FeedbackType] = useState<'error' | 'info' | null>(null);
  const [part1Submitted, setPart1Submitted] = useState(false);
  const [part1IsValid, setPart1IsValid] = useState(false);
  const [part2Choice, setPart2Choice] = useState<'sglt2' | 'glp1' | 'hybrid' | null>(null);
  const [part2Checklist, setPart2Checklist] = useState<Record<string, boolean>>({});

  // Phase 5: Counselling & 3-Month Follow-Up states
  const [counsellingTargetAnswer, setCounsellingTargetAnswer] = useState<'yes' | 'no' | null>(null);
  const [counsellingSecondLineChoice, setCounsellingSecondLineChoice] = useState<string | null>(null);
  const [counsellingChecklist, setCounsellingChecklist] = useState<Record<string, boolean>>({});

  const allQuestionsAsked = state.askedQuestions.length === patientCase1.anamnesisOptions.length;

  // Handler for Phase change
  const setPhase = (phase: SimulationState['currentPhase']) => {
    setState(prev => {
      const stepIndices: Record<string, number> = {
        welcome: 0,
        anamnesis: 1,
        dialogue: 1,
        physical_labs: 2,
        treatment: 3,
        counselling: 4,
        feedback: 5
      };
      const newStep = stepIndices[phase] || 0;
      const currentMax = prev.maxUnlockedStep || 0;
      return {
        ...prev,
        currentPhase: phase,
        maxUnlockedStep: Math.max(currentMax, newStep)
      };
    });
  };

  const handleStepClick = (stepIdx: number) => {
    const phasesByStep: Record<number, SimulationState['currentPhase']> = {
      0: 'welcome',
      1: allQuestionsAsked ? 'dialogue' : 'anamnesis',
      2: 'physical_labs',
      3: 'treatment',
      4: 'counselling',
      5: 'feedback'
    };
    const targetPhase = phasesByStep[stepIdx];
    if (targetPhase) {
      setPhase(targetPhase);
    }
  };

  // Complete Simulation Reset Handler
  const resetSimulation = () => {
    setState({
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
      maxUnlockedStep: 0,
    });
    setIsDataRead(false);

    // Reset Phase 3 states
    setSelectedFootTool(null);
    setCompletedTools({
      pulses: false,
      doppler: false,
      monofilament: false,
      visual: false,
    });
    setInspectedHotspots({
      pulses: [],
      doppler: [],
      monofilament: [],
      visual: [],
    });
    setQuizAnswers({
      riskLevel: null,
      frequency: null,
    });
    setQuizError(null);
    setQuizSuccess(false);
    setActiveFindingText(null);
    setActiveFindingTitle(null);
    setTipText("בחר כלי אבחון והקש על נקודות האומדן להצגת ממצאים");

    // Reset Phase 4 states
    setTreatmentPart('part1');
    setPart1Checked([]);
    setPart1Feedback(null);
    setPart1FeedbackType(null);
    setPart1Submitted(false);
    setPart1IsValid(false);
    setPart2Choice(null);
    setPart2Checklist({});

    // Reset Phase 5 states
    setCounsellingTargetAnswer(null);
    setCounsellingSecondLineChoice(null);
    setCounsellingChecklist({});
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
      maxUnlockedStep: 1,
    }));
    // Reset Phase 4 local states too!
    setTreatmentPart('part1');
    setPart1Checked([]);
    setPart1Feedback(null);
    setPart1FeedbackType(null);
    setPart1Submitted(false);
    setPart1IsValid(false);
    setPart2Choice(null);
    setPart2Checklist({});
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
    setSelectedFootTool(tool);
    setActiveFindingText(null);
    setActiveFindingTitle(null);
    if (tool === 'pulses') {
      setTipText("לחץ על נקודת Dorsalis Pedis או Posterior Tibial כדי למשש דפקים");
    } else if (tool === 'doppler') {
      setTipText("לחץ על נקודת Dorsalis Pedis או Posterior Tibial כדי להאזין לזרימת הדם בדופלר");
    } else if (tool === 'monofilament') {
      setTipText("לחץ על נקודת מונופילמנט כדי לבדוק תחושה");
    } else if (tool === 'visual') {
      setTipText("לחץ על נקודת אומדן ויזואלי בעקב כדי לבחון יבלות ועור");
    }
  };

  const handleHotspotClick = (hotspotType: 'dp' | 'tp' | 'mono' | 'visual_heel' | 'visual_toes') => {
    if (!selectedFootTool) {
      setTipText("יש לבחור כלי בדיקה מסרגל הכלים תחילה!");
      return;
    }

    if (selectedFootTool === 'pulses') {
      if (hotspotType === 'dp' || hotspotType === 'tp') {
        const currentList = inspectedHotspots.pulses || [];
        const updatedList = Array.from(new Set([...currentList, hotspotType]));
        setInspectedHotspots(prev => ({ ...prev, pulses: updatedList }));

        if (updatedList.length >= 2) {
          setCompletedTools(prev => ({ ...prev, pulses: true }));
          setActiveFindingTitle("מישוש דפקים פריפריים (הושלם 2/2)");
          setActiveFindingText("נמוש דפק תקין ומלא בשני העורקים (Dorsalis Pedis & Posterior Tibial). דפקים פריפריים תקינים ומלאים, זרימת דם שמורה.");
          setTipText("כל 2 נקודות הדופק נבדקו בהצלחה! השלב הושלם. כעת ניתן לעבור לבדיקה הבאה.");
        } else {
          setActiveFindingTitle("מישוש דפקים פריפריים (נבדקה 1/2 נקודות)");
          setActiveFindingText(`נבדק עורק ${hotspotType === 'dp' ? 'גב כף הרגל (DP)' : 'הקרסול (TP)'}. יש ללחוץ על נקודת הדופק השנייה בלוח להשלמת האומדן.`);
          setTipText("נבדקה 1 מתוך 2 נקודות דופק. לחץ כעת על נקודת הדופק השנייה בלוח!");
        }
      }
    } else if (selectedFootTool === 'doppler') {
      if (hotspotType === 'dp' || hotspotType === 'tp') {
        const currentList = inspectedHotspots.doppler || [];
        const updatedList = Array.from(new Set([...currentList, hotspotType]));
        setInspectedHotspots(prev => ({ ...prev, doppler: updatedList }));

        if (updatedList.length >= 2) {
          setCompletedTools(prev => ({ ...prev, doppler: true }));
          setActiveFindingTitle("בדיקת דופלר (הושלם 2/2)");
          setActiveFindingText("בשמיעת דופלר נשמע גל תקין וזרימת דם שמורה בשני העורקים (DP & TP). זרימת דם אקוסטית שמורה בשתי כפות הרגליים.");
          setTipText("כל 2 נקודות הדופלר נבדקו בהצלחה! השלב הושלם. כעת ניתן לעבור לבדיקה הבאה.");
        } else {
          setActiveFindingTitle("בדיקת דופלר (נבדקה 1/2 נקודות)");
          setActiveFindingText(`נבדק גל דופלר בנקודת ${hotspotType === 'dp' ? 'גב כף הרגל (DP)' : 'הקרסול (TP)'}. יש ללחוץ על העורק השני בלוח להשלמת האומדן.`);
          setTipText("נבדקה 1 מתוך 2 נקודות דופלר. לחץ כעת על נקודת הדופלר השנייה בלוח!");
        }
      }
    } else if (selectedFootTool === 'monofilament') {
      if (hotspotType === 'mono') {
        const currentList = inspectedHotspots.monofilament || [];
        const updatedList = Array.from(new Set([...currentList, hotspotType]));
        setInspectedHotspots(prev => ({ ...prev, monofilament: updatedList }));

        setCompletedTools(prev => ({ ...prev, monofilament: true }));
        setActiveFindingTitle("בדיקת מונופילמנט 10 גרם (הושלם)");
        setActiveFindingText("אובדן תחושה מוחלט ברוב נקודות הבדיקה במונופילמנט 10 גרם. המטופל אינו מרגיש את סיב המונופילמנט בכריות כף הרגל ובבהונות (נוירופתיה היקפית מובהקת).");
        setTipText("בדיקת המונופילמנט הושלמה בהצלחה! כעת ניתן לעבור לאומדן הוויזואלי.");
      }
    } else if (selectedFootTool === 'visual') {
      if (hotspotType === 'visual_heel' || hotspotType === 'visual_toes') {
        const currentList = inspectedHotspots.visual || [];
        const updatedList = Array.from(new Set([...currentList, hotspotType]));
        setInspectedHotspots(prev => ({ ...prev, visual: updatedList }));

        if (updatedList.length >= 2) {
          setCompletedTools(prev => ({ ...prev, visual: true }));
          setActiveFindingTitle("אומדן ויזואלי ומבני (הושלם 2/2)");
          setActiveFindingText("נבדקו 2/2 אזורי אומדן ויזואלי: עור יבש קל בעקב ופטרת בציפורניים (Onychomycosis) בבהונות. ללא עיוות גרמי של כף הרגל וללא כיב פעיל בהווה.");
          setTipText("כל 2 נקודות האומדן הוויזואלי נבדקו בהצלחה! כעת ניתן למלא את שאלון אומדן הסיכון.");
        } else {
          setActiveFindingTitle("אומדן ויזואלי ומבני (נבדקה 1/2 נקודות)");
          setActiveFindingText(`נבדק אזור ${hotspotType === 'visual_heel' ? 'העקב והעור' : 'הציפורניים והבהונות'}. יש ללחוץ על הנקודה השנייה בלוח להשלמת האומדן הוויזואלי המלא.`);
          setTipText("נבדקה 1 מתוך 2 נקודות אומדן ויזואלי. לחץ כעת על הנקודה השנייה בלוח!");
        }
      }
    }
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
    <SimulatorLayout 
      currentPhase={state.currentPhase} 
      scores={state.scores}
      onStepClick={handleStepClick}
      maxUnlockedStep={state.maxUnlockedStep || 0}
    >
      
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
                  <div className="text-slate-400 col-span-2">גיל אבחון: <span className="text-slate-800 font-bold">{patientCase1.demographics.diagnosisAge}</span></div>
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
                              <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${lab.status === 'high' ? 'text-rose-600 bg-rose-50' : lab.status === 'low' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                {lab.value}
                                {lab.name !== 'eGFR (CKD-EPI)' && ` ${lab.unit}`}
                              </span>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {lab.name === 'eGFR (CKD-EPI)' && `${lab.unit} • `}טווח: {lab.normalRange}
                              </p>
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
                <span>בדיקה גופנית</span>
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
                          השלמת בהצלחה את שלב השיח הטיפולי הראשוני. הצלחת לבסס אמפתיה ואמון מול ארתור, תוך שימור רציונלים מקצועיים. כעת נעבור לבדיקה גופנית מלאה.
                        </p>
                        <button
                          onClick={() => setPhase('physical_labs')}
                          className="premium-btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 space-x-reverse mx-auto shadow-md"
                        >
                          <span>המשך לבדיקה גופנית</span>
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
                            המפגש הראשוני הושלם. השתמש בבדיקה גופנית למעלה להתקדמות.
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

              {/* Premium Anatomical Foot Examination Canvas Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-6">
                <div className="text-center max-w-lg mx-auto">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    תחנת אומדן מונחית אנטומיה
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    מפת כף הרגל של ארתור פנדלטון
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    בחר כלי בדיקה מסרגל הכלים ולאחר מכן לחץ על נקודות האומדן (Hotspots) המהבהבות על גבי כף הרגל כדי לקרוא את הממצאים הקליניים.
                  </p>
                </div>

                {/* Foot Image Canvas */}
                <div className="max-w-2xl w-full relative mx-auto bg-slate-50 overflow-hidden rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center">
                  {/* Real Anatomical Asset */}
                  <img 
                    src="/tibialis.png" 
                    alt="Anatomical Foot Schematic" 
                    className="w-full h-auto block object-contain select-none"
                  />

                  {/* Hotspots Overlay */}
                  {/* 1. Dorsalis Pedis Hotspot (dp) - Pulse/Doppler only */}
                  {(selectedFootTool === 'pulses' || selectedFootTool === 'doppler') && (() => {
                    const isInspected = inspectedHotspots[selectedFootTool]?.includes('dp');
                    return (
                      <button
                        type="button"
                        onClick={() => handleHotspotClick('dp')}
                        className="absolute group transition-transform duration-300 hover:scale-125 focus:outline-none z-30"
                        style={{ top: '60.5%', left: '39.5%' }}
                      >
                        <span className="relative flex h-8 w-8 items-center justify-center">
                          {!isInspected && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              selectedFootTool === 'pulses' ? 'bg-amber-400' : 'bg-sky-400'
                            }`} />
                          )}
                          <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-md items-center justify-center text-white text-[10px] font-black ${
                            isInspected ? 'bg-emerald-500' : selectedFootTool === 'pulses' ? 'bg-amber-500' : 'bg-sky-500'
                          }`}>
                            {isInspected ? '✓' : ''}
                          </span>
                        </span>
                        <span className="absolute hidden group-hover:block bg-slate-900/90 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 transition-all">
                          עורק גב כף הרגל (DP) {isInspected ? '(נבדק ✓)' : ''}
                        </span>
                      </button>
                    );
                  })()}

                  {/* 2. Tibialis Posterior Hotspot (tp) - Pulse/Doppler only */}
                  {(selectedFootTool === 'pulses' || selectedFootTool === 'doppler') && (() => {
                    const isInspected = inspectedHotspots[selectedFootTool]?.includes('tp');
                    return (
                      <button
                        type="button"
                        onClick={() => handleHotspotClick('tp')}
                        className="absolute group transition-transform duration-300 hover:scale-125 focus:outline-none z-30"
                        style={{ top: '53.6%', left: '62.7%' }}
                      >
                        <span className="relative flex h-8 w-8 items-center justify-center">
                          {!isInspected && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              selectedFootTool === 'pulses' ? 'bg-amber-400' : 'bg-sky-400'
                            }`} />
                          )}
                          <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-md items-center justify-center text-white text-[10px] font-black ${
                            isInspected ? 'bg-emerald-500' : selectedFootTool === 'pulses' ? 'bg-amber-500' : 'bg-sky-500'
                          }`}>
                            {isInspected ? '✓' : ''}
                          </span>
                        </span>
                        <span className="absolute hidden group-hover:block bg-slate-900/90 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 transition-all">
                          עורק הקרסול האחורי (TP) {isInspected ? '(נבדק ✓)' : ''}
                        </span>
                      </button>
                    );
                  })()}

                  {/* 3. Monofilament Hotspot (mono) - Sensation only (plantar/bottom edge) */}
                  {selectedFootTool === 'monofilament' && (() => {
                    const isInspected = inspectedHotspots.monofilament?.includes('mono');
                    return (
                      <button
                        type="button"
                        onClick={() => handleHotspotClick('mono')}
                        className="absolute group transition-transform duration-300 hover:scale-125 focus:outline-none z-30"
                        style={{ top: '76.7%', left: '28.9%' }}
                      >
                        <span className="relative flex h-8 w-8 items-center justify-center">
                          {!isInspected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-rose-400" />}
                          <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-md items-center justify-center text-white text-[10px] font-black ${
                            isInspected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                          }`}>
                            {isInspected ? '✓' : ''}
                          </span>
                        </span>
                        <span className="absolute hidden group-hover:block bg-slate-900/90 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 transition-all">
                          נקודת בדיקת תחושה (סוליה/כף רגל תחתונה) {isInspected ? '(נבדק ✓)' : ''}
                        </span>
                      </button>
                    );
                  })()}

                  {/* 4. Visual Inspection Hotspot 1 (visual_heel) - Heel & skin profile */}
                  {selectedFootTool === 'visual' && (() => {
                    const isInspected = inspectedHotspots.visual?.includes('visual_heel');
                    return (
                      <button
                        type="button"
                        onClick={() => handleHotspotClick('visual_heel')}
                        className="absolute group transition-transform duration-300 hover:scale-125 focus:outline-none z-30"
                        style={{ top: '78%', left: '68%' }}
                      >
                        <span className="relative flex h-8 w-8 items-center justify-center">
                          {!isInspected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-orange-400" />}
                          <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-md items-center justify-center text-white text-[10px] font-black ${
                            isInspected ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'
                          }`}>
                            {isInspected ? '✓' : ''}
                          </span>
                        </span>
                        <span className="absolute hidden group-hover:block bg-slate-900/90 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 transition-all">
                          אומדן עור ועקב {isInspected ? '(נבדק ✓)' : '(נקודה 1/2)'}
                        </span>
                      </button>
                    );
                  })()}

                  {/* 5. Visual Inspection Hotspot 2 (visual_toes) - Toes & nails profile */}
                  {selectedFootTool === 'visual' && (() => {
                    const isInspected = inspectedHotspots.visual?.includes('visual_toes');
                    return (
                      <button
                        type="button"
                        onClick={() => handleHotspotClick('visual_toes')}
                        className="absolute group transition-transform duration-300 hover:scale-125 focus:outline-none z-30"
                        style={{ top: '68%', left: '25%' }}
                      >
                        <span className="relative flex h-8 w-8 items-center justify-center">
                          {!isInspected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-orange-400" />}
                          <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-md items-center justify-center text-white text-[10px] font-black ${
                            isInspected ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'
                          }`}>
                            {isInspected ? '✓' : ''}
                          </span>
                        </span>
                        <span className="absolute hidden group-hover:block bg-slate-900/90 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 transition-all">
                          אומדן ציפורניים ובהונות {isInspected ? '(נבדק ✓)' : '(נקודה 2/2)'}
                        </span>
                      </button>
                    );
                  })()}

                  {/* Elegant Instruction Banner when active tool is 'visual' */}
                  {selectedFootTool === 'visual' && (
                    <div className="absolute top-4 left-4 right-4 bg-orange-600/95 text-white p-3 rounded-xl shadow-lg border border-orange-400 flex items-center justify-between animate-fade-in z-20">
                      <span className="text-[10px] font-black text-orange-100 block">אומדן ויזואלי ומבני פעיל ({inspectedHotspots.visual?.length || 0}/2 נקודות)</span>
                      <span className="text-[11px] font-bold text-white text-right">לחץ על 2 נקודות האומדן הכתומיות בלוח (עקב וציפורניים) כדי לבצע את האומדן.</span>
                    </div>
                  )}

                  {/* Tip banner showing helpful feedback */}
                  {tipText && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 text-white py-2 px-4 rounded-xl text-center text-xs font-semibold backdrop-blur-sm shadow-md border border-slate-700 z-20">
                      {tipText}
                    </div>
                  )}
                </div>

                {/* Displaying Clinical Finding Text dynamically */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-2 text-right">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      activeFindingTitle ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'
                    }`} />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {activeFindingTitle || "ממצאי בדיקה פעילה"}
                    </h4>
                  </div>
                  {activeFindingText ? (
                    <p className="text-xs text-slate-600 font-bold leading-relaxed border-t border-slate-200/40 pt-2.5 mt-1 animate-fade-in">
                      {activeFindingText}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed border-t border-slate-200/40 pt-2.5 mt-1 italic">
                      לחץ על אחת מהנקודות המהבהבות על מפת כף הרגל כדי לקרוא את תוצאות הבדיקה עבור כלי האבחון שבחרת.
                    </p>
                  )}
                </div>
              </div>

              {/* Doppler validation card with premium acoustics waves feedback if selected */}
              {selectedFootTool === 'doppler' && (
                <div className="bg-sky-50 border border-sky-100/80 p-5 rounded-3xl text-right animate-fade-in shadow-sm flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Volume2 className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block text-[9px] font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md mb-1 uppercase tracking-wider">
                      בונוס קליני מועדף
                    </span>
                    <h5 className="text-xs font-black text-sky-900">
                      אומדן דופלר בוצע בהצלחה!
                    </h5>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-0.5">
                      בחירה בדופלר אקוסטי מהווה פרקטיקה קלינית מועדפת במרפאות מומחים להערכת זרימת דם ומניעת מחלות היקפיות (PAD). הוענקו 5 נקודות בונוס לדיוק קליני ובברית טיפולית.
                    </p>
                  </div>
                  {/* Acoustic Waves Visualization */}
                  <div className="flex items-center gap-1 h-6 px-3 bg-sky-100/60 rounded-full shrink-0">
                    <span className="w-1 h-3 bg-sky-500 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-sky-600 rounded-full animate-bounce" />
                    <span className="w-1 h-4 bg-sky-500 rounded-full animate-pulse" />
                    <span className="w-1 h-6 bg-sky-600 rounded-full animate-bounce" />
                    <span className="w-1 h-2 bg-sky-400 rounded-full animate-pulse" />
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
                    {(() => {
                      const nextToolToApply = !completedTools.pulses 
                        ? 'pulses' 
                        : !completedTools.doppler 
                          ? 'doppler' 
                          : !completedTools.monofilament 
                            ? 'monofilament' 
                            : !completedTools.visual 
                              ? 'visual' 
                              : null;

                      return (
                        <>
                          {/* Tool 1: Pulses */}
                          <button
                            onClick={() => handleApplyTool('pulses')}
                            className={`w-full text-right p-4 rounded-2xl border transition-all duration-305 flex items-center justify-between shadow-sm group ${
                              nextToolToApply === 'pulses'
                                ? 'ring-4 ring-indigo-500 ring-offset-2 animate-pulse border-indigo-500 bg-indigo-50/40 text-indigo-950 font-black'
                                : selectedFootTool === 'pulses'
                                  ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                                  : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                                selectedFootTool === 'pulses' || nextToolToApply === 'pulses' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                              }`}>
                                <Activity className="h-4 w-4" />
                              </span>
                              <div className="text-right">
                                <span className="text-xs font-black block flex items-center space-x-2 space-x-reverse">
                                  <span>מישוש דפקים פריפריים</span>
                                  {nextToolToApply === 'pulses' && (
                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                                      לחץ כאן כעת
                                    </span>
                                  )}
                                </span>
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
                              nextToolToApply === 'doppler'
                                ? 'ring-4 ring-indigo-500 ring-offset-2 animate-pulse border-indigo-500 bg-indigo-50/40 text-indigo-950 font-black'
                                : selectedFootTool === 'doppler'
                                  ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                                  : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                                selectedFootTool === 'doppler' || nextToolToApply === 'doppler' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                              }`}>
                                <Volume2 className="h-4 w-4" />
                              </span>
                              <div className="text-right">
                                <span className="text-xs font-black block flex items-center space-x-2 space-x-reverse">
                                  <span>בדיקת דופלר (Doppler)</span>
                                  {nextToolToApply === 'doppler' && (
                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                                      לחץ כאן כעת
                                    </span>
                                  )}
                                </span>
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
                              nextToolToApply === 'monofilament'
                                ? 'ring-4 ring-indigo-500 ring-offset-2 animate-pulse border-indigo-500 bg-indigo-50/40 text-indigo-950 font-black'
                                : selectedFootTool === 'monofilament'
                                  ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                                  : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                                selectedFootTool === 'monofilament' || nextToolToApply === 'monofilament' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                              }`}>
                                <HelpCircle className="h-4 w-4" />
                              </span>
                              <div className="text-right">
                                <span className="text-xs font-black block flex items-center space-x-2 space-x-reverse">
                                  <span>מונופילמנט 10 גרם</span>
                                  {nextToolToApply === 'monofilament' && (
                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                                      לחץ כאן כעת
                                    </span>
                                  )}
                                </span>
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
                              nextToolToApply === 'visual'
                                ? 'ring-4 ring-indigo-500 ring-offset-2 animate-pulse border-indigo-500 bg-indigo-50/40 text-indigo-950 font-black'
                                : selectedFootTool === 'visual'
                                  ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-black'
                                  : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <span className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                                selectedFootTool === 'visual' || nextToolToApply === 'visual' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'
                              }`}>
                                <FileText className="h-4 w-4" />
                              </span>
                              <div className="text-right">
                                <span className="text-xs font-black block flex items-center space-x-2 space-x-reverse">
                                  <span>אומדן ויזואלי ומבני</span>
                                  {nextToolToApply === 'visual' && (
                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                                      לחץ כאן כעת
                                    </span>
                                  )}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">עור, יבלות, כיבים והנעלה</span>
                              </div>
                            </div>
                            {completedTools.visual && (
                              <span className="text-emerald-500 bg-emerald-50 rounded-full p-1 shadow-sm shrink-0">
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                            )}
                          </button>
                        </>
                      );
                    })()}
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

      {/* 4. Treatment Strategy Phase (Two-Part progressive learning gate) */}
      {state.currentPhase === 'treatment' && (
        <div className="space-y-8 animate-all duration-300 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Heart className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span>טיפול תרופתי ושינוי אורח חיים (שלב 4 מתוך 6)</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                {treatmentPart === 'part1' ? "שלב א': סינון ואבחון קווי טיפול" : "שלב ב': ניהול הדילמה המומחית"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 space-x-reverse mt-4 sm:mt-0">
              <button 
                type="button"
                onClick={() => setPhase('physical_labs')} 
                className="premium-btn-secondary py-2 text-xs w-full sm:w-auto"
              >
                חזרה לבדיקה גופנית
              </button>
              {treatmentPart === 'part2' && (
                <button 
                  type="button"
                  onClick={() => setTreatmentPart('part1')} 
                  className="premium-btn-secondary py-2 text-xs w-full sm:w-auto"
                >
                  חזרה לחלק א'
                </button>
              )}
            </div>
          </div>

          {treatmentPart === 'part1' ? (
            /* Part 1 UI */
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">שאלה לסינון קליני:</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                  לפני שקובעים את התוכנית הסופית, אילו מבין האפשרויות הטיפוליות הבאות הן הרלוונטיות והמתאימות ביותר למצבו הקליני של ארתור? (במידת הצורך, ניתן לנווט חזרה לשלבים הקודמים בסרגל העליון כדי לרענן את הזיכרון במדדי המטופל).
                </p>
              </div>

              {/* Option Matrix Grid (Shuffled Order) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'sulfonyl',
                    title: 'סולפוניל-אוריאה (Sulfonureas - למשל Amaryl / Glibetic)',
                    desc: 'מעוררים הפרשת אינסולין ללא תלות ברמת הגלוקוז, מעלים סיכון משמעותי להיפוגליקמיה ולעלייה במשקל.',
                    color: 'border-slate-200 bg-slate-50/10 text-slate-800'
                  },
                  {
                    id: 'sglt2',
                    title: 'מעכבי SGLT2 (Jardiance / Forxiga)',
                    desc: 'פועלים בנפרון להגברת הפרשת גלוקוז בשתן, מפחיתים לחץ גלומרולרי ומקנים הגנה כלייתית חזקה.',
                    color: 'border-emerald-200 bg-emerald-50/10 text-emerald-800'
                  },
                  {
                    id: 'insulin',
                    title: 'אינסולין (Insulin therapy)',
                    desc: 'טיפול הורדת סוכר יעיל, אך מעלה סיכון להיפוגליקמיה ולעלייה במשקל. אינו מועדף כקו ראשון ל-BMI 30.9 ללא אי-ספיקה חריפה.',
                    color: 'border-slate-200 bg-slate-50/10 text-slate-800'
                  },
                  {
                    id: 'dpp4',
                    title: 'מעכבי DPP-4 (Januvia / Galvus)',
                    desc: 'מעכבים פירוק GLP-1 אנדוגני. בטוחים אך בעלי יעילות מתונה ואינם מציעים הגנה כלייתית או ירידה במשקל בהשוואה ל-GLP-1 RA.',
                    color: 'border-slate-200 bg-slate-50/10 text-slate-800'
                  },
                  {
                    id: 'actos',
                    title: 'אקטוס (Actos / Pioglitazone)',
                    desc: 'משפר רגישות לאינסולין אך עלול לגרום לאגירת נוזלים חריפה, בצקות, עלייה במשקל, ומחמיר אי-ספיקת לב.',
                    color: 'border-slate-200 bg-slate-50/10 text-slate-800'
                  },
                  {
                    id: 'glp1',
                    title: 'אנלוגים ל-GLP-1 (Ozempic / Trulicity)',
                    desc: 'מגבירים הפרשת אינסולין תלויית גלוקוז, מעכבים גלוקגון, מאיטים התרוקנות קיבה ומסייעים משמעותית לירידה במשקל.',
                    color: 'border-sky-200 bg-sky-50/10 text-sky-800'
                  }
                ].map((opt) => {
                  const isChecked = part1Checked.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        // Reset submit states when selection changes
                        setPart1Submitted(false);
                        setPart1IsValid(false);
                        setPart1Feedback(null);
                        setPart1FeedbackType(null);

                        setPart1Checked(prev => {
                          const isExist = prev.includes(opt.id);
                          return isExist ? prev.filter(x => x !== opt.id) : [...prev, opt.id];
                        });
                      }}
                      className={`flex flex-col text-right p-4 rounded-2xl border transition-all duration-300 text-slate-800 hover:border-slate-400 ${
                        isChecked 
                          ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 space-x-reverse mb-2 w-full justify-between">
                        <span className="font-bold text-sm text-slate-900">{opt.title}</span>
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && (
                            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Logic Feedback Alerts */}
              {part1Submitted && part1Feedback && part1FeedbackType === 'error' && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 flex items-start space-x-3 space-x-reverse animate-all duration-300">
                  <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-sm font-semibold">{part1Feedback}</div>
                </div>
              )}

              {/* Info Feedback Alerts */}
              {part1Submitted && part1Feedback && part1FeedbackType === 'info' && (
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-sky-850 flex items-start space-x-3 space-x-reverse animate-all duration-300">
                  <Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-sm font-semibold leading-relaxed">{part1Feedback}</div>
                </div>
              )}

              {/* Success Alert */}
              {part1Submitted && part1IsValid && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 flex items-start space-x-3 space-x-reverse animate-all duration-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-sm font-bold">
                    זיהית נכון! שילוב מעכבי SGLT2 ואנלוגים ל-GLP-1 הוא המענה הסינרגיסטי הטוב ביותר לעודף משקל (BMI 30.9), פגיעה גלומרולרית מוקדמת (ACR 140) וצורך באיזון סוכר מובהק (HbA1c 8.9%). לחצי על הלחצן למטה כדי לעבור לשלב הדילמה הקלינית.
                  </div>
                </div>
              )}

              {/* Part 1 Navigation */}
              <div className="flex justify-center pt-4 border-t border-slate-100">
                {part1IsValid ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTreatmentPart('part2');
                      setPart1Feedback(null);
                      setPart1Submitted(false);
                      setPart1IsValid(false);
                    }}
                    className="premium-btn-primary px-8 py-3 text-sm flex items-center space-x-2 space-x-reverse transition-all duration-300 shadow-lg hover:shadow-sky-200/50 hover:scale-105 active:scale-95 animate-bounce"
                  >
                    <span>המשך לדיון קליני</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPart1Submitted(true);
                      const hasSglt2 = part1Checked.includes('sglt2');
                      const hasGlp1 = part1Checked.includes('glp1');
                      const isExactlyTwo = part1Checked.length === 2;
                      const isCorrect = hasSglt2 && hasGlp1 && isExactlyTwo;
                      
                      if (isCorrect) {
                        setPart1IsValid(true);
                        setPart1Feedback(null);
                        setPart1FeedbackType(null);
                      } else {
                        setPart1IsValid(false);
                        
                        // Check for genuinely incorrect/harmful options
                        const hasIncorrectOptions = part1Checked.some(x => ['sulfonyl', 'actos', 'insulin', 'dpp4'].includes(x));
                        
                        if (hasIncorrectOptions) {
                          setPart1FeedbackType('error');
                          const hasSulfonylOrActos = part1Checked.includes('sulfonyl') || part1Checked.includes('actos');
                          if (hasSulfonylOrActos) {
                            setPart1Feedback("חשבי שנית: האם סולפוניל-אוריאה או אקטוס מתאימים למטופל עם BMI גבוה וסיכון כלייתי, או שהן עלולות להחמיר עלייה במשקל ואגירת נוזלים?");
                          } else {
                            setPart1Feedback("חשבי שנית: האם בחירה זו מעניקה הגנה כלייתית מוכחת וירידה משמעותית במשקל בהשוואה לחלופות האחרות?");
                          }
                        } else if (part1Checked.length === 1 && part1Checked.includes('sglt2')) {
                          setPart1FeedbackType('info');
                          setPart1Feedback("בחירה נכונה בחלק מהטיפול. תרופה זו נותנת מענה מובהק לאחד המדדים המרכזיים של ארתור. האם זיהית מדד מרכזי נוסף בנתוני המעבדה והגוף שלו שדורש מענה תרופתי קו-ראשון? ניתן לחזור למדדי המטופל בסרגל העליון כדי לבדוק שוב.");
                        } else if (part1Checked.length === 1 && part1Checked.includes('glp1')) {
                          setPart1FeedbackType('info');
                          setPart1Feedback("בחירה נכונה בחלק מהטיפול. תרופה זו נותנת מענה מובהק לאחד המדדים המרכזיים של ארתור. האם זיהית מדד מרכזי נוסף בנתוני המעבדה והגוף שלו שדורש מענה תרופתי קו-ראשון? ניתן לחזור למדדי המטופל בסרגל העליון כדי לבדוק שוב.");
                        } else {
                          setPart1FeedbackType('error');
                          setPart1Feedback("חשבי שנית: האם בחירה זו מעניקה הגנה כלייתית מוכחת וירידה משמעותית במשקל בהשוואה לחלופות האחרות?");
                        }
                      }
                    }}
                    disabled={part1Checked.length === 0}
                    className={`premium-btn-primary px-8 py-3 text-sm flex items-center space-x-2 space-x-reverse transition-all duration-300 ${
                      part1Checked.length > 0
                        ? 'shadow-lg hover:shadow-sky-200/50 hover:scale-105 active:scale-95'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span>בדיקת התאמת הטיפול</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Part 2 UI - The Clinical Dilemma */
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-950 shadow-lg">
                <h3 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">שלב ב': ניהול הדילמה המומחית</h3>
                <p className="text-base font-bold leading-relaxed">
                  בחרת נכון ב-SGLT2 ו-GLP-1. כעת, בהתחשב ב-ACR 140 וב-BMI הגבוה שלו, כיצד תבחרי לתעדף את תחילת הטיפול?
                </p>
              </div>

              {/* 3 Dilemma Resolution Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 'sglt2',
                    title: 'עדיפות למעכבי SGLT2 (Forxiga / Jardiance)',
                    summary: 'התחלת מעכבי SGLT2 כקו ראשון להשגת הגנה כלייתית ישירה ומיידית והפחתת לחץ תוך-גלומרולרי.',
                    color: 'hover:border-emerald-300 border-slate-200 bg-white text-slate-800',
                    activeColor: 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 text-slate-800'
                  },
                  {
                    id: 'glp1',
                    title: 'עדיפות לאנלוגים ל-GLP-1 (Ozempic / Trulicity)',
                    summary: 'התחלת אנלוגים ל-GLP-1 תחילה כקו ראשון להתמודדות עם השמנת יתר (BMI 30.9) וחוסר איזון גליקמי חריף (HbA1c 8.9%).',
                    color: 'hover:border-sky-300 border-slate-200 bg-white text-slate-800',
                    activeColor: 'border-sky-500 bg-sky-50/20 ring-2 ring-sky-500/20 text-slate-800'
                  },
                  {
                    id: 'hybrid',
                    title: 'שילוב היברידי בו-זמני (SGLT2 + GLP-1)',
                    summary: 'אמנם שני הטיפולים עשויים להתאים למטופל, אך מומלץ להתחיל עם טיפול אחד ובהמשך להוסיף את השני כדי לבחון תופעות לוואי לטיפול.',
                    color: 'hover:border-violet-300 border-slate-200 bg-white text-slate-800',
                    activeColor: 'border-violet-500 bg-violet-50/20 ring-2 ring-violet-500/20 text-slate-800'
                  }
                ].map((card) => {
                  const isActive = part2Choice === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => {
                        setPart2Choice(card.id as any);
                        setPart2Checklist({}); // Reset checklist when switching cards
                      }}
                      className={`flex flex-col text-right p-5 rounded-3xl border transition-all duration-300 ${
                        isActive ? card.activeColor : card.color
                      }`}
                    >
                      <span className="font-extrabold text-base text-slate-900 mb-2">{card.title}</span>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{card.summary}</p>
                    </button>
                  );
                })}
              </div>

              {/* Evidence-Based Feedback Rationale & Nursing Checklist */}
              {part2Choice && (
                <div className="space-y-6 animate-all duration-300">
                  {/* Feedback Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2 space-x-reverse mb-3">
                      <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                      <span>רציונל קליני מבוסס ראיות:</span>
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {part2Choice === 'sglt2' && (
                        "בחירה קלינית מעולה התואמת את הנחיות KDIGO 2023. למטופל עם סוכרת, שלב 2 של מחלת כליות כרונית (eGFR 72) ומיקרואלבומינוריה מוכחת (ACR 140 mg/g), מעכבי SGLT2 מעניקים את ההגנה הכלייתית הישירה והחזקה ביותר. הם מפחיתים לחץ תוך-גלומרולרי ומאיטים משמעותית הידרדרות כלייתית ואשפוזים על רקע אי-ספיקת לב, ללא קשר לרמת ה-HbA1c."
                      )}
                      {part2Choice === 'glp1' && (
                        "בחירה טיפולית מוצדקת קלינית המתמקדת בשני חסמים מרכזיים של ארתור: השמנת יתר משמעותית (BMI 30.9) וחוסר איזון גליקמי חריף (HbA1c 8.9%). אנלוגים ל-GLP-1 מציעים הפחתת משקל דרמטית, שיפור תחושת השובע, והפחתת אלבומינוריה משנית. דגש קליני קריטי: GLP-1 יכול להוריד מהר את רמות הסוכר, ובאיזון מהיר רטינופתיה סוכרתית עלולה להחמיר – על כן יש לוודא ביצוע בדיקת רופא עיניים בשנה האחרונה ושלילת רטינופתיה המצריכה טיפול."
                      )}
                      {part2Choice === 'hybrid' && (
                        <div className="space-y-3">
                          <p>
                            נכון ששני הטיפולים עשויים להתאים למטופל, אך מבחינה קלינית מומלץ להתחיל עם טיפול אחד ובהמשך להוסיף את השני כדי לבחון תופעות לוואי לטיפול והסתגלות.
                          </p>
                          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-slate-700 font-bold">חזרה לבחירה בין שני הטיפולים המומלצים:</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPart2Choice('sglt2');
                                  setPart2Checklist({});
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all duration-200 flex items-center space-x-1 space-x-reverse"
                              >
                                <span>עבור לעדיפות SGLT2</span>
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPart2Choice('glp1');
                                  setPart2Checklist({});
                                }}
                                className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold transition-all duration-200 flex items-center space-x-1 space-x-reverse"
                              >
                                <span>עבור לעדיפות GLP-1</span>
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </p>
                  </div>

                  {/* Checklist Card (Only shown for single treatment options: SGLT2 or GLP-1) */}
                  {part2Choice !== 'hybrid' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6">
                      <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2 space-x-reverse mb-4">
                        <FileText className="h-5 w-5 text-sky-500" />
                        <span>צ'קליסט התערבויות סיעודיות מומחה (יש לאשר את כל הסעיפים לביסוס התוכנית):</span>
                      </h4>
                      
                      {/* SGLT2 Pre-Assessment Clinical Guidance Box */}
                      {part2Choice === 'sglt2' && (
                        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start space-x-3 space-x-reverse mb-4 text-xs font-semibold leading-relaxed shadow-sm">
                          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold block text-sm text-amber-950 mb-1">הערכה קלינית מוקדמת לפני תחילת SGLT2i:</span>
                            המטופל אינו רזה (BMI גבוה), רמת ה-HbA1c הינה מעל 7.0% אך פחות מ-10.0% (ב-HbA1c גבוה ללא טיפול באינסולין או במטופלים המראים סימנים לסוכרת על רקע של חוסר באינסולין יש להיזהר במתן SGLT2 מחשש ל-eDKA).
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(part2Choice === 'sglt2' ? [
                          { id: 'hygiene', text: 'הדרכה קפדנית על היגיינה אישית ואינטימית למניעת זיהומים פטרייתיים בדרכי השתן (עקב גליקוזוריה).' },
                          { id: 'hydration', text: 'הסבר על חשיבות השתייה המרובה ומניעת התייבשות (אפקט משתן מתון).' },
                          { id: 'sickdays', text: 'הדרכה על "חוקי ימי מחלה" (Sick Day Rules) - הפסקה זמנית של התרופה במצבים של שלשול, הקאה או צום לצורך מניעת eDKA.' },
                          { id: 'labs', text: 'ניטור תקופתי של תפקודי כליות (Serum Creatinine, eGFR) ואלקטרוליטים.' },
                          { id: 'bp', text: 'ניטור הדוק של לחצי דם עקב אפקט סינרגיסטי להורדת לחץ דם בשילוב עם רמיפריל.' }
                        ] : [
                          { id: 'eyecare', text: 'וידוא בדיקת רופא עיניים (קרקעית עין) בשנה האחרונה ושלילת רטינופתיה סוכרתית המצריכה טיפול (איזון גליקמי מהיר תחת GLP-1 עלול להחמיר רטינופתיה).' },
                          { id: 'technique', text: 'הדרכה ותרגול טכניקת הזרקה תת-עורית (Subcutaneous Injection) פעם בשבוע.' },
                          { id: 'gi', text: 'הסבר מפורט על תופעות לוואי במערכת העיכול (בחילות) וחשיבות העלייה ההדרגתית במינון (Titration).' },
                          { id: 'meals', text: 'הנחיה לאכילת ארוחות קטנות יותר והפסקת אכילה ברגע שמרגישים מלאים למניעת בחילות או הקאות.' },
                          { id: 'pancreatitis', text: 'מעקב אחר תסמינים מחשידים לדלקת לבלב (פנקריאטיטיס) - כאב בטן חריף מקרין לגב, ויש לבדוק רמות טריגליצרידים לפני התחלת הטיפול.' },
                          { id: 'dietitian', text: 'הפנייה לדיאטנית והמלצה לשילוב אימוני התנגדות בהתאם למסוגלות של המטופל.' },
                          { id: 'followup', text: 'בניית תוכנית מעקב אחר הסתגלות המטופל לטיפול ולתופעות הלוואי.' }
                        ]).map((item) => {
                          const isChecked = !!part2Checklist[item.id];
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setPart2Checklist(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                              }}
                              className={`flex text-right items-start space-x-3 space-x-reverse p-4 rounded-2xl border transition-all duration-300 ${
                                isChecked 
                                  ? 'border-sky-500 bg-sky-50/20 text-slate-800 shadow-sm' 
                                  : 'border-slate-100 bg-slate-50/30 text-slate-650 hover:border-slate-200'
                              }`}
                            >
                              <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                                isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isChecked && (
                                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                                  </svg>
                                )}
                              </div>
                              <span className="text-xs font-semibold leading-relaxed">{item.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Complete Action Panel */}
                  {((part2Choice === 'sglt2' && Object.values(part2Checklist).filter(Boolean).length === 5) ||
                    (part2Choice === 'glp1' && Object.values(part2Checklist).filter(Boolean).length === 7)) && (
                    <div className="flex justify-center pt-4 border-t border-slate-100 animate-all duration-300">
                      <button
                        type="button"
                        onClick={() => {
                          // Award positive clinical scores for completing Phase 4 successfully!
                          setState(prev => {
                            const newAccuracy = Math.min(100, prev.scores.accuracy + 10);
                            const newAlliance = Math.min(100, prev.scores.alliance + 10);
                            return {
                              ...prev,
                              scores: {
                                ...prev.scores,
                                accuracy: newAccuracy,
                                alliance: newAlliance,
                              }
                            };
                          });
                          setPhase('counselling');
                        }}
                        className="premium-btn-primary px-8 py-3 text-sm flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-sky-200/50 hover:scale-105 active:scale-95 animate-bounce"
                      >
                        <span>המשך לשלב הייעוץ והדרכה</span>
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Counselling / 3-Month Follow-up & Sequential Titration Phase */}
      {state.currentPhase === 'counselling' && (() => {
        // Determine primary branch (if user selected glp1 initially vs sglt2 or default)
        const isGlp1Initial = part2Choice === 'glp1';
        
        // 3-Month Labs & Clinical Data according to initial branch
        const followUpLabs = isGlp1Initial ? {
          hba1c: '7.2%',
          hba1cBadge: 'שיפור מ-8.9%, עדיין מעל היעד (< 7.0%)',
          egfr: '73 mL/min/1.73m²',
          egfrBadge: 'עלייה קלה מ-72',
          acr: '140 mg/g',
          acrBadge: 'ללא שינוי ממעבדה קודמת',
          statusDesc: 'ארתור מגיע לביקורת מעקב לאחר 3 חודשי טיפול באנלוג GLP-1 (Ozempic). הוא עלה במינון ה-GLP-1 בהדרגה בהתאם להנחיות, ללא תופעות לוואי משמעותיות במערכת העיכול (ללא בחילות או הקאות קשות).'
        } : {
          hba1c: '7.6%',
          hba1cBadge: 'שיפור מ-8.9%, מעל היעד המבוקש (< 7.0%)',
          egfr: '74 mL/min/1.73m²',
          egfrBadge: 'עלייה קלה מ-72',
          acr: '140 mg/g',
          acrBadge: 'ללא שינוי ממעבדה קודמת',
          statusDesc: 'ארתור מגיע לביקורת מעקב לאחר 3 חודשי טיפול במעכב SGLT2 (Jardiance 10mg) לצד מטפורמין. הוא מדווח על היענות מצוינת להנחיות השתייה וההיגיינה, ללא זיהומים פטרייתיים בדרכי השתן.'
        };

        const targetQuestionText = isGlp1Initial 
          ? 'האם האיזון הגליקמי כעת מספק?' 
          : 'האם המטופל הגיע ליעד האיזון הגליקמי המבוקש עבורו?';

        const secondLineQuestionText = isGlp1Initial
          ? 'מהי תרופת הבחירה המועדפת כעת להשלמת התוכנית והגנה כלייתית נוספת?'
          : 'מהי תוספת הטיפול המועדפת כעת להשגת יעד האיזון והגנה קרדיו-מטבולית נוספת?';

        const requiredChecklistItems = isGlp1Initial ? [
          { id: 'hygiene', text: 'הדרכה קפדנית על היגיינה אישית ואינטימית למניעת זיהומים פטרייתיים בדרכי השתן (עקב גליקוזוריה).' },
          { id: 'hydration', text: 'הסבר על חשיבות השתייה המרובה ומניעת התייבשות (אפקט משתן מתון).' },
          { id: 'sickdays', text: 'הדרכה על "חוקי ימי מחלה" (Sick Day Rules) - הפסקה זמנית של התרופה במצבים של שלשול, הקאה או צום לצורך מניעת eDKA.' },
          { id: 'labs', text: 'ניטור תקופתי של תפקודי כליות (Serum Creatinine, eGFR) ואלקטרוליטים.' },
          { id: 'bp', text: 'ניטור הדוק של לחצי דם עקב אפקט סינרגיסטי להורדת לחץ דם בשילוב עם רמיפריל.' }
        ] : [
          { id: 'eyecare', text: 'וידוא בדיקת רופא עיניים (קרקעית עין) בשנה האחרונה ושלילת רטינופתיה סוכרתית המצריכה טיפול (איזון גליקמי מהיר תחת GLP-1 עלול להחמיר רטינופתיה).' },
          { id: 'technique', text: 'הדרכה ותרגול טכניקת הזרקה תת-עורית (Subcutaneous Injection) פעם בשבוע.' },
          { id: 'gi', text: 'הסבר מפורט על תופעות לוואי במערכת העיכול (בחילות) וחשיבות העלייה ההדרגתית במינון (Titration).' },
          { id: 'meals', text: 'הנחיה לאכילת ארוחות קטנות יותר והפסקת אכילה ברגע שמרגישים מלאים למניעת בחילות או הקאות.' },
          { id: 'pancreatitis', text: 'מעקב אחר תסמינים מחשידים לדלקת לבלב (פנקריאטיטיס) - כאב בטן חריף מקרין לגב, ויש לבדוק רמות טריגליצרידים לפני התחלת הטיפול.' },
          { id: 'dietitian', text: 'הפנייה לדיאטנית והמלצה לשילוב אימוני התנגדות בהתאם למסוגלות של המטופל.' },
          { id: 'followup', text: 'בניית תוכנית מעקב אחר הסתגלות המטופל לטיפול ולתופעות הלוואי.' }
        ];

        const isChecklistComplete = requiredChecklistItems.every(item => !!counsellingChecklist[item.id]);

        return (
          <div className="space-y-8 animate-all duration-300 text-right">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <Clock className="h-3 w-3 text-violet-500" />
                  <span>מעקב 3 חודשים והערכת טיפול משלים</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                  ביקורת קלינית: הערכת מעבדה והרחבת הטיפול
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 space-x-reverse mt-4 sm:mt-0">
                <button onClick={() => setPhase('treatment')} className="premium-btn-secondary py-2 text-xs w-full sm:w-auto">
                  חזרה לשלב 4
                </button>
              </div>
            </div>

            {/* 3-Month Clinical Overview Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-3 bg-sky-500/20 border border-sky-400/30 rounded-2xl">
                  <Activity className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">תמונת מצב קלינית – ביקורת מעקב (3 חודשים)</h3>
                  <p className="text-xs text-sky-200 font-medium mt-0.5">ניטור תגובה טיפולית ובדיקות דם חוזרות</p>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-2xl">
                {followUpLabs.statusDesc}
              </p>

              {/* Lab metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">HbA1c נוכחי:</span>
                  <div className="text-2xl font-black text-amber-400">{followUpLabs.hba1c}</div>
                  <span className="text-[11px] text-amber-300/80 font-medium block">{followUpLabs.hba1cBadge}</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">eGFR (CKD-EPI):</span>
                  <div className="text-2xl font-black text-sky-400">{followUpLabs.egfr}</div>
                  <span className="text-[11px] text-sky-300/80 font-medium block">{followUpLabs.egfrBadge}</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">ACR (יחס אלבומין/קריאטינין):</span>
                  <div className="text-2xl font-black text-emerald-400">{followUpLabs.acr}</div>
                  <span className="text-[11px] text-emerald-300/80 font-medium block">{followUpLabs.acrBadge}</span>
                </div>
              </div>
            </div>

            {/* Step 1: Target Assessment Question */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-violet-100 text-violet-700 rounded-2xl">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{targetQuestionText}</h3>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCounsellingTargetAnswer('yes')}
                  className={`flex-1 py-4 px-6 rounded-2xl border font-bold text-sm transition-all duration-200 ${
                    counsellingTargetAnswer === 'yes'
                      ? 'border-rose-500 bg-rose-50/50 text-rose-800 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  כן
                </button>
                <button
                  type="button"
                  onClick={() => setCounsellingTargetAnswer('no')}
                  className={`flex-1 py-4 px-6 rounded-2xl border font-bold text-sm transition-all duration-200 ${
                    counsellingTargetAnswer === 'no'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  לא
                </button>
              </div>

              {/* Target Assessment Feedback */}
              {counsellingTargetAnswer === 'yes' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed flex items-start space-x-3 space-x-reverse">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-sm mb-1">חשבי שנית...</span>
                    רמת HbA1c של {followUpLabs.hba1c} אמנם מציגה שיפור יפה לעומת 8.9%, אך אינה עומדת ביעד הטיפולי המומלץ עבור ארתור (HbA1c &lt; 7.0%, ואף שאיפה לפחות מ-6.5% במידה וניתן להגיע לכך בבטחה). מכיוון שגם מעכבי SGLT2 וגם אנלוגים ל-GLP-1 אינם גורמים להיפוגליקמיה (אינם תלויים בהפרשת אינסולין כפויה), שאפתנות גליקמית הינה בטוחה ומומלצת.
                  </div>
                </div>
              )}

              {counsellingTargetAnswer === 'no' && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold leading-relaxed flex items-start space-x-3 space-x-reverse animate-all duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-sm mb-1">תשובה מדויקת קלינית!</span>
                    רמת HbA1c של {followUpLabs.hba1c} אינה מגיעה ליעד הטיפולי המבוקש (&lt; 7.0%, ועדיף אף פחות מ-6.5% במידה וניתן להגיע לכך בבטחה). עקב הפרופיל הבטוח של תרופות אלו מסיכון להיפוגליקמיה (SGLT2i ו-GLP-1 RA אינם גורמים להיפוגליקמיה כטיפול יחיד או בשילוב עם מטפורמין), מומלץ להשלים כעת את הטיפול עם התרופה המשלימה.
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Second-Line Drug Selection (Unlocked when Target Assessment is 'no') */}
            {counsellingTargetAnswer === 'no' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-all duration-300">
                <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{secondLineQuestionText}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'glp1', title: 'אנלוגים ל-GLP-1 (Ozempic / Trulicity)', isCorrect: !isGlp1Initial },
                    { id: 'sglt2', title: 'מעכבי SGLT2 (Jardiance / Forxiga)', isCorrect: isGlp1Initial },
                    { id: 'insulin', title: 'אינסולין (Insulin therapy)', isCorrect: false },
                    { id: 'sulfonylurea', title: 'סולפוניל-אוריאה (Sulfonureas)', isCorrect: false }
                  ].map((option) => {
                    const isSelected = counsellingSecondLineChoice === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setCounsellingSecondLineChoice(option.id);
                          setCounsellingChecklist({}); // Reset checklist when switching drug selection
                        }}
                        className={`p-5 rounded-2xl border text-right font-bold text-sm transition-all duration-200 ${
                          isSelected
                            ? option.isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                              : 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20'
                            : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        {option.title}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback for Drug Choice */}
                {counsellingSecondLineChoice && (
                  <div>
                    {((isGlp1Initial && counsellingSecondLineChoice === 'sglt2') || (!isGlp1Initial && counsellingSecondLineChoice === 'glp1')) ? (
                      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold leading-relaxed flex items-start space-x-3 space-x-reverse animate-all duration-300">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-sm mb-1">בחירה קלינית מושלמת!</span>
                          {isGlp1Initial 
                            ? "הוספת מעכב SGLT2 כעת מעניקה לארתור הגנה כלייתית (Renoprotection) ישירה ומבוססת ל-ACR 140 mg/g שלו, מפחיתה עומס תוך-גלומרולרי, ומביאה את רמת ה-HbA1c אל מתחת ל-7.0% בבטחה."
                            : "הוספת GLP-1 RA כעת מעניקה לארתור ירידה משמעותית במשקל (BMI 30.9), משלימה את האיזון הגליקמי אל מתחת ל-7.0%, ומעניקה הגנה קרדיווסקולרית מקיפה לצד ה-SGLT2i."}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold leading-relaxed flex items-start space-x-3 space-x-reverse animate-all duration-300">
                        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-sm mb-1">תרופה אינה מומלצת כעת</span>
                          {counsellingSecondLineChoice === 'insulin' || counsellingSecondLineChoice === 'sulfonylurea'
                            ? "תרופה זו מעלה סיכון להיפוגליקמיה ואינה מעניקה את ההגנה האיבר-מטרה הנדרשת. ההנחיות המודרניות ממליצות לשלב SGLT2i ו-GLP-1 RA לפני שקול טיפול המשרה היפוגליקמיה."
                            : "תרופה זו כבר הותחלה בקו הראשון. כעת יש להוסיף את התרופה המשלימה מהמשפחה השנייה."}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Complementary Drug Checklist (Unlocked when correct 2nd-line drug chosen) */}
            {counsellingTargetAnswer === 'no' && 
             ((isGlp1Initial && counsellingSecondLineChoice === 'sglt2') || (!isGlp1Initial && counsellingSecondLineChoice === 'glp1')) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-all duration-300">
                <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    צ'קליסט התערבויות סיעודיות להוספת {isGlp1Initial ? 'SGLT2 (יש לאשר 5 סעיפים)' : 'GLP-1 (יש לאשר 7 סעיפים)'}:
                  </h3>
                </div>

                {/* SGLT2 Pre-Assessment Guidance Box in Counselling Phase */}
                {(isGlp1Initial && counsellingSecondLineChoice === 'sglt2') && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start space-x-3 space-x-reverse mb-4 text-xs font-semibold leading-relaxed shadow-sm">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block text-sm text-amber-950 mb-1">הערכה קלינית מוקדמת לפני תחילת SGLT2i:</span>
                      המטופל אינו רזה (BMI גבוה), רמת ה-HbA1c הינה מעל 7.0% אך פחות מ-10.0% (ב-HbA1c גבוה ללא טיפול באינסולין או במטופלים המראים סימנים לסוכרת על רקע של חוסר באינסולין יש להיזהר במתן SGLT2 מחשש ל-eDKA).
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredChecklistItems.map((item) => {
                    const isChecked = !!counsellingChecklist[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCounsellingChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                        }}
                        className={`flex text-right items-start space-x-3 space-x-reverse p-4 rounded-2xl border transition-all duration-300 ${
                          isChecked 
                            ? 'border-sky-500 bg-sky-50/20 text-slate-800 shadow-sm' 
                            : 'border-slate-100 bg-slate-50/30 text-slate-650 hover:border-slate-200'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                          isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && (
                            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-semibold leading-relaxed">{item.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Complete Action Panel for Phase 5 */}
                {isChecklistComplete && (
                  <div className="flex justify-center pt-6 border-t border-slate-100 animate-all duration-300">
                    <button
                      type="button"
                      onClick={() => {
                        setState(prev => {
                          const newAccuracy = Math.min(100, prev.scores.accuracy + 10);
                          const newAlliance = Math.min(100, prev.scores.alliance + 10);
                          return {
                            ...prev,
                            scores: {
                              ...prev.scores,
                              accuracy: newAccuracy,
                              alliance: newAlliance,
                            }
                          };
                        });
                        setPhase('feedback');
                      }}
                      className="premium-btn-primary px-8 py-3.5 text-sm flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-sky-200/50 hover:scale-105 active:scale-95 animate-bounce"
                    >
                      <span>סיום הסימולציה ומעבר להערכה סופית</span>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* 6. Final Review / Feedback Phase & Complete Clinical Outcome Dashboard */}
      {state.currentPhase === 'feedback' && (
        <div className="space-y-8 animate-all duration-300 text-right">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span>הסימולציה הושלמה בהצטיינות</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                סיכום והערכת תוצאות טיפול משולב – מעקב 6 חודשים
              </h2>
            </div>
            <button onClick={resetSimulation} className="premium-btn-primary py-2 px-6 text-xs mt-4 sm:mt-0">
              התחל סימולציה מחדש
            </button>
          </div>

          {/* Final Patient Success & Clinical Resolution Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">תמונת מצב קלינית מסכמת – ארתור לאחר 6 חודשי טיפול משולב</h3>
                <p className="text-xs text-emerald-200 font-medium mt-0.5">איזון גליקמי, הגנה כלייתית ושינוי באורח חיים</p>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 p-5 rounded-2xl leading-relaxed text-sm text-emerald-50 font-medium space-y-3">
              <p>
                ארתור כעת מקבל טיפול תרופתי משולב (Metformin + SGLT2i + GLP-1 RA). למטופל אין כלל תופעות לוואי כתוצאה מהטיפול התרופתי והוא מסתדר איתו מצוין.
              </p>
              <p>
                הוא נמצא במעקב סדיר של דיאטנית ומקפיד לבצע אימוני כוח פעם בשבוע בהתאם למסוגלותו. ארתור מודה מאוד על הטיפול המסור ומרוצה מאוד מהשינוי המשמעותי שעבר באורח חייו ובהרגשתו הכללית!
              </p>
            </div>

            {/* 6 Final Clinical & Lab Outcome Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-300 font-medium">HbA1c נוכחי:</span>
                <div className="text-3xl font-black text-emerald-400">6.5%</div>
                <span className="text-[11px] text-emerald-300 font-bold block">🟢 הושג יעד האיזון הגליקמי המיטבי!</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-300 font-medium">משקל גוף:</span>
                <div className="text-3xl font-black text-sky-400">85 ק"ג</div>
                <span className="text-[11px] text-sky-300 font-bold block">🟢 ירידה מ-98 ק"ג baseline</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-300 font-medium">ACR (יחס אלבומין/קריאטינין):</span>
                <div className="text-3xl font-black text-emerald-400">50 mg/g</div>
                <span className="text-[11px] text-emerald-300 font-bold block">🟢 ירידה דרמטית מ-140 mg/g (הגנה כלייתית!)</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-300 font-medium">לחץ דם:</span>
                <div className="text-3xl font-black text-teal-300">130/86 mmHg</div>
                <span className="text-[11px] text-teal-200 font-bold block">🟢 לחץ דם תקין ומאוזן תחת רמיפריל + SGLT2</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-300 font-medium">HDL כולסטרול:</span>
                <div className="text-3xl font-black text-purple-300">45 mg/dL</div>
                <span className="text-[11px] text-purple-200 font-bold block">🟢 עלייה ב-HDL בעקבות אימוני הכוח!</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-300 font-medium">LDL כולסטרול:</span>
                <div className="text-3xl font-black text-emerald-300">68 mg/dL</div>
                <span className="text-[11px] text-emerald-200 font-bold block">🟢 מעבר מאטורבסטטין לאטוזט (Atozet)</span>
              </div>
            </div>
          </div>

          {/* Performance Assessment Journal */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              יומן הערכת מדדי מצוינות קלינית:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center">
                <Activity className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">דיוק קליני ומבוסס הנחיות</h4>
                <p className="text-3xl font-black text-emerald-700 mt-1">100/100</p>
              </div>
              <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-6 text-center">
                <Users className="h-8 w-8 text-sky-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">ברית טיפולית והדרכת מטופל</h4>
                <p className="text-3xl font-black text-sky-700 mt-1">100/100</p>
              </div>
              <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-6 text-center">
                <ShieldAlert className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">בטיחות המטופל</h4>
                <p className="text-3xl font-black text-purple-700 mt-1">100/100</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </SimulatorLayout>
  );
}

export default App;
