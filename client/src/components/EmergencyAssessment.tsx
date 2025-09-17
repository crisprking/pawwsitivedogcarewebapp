import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Brain, Clock, Heart, Zap } from "lucide-react";
import type { EmergencyAssessment } from "@shared/aiTypes";

const emergencySymptoms = [
  "Difficulty breathing or gasping",
  "Seizures or convulsions",
  "Loss of consciousness or collapse",
  "Severe bleeding",
  "Suspected poisoning",
  "Severe vomiting or diarrhea",
  "Unable to urinate or defecate",
  "Signs of severe pain",
  "Pale or blue gums",
  "Severe lethargy or unresponsiveness"
];

const urgentSymptoms = [
  "Persistent vomiting",
  "Loss of appetite for 24+ hours",
  "Unusual lethargy",
  "Limping or difficulty moving",
  "Excessive thirst or urination",
  "Coughing or breathing changes",
  "Skin irritation or rash",
  "Behavioral changes",
  "Eye discharge or redness",
  "Minor wounds or cuts"
];

const routineSymptoms = [
  "Minor scratching",
  "Slight change in appetite",
  "Mild lethargy after exercise",
  "Minor behavioral quirks",
  "Regular grooming needs",
  "Routine check-up items",
  "Preventive care questions",
  "Diet or exercise concerns",
  "Training or behavior tips",
  "General wellness questions"
];

// Using shared type from aiTypes.ts

