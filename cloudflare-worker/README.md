# PetPort.app Cloudflare Worker - Prerendering Setup

## Quick Start

### 1. Install Dependencies
```bash
cd cloudflare-worker
npm install -g wrangler
npm install
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Configure Account ID
1. Go to: https://dash.cloudflare.com/
2. Copy your Account ID from the right sidebar
3. Update `wrangler.toml` with your `account_id`

### 4. Set Prerender.io Token
```bash
# Sign up at https://prerender.io first
# Then get your token from: https://prerender.io/account

wrangler secret put PRERENDER_TOKEN
# Paste your token when prompted
```

### 5. (Optional) Create KV Namespace for Caching
```bash
wrangler kv:namespace create "PRERENDER_CACHE"

# Copy the namespace ID from output and update wrangler.toml
# Uncomment the kv_namespaces section and add the ID
```

### 6. Deploy
```bash
wrangler deploy
```

### 7. Configure Route in Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com/
2. Select your account → Workers & Pages
3. Click on `petport-prerender`
4. Go to "Settings" → "Triggers"
5. Add Route: `petport.app/*`
6. Select Zone: `petport.app`
7. Save

## Testing

### Test as Googlebot
```bash
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://petport.app/podcast
```

Should return full HTML with rendered content.

### Test as Regular User
```bash
curl https://petport.app/podcast
```

Should return the React app shell.

### Check Worker Logs
```bash
wrangler tail
```

Then make requests to see real-time logs.

## Monitoring

### Cloudflare Dashboard
- Go to Workers & Pages → petport-prerender
- View Analytics tab for request counts
- Check Logs tab for errors

### Prerender.io Dashboard
- Go to: https://prerender.io/account
- View cached pages
- Check prerender success rate
- Purge cache if needed

## Troubleshooting

### Worker not catching requests
**Fix:** Verify route is set to `petport.app/*` in Cloudflare dashboard

### Getting blank pages for bots
**Fix:** Check that PRERENDER_TOKEN secret is set correctly

### Slow prerender times
**Fix:** Enable KV caching (see step 5 above)

### High costs
**Fix:** Increase cache TTLs in `prerender-worker.js` CONFIG section

## Cost Tracking

### Current Setup
- Cloudflare Workers: $5/month (Paid plan)
- Prerender.io: $30/month (10k cached pages)
- **Total: $35/month**

### Expected Usage
- ~50,000 bot requests/month
- ~80% cache hit rate with KV
- ~10,000 prerender.io requests/month

## Next Steps

1. ✅ Deploy Worker
2. ✅ Test with Google Rich Results Test
3. ✅ Submit sitemap to Google Search Console
4. ✅ Request re-indexing of critical pages
5. Monitor for 1 week
6. Optimize cache strategy based on analytics
