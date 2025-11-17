/**
 * Cloudflare Worker for PetPort.app Prerendering
 * 
 * This worker detects search engine bots and serves pre-rendered HTML
 * while serving the normal React app to regular users.
 * 
 * Architecture:
 * - Bot request → Prerender.io → Full HTML
 * - User request → Lovable App → React SPA
 * 
 * Deploy with: wrangler deploy
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Prerender.io API endpoint
  prerenderUrl: 'https://service.prerender.io',
  
  // Your domain
  domain: 'petport.app',
  
  // Cache TTLs (in seconds)
  cacheTTL: {
    marketing: 86400,    // 24 hours for /, /podcast, /learn
    podcast: 604800,     // 7 days for podcast episodes
    profiles: 3600,      // 1 hour for public profiles
    missing: 1800,       // 30 minutes for missing pet pages
    default: 3600,       // 1 hour default
  },
  
  // Paths that should NOT be prerendered
  skipPaths: [
    '/auth',
    '/profile',
    '/billing',
    '/subscribe',
    '/payment-success',
    '/payment-canceled',
    '/post-checkout',
    '/setup-stripe',
    '/diagnose-stripe',
  ],
};

// ============================================================================
// BOT DETECTION
// ============================================================================

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',              // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebot',            // Facebook
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'slackbot',
  'pinterestbot',
  'tumblr',
  'applebot',
  'ia_archiver',        // Alexa
  'rogerbot',           // Moz
  'embedly',
  'quora',
  'outbrain',
  'pinterest',
  'developers.google.com', // Google tools
];

/**
 * Check if the request is from a bot that needs prerendering
 */
function isBot(userAgent) {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Check if the request has escaped fragment (old AJAX crawling scheme)
 */
function hasEscapedFragment(url) {
  return url.searchParams.has('_escaped_fragment_');
}

// ============================================================================
// PATH CLASSIFICATION
// ============================================================================

/**
 * Determine if a path should be skipped (not prerendered)
 */
function shouldSkipPath(pathname) {
  return CONFIG.skipPaths.some(skip => pathname.startsWith(skip));
}

/**
 * Get appropriate cache TTL based on path
 */
function getCacheTTL(pathname) {
  // Marketing pages (homepage, podcast, learn) - 24 hours
  // Podcast episodes - 6 hours (content pages update more frequently)
  if (['/'].includes(pathname) || 
      pathname.startsWith('/podcast') ||
      pathname.startsWith('/learn') ||
      pathname.startsWith('/demos')) {
    // Check if it's an episode page (episodes are at /podcast/:episodeSlug)
    return (pathname.startsWith('/podcast/') && pathname !== '/podcast') 
      ? CONFIG.cacheTTL.podcast 
      : CONFIG.cacheTTL.marketing;
  }
  
  // Public profiles
  if (pathname.includes('/profile') || pathname.includes('/resume')) {
    return CONFIG.cacheTTL.profiles;
  }
  
  // Missing pet pages (urgent updates needed)
  if (pathname.includes('/missing')) {
    return CONFIG.cacheTTL.missing;
  }
  
  return CONFIG.cacheTTL.default;
}

// ============================================================================
// PRERENDER LOGIC
// ============================================================================

/**
 * Fetch pre-rendered content from Prerender.io
 */
async function fetchPrerenderedContent(url, prerenderToken) {
  // Convert petport.app URL to staging URL for Prerender.io to fetch
  const stagingUrl = url.replace('petport.app', 'petport.lovable.app');
  const prerenderUrl = `${CONFIG.prerenderUrl}/${stagingUrl}`;
  
  const response = await fetch(prerenderUrl, {
    headers: {
      'X-Prerender-Token': prerenderToken,
      'User-Agent': 'Cloudflare-Worker-PetPort',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Prerender failed: ${response.status}`);
  }
  
  return response;
}

/**
 * Create cache key for Cloudflare KV
 */
function getCacheKey(url) {
  return `prerender:${url.hostname}${url.pathname}${url.search}`;
}

// ============================================================================
// MAIN WORKER
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const userAgent = request.headers.get('User-Agent') || '';
      const pathname = url.pathname;
      
      // ----------------------------------------------------------------
      // WHITELIST: Let Prerender.io servers through (prevents loops)
      // ----------------------------------------------------------------
      
      if (userAgent.toLowerCase().includes('prerender')) {
        console.log('[PRERENDER.IO BYPASS] Proxying Prerender.io to staging origin');
        const stagingUrl = request.url.replace('petport.app', 'petport.lovable.app');
        return fetch(stagingUrl, request);
      }
      
      // ----------------------------------------------------------------
      // DECISION POINT: Should we prerender this request?
      // ----------------------------------------------------------------
      
      const needsPrerender = 
        (isBot(userAgent) || hasEscapedFragment(url)) &&
        !shouldSkipPath(pathname);
      
      // If not a bot or skip path, serve normal React app from staging
      if (!needsPrerender) {
        // Convert petport.app to staging URL for regular users
        const stagingUrl = request.url.replace('petport.app', 'petport.lovable.app');
        return fetch(stagingUrl, request);
      }
      
      // ----------------------------------------------------------------
      // BOT REQUEST: Serve pre-rendered content
      // ----------------------------------------------------------------
      
      console.log(`[BOT DETECTED] ${userAgent.substring(0, 50)} → ${pathname}`);
      
      // Check cache first (optional, requires KV namespace)
      const cacheKey = getCacheKey(url);
      let cachedResponse = null;
      
      if (env.PRERENDER_CACHE) {
        const cached = await env.PRERENDER_CACHE.get(cacheKey, 'text');
        if (cached) {
          console.log(`[CACHE HIT] ${pathname}`);
          return new Response(cached, {
            headers: {
              'Content-Type': 'text/html',
              'X-Prerender': 'true',
              'X-Prerender-Cache': 'HIT',
              'Cache-Control': `public, max-age=${getCacheTTL(pathname)}`,
            },
          });
        }
      }
      
      // Cache miss - fetch from Prerender.io
      console.log(`[CACHE MISS] Fetching from Prerender.io: ${pathname}`);
      
      const prerenderToken = env.PRERENDER_TOKEN;
      if (!prerenderToken) {
        console.error('[ERROR] PRERENDER_TOKEN not configured');
        return fetch(request); // Fallback to React app
      }
      
      const prerenderedResponse = await fetchPrerenderedContent(
        request.url, 
        prerenderToken
      );
      
      const html = await prerenderedResponse.text();
      
      // Store in cache for next time (optional, requires KV namespace)
      if (env.PRERENDER_CACHE) {
        const ttl = getCacheTTL(pathname);
        ctx.waitUntil(
          env.PRERENDER_CACHE.put(cacheKey, html, {
            expirationTtl: ttl,
          })
        );
      }
      
      // Return pre-rendered HTML
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'X-Prerender': 'true',
          'X-Prerender-Cache': 'MISS',
          'Cache-Control': `public, max-age=${getCacheTTL(pathname)}`,
          'X-Prerender-Status': prerenderedResponse.status.toString(),
        },
      });
      
    } catch (error) {
      console.error('[ERROR] Prerender worker failed:', error);
      
      // Fallback: serve React app on error
      return fetch(request);
    }
  },
};
