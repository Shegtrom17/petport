import { useState } from "react";
import { X } from "lucide-react";
import { featureFlags } from "@/config/featureFlags";
import { Button } from "@/components/ui/button";

export const TestModeRibbon = () => {
  const [dismissed, setDismissed] = useState(false);

  if (!featureFlags.testMode || dismissed) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-screen-xl px-3 sm:px-4 py-2 text-sm flex items-center justify-between gap-3">
        <p className="leading-tight">
          Test Mode is active for trusted testers. Some organization features may be visible; server rules still enforce data security.
        </p>
        <Button size="sm" variant="secondary" onClick={() => setDismissed(true)} className="shrink-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
};
