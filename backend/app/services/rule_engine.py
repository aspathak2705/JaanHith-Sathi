class RuleEngine:

    @staticmethod
    def check_eligibility(age: int):
        if age >= 18:
            return {
                "eligible": True,
                "reason": "User meets age requirement"
            }
        else:
            return {
                "eligible": False,
                "reason": "User must be at least 18 years old"
            }