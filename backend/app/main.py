from fastapi import FastAPI
from app.api.user import router as user_router
from app.api.election import router as election_router
from app.db.base import Base
from app.db.session import engine
from app.db.location_models import Booth
from app.models import interactions, user, state
from app.api.chat import router as chat_router
from app.api import auth
from app.api.location import router as location_router
from app.api.document import router as document_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="CivicGuide AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(location_router)

app.include_router(auth.router)

app.include_router(chat_router)

Base.metadata.create_all(bind=engine)

# Routers
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(election_router, prefix="/election", tags=["Election"])
app.include_router(document_router, prefix="/document", tags=["Document"])
from app.api.notification import router as notification_router
app.include_router(notification_router, prefix="/notification", tags=["Notification"])

@app.get("/")
def root():
    return {"message": "CivicGuide AI Backend Running"}
