def evaluate_response(message, lead):
    # Simple evaluation framework
    checks = {
        "personalization": lead["name"] in message and lead["company"] in message,
        "relevance": lead["needs"].lower() in message.lower(),
        "length": 50 <= len(message.split()) <= 200,
        "tone": "professional" in message.lower() or "friendly" in message.lower(),
    }
    score = sum(25 for check in checks.values() if check)
    recommendations = []
    if not checks["personalization"]:
        recommendations.append(
            "Add lead's name and company for better personalization."
        )
    if not checks["relevance"]:
        recommendations.append("Incorporate lead's specific needs for relevance.")
    if not checks["length"]:
        recommendations.append("Adjust message length to 50-200 words.")
    if not checks["tone"]:
        recommendations.append("Ensure a professional or friendly tone.")
    return {"score": score, "checks": checks, "recommendations": recommendations}
