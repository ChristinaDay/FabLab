# 🎯 Adzuna API Setup - Better Job Search Data!

## Why Switch to Adzuna API?

**JSearch API Issues:**
- ❌ Broken location filtering (returns random locations)
- ❌ Poor data quality 
- ❌ Expensive ($3 per API call)

**Adzuna API Benefits:**
- ✅ **Excellent location filtering** (actually works!)
- ✅ **High-quality job data** from real companies
- ✅ **Free tier**: 1,000 requests/month
- ✅ **Affordable**: $0.50 per 1,000 requests after free tier
- ✅ **Global coverage**: US, UK, Canada, Australia + 16 countries

## Quick Setup (5 minutes)

### 1. Get Free Adzuna API Key
1. Go to [https://developer.adzuna.com/](https://developer.adzuna.com/)
2. Click **"Register"**
3. Create your account
4. You'll get:
   - `app_id` (like: `12345678`)
   - `app_key` (like: `abcdef1234567890abcdef1234567890`)

### 2. Update Environment Variables
Add to your `.env.local` file:

```env
# Adzuna API (RECOMMENDED - Much better than JSearch!)
ADZUNA_APP_ID="your_adzuna_app_id"
ADZUNA_APP_KEY="your_adzuna_app_key"

# Optional: Comment out or remove JSearch API
# RAPIDAPI_KEY="your-rapidapi-key-here"
```

### 3. Test It!
1. Restart your dev server: `npm run dev`
2. Search for **"devops" in "seattle"**
3. You should see **actual Seattle jobs** now! 🎉

## API Comparison

| Feature | JSearch API | Adzuna API |
|---------|-------------|------------|
| Location Filtering | ❌ Broken | ✅ Excellent |
| Data Quality | ❌ Poor | ✅ High |
| Free Tier | ❌ None | ✅ 1,000 req/month |
| Pricing | ❌ $3/call | ✅ $0.50/1000 calls |
| Coverage | 🟡 Global | ✅ US, UK, CA, AU + 16 countries |

## What Changed in the Code

✅ **Already implemented for you:**
- Replaced JSearch API with Adzuna API
- Updated job data mapping
- Removed broken client-side location filtering (not needed!)
- Better error handling and fallbacks

The app will automatically:
- Use Adzuna API if credentials are configured
- Fall back to mock data if not configured
- Show much better location-filtered results!

## Next Steps

After you see Adzuna working well, you can:
1. **Remove JSearch entirely** from your `.env.local`
2. **Increase free tier** by upgrading Adzuna plan if needed
3. **Add more countries** (UK, Canada, Australia) by updating the API calls

**You now have a job search tool that actually works!** 🚀 