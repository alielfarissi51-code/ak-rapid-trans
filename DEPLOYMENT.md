# Deployment Guide - AK Rapid Trans

## Overview
This guide covers deploying AK Rapid Trans to Render (backend) and Vercel (frontend).

## File Storage Configuration

### Local Storage (Development)
- Default for development
- Files stored in `storage/app/` directory
- Not suitable for production (ephemeral on serverless platforms)

### Render Persistent Disk (Recommended for Render)
For production on Render:

1. **Create a persistent disk** on Render dashboard
2. **Mount at `/var/data`** in your service
3. **Set in `.env`:**
   ```
   FILESYSTEM_DISK=local
   APP_STORAGE_PATH=/var/data
   ```
4. **Disk survives redeploys and downtimes**

### AWS S3 (Scalable Alternative)
For high-traffic production:

1. **Create S3 bucket** and IAM user
2. **Set in `.env`:**
   ```
   FILESYSTEM_DISK=s3
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=your-bucket-name
   ```
3. **Install S3 driver:**
   ```bash
   composer require league/flysystem-aws-s3-v3
   ```

## Environment Variables

### Backend (.env in production)
```
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generate-with-php-artisan-key:generate>
APP_URL=https://your-backend-url

# Database
DB_HOST=your-database-host
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password

# CORS - Allow your frontend domain
FRONTEND_URL=https://your-frontend-url

# File Storage
FILESYSTEM_DISK=s3  # or local (if using Render persistent disk)
# AWS_* variables if using S3

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-password
```

### Frontend (.env.production in production)
```
VITE_API_BASE_URL=https://your-backend-url/api
```

## Migration & Setup on Render

After initial deployment:

```bash
# Run migrations
php artisan migrate

# Generate app key (if not already done)
php artisan key:generate

# Optional: Seed database (only in non-production)
php artisan db:seed
```

## Frontend Deployment on Vercel

1. **Build command:** `npm run build`
2. **Output directory:** `dist`
3. **vercel.json** is configured for SPA routing
4. **Environment variables:** Set `VITE_API_BASE_URL` in Vercel project settings

## Production Security Checklist

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` generated and secure
- [ ] Database credentials use strong passwords
- [ ] `FRONTEND_URL` matches your actual domain
- [ ] CORS properly configured
- [ ] File storage configured (S3 or persistent disk)
- [ ] HTTPS enabled on both backend and frontend
- [ ] Sensitive files not exposed in `public/`
- [ ] Database has backups enabled
