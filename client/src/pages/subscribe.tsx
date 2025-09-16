import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed to Pawsitive Premium!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe} 
        className="w-full"
        data-testid="button-subscribe"
      >
        Subscribe to Premium
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
      });
  }, [toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-page-title">
            Upgrade to Pawsitive Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get advanced features to keep your dogs healthier and happier with premium care tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Premium Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <i className="fas fa-chart-line text-primary text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Advanced Health Analytics</h4>
                    <p className="text-sm text-muted-foreground">AI-powered trend analysis and health predictions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center mt-0.5">
                    <i className="fas fa-comments text-secondary text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">24/7 Veterinarian Chat</h4>
                    <p className="text-sm text-muted-foreground">Instant access to professional veterinary advice</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-chart-3/10 rounded-full flex items-center justify-center mt-0.5">
                    <i className="fas fa-cloud text-chart-3 text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Unlimited Storage</h4>
                    <p className="text-sm text-muted-foreground">Store unlimited photos, documents, and health records</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-chart-4/10 rounded-full flex items-center justify-center mt-0.5">
                    <i className="fas fa-star text-chart-4 text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Priority Booking</h4>
                    <p className="text-sm text-muted-foreground">Skip the wait with priority appointment scheduling</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-chart-5/10 rounded-full flex items-center justify-center mt-0.5">
                    <i className="fas fa-shield-alt text-chart-5 text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Premium Support</h4>
                    <p className="text-sm text-muted-foreground">Priority customer support and personalized guidance</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">$9.99</div>
                    <div className="text-sm text-muted-foreground">per month • Cancel anytime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Start Your Premium Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>✓ 7-day free trial</p>
                  <p>✓ Cancel anytime</p>
                  <p>✓ Secure payment with Stripe</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">What Our Premium Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-chart-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className="fas fa-star text-sm"></i>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "The 24/7 vet chat saved us a expensive emergency visit. Highly recommend!"
                </p>
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b479?w=40&h=40&fit=crop&crop=face" 
                    alt="Sarah M." 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Sarah M.</div>
                    <div className="text-xs text-muted-foreground">Golden Retriever owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-chart-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className="fas fa-star text-sm"></i>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "The health analytics helped us catch an issue early. Amazing app!"
                </p>
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                    alt="Mike R." 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Mike R.</div>
                    <div className="text-xs text-muted-foreground">Labrador owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-chart-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className="fas fa-star text-sm"></i>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Priority booking means no more waiting weeks for appointments!"
                </p>
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" 
                    alt="Emma L." 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Emma L.</div>
                    <div className="text-xs text-muted-foreground">Beagle owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
