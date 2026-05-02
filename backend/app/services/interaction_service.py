from sqlalchemy.orm import Session
from app.models.interactions import Interaction


def log_interaction(db, user_id, query, response, intent=None, state=None):
    interaction = Interaction(
        user_id=user_id,
        query=query,
        response=response,
        intent=intent,
        state=state
    )

    db.add(interaction)
    db.commit()

def get_user_history(db, user_id: int, limit: int = 5):
    return db.query(Interaction)\
        .filter(Interaction.user_id == user_id)\
        .order_by(Interaction.id.desc())\
        .limit(limit)\
        .all()