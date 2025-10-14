// 🚨 DO NOT MODIFY WITHOUT OWNER APPROVAL (Oct 2025)
// This file contains verified production logic for sharing, OG metadata, and PDF generation.
// Any refactor or change may break share previews, OG image rendering, or PDF attachments.
// Cloudflare R2 hosts all OG images. Supabase OG fallbacks must never be re-enabled.
// Changes require explicit confirmation from Susan Hegstrom.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

// Environment
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Service not configured", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const url = new URL(req.url);
    const petId = url.searchParams.get("petId");
    const redirect = url.searchParams.get("redirect");
    
    // Check if this is a bot/crawler request
    const userAgent = req.headers.get("user-agent") || "";
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord|messenger|skype|slack/i.test(userAgent);
    
    // If not a crawler and we have a redirect URL, redirect immediately
    if (!isCrawler && redirect) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": redirect
        }
      });
    }

    if (!petId) {
      return new Response("petId is required", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Fetch minimal public-safe data
    const { data: pet, error: petErr } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, photo_url, photoUrl")
      .eq("id", petId)
      .maybeSingle();

    if (petErr) console.log("WARN: pet fetch error", petErr);

    const { data: lost, error: lostErr } = await supabase
      .from("lost_pet_data")
      .select("last_seen_location, last_seen_date, reward_amount")
      .eq("pet_id", petId)
      .maybeSingle();
    if (lostErr) console.log("WARN: lost data fetch error", lostErr);

    // Try to get a photo from pet_photos as fallback
    let photoUrl = (pet as any)?.photo_url || (pet as any)?.photoUrl || "";
    if (!photoUrl) {
      const { data: photos } = await supabase
        .from("pet_photos")
        .select("url, photo_url")
        .eq("pet_id", petId)
        .limit(1)
        .maybeSingle();
      photoUrl = (photos as any)?.url || (photos as any)?.photo_url || photoUrl;
    }

    const name = pet?.name || "Missing Pet";
    const safe = (s: string | null | undefined) => (s || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

    // Generate branded URL for OG tags
    const brandedUrl = `https://petport.app/missing/${petId}`;

    const lastSeenDate = lost?.last_seen_date ? new Date(lost.last_seen_date).toLocaleDateString() : "";
    const lastSeenStr = [safe(lost?.last_seen_location), lastSeenDate].filter(Boolean).join(" • ");
    const reward = lost?.reward_amount ? `Reward: ${safe(lost.reward_amount)}` : "";

    // Use the Cloudflare R2 lost pet image
    const ogImageUrl = "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og-lostpet.png";
    
    const petName = safe(name);
    const title = `MISSING: ${petName} - Help Bring Them Home | PetPort`;
    const description = `Help us find ${petName}! Share this post to spread the word. Every share increases the chance of a safe return. View full details and contact information.`;

    // Build minimal HTML with OG/Twitter meta and optional redirect for humans
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${brandedUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:secure_url" content="${ogImageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Missing pet alert from PetPort" />
  <meta property="og:url" content="${brandedUrl}" />
  <meta property="og:site_name" content="PetPort" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImageUrl}" />

  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 2rem; }
    .container { max-width: 760px; margin: 0 auto; text-align: center; }
    .btn { display: inline-block; background: #dc2626; color: #fff; padding: 0.75rem 1rem; border-radius: 0.5rem; text-decoration: none; }
    .muted { color: #6b7280; margin-top: 0.5rem; }
    img { max-width: 100%; height: auto; border-radius: 0.75rem; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${description}</p>
    ${photoUrl ? `<img alt="Photo of ${name}" src="${photoUrl}" />` : ""}
    ${redirect ? `<p><a class="btn" href="${redirect}">View live alert</a></p>` : ""}
    ${redirect ? `<p class="muted">If you are not redirected automatically, use the button above.</p>` : ""}
  </div>
  ${redirect ? `<script>setTimeout(() => location.replace(${JSON.stringify(redirect)}), 1000);</script>` : ""}
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    console.error("missing-pet-share error", e);
    return new Response("Internal error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
