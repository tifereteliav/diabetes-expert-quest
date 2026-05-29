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
  Scale
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
      currentDialogueId: patientCase1.initialDialogueId,
      scores: { accuracy: 100, alliance: 100, safety: 100 },
      askedQuestions: [],
      dialogueHistory: [],
    }));
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
            <button
              onClick={() => setPhase('anamnesis')}
              className="premium-btn-primary flex items-center justify-center space-x-2 space-x-reverse self-start md:self-auto"
            >
              <span>התחל סימולציה</span>
              <ArrowLeft className="h-5 w-5" />
            </button>
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
                </div>
              </div>

              {/* Lab Panel Snapshot */}
              <div>
                <div className="flex items-center space-x-2 space-x-reverse mb-4">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">תוצאות מעבדה מרכזיות</h4>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="w-full text-right text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4 text-right">בדיקה</th>
                        <th className="px-6 py-4 text-right">תוצאה</th>
                        <th className="px-6 py-4 text-right">טווח תקין / יעד</th>
                        <th className="px-6 py-4 text-right">משמעות קלינית</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      <tr>
                        <td className="px-6 py-4 text-slate-900 font-bold">HbA1c</td>
                        <td className="px-6 py-4 text-rose-600 font-bold">{patientCase1.labs.glycemic[0].value}%</td>
                        <td className="px-6 py-4 text-slate-400">{patientCase1.labs.glycemic[0].normalRange}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[240px] leading-relaxed">{patientCase1.labs.glycemic[0].interpretation}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-slate-900 font-bold">eGFR</td>
                        <td className="px-6 py-4 text-amber-600 font-bold">{patientCase1.labs.renal[1].value}</td>
                        <td className="px-6 py-4 text-slate-400">{patientCase1.labs.renal[1].normalRange}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[240px] leading-relaxed">{patientCase1.labs.renal[1].interpretation}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-slate-900 font-bold">UACR</td>
                        <td className="px-6 py-4 text-rose-600 font-bold">{patientCase1.labs.renal[2].value} mg/g</td>
                        <td className="px-6 py-4 text-slate-400">{patientCase1.labs.renal[2].normalRange}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[240px] leading-relaxed">{patientCase1.labs.renal[2].interpretation}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-slate-900 font-bold">LDL Cholesterol</td>
                        <td className="px-6 py-4 text-rose-600 font-bold">{patientCase1.labs.lipids[0].value} mg/dL</td>
                        <td className="px-6 py-4 text-slate-400">{patientCase1.labs.lipids[0].normalRange}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[240px] leading-relaxed">{patientCase1.labs.lipids[0].interpretation}</td>
                      </tr>
                    </tbody>
                  </table>
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
                    <span>Metformin 1000mg BID (פעמיים ביום)</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>רמיפריל (טרייטיס / Tritace) 10 מ״ג פעם ביום</span>
                  </li>
                  <li className="flex items-center space-x-2 space-x-reverse text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span>Atorvastatin 20mg Daily (פעם ביום)</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Anamnesis / Dialogue Phase (Hebrew) */}
      {state.currentPhase === 'anamnesis' && (
        <div className="space-y-8 animate-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6 text-right">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <Users className="h-3 w-3 text-sky-500" />
                <span>שלב האנמנזה</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                התייעצות עם המטופל
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right">
            
            {/* Right/Main: Chat Window */}
            <div className="lg:col-span-2 flex flex-col space-y-6 bg-slate-50/50 p-4 sm:p-6 rounded-3xl border border-slate-100/80">
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
                    onClick={resetDialogue}
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
                    
                    {/* Initial Info Node */}
                    <div className="bg-white/80 p-4 rounded-2xl border border-slate-100 text-xs text-slate-500 font-medium italic text-right">
                      סימולציה קלינית החלה עבור ארתור פנדלטון. מטרתך לבנות ברית טיפולית ולברר היענות לטיפול תרופתי.
                    </div>

                    {/* Patient / System Message */}
                    <div className={`p-5 rounded-2xl border font-medium ${
                      activeDialogueNode.speaker === 'system' 
                        ? 'bg-slate-900 text-slate-100 border-slate-950 shadow-md' 
                        : 'bg-white text-slate-800 border-slate-100 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400">
                          {activeDialogueNode.speaker === 'system' ? 'סצנה קלינית' : 'המטופל (ארתור)'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line text-right">
                        {activeDialogueNode.text}
                      </p>
                    </div>

                    {/* Patient response tips */}
                    {activeDialogueNode.clinicalTip && (
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-xs font-semibold text-right">
                        💡 {activeDialogueNode.clinicalTip}
                      </div>
                    )}

                  </div>

                  {/* Choices / Actions Selector */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      בחר פעולה מהשיח:
                    </h4>
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
                        המפגש הראשוני הושלם. אנא שאל שאלות מהלוח השמאלי.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Left/Sidebar: Anamnesis Structured Questions */}
            <div className="bg-white rounded-3xl border border-slate-100/80 p-4 sm:p-6 space-y-6 flex flex-col">
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-xs">
                  פאנל שאלות אנמנזה
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  שאל את ארתור שאלות ממוקדות לגבי ההיסטוריה שלו. שים לב להשפעה הטיפולית.
                </p>
              </div>

              {/* List of questions */}
              <div className="space-y-3 overflow-y-auto max-h-[380px] flex-1 pl-1">
                {patientCase1.anamnesisOptions.map((opt) => {
                  const isAsked = state.askedQuestions.includes(opt.id);

                  return (
                    <div 
                      key={opt.id}
                      className={`rounded-2xl border transition-all duration-300 text-right ${
                        isAsked 
                          ? 'border-slate-100 bg-slate-50/50 p-4' 
                          : 'border-slate-100 hover:border-slate-200 bg-white p-4 shadow-sm hover:shadow'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs font-bold text-slate-800 leading-snug text-right">
                          {opt.question}
                        </span>
                        {!isAsked && (
                          <button
                            onClick={() => handleAskQuestion(opt.id, opt.impact)}
                            className="bg-slate-900 text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
                          >
                            שאל
                          </button>
                        )}
                      </div>
                      
                      {isAsked && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          <p className="text-xs text-slate-600 font-medium italic bg-white p-3 rounded-xl border border-slate-100/60 leading-relaxed text-right">
                            " {opt.patientResponse} "
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md space-x-2 space-x-reverse text-right">
                            <span>הסבר קליני נרשם ביומן</span>
                            <span className="text-slate-400 font-medium text-[9px] max-w-[65%] text-left truncate">
                              {opt.clinicalRationale}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. Physical Labs Phase (Hebrew Placeholder Shell) */}
      {state.currentPhase === 'physical_labs' && (
        <div className="space-y-8 animate-all duration-300 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center space-x-1.5 space-x-reverse rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Activity className="h-3 w-3 text-indigo-500" />
                <span>בדיקה גופנית ואבחון מעבדתי</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-sans">
                בדיקה גופנית ובדיקות מעבדה מורחבות
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 space-x-reverse mt-4 sm:mt-0">
              <button onClick={() => setPhase('anamnesis')} className="premium-btn-secondary py-2 text-xs w-full sm:w-auto">
                חזרה להתייעצות
              </button>
              <button onClick={() => setPhase('treatment')} className="premium-btn-primary py-2 text-xs w-full sm:w-auto">
                שלב הטיפול
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8 border border-slate-100 bg-slate-50/40 rounded-3xl text-center space-y-4">
            <Thermometer className="h-12 w-12 text-slate-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-800">סביבת עבודה אבחנתית</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              בשלב הבא של הסימולציה, המשתמש יוכל לבצע הערכה גופנית מלאה לארתור (בדיקת תחושת רגליים במונופילמנט, מישוש דפקים היקפיים) ולהזמין לוחות בדיקה מתקדמים.
            </p>
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
