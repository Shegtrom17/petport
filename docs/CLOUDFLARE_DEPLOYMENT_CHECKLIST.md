# Cloudflare Worker Deployment Checklist - PetPort.app

## Pre-Deployment Checklist

### Phase 1: Accounts & Access
- [ ] Cloudflare account confirmed for petport.app domain
- [ ] Cloudflare Workers Paid plan activated ($5/month)
- [ ] Prerender.io account created (https://prerender.io)
- [ ] Prerender.io token obtained from dashboard
- [ ] Wrangler CLI installed globally (`npm install -g wrangler`)

### Phase 2: Configuration
- [ ] `wrangler.toml` updated with correct Account ID
- [ ] `PRERENDER_TOKEN` secret configured (`wrangler secret put PRERENDER_TOKEN`)
- [ ] KV namespace created (optional): `wrangler kv:namespace create "PRERENDER_CACHE"`
- [ ] `wrangler.toml` updated with KV namespace ID (if using cache)

### Phase 3: Testing Locally
- [ ] Worker script syntax verified
- [ ] Bot detection logic tested
- [ ] Path skip logic tested
- [ ] Cache TTL configuration reviewed

## Deployment Steps

### Step 1: Initial Deploy
```bash
cd cloudflare-worker
wrangler deploy
```
- [ ] Deployment successful (no errors)
- [ ] Worker URL returned (e.g., petport-prerender.workers.dev)

### Step 2: Configure Route in Dashboard
1. Go to: https://dash.cloudflare.com/
2. Select account → Workers & Pages
3. Click `petport-prerender`
4. Settings → Triggers → Add Route
   - [ ] Route: `petport.app/*`
   - [ ] Zone: `petport.app`
   - [ ] Save

### Step 3: Verify DNS Configuration
- [ ] `petport.app` A record: `185.158.133.1` (gray cloud - DNS only) ✅
- [ ] `www.petport.app` A record: `185.158.133.1` (gray cloud - DNS only) ✅
- [ ] No AAAA records interfering
- [ ] TTL set appropriately (e.g., 300 seconds)

## Post-Deployment Testing

### Test 1: Bot Detection
```bash
# Should return full HTML with content
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://petport.app/ | grep -i "petport"
```
- [ ] Returns full HTML (not React shell)
- [ ] Contains meta tags
- [ ] Contains rendered content

### Test 2: User Experience
```bash
# Should return React app shell
curl https://petport.app/ | grep -i "root"
```
- [ ] Returns minimal HTML with root div
- [ ] React app loads in browser
- [ ] No broken functionality

### Test 3: Critical Pages
Test each with Googlebot user-agent:
- [ ] `/` (Homepage)
- [ ] `/podcast` (Podcast hub)
- [ ] `/podcast/episode/pet-screening-resume-builder` (Episode)
- [ ] `/learn` (Learn hub)
- [ ] `/demos` (Demo hub)
- [ ] Public profile page (get ID from database)

### Test 4: Auth-Protected Pages (Should NOT Prerender)
- [ ] `/profile` returns React shell (not prerendered)
- [ ] `/billing` returns React shell
- [ ] `/subscribe` returns React shell

### Test 5: Social Media Crawlers
```bash
# Facebook
curl -A "facebookexternalhit/1.1" https://petport.app/podcast

# Twitter
curl -A "Twitterbot/1.0" https://petport.app/podcast
```
- [ ] Facebook returns full HTML
- [ ] Twitter returns full HTML
- [ ] OG tags present

## Monitoring Setup

### Cloudflare Analytics
1. Go to Workers & Pages → petport-prerender → Analytics
   - [ ] Request count tracking
   - [ ] Error rate monitoring
   - [ ] CPU time tracking

### Real-time Logs
```bash
wrangler tail
```
- [ ] Logs showing bot/user classification
- [ ] Cache hit/miss tracking
- [ ] No error messages

### Prerender.io Dashboard
1. Go to: https://prerender.io/account
   - [ ] Pages being cached
   - [ ] Success rate > 95%
   - [ ] Response times < 3s

## SEO Validation

### Google Search Console
1. Go to: https://search.google.com/search-console
   - [ ] Sitemap resubmitted
   - [ ] URL inspection for critical pages
   - [ ] Request indexing for top 10 pages

### Rich Results Test
1. Go to: https://search.google.com/test/rich-results
   - [ ] Test homepage
   - [ ] Test podcast hub
   - [ ] Test podcast episode
   - [ ] Verify structured data appears

### Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
   - [ ] Test homepage
   - [ ] Test podcast episode
   - [ ] OG image loads
   - [ ] Description shows

### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
   - [ ] Test homepage
   - [ ] Test podcast episode
   - [ ] Card preview appears

## Week 1 Monitoring

### Daily Checks (Days 1-7)
- [ ] Day 1: Worker running without errors
- [ ] Day 2: Cache hit rate trending up
- [ ] Day 3: Google Search Console shows no errors
- [ ] Day 4: Check Prerender.io usage (should be < 10k/day)
- [ ] Day 5: Verify indexed pages increasing
- [ ] Day 6: User experience still fast
- [ ] Day 7: Review analytics, adjust cache TTLs if needed

### Week 1 Metrics
- [ ] Total bot requests: _______
- [ ] Cache hit rate: _______% (target: >70%)
- [ ] Prerender.io requests: _______ (target: <10k)
- [ ] Average response time: _______ms (target: <500ms)
- [ ] Google indexed pages: _______ (target: +50)

## Optimization Actions

### If Cache Hit Rate < 70%
- [ ] Increase cache TTLs in worker config
- [ ] Verify KV namespace is working
- [ ] Check for cache purging issues

### If Prerender.io Requests > 10k/week
- [ ] Reduce cache TTLs for less-critical pages
- [ ] Add more paths to skip list
- [ ] Consider upgrading Prerender.io plan

### If Response Time > 500ms
- [ ] Enable KV caching if not already
- [ ] Optimize worker logic
- [ ] Check Prerender.io performance

### If Google Indexing < Expected
- [ ] Manually request indexing via Search Console
- [ ] Check robots.txt not blocking
- [ ] Verify sitemap is accessible
- [ ] Check for crawl errors in Search Console

## Rollback Plan

### If Critical Issues Arise
1. **Disable Worker Route**
   - [ ] Go to Cloudflare dashboard
   - [ ] Workers & Pages → petport-prerender
   - [ ] Triggers → Delete route
   - [ ] Site will revert to normal React app

2. **Alternative: Disable for Specific Paths**
   - [ ] Add problematic paths to `skipPaths` in worker
   - [ ] Redeploy: `wrangler deploy`

3. **Full Rollback**
   - [ ] Delete worker entirely
   - [ ] DNS still works (gray cloud)
   - [ ] React app functions normally

## Success Criteria (30 Days)

### Technical Metrics
- [ ] Worker uptime: 99.9%
- [ ] Cache hit rate: >80%
- [ ] Average response time: <300ms
- [ ] Zero critical errors

### SEO Metrics
- [ ] 90%+ of critical pages indexed
- [ ] Organic traffic increase: >100%
- [ ] Search impressions up: >200%
- [ ] Average position improving

### Business Metrics
- [ ] Organic signups increasing
- [ ] Direct traffic from search
- [ ] Reduced bounce rate from search
- [ ] Lower acquisition cost

## Notes & Observations

### Deployment Date: _______________

### Week 1 Notes:
```
[Add observations here]
```

### Issues Encountered:
```
[Document any problems and solutions]
```

### Optimization Ideas:
```
[Ideas for future improvements]
```

---

**Deployment Sign-off:**
- [ ] Technical verification complete
- [ ] SEO tools validation passed
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Documentation updated

**Deployed by:** _______________  
**Date:** _______________  
**Status:** ⬜ In Progress | ⬜ Complete | ⬜ Issues Found
