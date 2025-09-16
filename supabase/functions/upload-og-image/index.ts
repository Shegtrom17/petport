import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBuffer, fileName } = await req.json();
    
    // Convert base64 to buffer
    const buffer = Uint8Array.from(atob(imageBuffer), c => c.charCodeAt(0));
    
    // Upload to Cloudflare R2
    const r2Response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${Deno.env.get("CLOUDFLARE_ACCOUNT_ID")}/r2/buckets/petport-og-images/objects/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("CLOUDFLARE_R2_TOKEN")}`,
        'Content-Type': 'image/png',
      },
      body: buffer,
    });

    if (!r2Response.ok) {
      throw new Error(`R2 upload failed: ${r2Response.statusText}`);
    }

    const imageUrl = `https://petport.app/og/${fileName}`;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});