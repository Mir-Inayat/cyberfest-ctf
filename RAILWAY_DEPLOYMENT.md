# Railway Deployment Configuration for CTFd

## Deployment Steps

### 1. Initial Setup on Railway

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Deploy from GitHub repository or upload this folder
4. Railway will automatically detect the Dockerfile

### 2. Required Environment Variables

Set these in Railway's environment variables section:

```bash
# Security (REQUIRED)
SECRET_KEY=your-random-secret-key-here-minimum-32-characters

# Database (using SQLite - no external DB needed)
DATABASE_URL=sqlite:////opt/CTFd/CTFd/ctfd.db
SKIP_DB_PING=true

# Redis (optional - uses filesystem cache if not set)
REDIS_URL=

# Server Configuration
WORKERS=1
WORKER_CLASS=gevent

# Logging
ACCESS_LOG=-
ERROR_LOG=-

# Railway automatically sets PORT - don't set manually
```

### 3. Generate SECRET_KEY

Run this command locally to generate a secure secret key:

```powershell
py -3.12 -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste it into Railway's `SECRET_KEY` environment variable.

### 4. Configure Trusted Hosts (Important!)

After Railway gives you your deployment URL (e.g., `your-app-production.up.railway.app`):

**Option A: Via Environment Variable (Recommended)**
Add to Railway environment variables:
```
TRUSTED_HOSTS=your-app-production.up.railway.app,.railway.app
```

**Option B: Via config.ini**
Edit `CTFd/config.ini` before deploying:
```ini
[security]
TRUSTED_HOSTS = your-app-production.up.railway.app,.railway.app
```

### 5. Deployment

Railway will automatically:
1. Build the Docker image using the Dockerfile
2. Use the dynamic PORT environment variable
3. Start the application with gunicorn
4. Make it accessible on the internet

### 6. Access Your Application

Once deployed, Railway will provide a URL like:
```
https://your-app-production.up.railway.app
```

Your CTFd instance will be fully accessible with:
- ✅ All 51 challenges from the database
- ✅ All uploaded challenge files
- ✅ Custom branding and frontend assets
- ✅ Public internet access

## Important Notes

### Database Persistence
- **SQLite database** (`CTFd/ctfd.db`) is included in the Docker image
- For true persistence across deployments, consider using Railway's PostgreSQL addon
- To use PostgreSQL, set `DATABASE_URL` to Railway's provided PostgreSQL URL

### Volume/Persistent Storage
Railway doesn't support Docker volumes the same way as docker-compose. Your database is:
- ✅ **Included in the image** at build time (current setup)
- ❌ **Not persistent** across redeployments

**To make database truly persistent:**
1. Add Railway PostgreSQL to your project
2. Set `DATABASE_URL` environment variable to Railway's PostgreSQL URL
3. Remove the SQLite-specific configuration

### Security Checklist
- [ ] Set strong SECRET_KEY (minimum 32 random characters)
- [ ] Configure TRUSTED_HOSTS with your Railway domain
- [ ] Set REVERSE_PROXY=true (already in docker-compose.yml)
- [ ] Review admin credentials
- [ ] Enable HTTPS (Railway provides this automatically)

### Troubleshooting

#### "This site can't be reached"
- Check Railway logs for errors
- Verify PORT is not manually set (Railway sets it automatically)
- Confirm deployment is "Active" in Railway dashboard

#### "502 Bad Gateway"
- Check if app is binding to `0.0.0.0:$PORT` (fixed in docker-entrypoint.sh)
- Verify gunicorn is starting successfully in logs

#### Database errors
- If using SQLite, ensure `CTFd/ctfd.db` is in the repository
- For persistence, switch to Railway's PostgreSQL addon

#### Static files not loading
- All frontend assets are now included in the Docker build
- Check Railway logs for 404 errors
- Verify `.dockerignore` isn't excluding theme files

### Database Migration to PostgreSQL (Optional)

To migrate from SQLite to PostgreSQL on Railway:

1. Add PostgreSQL addon in Railway
2. Copy the DATABASE_URL from PostgreSQL addon
3. Export current data:
   ```powershell
   py -3.12 export.py
   ```
4. Update DATABASE_URL environment variable in Railway
5. Redeploy
6. Import data:
   ```powershell
   py -3.12 import.py
   ```

### Updating Your Deployment

To update with new challenges or changes:
```bash
git add .
git commit -m "Update challenges"
git push
```

Railway will automatically rebuild and redeploy.

## Support

- Railway Docs: https://docs.railway.app
- CTFd Docs: https://docs.ctfd.io
- Railway Status: https://railway.statuspage.io
