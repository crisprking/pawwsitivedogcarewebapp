// Shared AI Response Types for Gemini Integration

export interface SymptomAnalysis {
  severity: "mild" | "moderate" | "severe";
  urgency: "non-urgent" | "same-day" | "emergency";
  insights: string;
  recommendations: string[];
  vetRequired: boolean;
  emergencyWarning?: string;
}

export interface PhotoAnalysis {
  findings: string;
  concerns: string[];
  recommendations: string[];
  urgencyLevel: "low" | "medium" | "high";
  suggestedActions: string[];
}

export interface EmergencyAssessment {
  urgencyLevel: "non-urgent" | "urgent" | "emergency";
  timeFrame: string;
  reasoning: string;
  immediateActions: string[];
  redFlags: string[];
  vetRequired: boolean;
}

// API Response wrappers
export interface AnalyzeSymptomResponse {
  analysis: SymptomAnalysis;
}

export interface AnalyzePhotoResponse {
  analysis: PhotoAnalysis;
}

export interface EmergencyAssessmentResponse {
  assessment: EmergencyAssessment;
}

export interface HealthSummaryResponse {
  summary: string;
}

// Request types
export interface SymptomAnalysisRequest {
  dogId: string;
  symptomData: {
    type: string;
    title: string;
    description?: string;
    severity?: string;
    breed: string;
    age?: number;
    weight?: number;
  };
}

export interface PhotoAnalysisRequest {
  dogId: string;
  context?: string;
}

export interface EmergencyAssessmentRequest {
  dogId: string;
  assessmentData: {
    symptoms: string[];
    duration: string;
    severity: string;
    currentBehavior: string;
    vitalSigns?: {
      breathing?: string;
      heartRate?: string;
      temperature?: string;
      gumColor?: string;
    };
  };
}