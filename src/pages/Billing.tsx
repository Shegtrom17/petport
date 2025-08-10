import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { usePayment } from "@/hooks/usePayment";
import { ShoppingCart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Billing() {
  const { createPayment, isLoading } = usePayment();

  const handlePurchase = (quantity: number) => {
    createPayment('pet_slot', quantity);
  };

  const pricingOptions = [
    {
      quantity: 1,
      price: 1.99,
      popular: false,
      description: "Perfect for one extra furry friend"
    },
    {
      quantity: 3,
      price: 5.49,
      popular: true,
      description: "Great value for multiple pets"
    },
    {
      quantity: 5,
      price: 8.99,
      popular: false,
      description: "Best for pet enthusiasts"
    }
  ];

  return (
    <PWALayout>
      <AppHeader title="Billing" />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add More Pet Slots</h1>
          <p className="text-muted-foreground">
            Expand your pet family with additional profile slots
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pricingOptions.map((option) => (
            <Card key={option.quantity} className={`relative ${option.popular ? 'border-primary shadow-lg' : ''}`}>
              {option.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Zap className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">
                  {option.quantity} Pet Slot{option.quantity > 1 ? 's' : ''}
                </CardTitle>
                <div className="text-3xl font-bold text-primary">
                  ${option.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    /${option.quantity > 1 ? 'bundle' : 'slot'}
                  </span>
                </div>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Pet profiles:</span>
                    <span className="font-medium">+{option.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Full features:</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Public sharing:</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  {option.quantity > 1 && (
                    <div className="flex items-center justify-between text-primary">
                      <span>Savings:</span>
                      <span className="font-medium">
                        ${((1.99 * option.quantity) - option.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handlePurchase(option.quantity)}
                  disabled={isLoading}
                  className="w-full"
                  variant={option.popular ? "default" : "outline"}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isLoading ? 'Processing...' : `Purchase ${option.quantity > 1 ? 'Bundle' : 'Slot'}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>One-time purchase • Secure payment via Stripe • No recurring charges</p>
        </div>
      </div>
    </PWALayout>
  );
}