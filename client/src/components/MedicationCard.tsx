import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Medication } from "@shared/schema";

interface MedicationCardProps {
  medication: Medication;
  dogName?: string;
}

export default function MedicationCard({ medication, dogName }: MedicationCardProps) {
  const { toast } = useToast();

  const logMedicationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/medications/${medication.id}/log`, {
        notes: "Medication given via app",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", medication.dogId, "medications"] });
      toast({
        title: "Medication Logged",
        description: `${medication.name} has been marked as given.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getNextDueDisplay = () => {
    if (!medication.nextDueDate) return "Not scheduled";
    
    const nextDue = new Date(medication.nextDueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
    
    if (dueDate.getTime() === today.getTime()) {
      return "Today";
    } else if (dueDate < today) {
      return "Overdue";
    } else {
      return nextDue.toLocaleDateString();
    }
  };

  const getDueStatus = () => {
    if (!medication.nextDueDate) return "inactive";
    
    const nextDue = new Date(medication.nextDueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
    
    if (dueDate.getTime() === today.getTime()) {
      return "due";
    } else if (dueDate < today) {
      return "overdue";
    }
    return "upcoming";
  };

  const status = getDueStatus();
  const nextDueDisplay = getNextDueDisplay();

  const getStatusColor = () => {
    switch (status) {
      case "due":
        return "bg-secondary";
      case "overdue":
        return "bg-destructive";
      case "upcoming":
        return "bg-accent";
      default:
        return "bg-muted";
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case "due":
        return "bg-secondary";
      case "overdue":
        return "bg-destructive";
      case "upcoming":
        return "bg-accent";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="border border-border rounded-lg" data-testid={`card-medication-${medication.name}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground" data-testid={`text-medication-name-${medication.name}`}>
              {medication.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {dogName && `${dogName} • `}{medication.frequency}
            </p>
          </div>
          <div className={`w-2 h-2 ${getStatusDot()} rounded-full`}></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dose:</span>
            <span className="text-foreground" data-testid={`text-dosage-${medication.name}`}>
              {medication.dosage}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next:</span>
            <span className={`font-medium ${
              status === "due" ? "text-secondary" :
              status === "overdue" ? "text-destructive" :
              status === "upcoming" ? "text-accent" : "text-muted-foreground"
            }`} data-testid={`text-next-due-${medication.name}`}>
              {nextDueDisplay}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Refill:</span>
            <span className="text-foreground">
              {medication.refillCount || 0} left
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => logMedicationMutation.mutate()}
            disabled={logMedicationMutation.isPending || status === "inactive"}
            className={`flex-1 text-sm font-medium transition-colors ${getStatusColor()} ${
              status === "due" ? "text-white hover:bg-secondary/90" :
              status === "overdue" ? "text-white hover:bg-destructive/90" :
              status === "upcoming" ? "text-white hover:bg-accent/90" :
              "text-muted-foreground cursor-not-allowed"
            }`}
            data-testid={`button-mark-given-${medication.name}`}
          >
            {logMedicationMutation.isPending ? "Marking..." : 
             status === "inactive" ? "Not Scheduled" : "Mark Given"}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            data-testid={`button-edit-medication-${medication.name}`}
          >
            <i className="fas fa-edit"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
