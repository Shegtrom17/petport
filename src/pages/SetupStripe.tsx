import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SetupStripe() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [autoRunComplete, setAutoRunComplete] = useState(false);

  // Auto-run the setup when component mounts
  useEffect(() => {
    if (!autoRunComplete) {
      runSetup();
      setAutoRunComplete(true);
    }
  }, [autoRunComplete]);

  const runSetup = async () => {
    setIsRunning(true);
    try {
      console.log("Invoking setup-stripe-products function...");
      
      const { data, error } = await supabase.functions.invoke('setup-stripe-products', {
        body: {
          setupToken: 'petport-setup-2024'
        }
      });

      if (error) {
        console.error("Function error:", error);
        toast.error(`Error: ${error.message}`);
        setResult({ error: error.message });
      } else {
        console.log("Function success:", data);
        toast.success("Stripe products setup completed successfully!");
        setResult(data);
      }
    } catch (err: any) {
      console.error("Catch error:", err);
      toast.error(`Error: ${err.message}`);
      setResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Setup Stripe Products</CardTitle>
          <p className="text-sm text-muted-foreground">
            {autoRunComplete ? "Setup completed automatically." : "Setting up automatically..."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runSetup} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? "Setting up..." : "Run Setup Again"}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}