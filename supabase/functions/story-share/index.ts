import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const storyId = url.searchParams.get('storyId');
    const redirect = url.searchParams.get('redirect');

    const userAgent = req.headers.get('user-agent') || '';
    const isCrawler = /facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|slackbot/i.test(userAgent);

    if (!isCrawler && redirect) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': redirect },
      });
    }

    if (!storyId) {
      throw new Error('storyId is required');
    }

    // Fetch story data
    const { data: story, error: storyError } = await supabase
      .from('story_updates')
      .select(`
        id,
        story_text,
        photo_url,
        author_name,
        created_at,
        pet_id
      `)
      .eq('id', storyId)
      .eq('is_visible', true)
      .single();

    if (storyError || !story) {
      throw new Error('Story not found or not visible');
    }

    // Fetch pet data
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, name, species, breed')
      .eq('id', story.pet_id)
      .eq('is_public', true)
      .single();

    if (petError || !pet) {
      throw new Error('Pet not found or not public');
    }

    const title = `${pet.name}'s Story Update`;
    const storySnippet = story.story_text.length > 150 
      ? story.story_text.substring(0, 150) + '...' 
      : story.story_text;
    const description = `${story.author_name || 'Story Update'}: ${storySnippet}`;
    const ogImageUrl = story.photo_url || `https://petport.app/og/general-og.png`;
    const canonicalUrl = `https://petport.app/story-stream/${story.pet_id}#story-${story.id}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="PetPort">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonicalUrl}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  
  ${redirect ? `<meta http-equiv="refresh" content="0;url=${redirect}">` : ''}
  ${redirect ? `<script>window.location.href="${redirect}";</script>` : ''}
  
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { text-align: center; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 1.5rem; line-height: 1.6; }
    a {
      display: inline-block;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📖 ${title}</h1>
    <p>"${storySnippet}"</p>
    <a href="${canonicalUrl}">View Story</a>
  </div>
</body>
</html>
    `.trim();

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error in story-share:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
