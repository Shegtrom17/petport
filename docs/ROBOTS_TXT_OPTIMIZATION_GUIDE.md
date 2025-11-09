# Robots.txt Optimization Guide
## PetPort.app Crawl Management Strategy

**Last Updated:** November 2025  
**Purpose:** Maximize SEO performance while protecting sensitive routes and managing server load

---

## 📋 Overview

This guide explains PetPort's robots.txt optimization strategy, including crawl rate limiting, strategic allow/disallow rules, and security best practices.

### Current Status
✅ **Optimized** - Strategic crawl rules implemented  
✅ **Sitemap integrated** - Points to production sitemap.xml  
✅ **Security focused** - Auth/admin pages protected  
✅ **Performance tuned** - Different delays per bot type  

---

## 🎯 Core Strategy

### 1. **Tiered Crawler Access**
Different user-agents receive different treatment based on their value:

| Tier | Crawlers | Crawl-Delay | Access Level |
|------|----------|-------------|--------------|
| **Priority** | Googlebot, Bingbot | 1 second | Full public access |
| **Social** | Facebook, Twitter, LinkedIn | 0 seconds | Full access (need instant OG data) |
| **SEO Tools** | Ahrefs, Semrush | 10 seconds | Rate-limited, partial access |
| **Bad Bots** | Scrapers, unknown | ∞ (blocked) | No access |
| **Default** | All others | 2 seconds | Standard public access |

### 2. **Strategic Allow Rules**
Explicitly allowed paths for maximum visibility:

```
Allow: /                        # Homepage (priority)
Allow: /demo/*                  # All demo pages (SEO gold)
Allow: /podcast/*               # Content marketing hub
Allow: /public/*                # Public pet profiles (UGC)
Allow: /gift                    # High-value conversion page
Allow: /lost-pet-features       # Core product page
Allow: /learn                   # Educational content
Allow: /demos                   # Demo index
Allow: /referral-program        # Growth page
Allow: /vaccination-guide       # Resource content
Allow: /help                    # Support center
Allow: /privacy-policy          # Legal (required)
Allow: /terms                   # Legal (required)
Allow: /data-deletion           # Legal (required)
```

### 3. **Strategic Disallow Rules**
Protected paths (should NOT be indexed):

#### Authentication & User Pages
```
Disallow: /auth                 # Login/signup pages
Disallow: /profile              # User dashboard
Disallow: /add-pet              # Pet creation form
Disallow: /onboarding           # New user flow
```

#### Transactional Pages
```
Disallow: /billing              # Billing dashboard
Disallow: /subscribe            # Checkout flow
Disallow: /setup-stripe         # Stripe onboarding
Disallow: /post-checkout        # Post-purchase page
Disallow: /payment-success      # Success confirmation
Disallow: /payment-canceled     # Canceled payment
Disallow: /claim-subscription   # Gift claim flow
```

#### Admin & Internal Pages
```
Disallow: /referrals            # User referral dashboard
Disallow: /transfer-accept      # Pet transfer flow
Disallow: /recover-gift         # Gift recovery
Disallow: /reactivate           # Subscription reactivation
Disallow: /email-test           # Testing utility
```

#### API & Technical Endpoints
```
Disallow: /api/*                # API endpoints
Disallow: /functions/*          # Edge functions
Disallow: /*.json$              # JSON files
Disallow: /*?*auth*             # Auth query params
Disallow: /*?*token*            # Token params
Disallow: /*?*session*          # Session params
```

### 4. **Domain Protection**
Block staging/preview domains from being indexed:

```
Disallow: /*lovableproject.com*  # Lovable preview domain
Disallow: /*lovable.app*         # Lovable staging domain
Disallow: /*supabase.co*         # Supabase direct URLs
```

---

## ⚙️ Crawl-Delay Strategy

### Why Different Delays?

**0 seconds (Social crawlers):**
- Need instant Open Graph data
- Time-sensitive preview generation
- Users expect immediate link previews
- Low server impact (infrequent)

**1 second (Major search engines):**
- Trusted, well-behaved crawlers
- Need frequent access for freshness
- Respect server resources
- Balance speed vs. load

**2 seconds (Default):**
- Unknown but legitimate crawlers
- Cautious approach
- Prevents accidental overload
- Standard industry practice

**10 seconds (SEO tools):**
- Rate limit aggressive crawlers
- Not core to SEO performance
- Reduce server load
- Still allow data collection

**∞ (Bad bots):**
- Known scrapers/bad actors
- No legitimate SEO value
- Waste server resources
- Security risk

---

## 🔒 Security Benefits

### Protected Information
- User authentication flows
- Payment processing pages
- Personal dashboards
- API endpoints with sensitive data
- Session/token parameters

### Attack Surface Reduction
- Prevents bot enumeration of user pages
- Blocks automated scraping of user data
- Protects billing/payment flows
- Hides internal testing utilities

