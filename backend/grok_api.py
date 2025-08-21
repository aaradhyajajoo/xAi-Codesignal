from xai_sdk import Client
from xai_sdk.chat import system, user
import os
from dotenv import load_dotenv

load_dotenv()
client = Client(api_key=os.getenv("GROK_API_KEY"))


# def qualify_lead(lead, prompt, weights=None):
#     try:
#         context = f"Name: {lead['name']}, Company: {lead['company']}, Industry: {lead['industry']}, Budget: {lead['budget']}, Needs: {lead['needs']}"
#         if weights:
#             context += f"\nCustom weights: {weights}"
#         chat = client.chat.create(
#             model="grok-4-latest",
#             messages=[
#                 system(prompt),
#                 user(context),
#             ],
#             temperature=0.3,
#         )
#         response = chat.sample()
#         score = float(response.content.strip())
#         return min(max(score, 0), 100)

#     except Exception as e:
#         print(f"Error in qualify_lead: {e}")
#         return 0


def qualify_lead(lead, prompt, weights=None):
    try:
        # --- Validate required lead fields ---
        required_fields = ["name", "company", "industry", "budget", "needs"]
        missing_fields = [field for field in required_fields if field not in lead]
        if missing_fields:
            raise ValueError(f"Missing required lead fields: {missing_fields}")

        # --- Construct prompt context ---
        context = (
            f"Name: {lead['name']}, "
            f"Company: {lead['company']}, "
            f"Industry: {lead['industry']}, "
            f"Budget: {lead['budget']}, "
            f"Needs: {lead['needs']}"
        )
        if weights:
            context += f"\nCustom weights: {weights}"

        # --- Call model ---
        chat = client.chat.create(
            model="grok-4-latest",
            messages=[
                system(prompt),
                user(context),
            ],
            temperature=0.3,
        )

        if not chat:
            raise RuntimeError("No response returned from model creation.")

        response = chat.sample()
        if not response:
            raise RuntimeError("Empty sample returned from chat.")

        # --- Validate response format ---
        if not hasattr(response, "content") or response.content is None:
            raise AttributeError("Response does not contain 'content' field.")

        content = response.content.strip()
        if not content:
            raise ValueError("Model response content is empty.")

        try:
            score = float(content)
        except ValueError:
            raise ValueError(f"Model returned non-numeric score: '{content}'")

        # Clamp score to 0–100
        return min(max(score, 0), 100)

    except Exception as e:
        print(f"[qualify_lead] Error: {e}")
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