export default function EmergencyAssessment() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [currentBehavior, setCurrentBehavior] = useState<string>("");
  const [vitalSigns, setVitalSigns] = useState({
    breathing: "",
    heartRate: "",
    temperature: "",
    gumColor: "",
  });
  const [aiAssessment, setAiAssessment] = useState<EmergencyAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Get user's dogs
  const { data: dogs = [] } = useQuery({
    queryKey: ["/api/dogs"],
    enabled: isOpen,
  });

  const [assessment, setAssessment] = useState<{
    symptoms: string[];
    urgency: "emergency" | "urgent" | "routine" | null;
  }>({
    symptoms: [],
    urgency: null
  });

  const startAssessment = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setAssessment({ symptoms: [], urgency: null });
  };

  const handleSymptomCheck = (symptom: string, category: "emergency" | "urgent" | "routine") => {
    const newSymptoms = [...assessment.symptoms, symptom];
    let urgency = assessment.urgency;
    
    if (category === "emergency" || urgency === null) {
      urgency = category;
    } else if (category === "urgent" && urgency === "routine") {
      urgency = "urgent";
    }

    setAssessment({
      symptoms: newSymptoms,
      urgency
    });
    
    // Also add to selected symptoms for AI analysis
    setSelectedSymptoms(prev => [...prev, symptom]);
    
    setCurrentStep(2); // Go to results
  };

  const performAIAssessment = async () => {
    if (!selectedDogId || selectedSymptoms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a dog and symptoms before getting AI analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const assessmentData = {
        symptoms: selectedSymptoms,
        duration: duration || "Unknown",
        severity: severity || "Not specified",
        currentBehavior: currentBehavior || "Not specified",
        vitalSigns: Object.entries(vitalSigns)
          .filter(([_, value]) => value)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      };

      const response = await apiRequest("POST", "/api/ai/emergency-assessment", {
        dogId: selectedDogId,
        assessmentData,
      });

      const result = await response.json();
      setAiAssessment(result.assessment);
      setCurrentStep(3); // Go to AI results
      toast({
        title: "AI Assessment Complete",
        description: "Emergency assessment has been analyzed by AI.",
      });
    } catch (error) {
      console.error("AI assessment failed:", error);
      toast({
        title: "Assessment Failed",
        description: "Unable to perform AI assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAssessment({ symptoms: [], urgency: null });
    setSelectedSymptoms([]);
    setSelectedDogId("");
    setDuration("");
    setSeverity("");
    setCurrentBehavior("");
    setVitalSigns({ breathing: "", heartRate: "", temperature: "", gumColor: "" });
    setAiAssessment(null);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getRecommendation = () => {
    switch (assessment.urgency) {
      case "emergency":
        return {
          title: "🚨 Emergency Care Needed",
          description: "Contact your emergency vet or animal hospital immediately. These symptoms require immediate professional attention.",
          action: "Call Emergency Vet Now",
          color: "text-destructive",
          bgColor: "bg-destructive/10"
        };
      case "urgent":
        return {
          title: "⚠️ Urgent Veterinary Care",
          description: "Schedule an appointment with your vet within the next 24-48 hours. Monitor symptoms closely.",
          action: "Schedule Vet Visit",
          color: "text-chart-4",
          bgColor: "bg-chart-4/10"
        };
      case "routine":
        return {
          title: "📅 Routine Care",
          description: "These concerns can typically wait for your next routine appointment. Continue monitoring and note any changes.",
          action: "Schedule Routine Visit",
          color: "text-accent",
          bgColor: "bg-accent/10"
        };
      default:
        return null;
    }
  };

  const recommendation = getRecommendation();

  return (
    <>
      <div className="bg-gradient-to-br from-destructive/10 to-chart-4/10 rounded-xl border border-destructive/20 p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <i className="fas fa-exclamation-triangle text-destructive mr-2"></i>
              Emergency Health Assessment
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Quick symptom checker to help determine if immediate vet care is needed
            </p>
          </div>
          <Button 
            onClick={startAssessment}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-start-assessment"
          >
            Start Assessment
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-heartbeat text-destructive"></i>
            </div>
            <h4 className="font-medium text-foreground mb-1">Emergency Signs</h4>
            <p className="text-xs text-muted-foreground">Difficulty breathing, seizures, collapse</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-clock text-chart-4"></i>
            </div>
            <h4 className="font-medium text-foreground mb-1">Urgent Care</h4>
            <p className="text-xs text-muted-foreground">Vomiting, lethargy, appetite loss</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-calendar-alt text-accent"></i>
            </div>
            <h4 className="font-medium text-foreground mb-1">Schedule Visit</h4>
            <p className="text-xs text-muted-foreground">Minor concerns, routine checks</p>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Emergency Health Assessment</DialogTitle>
          </DialogHeader>

          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-stethoscope text-primary text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Let's assess your dog's condition
                </h3>
                <p className="text-muted-foreground">
                  Select any symptoms or concerns you've noticed. This will help determine the urgency of care needed.
                </p>
              </div>
              <Button 
                onClick={() => setCurrentStep(1)} 
                className="w-full"
                data-testid="button-continue-assessment"
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What symptoms have you noticed?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click on any symptoms that apply to your dog
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-destructive mb-3 flex items-center">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Emergency Symptoms
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {emergencySymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant="outline"
                        className="text-left justify-start h-auto p-3 border-destructive/20 hover:bg-destructive/10"
                        onClick={() => handleSymptomCheck(symptom, "emergency")}
                        data-testid={`symptom-emergency-${symptom.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-chart-4 mb-3 flex items-center">
                    <i className="fas fa-clock mr-2"></i>
                    Urgent Symptoms
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {urgentSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant="outline"
                        className="text-left justify-start h-auto p-3 border-chart-4/20 hover:bg-chart-4/10"
                        onClick={() => handleSymptomCheck(symptom, "urgent")}
                        data-testid={`symptom-urgent-${symptom.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-accent mb-3 flex items-center">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    Routine Concerns
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {routineSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant="outline"
                        className="text-left justify-start h-auto p-3 border-accent/20 hover:bg-accent/10"
                        onClick={() => handleSymptomCheck(symptom, "routine")}
                        data-testid={`symptom-routine-${symptom.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  Back
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel Assessment
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && recommendation && (
            <div className="space-y-6">
              <div className={`${recommendation.bgColor} rounded-lg p-6 text-center`}>
                <div className={`text-4xl mb-4 ${recommendation.color}`}>
                  {recommendation.title}
                </div>
                <p className="text-foreground mb-6">
                  {recommendation.description}
                </p>
                <Button 
                  className={`${recommendation.color === 'text-destructive' ? 'bg-destructive hover:bg-destructive/90' : 
                              recommendation.color === 'text-chart-4' ? 'bg-chart-4 hover:bg-chart-4/90' : 
                              'bg-accent hover:bg-accent/90'} text-white`}
                  data-testid="button-take-action"
                >
                  {recommendation.action}
                </Button>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Selected Symptoms:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {assessment.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-center">
                      <i className="fas fa-circle text-xs mr-2"></i>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={resetAssessment}
                  data-testid="button-start-over"
                >
                  Start Over
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-assessment"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