---

## 📊 SEO Impact Analysis

### Positive Impacts
✅ **Crawl Budget Optimization:** Directs bots to high-value pages  
✅ **Faster Indexing:** Priority paths get crawled first  
✅ **Security Signals:** Google favors sites with proper access control  
✅ **Server Performance:** Reduced load = faster page speeds  
✅ **Rich Snippets:** Social crawlers get instant OG data  

### Pages Excluded from Index (By Design)
🔒 Auth pages (no SEO value)  
🔒 User dashboards (private content)  
🔒 Checkout flows (don't want in search results)  
🔒 Admin pages (security risk)  
🔒 Testing utilities (internal only)  

---

## 🧪 Testing & Validation

### Google Search Console Verification

1. **Submit robots.txt for crawling:**
   - Go to GSC → Crawl → robots.txt Tester
   - Test specific URLs to verify rules

2. **Monitor crawl stats:**
   - Check "Crawl Stats" report
   - Verify crawl rate is appropriate
   - Look for crawl errors on allowed paths

3. **Test specific URLs:**
   ```
   Allowed (should return success):
   - https://petport.app/
   - https://petport.app/gift
   - https://petport.app/demo/resume
   - https://petport.app/podcast
   
   Blocked (should return disallowed):
   - https://petport.app/auth
   - https://petport.app/profile
   - https://petport.app/billing
   ```

### Manual Testing Tools

**Robots.txt Tester:**
- https://www.google.com/webmasters/tools/robots-testing-tool
- https://technicalseo.com/tools/robots-txt/

**Social Preview Testing:**
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/

---

## 📈 Monitoring & Maintenance

### Weekly Checks
- [ ] Review GSC crawl stats
- [ ] Check for unexpected 404s on allowed paths
- [ ] Monitor server load patterns
- [ ] Verify social previews still work

### Monthly Reviews
- [ ] Analyze which pages are being crawled most
- [ ] Update Allow/Disallow rules based on new pages
- [ ] Review bad bot activity
- [ ] Optimize crawl-delay if needed

### Quarterly Audits
- [ ] Full robots.txt review
- [ ] Test all major user-agents
- [ ] Update bad bot list
- [ ] Benchmark crawl efficiency

---

## 🚀 Advanced Optimization

### Crawl Budget Prioritization

If Googlebot is wasting crawl budget:

1. **Block low-value query parameters:**
   ```
   Disallow: /*?sort=*
   Disallow: /*?filter=*
   Disallow: /*?page=*
   ```

2. **Use canonical tags on allowed pages:**
   - Prevents duplicate content issues
   - Consolidates crawl budget

3. **Implement dynamic rendering:**
   - Serve pre-rendered HTML to bots
   - Faster crawl, better indexing

### Host-Specific Rules

For different environments:

```
# Production only
User-agent: *
Disallow: /*?env=staging*
Disallow: /*?test=*
```

---

## 🎯 Best Practices

### DO ✅
- Keep rules simple and explicit
- Test changes before deploying
- Monitor crawl stats regularly
- Use Allow rules for priority content
- Update sitemap location in robots.txt
- Block auth/admin pages
- Rate-limit aggressive crawlers

### DON'T ❌
- Block CSS/JS files (Google needs them)
- Block images (hurts image search)
- Disallow entire domains accidentally
- Block social crawlers (breaks previews)
- Use robots.txt for security alone (not sufficient)
- Forget to update after adding new pages
- Block all crawlers on production

---

## 🔗 Related Resources

**Internal Documentation:**
- [Sitemap Optimization Guide](../public/sitemap.xml)
- [SEO Audit Report](./SEO_AUDIT_REPORT.md)
- [Gift Page SEO Audit](./GIFT_PAGE_SEO_AUDIT.md)

**External Resources:**
- [Google Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [Robots.txt Standard](https://www.robotstxt.org/)

---

## 📝 Change Log

**November 2025:**
- ✅ Implemented tiered crawler access
- ✅ Added explicit Allow rules for priority pages
- ✅ Blocked auth/admin routes
- ✅ Added social crawler optimizations (0s delay)
- ✅ Rate-limited SEO tool crawlers
- ✅ Blocked bad bots completely
- ✅ Added API endpoint protection

**October 2025:**
- Initial robots.txt setup
- Basic Allow/Disallow rules
- Sitemap integration

---

## 🎓 Summary

**Current Optimization Level:** ⭐⭐⭐⭐⭐ (5/5)

**Key Achievements:**
- Strategic crawl rate management
- Security-first approach to sensitive routes
- Social crawler optimization for instant previews
- SEO tool rate limiting for server protection
- Complete bad bot blocking

**Expected Results:**
- Faster indexing of priority pages
- Better crawl budget utilization
- Improved server performance
- Enhanced security posture
- Optimal social media preview generation

**Maintenance Requirement:** Low (review monthly, update quarterly)
