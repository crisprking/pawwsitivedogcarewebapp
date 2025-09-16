import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { isUnauthorizedError } from "@/lib/authUtils";

const appointmentFormSchema = z.object({
  dogId: z.string().min(1, "Please select a dog"),
  vetName: z.string().min(1, "Vet name is required"),
  clinicName: z.string().min(1, "Clinic name is required"),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
  appointmentType: z.string().min(1, "Appointment type is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function Appointments() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: dogs = [] } = useQuery<any[]>({
    queryKey: ["/api/dogs"],
    enabled: isAuthenticated,
    throwOnError: false,
  });

  const { data: upcomingAppointments = [], isLoading: isLoadingAppointments } = useQuery<any[]>({
    queryKey: ["/api/appointments/upcoming"],
    enabled: isAuthenticated,
    throwOnError: false,
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      dogId: "",
      vetName: "",
      clinicName: "",
      clinicAddress: "",
      clinicPhone: "",
      appointmentType: "",
      scheduledAt: "",
      notes: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const { dogId, scheduledAt, ...rest } = data;
      const payload = {
        ...rest,
        scheduledAt: new Date(scheduledAt).toISOString(),
      };
      await apiRequest("POST", `/api/dogs/${dogId}/appointments`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    createAppointmentMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Appointments</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-schedule-appointment">
                <i className="fas fa-calendar-plus mr-2"></i>
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dogId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dog *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-dog">
                              <SelectValue placeholder="Select a dog" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dogs.map((dog) => (
                              <SelectItem key={dog.id} value={dog.id}>
                                {dog.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-appointment-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checkup">Annual Checkup</SelectItem>
                            <SelectItem value="vaccination">Vaccination</SelectItem>
                            <SelectItem value="emergency">Emergency Visit</SelectItem>
                            <SelectItem value="surgery">Surgery</SelectItem>
                            <SelectItem value="dental">Dental Cleaning</SelectItem>
                            <SelectItem value="grooming">Grooming</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} data-testid="input-scheduled-at" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veterinarian Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Smith" {...field} data-testid="input-vet-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Happy Tails Veterinary Clinic" {...field} data-testid="input-clinic-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clinicAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State" {...field} data-testid="input-clinic-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clinicPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-clinic-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAppointmentMutation.isPending}
                      data-testid="button-save-appointment"
                    >
                      {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {dogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar-alt text-chart-3 text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No dogs to schedule for</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Add a dog profile first to start scheduling appointments.
            </p>
            <Button size="lg">
              <i className="fas fa-plus mr-2"></i>
              Add Your First Dog
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-upcoming-appointments">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-calendar text-4xl mb-4 opacity-50"></i>
                    <p>No upcoming appointments scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                          <div className="text-center">
                            <div className="text-sm">{new Date(appointment.scheduledAt).getDate()}</div>
                            <div className="text-xs">{new Date(appointment.scheduledAt).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground" data-testid={`text-appointment-${appointment.dogName}`}>
                            {appointment.dogName} - {appointment.appointmentType}
                          </h4>
                          <p className="text-sm text-muted-foreground">{appointment.vetName} • {appointment.clinicName}</p>
                          <p className="text-xs text-primary font-medium">
                            {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })} • {appointment.clinicAddress}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appointment.clinicPhone && (
                            <Button variant="ghost" size="sm" data-testid={`button-call-${appointment.id}`}>
                              <i className="fas fa-phone"></i>
                            </Button>
                          )}
                          {appointment.clinicAddress && (
                            <Button variant="ghost" size="sm" data-testid={`button-directions-${appointment.id}`}>
                              <i className="fas fa-map-marker-alt"></i>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" data-testid={`button-view-${appointment.id}`}>
                            <i className="fas fa-chevron-right"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-lift cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-check text-primary text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Regular Checkup</h3>
                  <p className="text-sm text-muted-foreground">Annual wellness exam</p>
                </CardContent>
              </Card>

              <Card className="hover-lift cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-syringe text-secondary text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Vaccination</h3>
                  <p className="text-sm text-muted-foreground">Booster shots and updates</p>
                </CardContent>
              </Card>

              <Card className="hover-lift cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-destructive text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Emergency Visit</h3>
                  <p className="text-sm text-muted-foreground">Urgent care needed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}
