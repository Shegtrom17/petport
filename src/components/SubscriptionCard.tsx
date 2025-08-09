import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2, Crown, Zap } from "lucide-react";

export function SubscriptionCard() {
  const { subscription, isLoading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const formatEndDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.subscribed ? (
          <>
            <div className="flex items-center justify-between">
              <span>Plan:</span>
              <Badge variant="default" className="capitalize">
                {subscription.subscription_tier === 'monthly' ? 'Monthly Plan' : 'Yearly Plan - Best Value!'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Pet Limit:</span>
              <Badge variant="outline">
                {subscription.total_pet_limit} {subscription.total_pet_limit === 1 ? 'Pet' : 'Pets'}
              </Badge>
            </div>

            {subscription.subscription_end && (
              <div className="flex items-center justify-between">
                <span>Renews:</span>
                <span className="text-sm text-muted-foreground">
                  {formatEndDate(subscription.subscription_end)}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={openCustomerPortal}
                className="w-full"
              >
                Manage Subscription
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => createCheckout('yearly', 1)}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Add Pet Slot ($1.99/year)
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Subscribe to create and manage pet profiles
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={() => createCheckout('yearly')}
                className="w-full"
              >
                <Crown className="h-4 w-4 mr-2" />
                Yearly - $12.99
                <Badge className="ml-2" variant="secondary">Best Value</Badge>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => createCheckout('monthly')}
                className="w-full"
              >
                Monthly - $1.99
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 1 pet included in base plan</p>
              <p>• Additional pets: $1.99/year each</p>
              <p>• Cancel anytime</p>
            </div>
          </>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={checkSubscription}
          className="w-full"
        >
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
}