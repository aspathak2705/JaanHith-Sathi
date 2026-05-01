from nltk.stem import WordNetLemmatizer

lemmatizer = WordNetLemmatizer()


class DecisionEngine:
    def __init__(self, rag_pipeline):
        self.rag = rag_pipeline

    def normalize_query(self, query: str):
        words = query.lower().split()
        lemmatized = [lemmatizer.lemmatize(word) for word in words]
        return " ".join(lemmatized)

    
    #  Intent Detection
    def detect_intent(self, query: str):
        #  Normalize query (lemmatization)
        query = self.normalize_query(query)

        #  MOST SPECIFIC FIRST (Explanation)
        if any(k in query for k in [
            "why am i eligible",
            "why can i vote",
            "explain eligibility",
            "why eligible"
        ]):
            return "eligibility_explanation"

        #  2. Eligibility Check
        elif any(k in query for k in [
            "am i eligible",
            "can i vote",
            "eligible to vote",
            "eligibility"
        ]):
            return "eligibility"

        #  3. Documents
        elif any(k in query for k in [
            "document",
            "required",
            "proof",
            "what do i need",
            "documents needed"
        ]):
            return "documents"

        #  4. Process / Registration
        elif any(k in query for k in [
            "register",
            "registration",
            "process",
            "how to vote",
            "how do i register",
            "steps"
        ]):
            return "process"

        #  5. Default
        return "general"
        

    #  Route Query
    
    def route(self, query: str, user_context=None):
        intent = self.detect_intent(query)

        #  Rule-based eligibility (Phase 1)
        if intent == "eligibility":
            return self.handle_rule_based(query, user_context)

        #  Explanation of eligibility
        elif intent == "eligibility_explanation":
            return self.handle_eligibility_explanation(user_context)

        #  RAG-based queries
        elif intent in ["documents", "process", "general"]:
            return self.rag.generate_answer(query)

        #  fallback
        return {
        "answer": "I’m not sure how to answer that yet.",
        "source": "fallback",
        "sources": [],
        "meta":{}
        }
    
    def handle_rule_based(self, query, user_context):
        if not user_context:
            return {
                "answer": "I need some information like age and citizenship to determine your eligibility.",
                "source": "rule",
                "Sources": [],
                "meta":{}
            }

        age = user_context.get("age")
        citizen = user_context.get("citizen")

        if age >= 18 and citizen:
            return {
                "answer": "You are eligible to vote.",
                "source": "rule",
                "Sources": [],
                "meta":{}
            }
        else:
            return {
                "answer": "You are not eligible to vote based on the provided information.",
                "source": "rule",
                "Sources": [],
                "meta":{}
            }      
        
    def handle_eligibility_explanation(self, user_context):
        if not user_context:
            return {
                "answer": "I need your details to explain eligibility.",
                "source": "rule",
                "Sources": [],
                "meta":{}
            }

        age = user_context.get("age")
        citizen = user_context.get("citizen")

        context = f"""
        User Details:
        Age: {age}
        Citizen: {citizen}

        Explain clearly why this user is eligible or not eligible to vote.
        """

        explanation = self.rag.llm.generate(context)

        return {
            "answer":explanation.strip(),
            "source":"rule+llm",
            "sources": [],
            "meta":{}
        }