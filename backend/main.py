from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db import init_db, add_lead, get_leads, update_lead, search_leads, add_interaction
from grok_api import qualify_lead, generate_message
from evaluation import evaluate_response
from prompts import QUALIFICATION_PROMPT, MESSAGE_PROMPT
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Lead(BaseModel):
    name: str
    company: str
    industry: str
    budget: float
    needs: str
    stage: str = "potential_lead"


class LeadScore(BaseModel):
    weights: dict


class Interaction(BaseModel):
    message: str
    direction: str
    timestamp: str


@app.on_event("startup")
async def startup_event():
    init_db()


@app.post("/leads")
async def create_lead(lead: Lead):
    try:
        lead_id = add_lead(lead.dict())
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Unable to add lead from this user right now."
        ) from e
    else:
        score = qualify_lead(lead.dict(), QUALIFICATION_PROMPT)
        update_lead(lead_id, {"score": score})
        return {"id": lead_id, "score": score}


@app.post("/add_interaction/{lead_id}")
async def add_interactions(lead_id: int, interaction: Interaction):
    try:
        add_interaction(lead_id, interaction.dict())
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Unable to add interaction right now."
        ) from e
    return {"status": "success"}


@app.post("/leads/{lead_id}/score")
async def rescore_lead(lead_id: int, score: LeadScore):
    lead = get_leads(lead_id=lead_id)[0]
    score = qualify_lead(lead, QUALIFICATION_PROMPT, score.weights)
    update_lead(lead_id, {"score": score})
    return {"id": lead_id, "score": score}


@app.get("/leads")
async def list_leads(search: str = None):
    leads = search_leads(search) if search else get_leads()
    return leads


@app.post("/leads/{lead_id}/message")
async def generate_lead_message(lead_id: int):
    lead = get_leads(lead_id=lead_id)[0]
    message = generate_message(lead, MESSAGE_PROMPT)
    eval_result = evaluate_response(message, lead)
    update_lead(
        lead_id,
        {"last_message": message, "interaction_log": f"Generated message: {message}"},
    )
    return {"message": message, "evaluation": eval_result}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
