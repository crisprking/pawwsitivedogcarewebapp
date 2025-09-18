import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import DogProfileCard from "@/components/DogProfileCard";
import WeightChart from "@/components/WeightChart";
import MedicationCard from "@/components/MedicationCard";
import EmergencyAssessment from "@/components/EmergencyAssessment";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: dogs = [], isLoading: isLoadingDogs, error: dogsError } = useQuery<any[]>({
    queryKey: ["/api/dogs"],
    enabled: isAuthenticated,
    throwOnError: false,
  });

  // Handle dogs query error
  if (dogsError && isUnauthorizedError(dogsError as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: upcomingAppointments = [], error: appointmentsError } = useQuery<any[]>({
    queryKey: ["/api/appointments/upcoming"],
    enabled: isAuthenticated,
    throwOnError: false,
  });

  // Handle appointments query error
  if (appointmentsError && isUnauthorizedError(appointmentsError as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const firstName = user?.firstName || "there";
  const hasUpcomingAppointments = upcomingAppointments.length > 0;
  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="gradient-bg rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <i className="fas fa-sun text-2xl"></i>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold" data-testid="text-welcome">
                      Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}!
                    </h1>
                    <p className="opacity-75 text-lg">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <p className="opacity-90 mb-6 text-lg" data-testid="text-summary">
                  {hasUpcomingAppointments 
                    ? `${nextAppointment.dogName} has an appointment coming up today.`
                    : dogs.length > 0 
                      ? `You're caring for ${dogs.length} wonderful ${dogs.length === 1 ? 'pup' : 'pups'}.`
                      : "Welcome to Pawsitive! Let's start by adding your first dog."
                  }
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="secondary" 
                    className="bg-white text-primary hover:bg-gray-50 font-semibold"
                    data-testid="button-view-details"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    {dogs.length === 0 ? "Add Your First Dog" : "Add New Dog"}
                  </Button>
                  {dogs.length > 0 && (
                    <Button 
                      variant="ghost" 
                      className="text-white border-white/30 hover:bg-white/10"
                    >
                      <i className="fas fa-stethoscope mr-2"></i>
                      Quick Health Check
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <img 
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
                  alt="Happy golden retriever" 
                  className="w-56 h-36 rounded-2xl object-cover shadow-2xl border-4 border-white/20" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <i className="fas fa-cog mr-2"></i>
              Customize
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10 group" data-testid="card-health-check">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-destructive rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-heartbeat text-white text-xl"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-full">
                      Emergency
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-2">Health Check</h3>
                <p className="text-sm text-muted-foreground mb-3">Quick symptom assessment</p>
                <Button size="sm" className="w-full bg-destructive hover:bg-destructive/90">
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10 group" data-testid="card-medications">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-pills text-white text-xl"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-secondary font-semibold bg-secondary/10 px-2 py-1 rounded-full">
                      2 Due Today
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-2">Medications</h3>
                <p className="text-sm text-muted-foreground mb-3">Manage daily doses</p>
                <Button size="sm" variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-chart-3/5 to-chart-3/10 group" data-testid="card-appointments">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-chart-3 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-calendar-check text-white text-xl"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-chart-3 font-semibold bg-chart-3/10 px-2 py-1 rounded-full">
                      {hasUpcomingAppointments ? "Upcoming" : "None"}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-2">Appointments</h3>
                <p className="text-sm text-muted-foreground mb-3">Schedule & manage visits</p>
                <Button size="sm" variant="outline" className="w-full border-chart-3 text-chart-3 hover:bg-chart-3 hover:text-white">
                  {hasUpcomingAppointments ? "View Next" : "Schedule Now"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-chart-5/5 to-chart-5/10 group" data-testid="card-weight-track">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-chart-5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-chart-5 font-semibold bg-chart-5/10 px-2 py-1 rounded-full">
                      Trending ↗
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-2">Weight Tracking</h3>
                <p className="text-sm text-muted-foreground mb-3">Monitor health trends</p>
                <Button size="sm" variant="outline" className="w-full border-chart-5 text-chart-5 hover:bg-chart-5 hover:text-white">
                  Log Weight
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dog Profiles Section */}
        {dogs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground" data-testid="text-your-dogs">Your Dogs</h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="button-add-dog">
                <i className="fas fa-plus mr-2"></i>
                Add Dog
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoadingDogs ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-muted rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="h-3 bg-muted rounded w-32"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                dogs.map((dog) => (
                  <DogProfileCard key={dog.id} dog={dog} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Health Tracking Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Health Entries */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground" data-testid="text-recent-health">Recent Health Entries</h3>
                <Button variant="ghost" size="sm" className="text-primary" data-testid="button-log-symptom">
                  <i className="fas fa-plus mr-1"></i>Log Symptom
                </Button>
              </div>
              
              <div className="space-y-4">
                {dogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-stethoscope text-4xl mb-4 opacity-50"></i>
                    <p>Add your first dog to start tracking health records</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-heart text-4xl mb-4 opacity-50"></i>
                    <p>No health entries yet. Start logging symptoms and observations.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weight Chart */}
          {dogs.length > 0 && <WeightChart dogId={dogs[0]?.id} dogName={dogs[0]?.name} />}
        </div>

        {/* Emergency Assessment Tool */}
        <EmergencyAssessment />

        {/* Upcoming Appointments */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground" data-testid="text-upcoming-appointments">Upcoming Appointments</h3>
              <Button variant="ghost" size="sm" className="text-primary" data-testid="button-schedule-appointment">
                <i className="fas fa-calendar-plus mr-1"></i>Schedule Appointment
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <i className="fas fa-calendar text-4xl mb-4 opacity-50"></i>
                  <p>No upcoming appointments scheduled</p>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Teaser */}
        <div className="gradient-bg rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Upgrade to Pawsitive Premium</h3>
              <p className="opacity-90 mb-4">Get advanced health analytics, 24/7 vet chat, unlimited photo storage, and priority appointment booking.</p>
              <ul className="space-y-1 mb-6 text-sm opacity-90">
                <li className="flex items-center"><i className="fas fa-check mr-2"></i>Advanced health trend analysis</li>
                <li className="flex items-center"><i className="fas fa-check mr-2"></i>24/7 veterinarian chat support</li>
                <li className="flex items-center"><i className="fas fa-check mr-2"></i>Unlimited photo & document storage</li>
                <li className="flex items-center"><i className="fas fa-check mr-2"></i>Priority appointment scheduling</li>
              </ul>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-gray-50"
                  data-testid="button-start-trial"
                >
                  Start Free Trial
                </Button>
                <span className="text-sm opacity-75">$9.99/month • Cancel anytime</span>
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1559190394-df5a28aab5c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200" 
              alt="Veterinarian with happy dogs" 
              className="hidden lg:block w-64 h-40 rounded-xl object-cover ml-8" 
            />
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
