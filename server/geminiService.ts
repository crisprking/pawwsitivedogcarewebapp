import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Import shared types
import type {
  SymptomAnalysis,
  PhotoAnalysis,
  EmergencyAssessment
} from "@shared/aiTypes";

// Re-export for convenience
export type {
  SymptomAnalysis,
  PhotoAnalysis,
  EmergencyAssessment
};

export async function analyzeSymptoms(
  symptomData: {
    type: string;
    title: string;
    description?: string;
    severity?: string;
    breed: string;
    age?: number;
    weight?: number;
  }
): Promise<SymptomAnalysis> {
  try {
    const systemPrompt = `You are a veterinary AI assistant specializing in dog health analysis. 
Analyze the symptoms provided and give professional insights while emphasizing that this is not a replacement for veterinary care.
Always err on the side of caution and recommend professional veterinary consultation when in doubt.
Provide practical, actionable advice for dog owners.

Respond with JSON in this exact format:
{
  "severity": "mild" | "moderate" | "severe",
  "urgency": "non-urgent" | "same-day" | "emergency",  
  "insights": "detailed analysis of the symptoms",
  "recommendations": ["specific actionable recommendations"],
  "vetRequired": true/false,
  "emergencyWarning": "urgent warning if applicable"
}`;

    const prompt = `Analyze these dog symptoms:
    
Dog Information:
- Breed: ${symptomData.breed}
- Age: ${symptomData.age ? symptomData.age + " years" : "unknown"}
- Weight: ${symptomData.weight ? symptomData.weight + " lbs" : "unknown"}

Symptom Details:
- Type: ${symptomData.type}
- Title: ${symptomData.title}
- Description: ${symptomData.description || "No additional description"}
- Owner-reported severity: ${symptomData.severity || "Not specified"}

Please provide a thorough analysis focusing on:
1. Severity assessment based on the symptoms
2. Urgency level for veterinary care
3. Detailed insights about potential causes
4. Specific recommendations for the owner
5. Whether immediate veterinary attention is required
6. Any emergency warnings if the symptoms suggest serious conditions`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["mild", "moderate", "severe"] },
            urgency: { type: "string", enum: ["non-urgent", "same-day", "emergency"] },
            insights: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            vetRequired: { type: "boolean" },
            emergencyWarning: { type: "string" },
          },
          required: ["severity", "urgency", "insights", "recommendations", "vetRequired"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    
    if (!rawJson || rawJson.trim() === "") {
      throw new Error("Empty response from Gemini model");
    }
    
    try {
      const analysis: SymptomAnalysis = JSON.parse(rawJson);
      return analysis;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", rawJson);
      throw new Error(`Invalid JSON response from Gemini: ${parseError}`);
    }
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    throw new Error(`Failed to analyze symptoms: ${error}`);
  }
}

export async function analyzeHealthPhoto(photoBuffer: Buffer, mimeType: string, context?: string): Promise<PhotoAnalysis> {
  try {
    const systemPrompt = `You are a veterinary AI assistant specializing in visual analysis of dog health images.
Analyze the photo carefully and provide insights about any visible health concerns.
Be thorough but cautious - recommend professional veterinary consultation for any concerning findings.
Focus on observable conditions like skin issues, wounds, swelling, discharge, posture, or other visible abnormalities.

Respond with JSON in this exact format:
{
  "findings": "detailed description of what you observe",
  "concerns": ["specific health concerns identified"],
  "recommendations": ["actionable recommendations"],
  "urgencyLevel": "low" | "medium" | "high",
  "suggestedActions": ["immediate actions owner should take"]
}`;

    const prompt = `Analyze this dog health photo and provide detailed insights:

${context ? `Context provided by owner: ${context}` : "No additional context provided"}

Please examine the image for:
1. Visible skin conditions, lesions, or abnormalities
2. Signs of injury, swelling, or inflammation
3. Discharge from eyes, nose, or ears
4. Posture or mobility indicators
5. Overall physical condition
6. Any concerning visual symptoms

Provide a comprehensive analysis with specific observations and recommendations.`;

    const contents = [
      {
        inlineData: {
          data: photoBuffer.toString("base64"),
          mimeType: mimeType,
        },
      },
      prompt,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            findings: { type: "string" },
            concerns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            urgencyLevel: { type: "string", enum: ["low", "medium", "high"] },
            suggestedActions: { type: "array", items: { type: "string" } },
          },
          required: ["findings", "concerns", "recommendations", "urgencyLevel", "suggestedActions"],
        },
      },
      contents: contents,
    });

    const rawJson = response.text;
    
    if (!rawJson || rawJson.trim() === "") {
      throw new Error("Empty response from Gemini model");
    }
    
    try {
      const analysis: PhotoAnalysis = JSON.parse(rawJson);
      return analysis;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", rawJson);
      throw new Error(`Invalid JSON response from Gemini: ${parseError}`);
    }
  } catch (error) {
    console.error("Error analyzing photo:", error);
    throw new Error(`Failed to analyze photo: ${error}`);
  }
}

