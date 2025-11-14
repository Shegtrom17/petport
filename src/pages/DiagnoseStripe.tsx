import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function DiagnoseStripe() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      console.log("Running Stripe diagnostic...");
      
      const { data, error } = await supabase.functions.invoke('diagnose-stripe-mode');

      if (error) {
        console.error("Diagnostic error:", error);
        toast.error(`Error: ${error.message}`);
        setResult({ error: error.message });
      } else {
        console.log("Diagnostic result:", data);
        const isLive = data.isLiveMode;
        toast.success(isLive ? "✅ LIVE MODE DETECTED" : "⚠️ TEST MODE DETECTED");
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

  const getModeIcon = () => {
    if (!result) return null;
    if (result.error) return <XCircle className="w-8 h-8 text-destructive" />;
    return result.isLiveMode 
      ? <CheckCircle className="w-8 h-8 text-green-600" />
      : <AlertCircle className="w-8 h-8 text-orange-500" />;
  };

  const getModeText = () => {
    if (!result) return null;
    if (result.error) return "ERROR";
    return result.isLiveMode ? "🟢 LIVE MODE" : "🟡 TEST MODE";
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Stripe Environment Diagnostic</CardTitle>
          <p className="text-sm text-muted-foreground">
            Check which Stripe environment is currently active
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? "Running Diagnostic..." : "Run Stripe Diagnostic"}
          </Button>
          
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                {getModeIcon()}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{getModeText()}</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.error ? "Failed to retrieve mode" : "Current Stripe environment"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Diagnostic Details:</h4>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96 font-mono">
{JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {!result.error && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 border rounded">
                    <div className="text-muted-foreground mb-1">Key Prefix</div>
                    <div className="font-mono font-semibold">{result.keyPrefix}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-muted-foreground mb-1">Account ID</div>
                    <div className="font-mono text-xs">{result.accountId}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-muted-foreground mb-1">Account Name</div>
                    <div className="font-semibold">{result.accountName}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-muted-foreground mb-1">Charges Enabled</div>
                    <div className="font-semibold">{result.chargesEnabled ? "✅ Yes" : "❌ No"}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
