JOURNEY_FLOW = {
    "NEW_USER": "Check eligibility",
    "ELIGIBILITY_CHECKED": "Register to vote",
    "REGISTERED": "Prepare for voting",
    "READY_TO_VOTE": "Go to polling booth"
}


def get_next_step(user_state: str):
    return JOURNEY_FLOW.get(user_state, "Start process")


def get_journey_info(user_state: str):
    return {
        "current_stage": user_state,
        "next_step": get_next_step(user_state)
    }