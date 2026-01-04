# 🌐 Deployment Guide for HabbitTracker

This guide covers deploying HabbitTracker to production using popular hosting platforms.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Next.js)                         │
│           Deployed on: Vercel / Netlify / Railway           │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Calls to /api/v1/*
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express.js)                       │
│        Deployed on: Railway / Heroku / DigitalOcean        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (MongoDB Atlas)                       │
│              Cloud Managed Service                         │
└─────────────────────────────────────────────────────────────┘
```

## Option 1: Vercel + Railway (Recommended)

### Why This Stack?
- **Vercel**: Perfect for Next.js with zero-config deployment
- **Railway**: Simple Node.js backend deployment
- **MongoDB Atlas**: Managed MongoDB in the cloud
- **Total Cost**: Free tier covers small projects ($0-50/month)

### Deployment Steps

#### 1. Prepare MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Click "Create" → "Build a Cluster"
4. Choose a free tier (M0) cluster
5. Wait for cluster to be created
6. Click "CONNECT" and choose "Connect your application"
7. Copy the connection string (you'll need this)
8. Replace `<password>` with your password and `myFirstDatabase` with your DB name

#### 2. Deploy Backend on Railway

1. Go to https://railway.app
2. Create account and link GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your HabbitTracker repository
5. In Settings, add environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habbittracker?retryWrites=true&w=majority
   PORT=5000
   JWT_SECRET=your_random_jwt_secret_here
   NODE_ENV=production
   ```
6. Railway will auto-detect `server/package.json` and deploy
7. Copy the deployed URL (e.g., `https://habbittracker-prod.railway.app`)

#### 3. Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Create account and link GitHub
3. Click "Add New..." → "Project"
4. Select your HabbitTracker repository
5. In "Root Directory", select `client/`
6. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://habbittracker-prod.railway.app/api/v1
   ```
7. Click "Deploy"
8. Vercel will automatically detect Next.js and deploy

#### 4. Configure CORS

Update backend `server/src/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-domain.vercel.app'
  ],
  credentials: true
}))
```

## Option 2: DigitalOcean App Platform

### Cost
- ~$12/month for small apps

### Steps

1. **Create DigitalOcean Account**: https://digitalocean.com
2. **Create App**:
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Specify multiple services

3. **Configure Services**:
   - **Frontend** (Next.js):
     - Source: GitHub repo, branch: main, path: client
     - Build: `npm install && npm run build`
     - Run: `npm run start`
   
   - **Backend** (Node.js):
     - Source: GitHub repo, branch: main, path: server
     - Build: `npm install`
     - Run: `npm run dev` (or use production start script)

4. **Database**:
   - Use managed MongoDB Atlas (free tier)
   - Or DigitalOcean Managed Database

## Option 3: Heroku + Heroku Postgres

### Cost
- Heroku free tier is limited (deprecated), paid starts at $7/month

### Steps

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create apps
heroku create habbittracker-backend --buildpack heroku/nodejs
heroku create habbittracker-frontend --buildpack heroku/nodejs

# 4. Add MongoDB URI
heroku config:set MONGODB_URI=your_mongodb_connection_string --app habbittracker-backend
heroku config:set JWT_SECRET=your_secret --app habbittracker-backend

# 5. Deploy
git push heroku main  # For each app
```

## Environment Variables Checklist

### Backend Production (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habbittracker
JWT_SECRET=your_very_secure_random_secret_at_least_32_characters
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend Production (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api/v1
```

## Pre-Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Environment variables configured on hosting platform
- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] CORS configured for production domains
- [ ] SSL/HTTPS enabled (automatically on Vercel/Railway)
- [ ] Database backups enabled
- [ ] Error logging configured (optional)
- [ ] Testing done locally with production env vars

## Post-Deployment Verification

1. **Test API Endpoints**:
   ```bash
   curl https://your-api-domain/api/v1/auth/register
   ```

2. **Check Frontend**:
   - Visit https://your-frontend-domain
   - Login/signup
   - Create a habit
   - Toggle completion
   - Check analytics

3. **Monitor Logs**:
   - Railway: Dashboard → Logs
   - Vercel: Deployments → Logs
   - Heroku: `heroku logs --tail`

4. **Performance Testing**:
   - Frontend: https://pagespeed.web.dev/
   - API: Use Postman to test endpoints

## Common Production Issues

### Issue: CORS Errors
**Solution**: Ensure CORS is configured for production domain
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
```

### Issue: Database Connection Timeout
**Solution**: 
- Add your IP to MongoDB Atlas whitelist (use 0.0.0.0/0 for cloud deployments)
- Increase connection timeout in URI

### Issue: Hot Reload Not Working
**Solution**: Use production build for testing
```bash
npm run build
npm start
```

### Issue: Slow API Responses
**Solution**:
- Add MongoDB indexes (already done in code)
- Consider database optimization
- Add caching layer (Redis)

## Scaling Considerations

### When Traffic Increases

1. **Database**: MongoDB Atlas allows scaling up cluster tier
2. **Backend**: Railway allows increasing resources
3. **Frontend**: Vercel scales automatically
4. **Caching**: Add Redis for session/data caching
5. **CDN**: Vercel includes automatic CDN

### Monitoring Tools

- **Uptime**: https://uptimerobot.com (free)
- **Error Tracking**: https://sentry.io (free tier available)
- **Analytics**: Google Analytics + custom logging
- **Performance**: https://datadog.com

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway-app/actions@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Backup Strategy

### Automatic Backups
- **MongoDB Atlas**: Free automatic daily backups
- **Vercel**: Version control (GitHub)
- **Railway**: No built-in backup; use GitHub releases

### Manual Backups
```bash
# Export MongoDB data
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/habbittracker"

# Backup to file
tar -czf habbittracker-backup-$(date +%Y%m%d).tar.gz ./dump/
```

## Rollback Procedure

### If something goes wrong:

**Frontend**:
- Vercel: Go to Deployments → Click previous version → Promote to Production

**Backend**:
- Railway: Go to Deployments → Click previous version → Redeploy

**Database**:
- MongoDB: Restore from backup in Atlas

## Cost Estimation (Monthly)

| Service | Free | Paid |
|---------|------|------|
| Vercel (Frontend) | ✅ | $20+ |
| Railway (Backend) | $5 credit | $5-50 |
| MongoDB Atlas | ✅ (shared) | $9-100 |
| **Total** | ~$0 | ~$30-150 |

## Support & Troubleshooting

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://docs.mongodb.com/manual/)
- [Next.js Deployment](https://nextjs.org/learn/basics/deploying-nextjs-app)

## Next Steps After Deployment

1. Setup monitoring and alerting
2. Configure automated backups
3. Setup CI/CD pipeline
4. Monitor user feedback
5. Plan scaling strategy
6. Setup error tracking (Sentry)
7. Implement analytics (Mixpanel/Amplitude)

---

**Happy Deploying!** 🚀

For questions or issues, check the respective platform's documentation or open an issue on GitHub.
