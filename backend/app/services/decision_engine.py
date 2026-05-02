from nltk.stem import WordNetLemmatizer
from app.services.journey_service import get_journey_info
from app.services.state_service import update_user_state

lemmatizer = WordNetLemmatizer()


class DecisionEngine:
    def __init__(self, rag_pipeline):
        self.rag = rag_pipeline

    # Normalize Query
    def normalize_query(self, query: str):
        words = query.lower().split()
        lemmatized = [lemmatizer.lemmatize(word) for word in words]
        return " ".join(lemmatized)

    
    # Intent Detection 
    def detect_intent(self, query: str):
        query = self.normalize_query(query)

        
        if any(k in query for k in [
            "what next",
            "next step",
            "what should i do",
            "where am i",
            "my status"
        ]):
            return "what_next"

        elif any(k in query for k in [
            "why am i eligible",
            "why can i vote",
            "explain eligibility",
            "why eligible"
        ]):
            return "eligibility_explanation"

        elif any(k in query for k in [
            "am i eligible",
            "can i vote",
            "eligible to vote",
            "eligibility"
        ]):
            return "eligibility"

        elif any(k in query for k in [
            "document",
            "required",
            "proof",
            "what do i need",
            "documents needed"
        ]):
            return "documents"

        elif any(k in query for k in [
            "register",
            "registration",
            "process",
            "how to vote",
            "steps"
        ]):
            return "process"

        return "general"

    # MAIN ROUTER 
    def route(self, query: str, context: dict = None, db=None):
        intent = self.detect_intent(query)

        #  ALWAYS derive journey info
        user_state = context.get("state", "NEW_USER") if context else "NEW_USER"
        journey = get_journey_info(user_state)

        # 1. WHAT NEXT (NEW CORE)
        if intent == "what_next":
            return {
                "answer": f"You are currently at '{journey['current_stage']}'. Next step: {journey['next_step']}",
                "source": "journey",
                "sources": [],
                "meta": journey
            }

        # 2. ELIGIBILITY (RULE)
        elif intent == "eligibility":
            result = self.handle_rule_based(context, journey)

            if context and context.get("age") >= 18 and context.get("is_citizen"):
                update_user_state(db, context["user_id"], "ELIGIBILITY_CHECKED")

            return result

        # 3. ELIGIBILITY EXPLANATION
        elif intent == "eligibility_explanation":
            return self.handle_eligibility_explanation(context, journey)
        
        # 4. RAG (DOCUMENTS / PROCESS / GENERAL)
        elif intent == "process" or intent == "documents" or intent == "general":
            rag_result = self.rag.generate_answer(query)

            update_user_state(db, context["user_id"], "REGISTERED")

            return {
                "answer": rag_result.get("answer"),
                "source": "rag",
                "sources": rag_result.get("sources", []),
                "meta": journey
            }

        # FALLBACK
        return {
            "answer": "I’m not sure how to answer that yet.",
            "source": "fallback",
            "sources": [],
            "meta": journey
        }

    # RULE ENGINE (PHASE 1 LOGIC)
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


    # EXPLANATION (RULE + LLM)
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