# README.md
# Intelligent Sales Agent Prototype

This is a demo application showcasing an intelligent sales agent powered by xAI's Grok API for lead qualification and personalized messaging.

## Features
- **Lead Qualification**: Uses Grok API to score leads based on name, company, industry, budget, and needs.
- **Personalized Messaging**: Generates tailored outreach emails using Grok API.
- **Data Management**: SQLite database for lead storage with CRUD operations and search functionality.
- **Frontend Interface**: React-based UI with Tailwind CSS for intuitive lead management and message generation.
- **Evaluation Framework**: Basic evaluation of generated messages for personalization, relevance, length, and tone.

## Technical Architecture
- **Backend**: FastAPI (Python) with SQLite for data storage. Integrates Grok API for lead scoring and message generation.
- **Frontend**: React with Tailwind CSS for a responsive, user-friendly interface.
- **Prompt Engineering**: Optimized prompts for lead qualification (scoring 0-100) and message generation (50-200 words, professional tone).
- **Evaluation**: Simple framework to assess message quality with actionable recommendations.
- **Pipeline Stages**: New → Qualified (score ≥ 70) → Contacted (message generated).

## Local Setup Instructions
1. **Prerequisites**:
   - Docker and Docker Compose installed.
   - Node.js and npm installed.
   - Grok API key from xAI (set as `GROK_API_KEY` environment variable).

2. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd sales-agent-prototype
   ```

3. **Set Environment Variable**:
   Copy `backend/.env.example` to `backend/.env` and add your Grok API key:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env to add your GROK_API_KEY
   ```

4. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   - Backend runs on `http://localhost:8000`
   - Frontend runs on `http://localhost:3000`

6. **Access the Application**:
   Open `http://localhost:3000` in your browser to interact with the UI.


## Usage
- **Add Lead**: Fill out the form with lead details (name, company, industry, budget, needs).
- **View Leads**: Leads are listed with their score, stage, and interaction history.
- **Rescore Lead**: Click "Rescore" and input custom weights (JSON format) to adjust scoring.
- **Generate Message**: Click "Generate Message" to create a personalized email.
- **Search Leads**: Use the search bar to filter leads by company, needs, or interaction log.

## Troubleshooting
- **API Errors**: Ensure `GROK_API_KEY` is valid. Check xAI API status at https://x.ai/api.
- **Database Issues**: Verify `leads.db` is writable in the `backend` directory.
- **Frontend Not Loading**: Run `npm install` in `frontend` directory and ensure port 3000 is free.
- **Docker Issues**: Check Docker is running and ports 3000/8000 are free. Rebuild with `docker-compose up --build`.

## Limitations
- Evaluation framework is basic and could be expanded with more metrics.
- Database is SQLite, suitable for demo but not production-scale.
- Error handling is minimal; enhance for robustness in production.
- Pipeline stages are simplified (New, Qualified, Contacted).

## Recommendations for Improvement
- Enhance evaluation framework with A/B testing and user feedback.
- Use a production-grade database (e.g., PostgreSQL) for scalability.
- Add authentication and role-based access for security.
- Implement advanced error handling and retry mechanisms for API calls.
- Expand pipeline stages and automate transitions based on lead interactions.