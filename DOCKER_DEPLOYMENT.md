# Docker Deployment Guide for CTFd with Database, Uploads & Frontend Assets

## Prerequisites
1. Install Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop

## Current Configuration

### Database, Uploads & Frontend
Your CTFd instance has:
- **51 challenges** stored in `CTFd/ctfd.db` (SQLite database)
- **Challenge files** stored in `CTFd/uploads/` directory
- **Custom frontend assets** in `CTFd/themes/core/static/`
  - `css/ddc-custom.dev.css` - Custom styling
  - `js/ddc-particles.dev.js` - Particle effects
  - `img/ddc_logo.jpg` - Custom logo
  - `img/ddc-favicon.png` - Custom favicon
- All assets are now properly included in Docker builds

### Docker Configuration Updated

#### 1. `.dockerignore` - Optimized to include all frontend assets
```
# Explicitly includes:
!CTFd/themes/
!CTFd/themes/**/*
!CTFd/static/
!CTFd/static/**/*
!CTFd/ctfd.db
!CTFd/uploads/
!CTFd/uploads/**/*
```

#### 2. `Dockerfile` - Enhanced with frontend asset verification
- Multi-stage build for optimized image size
- Verification step to ensure themes and static files are present
- Proper file permissions for all assets

#### 3. `docker-compose.yml` - Complete volume mounts
```yaml
volumes:
  - .data/CTFd/logs:/var/log/CTFd
  - .data/CTFd/uploads:/var/uploads
  - ./CTFd/ctfd.db:/opt/CTFd/CTFd/ctfd.db              # Database
  - ./CTFd/uploads:/opt/CTFd/CTFd/uploads              # Challenge files
  - ./CTFd/themes/core/static/css/ddc-custom.dev.css:/opt/CTFd/CTFd/themes/core/static/css/ddc-custom.dev.css:ro
  - ./CTFd/themes/core/static/js/ddc-particles.dev.js:/opt/CTFd/CTFd/themes/core/static/js/ddc-particles.dev.js:ro
  - ./CTFd/themes/core/static/img/ddc_logo.jpg:/opt/CTFd/CTFd/themes/core/static/img/ddc_logo.jpg:ro
  - ./CTFd/themes/core/static/img/ddc-favicon.png:/opt/CTFd/CTFd/themes/core/static/img/ddc-favicon.png:ro
```

## Deployment Steps

### Option 1: Using Docker (Recommended for Production)

1. **Install Docker Desktop**
   ```powershell
   # Download and install from https://www.docker.com/products/docker-desktop
   # Restart your computer after installation
   ```

2. **Build the Docker image**
   ```powershell
   cd c:\Users\Admin\Desktop\cyberfest-ctf
   docker compose build
   ```

3. **Start all services**
   ```powershell
   docker compose up -d
   ```

4. **Access the application**
   - Web interface: http://localhost
   - Admin panel: http://localhost/admin
   - All 51 challenges and uploads will be available

5. **View logs**
   ```powershell
   docker compose logs -f ctfd
   ```

6. **Stop services**
   ```powershell
   docker compose down
   ```

### Option 2: Direct Python Server (Current Setup)

Your server is currently running on port 4000:
```powershell
cd c:\Users\Admin\Desktop\cyberfest-ctf
py -3.12 serve.py
```
Access at: http://localhost:4000

## Data Persistence

### In Docker:
- **Database**: Mounted from `./CTFd/ctfd.db` - all 51 challenges persist
- **Uploads**: Mounted from `./CTFd/uploads/` - all challenge files persist
- **Logs**: Stored in `.data/CTFd/logs/`

### Backup Strategy:
```powershell
# Backup database
Copy-Item .\CTFd\ctfd.db .\CTFd\ctfd.db.backup

# Backup uploads
Copy-Item -Recurse .\CTFd\uploads .\CTFd\uploads.backup
```

## Making it Internet-Accessible

### Using ngrok (Already Downloaded)
1. **Setup ngrok**
   ```powershell
   cd $env:USERPROFILE\Downloads
   .\ngrok.exe authtoken YOUR_AUTH_TOKEN  # Get token from https://dashboard.ngrok.com
   ```

2. **For Python server (port 4000)**
   ```powershell
   .\ngrok.exe http 4000
   ```

3. **For Docker (port 80)**
   ```powershell
   .\ngrok.exe http 80
   ```

### Production Deployment (Recommended)
- Deploy on cloud platform (AWS, Azure, DigitalOcean)
- Use proper domain name
- Enable HTTPS with Let's Encrypt
- Configure firewall rules

## Configuration Files Updated

1. **Dockerfile** - Already configured for production use
2. **.dockerignore** - Now includes database and uploads in build
3. **docker-compose.yml** - Added persistent volume mounts
4. **docker-entrypoint.sh** - Handles migrations and startup

## Verify Your Data

Check challenges in database:
```powershell
py -3.12 -I -c "import sqlite3; conn=sqlite3.connect('CTFd/ctfd.db'); print('Challenges:', conn.execute('select count(*) from challenges').fetchone()[0])"
```

## Troubleshooting

### Database not found in Docker
- Ensure `CTFd/ctfd.db` exists before building
- Check volume mount in docker-compose.yml

### Uploads missing
- Verify `CTFd/uploads/` directory exists
- Check .dockerignore doesn't exclude uploads

### Port conflicts
- Change port mapping in docker-compose.yml: `"8080:8000"` instead of `"8000:8000"`

## Next Steps

1. Install Docker Desktop if deploying with Docker
2. Test locally with current Python server
3. Use ngrok for temporary internet access
4. Plan production deployment with proper hosting
