def generate_recommendations(user_state: str, history: list):
    
    recommendations = []

    # 🔹 STATE-BASED RECOMMENDATIONS
    if user_state == "NEW_USER":
        recommendations.append("Check eligibility")

    elif user_state == "ELIGIBILITY_CHECKED":
        recommendations.append("Register to vote")

    elif user_state == "REGISTERED":
        recommendations.append("Prepare required documents")

    elif user_state == "READY_TO_VOTE":
        recommendations.append("Visit polling booth")

    # 🔹 HISTORY-BASED REFINEMENT
    past_queries = [h.query.lower() for h in history]

    if any("document" in q for q in past_queries):
        recommendations.append("Verify your documents are complete")

    if any("eligibility" in q for q in past_queries):
        recommendations.append("Proceed with registration")

    return list(set(recommendations))  # remove duplicates