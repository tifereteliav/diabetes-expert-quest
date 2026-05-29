export interface ScoreImpact {
  accuracy: number;  // Clinical Accuracy impact (can be positive/negative)
  alliance: number;  // Therapeutic Alliance impact
  safety: number;    // Patient Safety impact
}

export interface PatientDemographics {
  name: string;
  age: number;
  gender: string;
  ethnicity: string;
  occupation: string;
  bmi: number;
  height: number;
  weight: number;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temp: string;
  };
}

export interface LabResult {
  name: string;
  value: string | number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  interpretation: string;
}

export interface LabPanel {
  glycemic: LabResult[];
  renal: LabResult[];
  lipids: LabResult[];
  other: LabResult[];
}

export interface HistoryItem {
  category: 'chief_complaint' | 'medical_history' | 'lifestyle' | 'family_history' | 'symptoms';
  label: string;
  value: string;
}

export interface AnamnesisOption {
  id: string;
  question: string;
  patientResponse: string;
  clinicalRationale: string;
  impact: ScoreImpact;
  isAsked?: boolean;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextId: string;
  impact: ScoreImpact;
  rationale: string;
}

export interface DialogueNode {
  id: string;
  speaker: 'practitioner' | 'patient' | 'system';
  text: string;
  choices: DialogueChoice[];
  clinicalTip?: string;
}

export interface PatientCase {
  id: string;
  demographics: PatientDemographics;
  history: HistoryItem[];
  labs: LabPanel;
  anamnesisOptions: AnamnesisOption[];
  dialogueTree: {
    [nodeId: string]: DialogueNode;
  };
  initialDialogueId: string;
}

export interface SimulationState {
  currentPhase: 'welcome' | 'anamnesis' | 'physical_labs' | 'treatment' | 'counselling' | 'feedback';
  scores: {
    accuracy: number;
    alliance: number;
    safety: number;
  };
  askedQuestions: string[]; // ids of asked anamnesis options
  dialogueHistory: { nodeId: string; choiceId?: string }[];
  currentDialogueId: string;
  selectedTreatments: string[];
}