export async function performEmergencyAssessment(
  assessmentData: {
    symptoms: string[];
    duration: string;
    severity: string;
    dogInfo: {
      breed: string;
      age?: number;
      weight?: number;
      medicalHistory?: string[];
    };
    currentBehavior: string;
    vitalSigns?: {
      breathing?: string;
      heartRate?: string;
      temperature?: string;
      gumColor?: string;
    };
  }
): Promise<EmergencyAssessment> {
  try {
    const systemPrompt = `You are a veterinary emergency triage AI assistant. 
Assess the urgency of the dog's condition and provide immediate guidance.
This is critical - lives may depend on accurate triage. Err on the side of caution.
Provide clear guidance on timeframe for veterinary care and immediate actions.

Respond with JSON in this exact format:
{
  "urgencyLevel": "non-urgent" | "urgent" | "emergency",
  "timeFrame": "specific timeframe for veterinary care",
  "reasoning": "detailed explanation of the assessment",
  "immediateActions": ["immediate steps owner should take"],
  "redFlags": ["warning signs that indicate emergency"],
  "vetRequired": true/false
}`;

    const prompt = `EMERGENCY ASSESSMENT REQUEST:

Dog Information:
- Breed: ${assessmentData.dogInfo.breed}
- Age: ${assessmentData.dogInfo.age ? assessmentData.dogInfo.age + " years" : "unknown"}
- Weight: ${assessmentData.dogInfo.weight ? assessmentData.dogInfo.weight + " lbs" : "unknown"}
- Medical History: ${assessmentData.dogInfo.medicalHistory?.join(", ") || "None provided"}

Current Symptoms:
${assessmentData.symptoms.map(symptom => `- ${symptom}`).join("\n")}

Symptom Duration: ${assessmentData.duration}
Owner-assessed Severity: ${assessmentData.severity}
Current Behavior: ${assessmentData.currentBehavior}

Vital Signs (if available):
${assessmentData.vitalSigns ? Object.entries(assessmentData.vitalSigns)
  .filter(([_, value]) => value)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n") : "No vital signs provided"}

Please perform emergency triage assessment:
1. Determine urgency level (non-urgent, urgent, emergency)
2. Specify timeframe for veterinary care needed
3. Provide reasoning for the assessment
4. List immediate actions the owner should take
5. Identify any red flag symptoms
6. Determine if veterinary care is required

CRITICAL: For any life-threatening symptoms (difficulty breathing, seizures, unconsciousness, severe bleeding, bloat symptoms, etc.), classify as EMERGENCY.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            urgencyLevel: { type: "string", enum: ["non-urgent", "urgent", "emergency"] },
            timeFrame: { type: "string" },
            reasoning: { type: "string" },
            immediateActions: { type: "array", items: { type: "string" } },
            redFlags: { type: "array", items: { type: "string" } },
            vetRequired: { type: "boolean" },
          },
          required: ["urgencyLevel", "timeFrame", "reasoning", "immediateActions", "redFlags", "vetRequired"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    
    if (!rawJson || rawJson.trim() === "") {
      throw new Error("Empty response from Gemini model");
    }
    
    try {
      const assessment: EmergencyAssessment = JSON.parse(rawJson);
      return assessment;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", rawJson);
      throw new Error(`Invalid JSON response from Gemini: ${parseError}`);
    }
  } catch (error) {
    console.error("Error performing emergency assessment:", error);
    throw new Error(`Failed to perform emergency assessment: ${error}`);
  }
}

export async function generateHealthSummary(
  dogData: {
    name: string;
    breed: string;
    age?: number;
    weight?: number;
  },
  recentHealthRecords: Array<{
    type: string;
    title: string;
    description?: string;
    severity?: string;
    recordedAt: Date;
  }>
): Promise<string> {
  try {
    const prompt = `Generate a comprehensive health summary for this dog:

Dog Information:
- Name: ${dogData.name}
- Breed: ${dogData.breed}
- Age: ${dogData.age ? dogData.age + " years" : "unknown"}
- Weight: ${dogData.weight ? dogData.weight + " lbs" : "unknown"}

Recent Health Records:
${recentHealthRecords.map((record, index) => `
${index + 1}. ${record.type.toUpperCase()} - ${record.title}
   - Severity: ${record.severity || "Not specified"}
   - Description: ${record.description || "No description"}
   - Date: ${record.recordedAt.toLocaleDateString()}
`).join("")}

Please provide:
1. Overall health trend analysis
2. Patterns or recurring issues
3. Breed-specific considerations
4. Preventive care recommendations
5. Areas that may need veterinary attention
6. Positive health indicators

Keep the summary informative but accessible to pet owners.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate health summary";
  } catch (error) {
    console.error("Error generating health summary:", error);
    throw new Error(`Failed to generate health summary: ${error}`);
  }
}