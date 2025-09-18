import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <i className="fas fa-paw text-primary-foreground text-lg"></i>
              </div>
              <span className="text-2xl font-bold text-foreground">Pawsitive</span>
            </div>
            <Button 
              onClick={handleLogin}
              variant="default"
              className="px-6"
              data-testid="button-login-header"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              🐕 Trusted by 10,000+ Dog Parents
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Keep Your Dog
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Healthy & Happy
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              The complete health management platform for dog owners. Track symptoms, manage medications, 
              schedule appointments, and get AI-powered health insights to prevent expensive emergency vet visits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-login"
              >
                Get Started Free
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
              <div className="flex items-center text-sm text-muted-foreground">
                <i className="fas fa-check text-accent mr-2"></i>
                No credit card required
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
                alt="Happy dogs with their owners" 
                className="relative w-full h-96 object-cover rounded-3xl shadow-2xl border border-border/50" 
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Everything You Need for Your Dog's Health
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools designed by veterinarians to help you provide the best care for your furry friend.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-accent/5 to-accent/10">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-stethoscope text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Health Tracking</h3>
                  <p className="text-muted-foreground mb-4">
                    Log symptoms with photos, track patterns, and get AI-powered urgency assessments.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    AI-Powered
                  </Badge>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-pills text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Smart Medication</h3>
                  <p className="text-muted-foreground mb-4">
                    Never miss a dose with intelligent reminders and automatic refill notifications.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Smart Alerts
                  </Badge>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-chart-3/5 to-chart-3/10">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-chart-3 rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-calendar-check text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Vet Appointments</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule appointments and maintain comprehensive medical history records.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Integrated
                  </Badge>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-chart-5/5 to-chart-5/10">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-chart-5 rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-chart-line text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Weight Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor weight trends with beautiful charts and get health insights.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Analytics
                  </Badge>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-destructive rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-heartbeat text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Emergency Care</h3>
                  <p className="text-muted-foreground mb-4">
                    Quick symptom assessment to determine if immediate veterinary care is needed.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    24/7 Available
                  </Badge>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-chart-4/5 to-chart-4/10">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-chart-4 rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-shield-virus text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Vaccination Hub</h3>
                  <p className="text-muted-foreground mb-4">
                    Stay current with vaccination schedules and receive timely reminders.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Automated
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Loved by Dog Parents Everywhere
              </h2>
              <p className="text-lg text-muted-foreground">
                See what our community has to say about Pawsitive
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {"★".repeat(5)}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "Pawsitive helped me catch my Golden Retriever's hip issues early. The weight tracking and symptom logging made all the difference!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                      S
                    </div>
                    <div>
                      <p className="font-semibold">Sarah M.</p>
                      <p className="text-sm text-muted-foreground">Golden Retriever Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {"★".repeat(5)}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "The medication reminders are a lifesaver! I never miss giving Max his arthritis medication anymore."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold mr-3">
                      M
                    </div>
                    <div>
                      <p className="font-semibold">Mike R.</p>
                      <p className="text-sm text-muted-foreground">German Shepherd Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {"★".repeat(5)}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "As a busy mom, Pawsitive keeps me organized with all three of my dogs' health records in one place."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold mr-3">
                      J
                    </div>
                    <div>
                      <p className="font-semibold">Jessica L.</p>
                      <p className="text-sm text-muted-foreground">Multi-Dog Parent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-10 rounded-3xl"></div>
            <div className="relative gradient-bg rounded-3xl p-12 text-white text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Give Your Dog the Best Care?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join over 10,000 dog parents who trust Pawsitive to keep their furry friends healthy and happy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  onClick={handleLogin}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-50 shadow-lg"
                  data-testid="button-login-cta"
                >
                  Start Free Today
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
                <div className="flex items-center text-sm opacity-75">
                  <i className="fas fa-check mr-2"></i>
                  Free forever • No credit card required
                </div>
              </div>

              <div className="flex justify-center items-center space-x-8 text-sm opacity-75">
                <div className="flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  10,000+ Users
                </div>
                <div className="flex items-center">
                  <i className="fas fa-star mr-2"></i>
                  4.9/5 Rating
                </div>
                <div className="flex items-center">
                  <i className="fas fa-shield-alt mr-2"></i>
                  HIPAA Compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-paw text-primary-foreground text-sm"></i>
              </div>
              <span className="text-xl font-bold text-foreground">Pawsitive</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Pawsitive. Made with ❤️ for dog parents everywhere.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
