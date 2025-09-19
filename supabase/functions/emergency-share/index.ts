import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Emergency share function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const petId = url.searchParams.get('petId');
    const redirect = url.searchParams.get('redirect');
    const userAgent = req.headers.get('user-agent') || '';
    
    // Detect social media crawlers
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|telegram/i.test(userAgent);
    
    console.log('Emergency share request:', {
      petId,
      redirect,
      userAgent,
      isCrawler
    });

    // If not a crawler and redirect is provided, redirect immediately
    if (!isCrawler && redirect) {
      return Response.redirect(decodeURIComponent(redirect), 302);
    }

    if (!petId) {
      return new Response('Pet ID is required', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pet data - public pets only for sharing
    const { data: pet, error } = await supabase
      .from('pets')
      .select('name, species, is_public')
      .eq('id', petId)
      .single();

    if (error || !pet) {
      console.error('Pet not found:', error);
      return new Response('Pet not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    if (!pet.is_public) {
      console.error('Pet is not public');
      return new Response('Pet not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Generate meta tags for social sharing
    const title = `🚨 ${pet.name}'s Emergency Information - PetPort`;
    const description = `Quick access to ${pet.name}'s emergency contact details and important information.`;
    const ogImage = 'https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/carehandling-og.png';
    const canonicalUrl = `https://petport.app/profile/${petId}`;
    
    // Sanitize strings to prevent XSS
    const sanitizeString = (str: string) => {
      return str.replace(/[<>"'&]/g, (match) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '&': '&amp;'
        };
        return entities[match];
      });
    };

    const safeTitle = sanitizeString(title);
    const safeDescription = sanitizeString(description);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${safeTitle}">
    <meta property="twitter:description" content="${safeDescription}">
    <meta property="twitter:image" content="${ogImage}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${canonicalUrl}">
    
    ${redirect ? `
    <script>
      setTimeout(function() {
        window.location.href = "${decodeURIComponent(redirect)}";
      }, 100);
    </script>
    ` : ''}
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
        <h1>🚨 ${sanitizeString(pet.name)}'s Emergency Information</h1>
        <p>${safeDescription}</p>
        <p>
            <a href="${canonicalUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                View Emergency Details
            </a>
        </p>
    </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
      },
    });

  } catch (error) {
    console.error('Error in emergency-share function:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});