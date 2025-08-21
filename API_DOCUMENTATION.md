# API Documentation

This document provides comprehensive information about the Intelligent Sales Agent API endpoints, request/response formats, and usage examples.

## 🌐 Base Information

- **Base URL**: `http://localhost:8000` (local development)
- **API Version**: v1.0.0
- **Content Type**: `application/json`
- **Authentication**: Currently open (add JWT for production)

## 📚 Interactive Documentation

Access the interactive Swagger UI documentation at:
```
http://localhost:8000/docs
```

## 🔗 Endpoints Overview

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/health` | Health check | None |
| `POST` | `/leads` | Create new lead | None |
| `GET` | `/leads` | List/search leads | None |
| `POST` | `/leads/{id}/score` | Rescore lead | None |
| `POST` | `/leads/{id}/message` | Generate message | None |
| `POST` | `/add_interaction/{id}` | Log interaction | None |

## 📊 Data Models

### Lead Model
```json
{
  "name": "string",
  "company": "string",
  "industry": "string",
  "budget": "number",
  "needs": "string",
  "stage": "string (optional, default: 'potential_lead')"
}
```

**Field Descriptions**:
- `name`: Contact person's full name (required)
- `company`: Company name (required)
- `industry`: Business sector (required)
- `budget`: Expected project budget in USD (required)
- `needs`: Specific requirements or pain points (required)
- `stage`: Lead stage - one of: `potential_lead`, `reached_out`, `response_received`

### Lead Score Model
```json
{
  "weights": {
    "company_size": "number (optional)",
    "budget_range": "number (optional)",
    "industry_match": "number (optional)",
    "needs_clarity": "number (optional)"
  }
}
```

### Interaction Model
```json
{
  "message": "string",
  "direction": "string",
  "timestamp": "string (optional)"
}
```

**Field Descriptions**:
- `message`: Interaction content (required)
- `direction`: `inbound` or `outbound` (required)
- `timestamp`: ISO 8601 timestamp (optional, auto-generated if not provided)

## 🚀 Endpoint Details

### Health Check

#### `GET /health`
Check the health status of the API service.

**Response**:
```json
{
  "status": "healthy"
}
```

**Example**:
```bash
curl http://localhost:8000/health
```

**Response Codes**:
- `200`: Service is healthy
- `503`: Service is unhealthy

---

### Lead Management

#### `POST /leads`
Create a new lead and automatically qualify it using AI.

**Request Body**:
```json
{
  "name": "John Smith",
  "company": "TechCorp Inc",
  "industry": "Technology",
  "budget": 50000,
  "needs": "Custom CRM development with AI features"
}
```

**Response**:
```json
{
  "id": 1,
  "score": 85.5
}
```

**Example**:
```bash
curl -X POST "http://localhost:8000/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "company": "TechCorp Inc",
    "industry": "Technology",
    "budget": 50000,
    "needs": "Custom CRM development with AI features"
  }'
```

**Response Codes**:
- `200`: Lead created successfully
- `422`: Validation error (check request body)
- `500`: Internal server error

**Notes**:
- Lead is automatically scored using Grok AI
- Score ranges from 0-100
- Duplicate leads (same name + company) are not allowed

---

#### `GET /leads`
Retrieve all leads or search for specific leads.

**Query Parameters**:
- `search` (optional): Search term for company, needs, or interaction log

**Response**:
```json
[
  {
    "id": 1,
    "name": "John Smith",
    "company": "TechCorp Inc",
    "industry": "Technology",
    "budget": 50000,
    "needs": "Custom CRM development with AI features",
    "score": 85.5,
    "stage": "potential_lead",
    "last_message": null,
    "interaction_log": null
  }
]
```

**Examples**:
```bash
# Get all leads
curl "http://localhost:8000/leads"

# Search for leads
curl "http://localhost:8000/leads?search=TechCorp"
```

**Response Codes**:
- `200`: Leads retrieved successfully
- `500`: Internal server error

---

#### `POST /leads/{id}/score`
Rescore a lead using custom weights.

**Path Parameters**:
- `id`: Lead ID (integer)

**Request Body**:
```json
{
  "weights": {
    "company_size": 0.3,
    "budget_range": 0.4,
    "industry_match": 0.2,
    "needs_clarity": 0.1
  }
}
```

**Response**:
```json
{
  "id": 1,
  "score": 78.2
}
```

**Example**:
```bash
curl -X POST "http://localhost:8000/leads/1/score" \
  -H "Content-Type: application/json" \
  -d '{
    "weights": {
      "company_size": 0.3,
      "budget_range": 0.4,
      "industry_match": 0.2,
      "needs_clarity": 0.1
    }
  }'
