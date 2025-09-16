import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Dog } from "@shared/schema";

interface DogProfileCardProps {
  dog: Dog;
}

export default function DogProfileCard({ dog }: DogProfileCardProps) {
  const getAgeString = (birthDate: string | null) => {
    if (!birthDate) return "Age unknown";
    
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (ageInYears === 0) {
      const ageInMonths = monthDiff;
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`;
    }
    
    return `${ageInYears} year${ageInYears !== 1 ? 's' : ''} old`;
  };

  const getHealthStatus = () => {
    // This could be enhanced to show actual health status based on recent records
    return "Healthy";
  };

  const getWeightDisplay = () => {
    if (!dog.weight) return "-- lbs";
    return `${parseFloat(dog.weight)} lbs`;
  };

  // Use a default dog image if no profile image
  const profileImage = dog.profileImageUrl || 
    "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80";

  return (
    <Card className="hover-lift cursor-pointer" data-testid={`card-dog-${dog.name}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={profileImage}
            alt={`${dog.name} profile`}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              // Fallback to default image if custom image fails to load
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80";
            }}
          />
          <div>
            <h3 className="font-bold text-foreground" data-testid={`text-dog-name-${dog.name}`}>
              {dog.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {dog.breed} • {getAgeString(dog.birthDate)}
            </p>
            <Badge variant="secondary" className="text-xs mt-1">
              {getHealthStatus()} • Last checkup: Recent
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground" data-testid={`text-weight-${dog.name}`}>
              {getWeightDisplay()}
            </p>
            <p className="text-xs text-muted-foreground">Weight</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-secondary">0</p>
            <p className="text-xs text-muted-foreground">Meds Due</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-accent">100%</p>
            <p className="text-xs text-muted-foreground">Vaccines</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/health`} className="flex-1">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid={`button-view-health-${dog.name}`}
            >
              View Health
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            data-testid={`button-edit-${dog.name}`}
          >
            <i className="fas fa-edit"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
