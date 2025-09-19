import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// CORS headers for edge functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration')
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    const url = new URL(req.url)
    const petId = url.searchParams.get('petId')
    const redirect = url.searchParams.get('redirect')

    // Detect crawler/bot user agents
    const userAgent = req.headers.get('user-agent') || ''
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|skypeuripreview|slackbot|discordbot/i.test(userAgent)

    console.log('Travel share request:', { petId, redirect, userAgent: userAgent.substring(0, 100), isCrawler })

    // If not a crawler and redirect is provided, perform redirect
    if (!isCrawler && redirect) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': decodeURIComponent(redirect)
        }
      })
    }

    if (!petId) {
      console.error('Missing petId parameter')
      return new Response('Pet ID is required', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch pet data
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('name, species, age, is_public')
      .eq('id', petId)
      .single()

    if (petError || !pet) {
      console.error('Pet not found:', petError)
      return new Response('Pet not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }

    if (!pet.is_public) {
      console.error('Pet is not public')
      return new Response('Pet is not public', { 
        status: 404,
        headers: corsHeaders 
      })
    }

    // Sanitize pet name for safe HTML output
    const safePetName = pet.name?.replace(/[<>"'&]/g, '') || 'Pet'
    
    // Generate URLs
    const baseUrl = 'https://petport.app'
    const canonicalUrl = `${baseUrl}/profile/${petId}`
    const ogImageUrl = 'https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/travel-og.png'
    
    // Generate the HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Primary Meta Tags -->
    <title>${safePetName}'s Travel Map - PetPort</title>
    <meta name="title" content="${safePetName}'s Travel Map - PetPort">
    <meta name="description" content="Check out ${safePetName}'s travels, with PetPort's interactive map.">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${safePetName}'s Travel Map - PetPort">
    <meta property="og:description" content="Check out ${safePetName}'s travels, with PetPort's interactive map.">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${safePetName}'s Travel Map - PetPort">
    <meta property="twitter:description" content="Check out ${safePetName}'s travels, with PetPort's interactive map.">
    <meta property="twitter:image" content="${ogImageUrl}">
    
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 600px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 20px 0; font-size: 2.5em; }
        p { font-size: 1.2em; line-height: 1.6; margin: 0 0 30px 0; }
        .loading { opacity: 0.7; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${safePetName}'s Travel Map</h1>
        <p>Explore ${safePetName}'s adventures with PetPort's interactive travel map.</p>
        <div class="loading">Loading travel data...</div>
    </div>
    
    ${redirect ? `
    <script>
        setTimeout(function() {
            window.location.href = decodeURIComponent('${redirect}');
        }, 2000);
    </script>
    ` : ''}
</body>
</html>`

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    })

  } catch (error) {
    console.error('Error in travel-share function:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})