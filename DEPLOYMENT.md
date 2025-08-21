# Deployment Guide

This guide covers deploying the Intelligent Sales Agent to various environments, from local development to production.

## 🏠 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Grok API key

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd sales-agent-prototype

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROK_API_KEY

# Frontend
cd ../frontend
npm install

# Run both services
# Terminal 1: Backend
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend && npm start
```

## 🐳 Docker Development

### Using Docker Compose
```bash
# Build and run
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build --force-recreate
```

### Docker Commands
```bash
# Build backend image
docker build -t sales-agent-backend .

# Run backend container
docker run -d \
  -p 8000:8000 \
  -e GROK_API_KEY=$GROK_API_KEY \
  -v $(pwd)/backend:/app \
  sales-agent-backend

# Run frontend container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/frontend:/app \
  -w /app \
  node:18 npm start
```

## ☁️ Production Deployment

### Environment Variables
```bash
# Production .env
GROK_API_KEY=your_production_grok_key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
LOG_LEVEL=WARNING
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com
SECRET_KEY=your_secret_key_here
```

### Production Dockerfile
```dockerfile
# Multi-stage build for production
FROM python:3.10-slim as builder

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY backend/ .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GROK_API_KEY=${GROK_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - LOG_LEVEL=${LOG_LEVEL}
      - ENVIRONMENT=production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=${API_URL}
    restart: unless-stopped
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```
