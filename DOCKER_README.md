# Docker Setup Guide

This guide shows you how to run the Sales Agent using Docker.

## 🚀 Quick Start

### 1. Prerequisites
- Docker installed and running
- Docker Compose installed
- Grok API key from [xAI](https://x.ai)

### 2. Setup Environment
```bash
# Copy the environment template
cp backend/env.example backend/.env

# Edit the .env file and add your GROK_API_KEY
# You can get your API key from: https://x.ai
```

### 3. Run with Docker Compose
```bash
# Build and start services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🐳 Docker Commands

### Basic Commands
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
```

### Development Commands
```bash
# Rebuild after code changes
docker-compose up --build

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# View running containers
docker-compose ps
```

### Troubleshooting
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Remove containers and start fresh
docker-compose down
docker-compose up --build
```

## 🔧 Configuration

### Environment Variables
The following environment variables can be set in `backend/.env`:

- `GROK_API_KEY`: Your xAI Grok API key (required)
- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `LOG_LEVEL`: Logging level (defaults to INFO)

### Ports
- **Frontend**: 3000
- **Backend**: 8000

### Volumes
- `./backend:/app`: Backend code (for development)
- `./frontend:/app`: Frontend code (for development)
- `./backend/leads.db:/app/leads.db`: Database persistence

## 🚨 Common Issues

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process or use different ports
```

### Permission Issues
```bash
# Make sure Docker has access to the project directory
# On Linux/Mac, you might need to adjust file permissions
chmod -R 755 .
```

### API Key Issues
- Make sure your `GROK_API_KEY` is set in `backend/.env`
- Verify the API key is valid at [xAI platform](https://x.ai)
- Check backend logs for API errors

## 📁 Project Structure
```
.
├── docker-compose.yml          # Docker Compose configuration
├── setup.sh                    # Setup script
├── backend/
│   ├── Dockerfile             # Backend Docker image
│   ├── .env                   # Environment variables
│   └── env.example            # Environment template
└── frontend/
    └── Dockerfile             # Frontend Docker image
```

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `docker-compose logs`
2. **Verify environment**: Make sure `.env` file is configured
3. **Check ports**: Ensure ports 3000 and 8000 are available
4. **Restart services**: `docker-compose restart`

For more detailed troubleshooting, see the main [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide.
