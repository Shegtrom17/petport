import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Minimal stub to unblock deployments while PDF generation is being stabilized
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  console.log("[generate-pet-pdf] start", { method: req.method });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Temporarily disabled to unblock other edge function deployments
    return new Response(
      JSON.stringify({
        success: false,
        error: "PDF generation is temporarily disabled while we stabilize deployments.",
        pdfBytes: null,
        fileName: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-pet-pdf] error", { message, stack: error instanceof Error ? error.stack : undefined });
    return new Response(
      JSON.stringify({ error: message || "Internal Server Error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
