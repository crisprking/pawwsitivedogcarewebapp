import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHealthRecordSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { AlertTriangle, Brain, Camera, Heart, Lightbulb } from "lucide-react";
import type { SymptomAnalysis, PhotoAnalysis } from "@shared/aiTypes";

// Use the shared schema instead of local one
const healthEntryFormSchema = insertHealthRecordSchema.omit({
  dogId: true,
  recordedAt: true,
}).extend({
  // We'll handle photo uploads separately from the form data
  photoUrls: z.array(z.string()).optional(),
});

type HealthEntryFormValues = z.infer<typeof healthEntryFormSchema>;

interface HealthEntryFormProps {
  dogId: string;
}

export default function HealthEntryForm({ dogId }: HealthEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<SymptomAnalysis | null>(null);
  const [photoAnalyses, setPhotoAnalyses] = useState<PhotoAnalysis[]>([]);
  const [isAnalyzingSymptoms, setIsAnalyzingSymptoms] = useState(false);
  const [isAnalyzingPhotos, setIsAnalyzingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<HealthEntryFormValues>({
    resolver: zodResolver(healthEntryFormSchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
      severity: "",
    },
  });

  // Upload photos to the server
  const uploadPhotos = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await fetch('/api/upload/health-photos', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include session cookies
    });

    if (!response.ok) {
      throw new Error('Failed to upload photos');
    }

    const data = await response.json();
    return data.photoUrls;
  };

  const createHealthRecordMutation = useMutation({
    mutationFn: async (data: HealthEntryFormValues) => {
      let photoUrls: string[] = [];
      
      // Upload photos first if any are selected
      if (selectedFiles.length > 0) {
        setIsUploadingPhotos(true);
        try {
          photoUrls = await uploadPhotos(selectedFiles);
        } catch (error) {
          console.error('Photo upload failed:', error);
          throw new Error('Failed to upload photos');
        } finally {
          setIsUploadingPhotos(false);
        }
      }

      // Create health record with photo URLs
      const payload = {
        ...data,
        dogId,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      };
      
      await apiRequest("POST", `/api/dogs/${dogId}/health-records`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "health-records"] });
      setIsOpen(false);
      form.reset();
      setSelectedFiles([]);
      toast({
        title: "Health Entry Added",
        description: "Health record has been logged successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add health entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    // Limit total files to 5
    const totalFiles = selectedFiles.length + newFiles.length;
    if (totalFiles > 5) {
      toast({
        title: "Too Many Files",
        description: "You can upload a maximum of 5 photos.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // AI Symptom Analysis
  const analyzeSymptoms = async () => {
    const formData = form.getValues();
    
    if (!formData.type || !formData.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in the type and title fields before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingSymptoms(true);
    try {
      const response = await apiRequest("POST", "/api/ai/analyze-symptoms", {
        dogId,
        symptomData: {
          type: formData.type,
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
        },
      });
      
      const analysisResult = await response.json();
      setAiAnalysis(analysisResult);
      toast({
        title: "AI Analysis Complete",
        description: "Symptom analysis has been generated.",
      });
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingSymptoms(false);
    }
  };

  // AI Photo Analysis
  const analyzePhotos = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Photos",
        description: "Please upload photos before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingPhotos(true);
    const analyses: PhotoAnalysis[] = [];
    
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('context', form.getValues().description || '');
        
        const response = await fetch('/api/ai/analyze-photo', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (response.ok) {
          const analysis = await response.json();
          analyses.push(analysis);
        }
      }
      
      setPhotoAnalyses(analyses);
      toast({
        title: "Photo Analysis Complete",
        description: `Analyzed ${analyses.length} photo(s) successfully.`,
      });
    } catch (error) {
      console.error("Photo analysis failed:", error);
      toast({
        title: "Photo Analysis Failed",
        description: "Unable to analyze photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingPhotos(false);
    }
  };

  const onSubmit = (data: HealthEntryFormValues) => {
    createHealthRecordMutation.mutate(data);
  };

  const resetAnalyses = () => {
    setAiAnalysis(null);
    setPhotoAnalyses([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-add-health-entry">
          <i className="fas fa-plus mr-1"></i>
          Log Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Health Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Fields Column */}
              <div className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-health-type">
                        <SelectValue placeholder="Select entry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="symptom">Symptom</SelectItem>
                      <SelectItem value="behavior">Behavior</SelectItem>
                      <SelectItem value="appetite">Appetite</SelectItem>
                      <SelectItem value="activity">Activity Level</SelectItem>
                      <SelectItem value="checkup">Vet Checkup</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Limping on right front paw" 
                      {...field} 
                      data-testid="input-health-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you observed..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="input-health-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity (for symptoms)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-severity">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload Section */}
            <div className="space-y-2">
              <FormLabel>Photos (optional)</FormLabel>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 5}
                  data-testid="button-add-photo"
                >
                  <i className="fas fa-camera mr-2"></i>
                  Add Photos
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length > 0 && `${selectedFiles.length} photo(s) selected`}
                  {selectedFiles.length >= 5 && " (Maximum reached)"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-photo-upload"
              />
              
              {/* Photo Preview Grid */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                        data-testid={`preview-image-${index}`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                        data-testid={`remove-image-${index}`}
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </div>
                
                {/* AI Analysis Section */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI Health Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* AI Analysis Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={analyzeSymptoms}
                          disabled={isAnalyzingSymptoms}
                          data-testid="button-analyze-symptoms"
                        >
                          <Lightbulb className="h-4 w-4 mr-1" />
                          {isAnalyzingSymptoms ? "Analyzing..." : "Analyze Symptoms"}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={analyzePhotos}
                          disabled={isAnalyzingPhotos || selectedFiles.length === 0}
                          data-testid="button-analyze-photos"
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          {isAnalyzingPhotos ? "Analyzing..." : "Analyze Photos"}
                        </Button>
                      </div>

                      {/* Symptom Analysis Results */}
                      {aiAnalysis && (
                        <div className="space-y-3">
                          <Separator />
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4" />
                              Symptom Analysis
                            </h4>
                            
                            <div className="flex gap-2 mb-3">
                              <Badge 
                                variant={aiAnalysis.severity === 'severe' ? 'destructive' : 
                                        aiAnalysis.severity === 'moderate' ? 'default' : 'secondary'}
                              >
                                {aiAnalysis.severity?.toUpperCase()}
                              </Badge>
                              
                              <Badge 
                                variant={aiAnalysis.urgency === 'emergency' ? 'destructive' : 
                                        aiAnalysis.urgency === 'same-day' ? 'default' : 'secondary'}
                              >
                                {aiAnalysis.urgency?.replace('-', ' ').toUpperCase()}
                              </Badge>
                              
                              {aiAnalysis.vetRequired && (
                                <Badge variant="outline">
                                  VET REQUIRED
                                </Badge>
                              )}
                            </div>
                            
                            {aiAnalysis.emergencyWarning && (
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-3">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Emergency Warning</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{aiAnalysis.emergencyWarning}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {aiAnalysis.insights}
                            </div>
                            
                            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Recommendations:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {aiAnalysis.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Photo Analysis Results */}
                      {photoAnalyses.length > 0 && (
                        <div className="space-y-3">
                          <Separator />
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <Camera className="h-4 w-4" />
                              Photo Analysis
                            </h4>
                            
                            {photoAnalyses.map((analysis, index) => (
                              <div key={index} className="border rounded-md p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-medium">Photo {index + 1}</span>
                                  <Badge 
                                    variant={analysis.urgencyLevel === 'high' ? 'destructive' : 
                                            analysis.urgencyLevel === 'medium' ? 'default' : 'secondary'}
                                  >
                                    {analysis.urgencyLevel?.toUpperCase()} URGENCY
                                  </Badge>
                                </div>
                                
                                {analysis.findings && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Findings:</p>
                                    <p className="text-sm">{analysis.findings}</p>
                                  </div>
                                )}
                                
                                {analysis.concerns && analysis.concerns.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Concerns:</p>
                                    <ul className="text-sm space-y-1">
                                      {analysis.concerns.map((concern, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-destructive">•</span>
                                          <span>{concern}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">Suggested Actions:</p>
                                    <ul className="text-sm space-y-1">
                                      {analysis.suggestedActions.map((action, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-primary">•</span>
                                          <span>{action}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(aiAnalysis || photoAnalyses.length > 0) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetAnalyses}
                          className="w-full"
                          data-testid="button-clear-analysis"
                        >
                          Clear Analysis
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsOpen(false);
                      resetAnalyses();
                    }}
                    data-testid="button-cancel-health-entry"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createHealthRecordMutation.isPending || isUploadingPhotos}
                    data-testid="button-save-health-entry"
                  >
                    {isUploadingPhotos ? "Uploading photos..." :
                     createHealthRecordMutation.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}