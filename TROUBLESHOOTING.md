# Troubleshooting Guide

This guide provides solutions for common issues you may encounter while using the Intelligent Sales Agent platform.

## 🚨 Quick Diagnosis

### System Status Check
```bash
# Check if services are running
docker-compose ps

# Check service health
curl http://localhost:8000/health
curl http://localhost:3000

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

### Common Error Patterns
- **500 Internal Server Error**: Backend service issue
- **502 Bad Gateway**: Service communication problem
- **404 Not Found**: Endpoint or route issue
- **422 Validation Error**: Input data format problem
- **401 Unauthorized**: Authentication/API key issue

## 🔧 Backend Issues

### API Connection Problems

#### Grok API Key Issues
**Symptoms**: 500 errors when creating leads or generating messages
```bash
# Check if API key is set
echo $GROK_API_KEY

# Test API key validity
curl -H "Authorization: Bearer $GROK_API_KEY" \
     https://api.x.ai/v1/models

# Verify in .env file
cat backend/.env | grep GROK_API_KEY
```

**Solutions**:
1. **Invalid API Key**: Get a new key from [xAI platform](https://x.ai)
2. **Expired Key**: Refresh your API key
3. **Rate Limit Exceeded**: Wait and retry, implement exponential backoff
4. **Network Issues**: Check firewall and proxy settings

#### Database Connection Issues
**Symptoms**: 500 errors, "Unable to add lead" messages
```bash
# Check database file
ls -la backend/leads.db

# Check file permissions
chmod 644 backend/leads.db

# Test database connection
sqlite3 backend/leads.db "SELECT 1;"
```

**Solutions**:
1. **File Permissions**: Ensure proper read/write access
2. **Corrupted Database**: Restore from backup or reset
3. **Disk Space**: Check available storage
4. **SQLite Version**: Ensure compatibility

### Service Startup Issues

#### Port Already in Use
**Symptoms**: "Address already in use" errors
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill process using the port
kill -9 <PID>

# Or use different ports
uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Missing Dependencies
**Symptoms**: Import errors, module not found
```bash
# Check Python environment
python --version
pip list

# Reinstall requirements
cd backend
pip install -r requirements.txt --force-reinstall

# Check virtual environment
which python
source venv/bin/activate  # if using venv
```

### Performance Issues

#### Slow API Responses
**Symptoms**: Long loading times, timeouts
```bash
# Check response times
time curl http://localhost:8000/health

# Monitor system resources
htop
docker stats

# Check database performance
sqlite3 backend/leads.db "EXPLAIN QUERY PLAN SELECT * FROM leads;"
```

**Solutions**:
1. **Database Indexing**: Add indexes for search queries
2. **Caching**: Implement Redis or in-memory caching
3. **Connection Pooling**: Optimize database connections
4. **API Rate Limiting**: Implement proper throttling

#### Memory Issues
**Symptoms**: Out of memory errors, slow performance
```bash
# Check memory usage
free -h
docker stats

# Check Python memory
ps aux | grep python
```

**Solutions**:
1. **Restart Services**: `docker-compose restart`
2. **Memory Limits**: Set Docker memory constraints
3. **Garbage Collection**: Optimize Python memory usage
4. **Resource Monitoring**: Implement proper monitoring

## 🎨 Frontend Issues

### React App Not Loading

#### Build Errors
**Symptoms**: White screen, console errors
```bash
# Clear build cache
cd frontend
rm -rf build node_modules package-lock.json

# Reinstall dependencies
npm install

# Check for errors
npm run build
```

#### Port Conflicts
**Symptoms**: "Port 3000 is already in use"
```bash
# Check port usage
lsof -i :3000

# Use different port
PORT=3001 npm start

# Kill conflicting process
kill -9 <PID>
```

### UI Rendering Issues

#### Styling Problems
**Symptoms**: Broken layout, missing styles
```bash
# Check Tailwind CSS
cd frontend
npm run build:css

# Verify CSS compilation
ls -la src/index.css
```

#### Component Errors
**Symptoms**: JavaScript errors in console
```bash
# Check browser console
# Look for specific error messages

# Verify API responses
curl http://localhost:8000/leads

# Check network tab in DevTools
```

## 🐳 Docker Issues

### Container Problems

#### Build Failures
**Symptoms**: "Build failed" errors
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test .
```

#### Container Won't Start
**Symptoms**: Containers exit immediately
```bash
# Check container logs
docker-compose logs backend

# Check container status
docker-compose ps -a

# Restart services
docker-compose down
docker-compose up --build
```

#### Volume Mount Issues
**Symptoms**: File changes not reflected
```bash
# Check volume mounts
docker-compose config

# Verify file permissions
ls -la backend/
ls -la frontend/

# Restart with fresh volumes
docker-compose down -v
docker-compose up --build
```

### Network Issues

#### Service Communication
**Symptoms**: Frontend can't reach backend
```bash
# Check network configuration
docker network ls
docker network inspect sales-agent-prototype_default

# Test connectivity
docker exec -it <container_id> ping backend
docker exec -it <container_id> curl http://backend:8000/health
```

