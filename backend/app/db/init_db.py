from app.db.base import Base
from app.db.session import engine

from app.db.location_models import Booth
from app.models.interactions import Interaction
from app.models.state import UserState
from app.models.user import User


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
