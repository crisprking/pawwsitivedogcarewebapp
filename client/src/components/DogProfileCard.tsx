import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Calendar, Stethoscope } from "lucide-react";
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

  return (
    <Card className="hover-lift shadow-lg bg-white dark:bg-gray-800" data-testid={`card-dog-${dog.name}`}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {dog.profileImageUrl ? (
            <img 
              src={dog.profileImageUrl}
              alt={`${dog.name} profile`}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-100 dark:border-teal-900"
              onError={(e) => {
                // Fallback to heart icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center ${dog.profileImageUrl ? 'hidden' : ''}`}>
            <Heart className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white" data-testid={`text-dog-name-${dog.name}`}>
              {dog.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{dog.breed}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Age:</span>
            <span className="text-gray-900 dark:text-white">{getAgeString(dog.birthDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Weight:</span>
            <span className="text-gray-900 dark:text-white" data-testid={`text-weight-${dog.name}`}>{getWeightDisplay()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Gender:</span>
            <span className="text-gray-900 dark:text-white">{dog.gender || 'Not specified'}</span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Link href={`/health?dogId=${dog.id}`} className="flex-1">
            <Button 
              className="flex-1 bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 w-full"
              data-testid={`button-log-health-${dog.name}`}
            >
              <Stethoscope className="h-4 w-4 mr-1" />
              Log Health
            </Button>
          </Link>
          <Link href={`/appointments?dogId=${dog.id}`} className="flex-1">
            <Button 
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 w-full"
              data-testid={`button-schedule-apt-${dog.name}`}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule Apt
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
