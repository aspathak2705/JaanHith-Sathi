class StateMachine:
    STATES = [
        "NEW_USER",
        "ELIGIBILITY_CHECKED",
        "REGISTERED",
        "READY_TO_VOTE",
        "VOTED"
    ]

    def __init__(self):
        pass

    def get_next_state(self, current_state):
        if current_state not in self.STATES:
            return "NEW_USER"

        idx = self.STATES.index(current_state)

        if idx + 1 < len(self.STATES):
            return self.STATES[idx + 1]

        return current_state