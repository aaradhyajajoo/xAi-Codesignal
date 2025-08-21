from xai_sdk import Client
from xai_sdk.chat import system, user
import os
from dotenv import load_dotenv

load_dotenv()
client = Client(api_key=os.getenv("GROK_API_KEY"))


def qualify_lead(lead, prompt, weights=None):
    try:
        context = f"Name: {lead['name']}, Company: {lead['company']}, Industry: {lead['industry']}, Budget: {lead['budget']}, Needs: {lead['needs']}"
        if weights:
            context += f"\nCustom weights: {weights}"
        chat = client.chat.create(
            model="grok-4-latest",
            messages=[
                system(prompt),
                user(context),
            ],
            temperature=0.3,
        )
        response = chat.sample()
        score = float(response.content.strip())
        return min(max(score, 0), 100)

    except Exception as e:
        print(f"Error in qualify_lead: {e}")
        return 0


def generate_message(lead, prompt):
    try:
        context = f"Name: {lead['name']}, Company: {lead['company']}, Industry: {lead['industry']}, Budget: {lead['budget']}, Needs: {lead['needs']}"
        chat = client.chat.create(
            model="grok-4-latest",
            messages=[
                system(prompt),
                user(context),
            ],
            temperature=0.5,
        )
        response = chat.sample()
        return response.content.strip()
    except Exception as e:
        print(f"Error in generate_message: {e}")
        return "Failed to generate message."
