
from nltk.stem import WordNetLemmatizer
from typing import Optional

from app.services.journey_service import get_journey_info
from app.services.state_service import update_user_state
from app.services.interaction_service import get_user_history
from app.services.recommendation_service import generate_recommendations

lemmatizer = WordNetLemmatizer()


class DecisionEngine:
    def __init__(self, rag_pipeline):
        self.rag = rag_pipeline

    #  Normalize Query
    def normalize_query(self, query: str):
        words = query.lower().split()
        lemmatized = [lemmatizer.lemmatize(word) for word in words]
        return " ".join(lemmatized)

    #  Intent Detection (UPDATED FOR DATASET PHASE 4)
    def detect_intent(self, query: str):
        query = self.normalize_query(query)
        q = query.lower()

        # Phase 4: Booth / location intent
        if any(word in q for word in [
            "booth",
            "polling station",
            "polling booth",
            "voting booth",
            "voter center",
            "voter centre",
            "find booth",
            "where should i vote",
            "voting location",
            "nearest booth",
            "near me",
            "my booth",
            "where do i vote"
        ]):
            return "FIND_BOOTH"

        #  NEW: Area-based detection (CRITICAL for dataset)
        if any(word in q for word in [
            "nagar",
            "society",
            "colony",
            "area",
            "road",
            "chowk",
            "wadi",
            "peth"
        ]):
            return "FIND_BOOTH"

        # Directions (optional fallback)
        if any(word in q for word in [
            "directions",
            "direction",
            "how to go",
            "navigate",
            "route",
            "map"
        ]):
            return "GET_DIRECTIONS"

        #  Phase 3 intents
        if any(k in q for k in [
            "what next",
            "next step",
            "what should i do",
            "where am i",
            "my status"
        ]):
            return "what_next"

        elif any(k in q for k in [
            "why am i eligible",
            "why can i vote",
            "explain eligibility",
            "why eligible"
        ]):
            return "eligibility_explanation"

        elif any(k in q for k in [
            "am i eligible",
            "can i vote",
            "eligible to vote",
            "eligibility"
        ]):
            return "eligibility"

        elif any(k in q for k in [
            "document",
            "required",
            "proof",
            "what do i need",
            "documents needed"
        ]):
            return "documents"

        elif any(k in q for k in [
            "register",
            "registration",
            "process",
            "how to vote",
            "steps"
        ]):
            return "process"

        return "general"

    #  Route classification
    def route_request(self, intent: str) -> str:
        if intent in ["FIND_BOOTH", "GET_DIRECTIONS"]:
            return "LOCATION_ENGINE"
        return "KNOWLEDGE_ENGINE"

    #  State-based trigger
    def should_trigger_location(self, user_state: Optional[str]) -> bool:
        return user_state == "READY_TO_VOTE"

    #  MAIN ROUTER (Phase 3 only)
    def route(self, query: str, context: dict = None, db=None):

        if not context:
            return {
                "answer": "User context not found",
                "source": "system",
                "sources": [],
                "meta": {}
            }

        intent = self.detect_intent(query)
        user_state = context.get("state", "NEW_USER")

        history = get_user_history(db, context["user_id"])
        recommendations = generate_recommendations(user_state, history)
        journey = get_journey_info(user_state)

        #  WHAT NEXT
        if intent == "what_next":
            return {
                "answer": f"You are currently at '{journey['current_stage']}'. Next step: {journey['next_step']}",
                "source": "journey",
                "sources": [],
                "meta": journey
            }

        #  ELIGIBILITY
        elif intent == "eligibility":
            result = self.handle_rule_based(context, journey)

            current_state = context.get("state")

            if (
                current_state != "ELIGIBILITY_CHECKED"
                and context.get("age") >= 18
                and context.get("is_citizen")
            ):
                new_state = update_user_state(db, context["user_id"], "ELIGIBILITY_CHECKED")
                updated_journey = get_journey_info(new_state)
                result["meta"] = updated_journey

            return result

        #  ELIGIBILITY EXPLANATION
        elif intent == "eligibility_explanation":
            return self.handle_eligibility_explanation(context, journey)

        #  PROCESS (RAG)
        elif intent == "process":
            rag_result = self.rag.generate_answer(query)

            new_state = update_user_state(db, context["user_id"], "REGISTERED")
            updated_journey = get_journey_info(new_state)

            return {
                "answer": rag_result.get("answer"),
                "source": "rag",
                "sources": rag_result.get("sources", []),
                "meta": updated_journey
            }

        #  DOCUMENTS
        elif intent == "documents":
            rag_result = self.rag.generate_answer(query)

            return {
                "answer": rag_result.get("answer"),
                "source": "rag",
                "sources": rag_result.get("sources", []),
                "meta": journey
            }

        #  FALLBACK
        return {
            "answer": "I’m not sure how to answer that yet.",
            "source": "fallback",
            "sources": [],
            "meta": journey
        }

    #  RULE ENGINE
    def handle_rule_based(self, user_context, journey):
        if not user_context:
            return {
                "answer": "I need your age and citizenship to check eligibility.",
                "source": "rule",
                "sources": [],
                "meta": journey
            }

        age = user_context.get("age")
        citizen = user_context.get("is_citizen")

        if age and age >= 18 and citizen:
            return {
                "answer": "You are eligible to vote.",
                "source": "rule",
                "sources": [],
                "meta": journey
            }
        else:
            return {
                "answer": "You are not eligible to vote based on your details.",
                "source": "rule",
                "sources": [],
                "meta": journey
            }

    #  EXPLANATION (RULE + LLM)
    def handle_eligibility_explanation(self, user_context, journey):
        if not user_context:
            return {
                "answer": "I need your details to explain eligibility.",
                "source": "rule",
                "sources": [],
                "meta": journey
            }

        age = user_context.get("age")
        citizen = user_context.get("is_citizen")

        prompt = f"""
        User Details:
        Age: {age}
        Citizen: {citizen}

        Explain clearly why this user is eligible or not eligible to vote.
        """

        explanation = self.rag.llm.generate(prompt)

        return {
            "answer": explanation.strip(),
            "source": "rule+llm",
            "sources": [],
            "meta": journey
        }
