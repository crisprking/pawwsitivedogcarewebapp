import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface WeightChartProps {
  dogId: string;
  dogName: string;
}

export default function WeightChart({ dogId, dogName }: WeightChartProps) {
  const { toast } = useToast();

  const { data: weightRecords = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/dogs", dogId, "weight-records"],
    enabled: !!dogId,
    throwOnError: false,
  });

  const getChartData = () => {
    if (weightRecords.length === 0) return [];
    
    // Sort by date and take last 6 months
    const sorted = [...weightRecords]
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .slice(-6);
    
    return sorted.map(record => ({
      date: new Date(record.recordedAt).toLocaleDateString('en-US', { month: 'short' }),
      weight: parseFloat(record.weight),
      recordedAt: record.recordedAt
    }));
  };

  const chartData = getChartData();
  const currentWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight : 0;
  const previousWeight = chartData.length > 1 ? chartData[chartData.length - 2].weight : currentWeight;
  const weightChange = currentWeight - previousWeight;
  const maxWeight = Math.max(...chartData.map(d => d.weight), 0);

  const getWeightStatus = () => {
    if (Math.abs(weightChange) < 0.5) return "Stable";
    if (weightChange > 0) return "Gaining";
    return "Losing";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="flex justify-between">
              <div className="h-8 w-16 bg-muted rounded"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`card-weight-chart-${dogName}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground" data-testid={`text-weight-trends-${dogName}`}>
            Weight Trends - {dogName}
          </h3>
          <Button variant="outline" size="sm" data-testid="button-log-weight">
            <i className="fas fa-plus mr-1"></i>
            Log Weight
          </Button>
        </div>
        
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <i className="fas fa-weight text-4xl mb-4 opacity-50"></i>
            <p className="mb-2">No weight records yet</p>
            <p className="text-sm">Start tracking weight to see trends and health insights</p>
          </div>
        ) : (
          <>
            <div className="chart-container rounded-lg p-4 mb-4 bg-gradient-to-br from-primary/5 to-secondary/5" style={{ height: "200px" }}>
              <div className="flex items-end justify-between h-full space-x-2">
                {chartData.map((dataPoint, index) => {
                  const height = maxWeight > 0 ? (dataPoint.weight / maxWeight) * 100 : 0;
                  const isLatest = index === chartData.length - 1;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className={`rounded-t w-full ${isLatest ? 'bg-secondary' : 'bg-primary'} transition-all duration-500 ease-in-out`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                        data-testid={`weight-bar-${index}`}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-2">
                        {dataPoint.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground" data-testid={`text-current-weight-${dogName}`}>
                  {currentWeight.toFixed(1)} lbs
                </p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${
                  weightChange > 0 ? 'text-chart-4' : 
                  weightChange < 0 ? 'text-destructive' : 'text-accent'
                }`} data-testid={`text-weight-change-${dogName}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
                </p>
                <p className="text-xs text-muted-foreground">This period</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground" data-testid={`text-weight-status-${dogName}`}>
                  {getWeightStatus()}
                </p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
