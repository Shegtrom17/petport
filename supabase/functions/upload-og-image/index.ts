import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read the image file from public/og/resume-og-v1.png
    const imageResponse = await fetch('https://c2db7d2d-7448-4eaf-945e-d804d3aeaccc.sandbox.lovable.dev/og/resume-og-v1.png')
    const imageBuffer = await imageResponse.arrayBuffer()

    // Upload to storage bucket with correct content type
    const { data, error } = await supabase.storage
      .from('og-images')
      .upload('resume-og-v1.png', imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('og-images')
      .getPublicUrl('resume-og-v1.png')

    return new Response(JSON.stringify({ 
      success: true, 
      path: data.path,
      publicUrl: urlData.publicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})