#### Port Mapping
**Symptoms**: Can't access from host machine
```bash
# Check port mappings
docker-compose ps
netstat -tulpn | grep :8000

# Verify firewall settings
sudo ufw status
sudo iptables -L
```

## 🗄️ Database Issues

### SQLite Problems

#### Database Locked
**Symptoms**: "database is locked" errors
```bash
# Check for multiple connections
lsof backend/leads.db

# Kill processes using database
pkill -f "leads.db"

# Check file permissions
ls -la backend/leads.db
```

#### Corrupted Database
**Symptoms**: "malformed database" errors
```bash
# Check database integrity
sqlite3 backend/leads.db "PRAGMA integrity_check;"

# Backup and recreate
cp backend/leads.db backend/leads.db.backup
rm backend/leads.db
docker-compose restart backend
```

### Data Issues

#### Missing Data
**Symptoms**: Leads not appearing, search not working
```bash
# Check database content
sqlite3 backend/leads.db "SELECT COUNT(*) FROM leads;"
sqlite3 backend/leads.db "SELECT * FROM leads LIMIT 5;"

# Verify data insertion
sqlite3 backend/leads.db "SELECT * FROM leads ORDER BY id DESC LIMIT 1;"
```

#### Search Problems
**Symptoms**: Search returns no results
```bash
# Test search query
sqlite3 backend/leads.db "SELECT * FROM leads WHERE company LIKE '%test%';"

# Check search implementation
# Look at backend/db.py search_leads function
```

## 🔌 Integration Issues

### Grok API Integration

#### Authentication Failures
**Symptoms**: "Unauthorized" or "Invalid API key" errors
```bash
# Verify API key format
echo $GROK_API_KEY | wc -c

# Test API endpoint
curl -H "Authorization: Bearer $GROK_API_KEY" \
     https://api.x.ai/v1/models

# Check API status
curl https://status.x.ai/api/v2/status.json
```

#### Rate Limiting
**Symptoms**: "Rate limit exceeded" errors
```bash
# Check API usage
# Implement exponential backoff in code

# Monitor request frequency
# Add delays between requests
```

### CORS Issues

**Symptoms**: "CORS policy" errors in browser
```bash
# Check CORS configuration in backend/main.py
# Verify allowed origins

# Test CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:8000/leads
```

## 📊 Monitoring & Debugging

### Log Analysis

#### Backend Logs
```bash
# View real-time logs
docker-compose logs -f backend

# Search for errors
docker-compose logs backend | grep -i error

# Check specific time period
docker-compose logs --since="2024-01-01T00:00:00" backend
```

#### Frontend Logs
```bash
# Check browser console
# Look for JavaScript errors

# Check network requests
# Verify API calls and responses
```

### Performance Monitoring

#### API Response Times
```bash
# Test endpoint performance
time curl http://localhost:8000/leads

# Monitor with curl timing
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8000/health"
```

#### Database Performance
```bash
# Check query performance
sqlite3 backend/leads.db "EXPLAIN QUERY PLAN SELECT * FROM leads WHERE company LIKE '%test%';"

# Monitor database size
ls -lh backend/leads.db
```

## 🚀 Advanced Troubleshooting

### Debug Mode

#### Enable Debug Logging
```bash
# Set debug environment variable
export LOG_LEVEL=DEBUG

# Restart services
docker-compose restart backend

# Check debug output
docker-compose logs -f backend
```

### System Diagnostics

#### Resource Usage
```bash
# Check system resources
htop
iotop
nethogs

# Check Docker resources
docker system df
docker stats --no-stream
```

#### Network Diagnostics
```bash
# Check network connectivity
ping google.com
traceroute google.com

# Check DNS resolution
nslookup api.x.ai
dig api.x.ai
```

## 📋 Troubleshooting Checklist

### Before Starting
- [ ] Check if services are running
- [ ] Verify environment variables
- [ ] Check log files
- [ ] Confirm network connectivity

### Common Solutions
- [ ] Restart services: `docker-compose restart`
- [ ] Rebuild containers: `docker-compose up --build`
- [ ] Clear cache: Remove node_modules and rebuild
- [ ] Check file permissions
- [ ] Verify API keys and endpoints

### When to Escalate
- [ ] Multiple services failing
- [ ] Data corruption issues
- [ ] Security concerns
- [ ] Performance degradation
- [ ] Integration failures

## 🆘 Getting Help

### Self-Service Resources
1. **This Troubleshooting Guide**: Check relevant sections
2. **README.md**: Setup and configuration details
3. **API Documentation**: `/docs` endpoint for backend
4. **Log Files**: Check service logs for error details

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Troubleshooting](https://reactjs.org/docs/error-boundaries.html)
- [Docker Documentation](https://docs.docker.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [xAI API Documentation](https://docs.x.ai/)

### Contact Support
- **GitHub Issues**: Create detailed issue with logs
- **Documentation**: Update docs with solutions found
- **Team Chat**: Discuss with development team
- **Email**: For urgent production issues

---

**Remember**: Most issues can be resolved by checking logs, restarting services, and verifying configuration. Always check the logs first!
