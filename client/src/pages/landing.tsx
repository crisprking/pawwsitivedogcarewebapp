import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-paw text-primary-foreground text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-foreground">Pawsitive</span>
          </div>

          {/* Hero Section */}
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Keep Your Dog Healthy & Happy
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track symptoms, manage medications, and make informed health decisions to prevent expensive emergency vet visits.
          </p>

          <Button 
            onClick={handleLogin}
            size="lg"
            className="mb-16 px-8 py-4 text-lg"
            data-testid="button-login"
          >
            Get Started - It's Free
          </Button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-thermometer-three-quarters text-accent text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Health Tracking</h3>
                <p className="text-muted-foreground">
                  Log symptoms with photos and get guidance on urgency levels
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-pills text-secondary text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Medication Management</h3>
                <p className="text-muted-foreground">
                  Never miss a dose with smart reminders and refill notifications
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-chart-3/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar-check text-chart-3 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Vet Appointments</h3>
                <p className="text-muted-foreground">
                  Schedule appointments and keep track of your dog's medical history
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-chart-5/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-weight text-chart-5 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Weight Monitoring</h3>
                <p className="text-muted-foreground">
                  Track weight trends and maintain optimal health
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-destructive text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Emergency Assessment</h3>
                <p className="text-muted-foreground">
                  Quick symptom checker to determine if immediate care is needed
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-chart-4/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-chart-4 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Vaccination Tracking</h3>
                <p className="text-muted-foreground">
                  Stay up to date with vaccination schedules and reminders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="gradient-bg rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Give Your Dog the Care They Deserve
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Join thousands of dog parents who trust Pawsitive to keep their furry friends healthy
            </p>
            <Button 
              onClick={handleLogin}
              variant="secondary"
              size="lg"
              className="px-8 py-4 text-lg"
              data-testid="button-login-cta"
            >
              Start Your Free Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
