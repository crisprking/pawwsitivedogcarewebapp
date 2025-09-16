import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import HealthEntryForm from "@/components/HealthEntryForm";
import EmergencyAssessment from "@/components/EmergencyAssessment";
import WeightChart from "@/components/WeightChart";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Health() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  const { data: dogs = [], isLoading: isLoadingDogs } = useQuery<any[]>({
    queryKey: ["/api/dogs"],
    enabled: isAuthenticated,
    throwOnError: false,
  });

  const { data: healthRecords = [] } = useQuery<any[]>({
    queryKey: ["/api/dogs", selectedDogId, "health-records"],
    enabled: isAuthenticated && !!selectedDogId,
    throwOnError: false,
  });

  const { data: medications = [] } = useQuery<any[]>({
    queryKey: ["/api/dogs", selectedDogId, "medications"],
    enabled: isAuthenticated && !!selectedDogId,
    throwOnError: false,
  });

  const { data: vaccinations = [] } = useQuery<any[]>({
    queryKey: ["/api/dogs", selectedDogId, "vaccinations"],
    enabled: isAuthenticated && !!selectedDogId,
    throwOnError: false,
  });

  // Set first dog as selected by default
  if (!selectedDogId && dogs.length > 0) {
    setSelectedDogId(dogs[0].id);
  }

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

  const selectedDog = dogs.find(dog => dog.id === selectedDogId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Health Dashboard</h1>
        </div>

        {dogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-heart text-accent text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No dogs to track</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Add a dog profile first to start tracking their health information.
            </p>
            <Button size="lg">
              <i className="fas fa-plus mr-2"></i>
              Add Your First Dog
            </Button>
          </div>
        ) : (
          <>
            {/* Dog Selector */}
            {dogs.length > 1 && (
              <div className="mb-8">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {dogs.map((dog) => (
                    <Button
                      key={dog.id}
                      variant={selectedDogId === dog.id ? "default" : "outline"}
                      onClick={() => setSelectedDogId(dog.id)}
                      className="whitespace-nowrap"
                      data-testid={`button-select-dog-${dog.name}`}
                    >
                      {dog.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedDog && (
              <>
                {/* Emergency Assessment */}
                <div className="mb-8">
                  <EmergencyAssessment />
                </div>

                {/* Health Tabs */}
                <Tabs defaultValue="records" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="records" data-testid="tab-records">Health Records</TabsTrigger>
                    <TabsTrigger value="medications" data-testid="tab-medications">Medications</TabsTrigger>
                    <TabsTrigger value="weight" data-testid="tab-weight">Weight Tracking</TabsTrigger>
                    <TabsTrigger value="vaccinations" data-testid="tab-vaccinations">Vaccinations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="records" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span data-testid={`text-health-records-${selectedDog.name}`}>
                                {selectedDog.name}'s Health Records
                              </span>
                              <HealthEntryForm dogId={selectedDogId} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {healthRecords.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <i className="fas fa-clipboard-list text-4xl mb-4 opacity-50"></i>
                                <p>No health records yet. Start by logging symptoms or observations.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {healthRecords.map((record) => (
                                  <div key={record.id} className="p-4 border border-border rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-semibold text-foreground">{record.title}</h4>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(record.recordedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {record.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                                    )}
                                    {record.severity && (
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        record.severity === 'severe' ? 'bg-destructive/20 text-destructive' :
                                        record.severity === 'moderate' ? 'bg-chart-4/20 text-chart-4' :
                                        'bg-chart-3/20 text-chart-3'
                                      }`}>
                                        {record.severity}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <Card>
                          <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                              <i className="fas fa-thermometer-three-quarters mr-2"></i>
                              Emergency Assessment
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <i className="fas fa-camera mr-2"></i>
                              Add Photo
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <i className="fas fa-weight mr-2"></i>
                              Log Weight
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="medications">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span data-testid={`text-medications-${selectedDog.name}`}>
                            {selectedDog.name}'s Medications
                          </span>
                          <Button>
                            <i className="fas fa-plus mr-2"></i>
                            Add Medication
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {medications.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <i className="fas fa-pills text-4xl mb-4 opacity-50"></i>
                            <p>No medications recorded. Add medications to track doses and schedules.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {medications.map((medication) => (
                              <div key={medication.id} className="border border-border rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">{medication.name}</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dose:</span>
                                    <span className="text-foreground">{medication.dosage}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frequency:</span>
                                    <span className="text-foreground">{medication.frequency}</span>
                                  </div>
                                  {medication.nextDueDate && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Next due:</span>
                                      <span className="text-foreground">
                                        {new Date(medication.nextDueDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button size="sm" className="w-full mt-3">
                                  Mark Given
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="weight">
                    <WeightChart dogId={selectedDogId} dogName={selectedDog.name} />
                  </TabsContent>

                  <TabsContent value="vaccinations">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span data-testid={`text-vaccinations-${selectedDog.name}`}>
                            {selectedDog.name}'s Vaccinations
                          </span>
                          <Button>
                            <i className="fas fa-plus mr-2"></i>
                            Add Vaccination
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {vaccinations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <i className="fas fa-shield-alt text-4xl mb-4 opacity-50"></i>
                            <p>No vaccination records. Add vaccinations to track your dog's immunization status.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {vaccinations.map((vaccination) => (
                              <div key={vaccination.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div>
                                  <h4 className="font-semibold text-foreground">{vaccination.vaccineName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Administered: {new Date(vaccination.administeredAt).toLocaleDateString()}
                                  </p>
                                  {vaccination.nextDueDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Next due: {new Date(vaccination.nextDueDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {vaccination.vetName && (
                                    <p className="text-sm text-muted-foreground">By: {vaccination.vetName}</p>
                                  )}
                                  <span className="inline-block px-2 py-1 bg-chart-3/20 text-chart-3 rounded text-xs font-medium">
                                    Complete
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}
