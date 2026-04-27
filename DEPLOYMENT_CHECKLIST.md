# Deployment Checklist - AK Rapid Trans

## Pre-Deployment (Local)

### Code
- [ ] All code committed to git
- [ ] No debug console.log statements left
- [ ] No hardcoded credentials in code
- [ ] All environment variables use safe placeholders in `.env.example`

### Backend
- [ ] `backend/.env.example` cleaned (no merge conflicts, no hardcoded credentials)
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] CORS config (`config/cors.php`) reads `FRONTEND_URL` from env
- [ ] DatabaseSeeder safe for production (no demo data in production)
- [ ] All migrations tested locally

### Frontend
- [ ] `frontend/.env.example` created with `VITE_API_BASE_URL`
- [ ] API calls use `import.meta.env.VITE_API_BASE_URL` instead of hardcoded URLs
- [ ] `vercel.json` created for SPA routing
- [ ] Build succeeds: `npm run build`
- [ ] No console.log/debug statements in production code

## Render Backend Deployment

### Pre-Deploy
1. [ ] Create PostgreSQL or MySQL database on Render
2. [ ] Create persistent disk (if using local storage)
3. [ ] Prepare `.env` file with:
   - Generated `APP_KEY`
   - Database credentials pointing to Render database
   - `FRONTEND_URL` set to your Vercel domain
   - File storage configured

### Deploy Steps
1. [ ] Connect GitHub repository to Render
2. [ ] Create Web Service from repository
3. [ ] Set build command: `composer install && npm install && npm run build`
4. [ ] Set start command: `php artisan serve` (or `./artisan`)
5. [ ] Add environment variables in Render dashboard
6. [ ] Deploy service

### Post-Deploy
1. [ ] SSH into service: `php artisan migrate`
2. [ ] [ ] Verify API is responding at `https://your-backend-url/api/health`
3. [ ] Test a sample API endpoint
4. [ ] Check application logs for errors

## Vercel Frontend Deployment

### Pre-Deploy
1. [ ] Prepare `VITE_API_BASE_URL` value (Render backend URL)

### Deploy Steps
1. [ ] Connect GitHub repository to Vercel
2. [ ] Configure Project:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. [ ] Add Environment Variables:
   - `VITE_API_BASE_URL`: Your Render backend URL + `/api`
4. [ ] Deploy

### Post-Deploy
1. [ ] Verify frontend loads at https://your-vercel-url
2. [ ] Check that API calls go to correct backend
3. [ ] Test login/authentication flow
4. [ ] Test file upload (if applicable)
5. [ ] Verify mobile responsiveness

## Render + Vercel Integration

### CORS Verification
- [ ] Login to Render dashboard
- [ ] Check backend `.env` has correct `FRONTEND_URL`
- [ ] Restart web service to apply env changes
- [ ] Test from Vercel frontend - API requests should succeed

### File Storage
- [ ] If using S3: Verify AWS credentials and bucket access
- [ ] If using Render persistent disk: Verify disk mounted at `/var/data`
- [ ] Test file upload from frontend

## Monitoring

- [ ] Set up logging and error tracking (e.g., Sentry)
- [ ] Enable Render error notifications
- [ ] Monitor database performance
- [ ] Check Vercel Analytics

## Production Safety

- [ ] No demo users seeded in production database
- [ ] HTTPS enforced on both frontend and backend
- [ ] Database backups configured
- [ ] Rate limiting enabled on API (if needed)
- [ ] Sensitive API endpoints protected with authentication

## Rollback Plan

- [ ] Keep previous version deployed until new version verified
- [ ] Have database backup before migration
- [ ] Document rollback steps if needed