```

**Response Codes**:
- `200`: Lead rescored successfully
- `404`: Lead not found
- `422`: Validation error
- `500`: Internal server error

**Notes**:
- Weights should sum to 1.0 for best results
- If no weights provided, default weights are used

---

#### `POST /leads/{id}/message`
Generate a personalized message for a lead using AI.

**Path Parameters**:
- `id`: Lead ID (integer)

**Response**:
```json
{
  "message": "Hi John, I hope this message finds you well. I came across TechCorp Inc and was impressed by your innovative approach in the technology sector. Given your need for custom CRM development with AI features and your budget consideration of $50,000, I believe we could be an excellent fit for your project...",
  "evaluation": {
    "personalization": 9.2,
    "relevance": 8.8,
    "length": 7.5,
    "tone": 9.0,
    "overall_score": 8.6,
    "recommendations": [
      "Message length is optimal for engagement",
      "Tone is professional yet approachable",
      "Personalization elements are well integrated"
    ]
  }
}
```

**Example**:
```bash
curl -X POST "http://localhost:8000/leads/1/message"
```

**Response Codes**:
- `200`: Message generated successfully
- `404`: Lead not found
- `500`: Internal server error

**Notes**:
- Message is generated using Grok AI with lead-specific context
- Message is automatically evaluated for quality
- Lead stage is updated to track interaction

---

### Interaction Tracking

#### `POST /add_interaction/{id}`
Log an interaction with a lead.

**Path Parameters**:
- `id`: Lead ID (integer)

**Request Body**:
```json
{
  "message": "Sent follow-up email about project timeline",
  "direction": "outbound"
}
```

**Response**:
```json
{
  "status": "success"
}
```

**Example**:
```bash
curl -X POST "http://localhost:8000/add_interaction/1" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Sent follow-up email about project timeline",
    "direction": "outbound"
  }'
```

**Response Codes**:
- `200`: Interaction logged successfully
- `404`: Lead not found
- `422`: Validation error
- `500`: Internal server error

**Notes**:
- Timestamp is automatically generated if not provided
- Direction must be either "inbound" or "outbound"
- Interaction is linked to the lead for audit trail

## 🔍 Search Functionality

### Search Implementation
The search endpoint (`GET /leads?search=<term>`) performs a case-insensitive search across:
- Company name
- Industry
- Needs description
- Interaction log content

### Search Examples
```bash
# Search by company
curl "http://localhost:8000/leads?search=TechCorp"

# Search by industry
curl "http://localhost:8000/leads?search=Technology"

# Search by needs
curl "http://localhost:8000/leads?search=CRM"

# Search by interaction content
curl "http://localhost:8000/leads?search=follow-up"
```

## 📊 Error Handling

### Error Response Format
```json
{
  "detail": "Error message description"
}
```

### Common Error Codes

#### `400 Bad Request`
- Invalid request format
- Missing required fields

#### `404 Not Found`
- Lead ID doesn't exist
- Endpoint not found

#### `422 Unprocessable Entity`
- Validation errors
- Invalid data types
- Constraint violations

#### `500 Internal Server Error`
- Database connection issues
- Grok API failures
- Unexpected server errors

### Error Examples
```json
// Validation Error
{
  "detail": [
    {
      "loc": ["body", "budget"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt",
      "ctx": {"limit_value": 0}
    }
  ]
}

// Not Found Error
{
  "detail": "Lead not found"
}

// Internal Server Error
{
  "detail": "Unable to add lead from this user right now."
}
```

## 📈 Performance & Limits

### Current Performance Metrics
- **API Response Time**: < 200ms (local)
- **Database Queries**: < 50ms
- **AI Generation**: 2-5 seconds (depends on Grok API)

### Rate Limiting
Currently no rate limiting implemented. Consider adding:
- Per-endpoint limits
- Per-user limits
- Burst protection

### Caching
No caching currently implemented. Consider adding:
- Response caching for static data
- Database query result caching
- AI-generated content caching

## 🧪 Testing

### Test Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Create test lead
curl -X POST "http://localhost:8000/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "company": "Test Company",
    "industry": "Test Industry",
    "budget": 10000,
    "needs": "Test needs"
  }'

# List leads
curl "http://localhost:8000/leads"
```

### Load Testing
```bash
# Simple load test with Apache Bench
ab -n 100 -c 10 http://localhost:8000/health

# Load test with custom data
ab -n 50 -c 5 -p test_lead.json -T application/json \
   http://localhost:8000/leads
```

## 🔄 API Versioning

### Current Version
- **Version**: v1.0.0
- **Status**: Stable
- **Breaking Changes**: None planned

### Versioning Strategy
- URL-based versioning: `/api/v1/leads`
- Header-based versioning: `Accept: application/vnd.api.v1+json`
- Current implementation: No versioning (v1 assumed)

## 📝 Changelog

### v1.0.0 (Current)
- Initial API release
- Lead management endpoints
- AI-powered qualification and messaging
- Interaction tracking
- Search functionality

### Planned Features
- Authentication and authorization
- Rate limiting
- Advanced filtering and pagination
- Webhook support
- Bulk operations

## 🆘 Support & Resources

### Getting Help
- **API Documentation**: This document
- **Interactive Docs**: `/docs` endpoint
- **GitHub Issues**: Report bugs and request features
- **Team Support**: Contact development team

### Useful Tools
- **Postman**: API testing and documentation
- **Insomnia**: Alternative API client
- **curl**: Command-line testing
- **jq**: JSON processing

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [xAI Grok API Docs](https://docs.x.ai/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Maintainer**: Development Team
