import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Edge function disabled - force fallback to client-side generation
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  console.log("[generate-pet-pdf] Edge function disabled, forcing client-side fallback", { method: req.method });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Always return error to force client-side generation
    return new Response(
      JSON.stringify({
        success: false,
        error: "Edge function disabled - use client-side generation",
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
