import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const healthEntrySchema = z.object({
  type: z.string().min(1, "Please select a type"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  severity: z.string().optional(),
});

type HealthEntryFormValues = z.infer<typeof healthEntrySchema>;

interface HealthEntryFormProps {
  dogId: string;
}

export default function HealthEntryForm({ dogId }: HealthEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<HealthEntryFormValues>({
    resolver: zodResolver(healthEntrySchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
      severity: "",
    },
  });

  const createHealthRecordMutation = useMutation({
    mutationFn: async (data: HealthEntryFormValues) => {
      await apiRequest("POST", `/api/dogs/${dogId}/health-records`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "health-records"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Health Entry Added",
        description: "Health record has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add health entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HealthEntryFormValues) => {
    createHealthRecordMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-add-health-entry">
          <i className="fas fa-plus mr-1"></i>
          Log Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Health Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel-health-entry"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createHealthRecordMutation.isPending}
                data-testid="button-save-health-entry"
              >
                {createHealthRecordMutation.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
